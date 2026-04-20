/**
 * ============================================================================
 * ZerxLab Website - AUR RPC 客户端(带 24h 缓存)
 * ----------------------------------------------------------------------------
 * 全站 SSR 场景下,/aur 页面的 `version` 字段需要实时反映 AUR 仓库的最新版本,
 * 而不是 Directus 里手动 seed 的静态值。本模块负责:
 *
 *   1. 调用 AUR RPC v5 的 /rpc/v5/info 接口一次性拿多个包的元数据
 *   2. 双层 24h 缓存(进程内 Map + 磁盘 JSON),避免每次 CDN 回源都打 AUR
 *   3. 失败降级:返回 null / 部分结果,调用方用 Directus 里的旧 version 兜底
 *
 * 为什么要双层缓存(与 src/lib/github.ts 同思路):
 *   - 进程内 Map:同一次 Node 进程内,不同页面请求共享,零延迟
 *   - 磁盘文件:  容器重启 / Node 进程重启后仍能命中,避免反复打 AUR
 *   - AUR 的 RPC 很快(< 500ms),但 24h 缓存后能把它压到"理论上每天 1 次"
 *
 * 缓存 TTL:24 小时(用户决策)。理由:
 *   - AUR 包的 VERSION 字段变化频率一般是"天级"(作者合并 PKGBUILD 后)
 *   - 边缘 CDN 缓存 /aur 页面只有 5 分钟,过期后回源会读本模块的缓存
 *   - 24h TTL 意味着上游发新版本后,用户最多等 24h + CDN 窗口看到新版本号
 *   - 如果需要更快,可以在管理员侧手动触发缓存失效(未实现)
 *
 * AUR RPC v5 参考:
 *   https://wiki.archlinux.org/title/Aurweb_RPC_interface
 *
 *   - 接口:GET https://aur.archlinux.org/rpc/v5/info?arg[]=pkg1&arg[]=pkg2
 *   - 单次请求可以查多个包(上限建议 < 100)
 *   - 返回的 results 数组可能比请求少(包不存在时直接不出现在结果里)
 *   - 字段名是 PascalCase(Version / Name / LastModified / OutOfDate 等)
 *
 * 使用示例:
 *   import { getAurInfoBatch } from "@/lib/aur-rpc";
 *   const map = await getAurInfoBatch([
 *     "zerx-lab-pencil-bin",
 *     "zerx-lab-fluxdown-bin",
 *   ]);
 *   const pencilVersion = map.get("zerx-lab-pencil-bin")?.version ?? null;
 *
 * 隐私 / 合规:
 *   - AUR RPC 是公开匿名接口,无需 token / API key
 *   - 我们只发 GET 请求,带一个可识别的 UA 让 AUR 管理员好排查
 * ============================================================================
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/* ----------------------------------------------------------------------------
 * 类型
 * ---------------------------------------------------------------------------- */

/**
 * 从 AUR RPC 响应中抽取的"够前端用"的最小字段集。
 * 完整响应字段很多(见 wiki),这里只保留我们真的会渲染/可能用到的。
 */
export interface AurPackageInfo {
	/** AUR 包名,如 "zerx-lab-pencil-bin" */
	name: string;
	/** 版本字符串,如 "1.1.51-1";来源于 PKGBUILD 的 pkgver-pkgrel */
	version: string;
	/** 包描述(英文,AUR 只有英文简介) */
	description: string | null;
	/** 上游项目 URL(PKGBUILD 的 url 字段) */
	url: string | null;
	/** 维护者用户名;null 表示 orphan(无人维护) */
	maintainer: string | null;
	/** 上游过时标记 Unix 秒;null 表示未标记过时 */
	outOfDate: number | null;
	/** 最近一次 PKGBUILD 修改时间 Unix 秒 */
	lastModified: number | null;
	/** 投票数 */
	numVotes: number;
	/** 流行度(AUR 内部算法) */
	popularity: number;
	/** 抓取时间戳(ms),用于调试缓存命中 */
	fetchedAt: number;
}

/* ----------------------------------------------------------------------------
 * 配置
 * ---------------------------------------------------------------------------- */

/** 缓存 TTL:24 小时(用户决策) */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** 请求超时:AUR RPC 理论很快,8s 给跨境网络留点余量 */
const REQUEST_TIMEOUT_MS = 8_000;

/** AUR RPC v5 info 接口的基址 */
const AUR_RPC_ENDPOINT = "https://aur.archlinux.org/rpc/v5/info";

/** 可识别的 UA,方便 AUR 管理员排查异常流量 */
const USER_AGENT = "zerx-lab-website (+https://zerx.dev)";

/**
 * 定位项目根:本文件在 `<root>/src/lib/aur-rpc.ts`,上溯 2 级就是根。
 * fileURLToPath 兼容 Node / Bun / Vite 各种运行时的 ESM。
 */
const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(MODULE_DIR, "..", "..");

/**
 * 磁盘缓存文件位置。
 * 用 node_modules/.cache/ 与 github.ts 保持一致:
 *   - .gitignore 已天然忽略
 *   - 跨工具约定位置,不会被当作"项目资产"误判
 *   - 容器镜像里 node_modules 通常是分层缓存的一部分,不会被清
 */
const CACHE_DIR = resolve(PROJECT_ROOT, "node_modules/.cache");
const CACHE_FILE = resolve(CACHE_DIR, "zerx-aur-info.json");

/* ----------------------------------------------------------------------------
 * 缓存层
 * ---------------------------------------------------------------------------- */

/**
 * 进程内缓存。
 * key = AUR 包名(原样,AUR 包名大小写敏感但实际都是小写)
 * value = 带 fetchedAt 的 info,或 null(表示曾拉过但包不存在 / 失败)
 *
 * null 也缓存,避免连续请求都去重试同一个挂掉 / 不存在的包。
 */
interface ProcessCacheEntry {
	fetchedAt: number;
	info: AurPackageInfo | null;
}
const processCache = new Map<string, ProcessCacheEntry>();

/**
 * 磁盘缓存的序列化形态。
 * 结构与 github.ts 对齐,方便以后抽公共 util。
 */
interface DiskCacheShape {
	version: 1;
	entries: Record<string, { fetchedAt: number; info: AurPackageInfo | null }>;
}

/** 磁盘缓存的内存投影。首次加载后就不再读盘,所有读写都走它 + 落盘。 */
let diskCache: DiskCacheShape | null = null;
/** 是否已经在本次进程中读过盘;读盘失败也不重试,避免刷屏 */
let diskCacheLoaded = false;

async function loadDiskCache(): Promise<DiskCacheShape> {
	if (diskCacheLoaded && diskCache) return diskCache;
	diskCacheLoaded = true;

	const fresh: DiskCacheShape = { version: 1, entries: {} };

	if (!existsSync(CACHE_FILE)) {
		diskCache = fresh;
		return fresh;
	}

	try {
		const raw = await readFile(CACHE_FILE, "utf8");
		const parsed = JSON.parse(raw) as Partial<DiskCacheShape>;
		if (
			parsed?.version === 1 &&
			parsed.entries &&
			typeof parsed.entries === "object"
		) {
			diskCache = { version: 1, entries: parsed.entries };
			return diskCache;
		}
	} catch (err) {
		// 缓存文件损坏:静默忽略,当作空缓存,不让整个 SSR 请求挂掉
		console.warn(
			`[aur-rpc] 读取磁盘缓存失败,将当作空缓存处理: ${(err as Error).message}`,
		);
	}

	diskCache = fresh;
	return fresh;
}

/**
 * 立即落盘。
 *
 * 与 github.ts 一致,不做 debounce:
 *   - 一次 SSR 请求内最多触发一次批量写,几 KB,耗时 < 10ms
 *   - 24h TTL 意味着真正落盘的频率极低(每个包每天最多 1 次)
 *   - 保持"每次有变化就立刻 await 落盘",避免定时器未执行导致缓存丢失
 */
async function flushDiskCache(): Promise<void> {
	if (!diskCache) return;
	try {
		if (!existsSync(CACHE_DIR)) {
			await mkdir(CACHE_DIR, { recursive: true });
		}
		await writeFile(CACHE_FILE, JSON.stringify(diskCache, null, 2), "utf8");
	} catch (err) {
		// 写失败不致命,下一次请求正好重拉
		console.warn(
			`[aur-rpc] 写入磁盘缓存失败(本次请求仍可用): ${(err as Error).message}`,
		);
	}
}

/* ----------------------------------------------------------------------------
 * AUR RPC
 * ---------------------------------------------------------------------------- */

/** AUR RPC /info 接口的原始响应中我们关心的字段(PascalCase) */
interface RawAurResult {
	Name: string;
	Version: string;
	Description: string | null;
	URL: string | null;
	Maintainer: string | null;
	OutOfDate: number | null;
	LastModified: number | null;
	NumVotes: number;
	Popularity: number;
}

interface RawAurResponse {
	resultcount: number;
	results: RawAurResult[];
	type: string;
	version: number;
	error?: string;
}

/**
 * 真正打 AUR RPC,一次请求多个包。
 *
 * AUR RPC v5 的 `info` 类型接受多个 arg[]=pkg 参数,一次返回所有命中的结果。
 * 未命中的包不会出现在 results 里(不是 error),所以调用方需要做差集检查。
 *
 * 返回值:包名 → info 的 Map,未命中的包不在 Map 里(让调用方能区分"请求失败"
 * 和"包在 AUR 上不存在")。整体请求失败时返回 null。
 */
async function fetchFromAurRpc(
	names: readonly string[],
): Promise<Map<string, AurPackageInfo> | null> {
	if (names.length === 0) return new Map();

	// 构造 ?arg[]=a&arg[]=b&arg[]=c
	const params = new URLSearchParams();
	for (const n of names) {
		params.append("arg[]", n);
	}
	const url = `${AUR_RPC_ENDPOINT}?${params.toString()}`;

	const headers: Record<string, string> = {
		Accept: "application/json",
		"User-Agent": USER_AGENT,
	};

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const res = await fetch(url, { headers, signal: controller.signal });

		if (!res.ok) {
			console.warn(
				`[aur-rpc] RPC 请求失败 status=${res.status} names=${names.join(",")}`,
			);
			return null;
		}

		const raw = (await res.json()) as RawAurResponse;

		// RPC 协议错误(type === "error")
		if (raw.error || raw.type === "error") {
			console.warn(
				`[aur-rpc] RPC 返回 error: ${raw.error ?? "unknown"} names=${names.join(",")}`,
			);
			return null;
		}

		const now = Date.now();
		const out = new Map<string, AurPackageInfo>();
		for (const r of raw.results ?? []) {
			if (!r?.Name || !r?.Version) continue;
			out.set(r.Name, {
				name: r.Name,
				version: r.Version,
				description: r.Description ?? null,
				url: r.URL ?? null,
				maintainer: r.Maintainer ?? null,
				outOfDate: r.OutOfDate ?? null,
				lastModified: r.LastModified ?? null,
				numVotes: r.NumVotes ?? 0,
				popularity: r.Popularity ?? 0,
				fetchedAt: now,
			});
		}
		return out;
	} catch (err) {
		// AbortError(超时)/ 网络 DNS 失败 / JSON 解析失败 —— 一律静默返回 null
		const msg = (err as Error)?.message ?? String(err);
		console.warn(`[aur-rpc] 请求异常: ${msg} names=${names.join(",")}`);
		return null;
	} finally {
		clearTimeout(timeoutId);
	}
}

/* ----------------------------------------------------------------------------
 * 缓存读写工具
 * ---------------------------------------------------------------------------- */

/**
 * 判断一个缓存条目是否仍在 TTL 内。
 * now 参数允许外部传入"批次基准时间",保证一次批量调用中所有条目用同一个 now
 * 判断,避免边界抖动。
 */
function isFresh(fetchedAt: number, now: number): boolean {
	return now - fetchedAt < CACHE_TTL_MS;
}

/**
 * 从双层缓存中读取一个包的条目。命中(无论 info 是否为 null)且未过期就返回,
 * 否则返回 undefined 让调用方去拉。
 */
async function readCached(
	name: string,
	now: number,
): Promise<ProcessCacheEntry | undefined> {
	// 1. 进程内
	const mem = processCache.get(name);
	if (mem && isFresh(mem.fetchedAt, now)) return mem;

	// 2. 磁盘
	const disk = await loadDiskCache();
	const diskEntry = disk.entries[name];
	if (diskEntry && isFresh(diskEntry.fetchedAt, now)) {
		// 回填进程内缓存,下次免读盘
		const entry: ProcessCacheEntry = {
			fetchedAt: diskEntry.fetchedAt,
			info: diskEntry.info,
		};
		processCache.set(name, entry);
		return entry;
	}

	return undefined;
}

/**
 * 把一个包的最新结果写回双层缓存。
 * info === null 表示"这次拉了但包不存在 / RPC 失败",也缓存,避免短期重试。
 */
async function writeCached(
	name: string,
	info: AurPackageInfo | null,
	now: number,
): Promise<void> {
	processCache.set(name, { fetchedAt: now, info });
	const disk = await loadDiskCache();
	disk.entries[name] = { fetchedAt: now, info };
}

/* ----------------------------------------------------------------------------
 * 公开 API
 * ---------------------------------------------------------------------------- */

/**
 * 批量获取多个 AUR 包的元数据。
 *
 * 流程:
 *   1. 过滤空值 / 去重,得到需要查询的包名列表
 *   2. 对每个包查双层缓存,把未过期的收集起来;过期 / 未命中的进入待拉列表
 *   3. 待拉列表不为空时,一次性 RPC 查询
 *      - 成功:把结果写回缓存;请求过但 RPC 未返回的包(说明包不在 AUR)
 *             也以 null 写回缓存,避免反复重试
 *      - 失败(网络 / 超时):待拉的包不写缓存,下次请求会重试
 *   4. 返回包名 → info 的 Map。RPC 失败时尽量用"过期但存在"的进程/磁盘缓存
 *      做兜底,只有连旧缓存都没有时才不出现在 Map 里。
 *
 * @param names 要查询的 AUR 包名列表(会自动去重 / 去空)
 * @returns 包名 → info 的 Map;查不到的包不在 Map 里(而非放 null)
 */
export async function getAurInfoBatch(
	names: readonly (string | null | undefined)[],
): Promise<Map<string, AurPackageInfo>> {
	const now = Date.now();
	const result = new Map<string, AurPackageInfo>();

	// 归一化:去空、去重
	const wanted = Array.from(
		new Set(
			names
				.filter((n): n is string => typeof n === "string" && n.trim() !== "")
				.map((n) => n.trim()),
		),
	);

	if (wanted.length === 0) return result;

	// 第一轮:查缓存
	const needFetch: string[] = [];
	// 记录那些缓存已过期但仍有旧数据的包,用作 RPC 失败时的 stale fallback
	const staleBackup = new Map<string, AurPackageInfo>();

	for (const name of wanted) {
		const cached = await readCached(name, now);
		if (cached) {
			if (cached.info) result.set(name, cached.info);
			// cached.info === null 表示"上次确认过这个包不存在 / 失败",
			// 在 TTL 内不放进 result,也不重拉
			continue;
		}

		// 未命中或已过期:排入待拉列表;若进程/磁盘里有"过期数据"留着兜底
		needFetch.push(name);
		const memStale = processCache.get(name);
		if (memStale?.info) {
			staleBackup.set(name, memStale.info);
			continue;
		}
		const disk = await loadDiskCache();
		const diskStale = disk.entries[name];
		if (diskStale?.info) {
			staleBackup.set(name, diskStale.info);
		}
	}

	if (needFetch.length === 0) {
		return result;
	}

	// 第二轮:批量 RPC
	const fresh = await fetchFromAurRpc(needFetch);

	if (fresh === null) {
		// 整体 RPC 失败:不写缓存,但用 staleBackup 兜底,让用户至少看到旧版本号
		for (const [name, info] of staleBackup) {
			if (!result.has(name)) result.set(name, info);
		}
		return result;
	}

	// RPC 成功:逐个处理 needFetch
	let anyWritten = false;
	for (const name of needFetch) {
		const info = fresh.get(name) ?? null;
		await writeCached(name, info, now);
		anyWritten = true;
		if (info) {
			result.set(name, info);
		} else if (staleBackup.has(name)) {
			// RPC 成功但某个包不在结果里 —— 说明它从 AUR 下架了。
			// 我们已经把 null 写回缓存,但这次调用仍用旧数据兜底展示。
			const backup = staleBackup.get(name);
			if (backup) result.set(name, backup);
		}
	}

	if (anyWritten) {
		await flushDiskCache();
	}

	return result;
}

/**
 * 单个包的便捷封装。
 * 内部直接复用 getAurInfoBatch,所有缓存/兜底逻辑自动继承。
 *
 * @returns info 对象,或 null(包在 AUR 找不到且无任何旧缓存)
 */
export async function getAurInfo(
	name: string | null | undefined,
): Promise<AurPackageInfo | null> {
	if (!name) return null;
	const map = await getAurInfoBatch([name]);
	return map.get(name.trim()) ?? null;
}

/**
 * 强制刷新(忽略缓存直拉 RPC)。留给可能的手动刷新脚本 / 调试用。
 * 结果仍会写回两层缓存。
 */
export async function refreshAurInfoBatch(
	names: readonly string[],
): Promise<Map<string, AurPackageInfo>> {
	const wanted = Array.from(
		new Set(names.filter((n) => typeof n === "string" && n.trim() !== "")),
	);
	if (wanted.length === 0) return new Map();

	const now = Date.now();
	const fresh = await fetchFromAurRpc(wanted);
	if (fresh === null) return new Map();

	for (const name of wanted) {
		const info = fresh.get(name) ?? null;
		await writeCached(name, info, now);
	}
	await flushDiskCache();

	const out = new Map<string, AurPackageInfo>();
	for (const [k, v] of fresh) out.set(k, v);
	return out;
}
