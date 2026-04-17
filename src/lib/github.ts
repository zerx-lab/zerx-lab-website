/**
 * ============================================================================
 * ZerxLab Website - GitHub Stats Fetcher
 * ----------------------------------------------------------------------------
 * 在 Astro SSG 构建时,按需拉取 GitHub 仓库的 star / fork 等统计数据。
 *
 * 设计目标:
 *   - 构建期"零成本"感:多个页面查同一个 repo 只打一次 API(进程内 Map 去重)
 *   - 跨次构建复用:24h 磁盘缓存,避免每次 `astro build` 都真的去拉
 *   - 零 token 也能跑:匿名 GitHub API 有 60/h/IP 限额,够 7 个 repo 一次 build
 *   - 失败降级:网络/超限/404 时返回 null,由调用方自己决定兜底(Directus / fallback)
 *
 * 缓存分层(调用顺序):
 *   1. 进程内 Map:同一次 astro build 中,相同 repo 只查一次(永不过期)
 *   2. 磁盘文件:  node_modules/.cache/zerx-github-stats.json,24h TTL
 *   3. GitHub API: 二者都 miss 时真的网络请求
 *
 * 为什么缓存放在 node_modules/.cache:
 *   - 该目录是工具链约定的缓存位置(Webpack/Babel/SWC 等都用这里)
 *   - 已被 .gitignore 覆盖(node_modules 整体忽略),不会意外提交
 *   - 包管理器不会清理该子目录(bun install 只管 node_modules 顶层)
 *
 * 使用示例:
 *   import { getGithubStats } from "@/lib/github";
 *   const stats = await getGithubStats("zerx-lab/wordZero");
 *   // stats 可能为 null(API 失败),调用方要有兜底
 *
 * 关于 GITHUB_TOKEN:
 *   - 可选,但推荐:匿名限额 60/h,带 token 后 5000/h
 *   - 只需要 public_repo scope(最小权限,只读公开仓库元数据)
 *   - 在 .env 里 GITHUB_TOKEN=ghp_xxx 即可,本模块自动识别
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
 * 从 GitHub 抽取的"够前端用"的最小字段集。
 * 完整响应字段很多(见 https://docs.github.com/en/rest/repos/repos#get-a-repository),
 * 这里只保留我们真的会渲染的。
 */
export interface GithubRepoStats {
	/** 形如 "owner/repo",小写,匹配 GitHub URL 段 */
	fullName: string;
	stars: number;
	forks: number;
	watchers: number;
	/** 默认主语言,如 "Go" / "TypeScript" / "Rust";可能为 null(空仓库) */
	language: string | null;
	/** 仓库简介(GitHub 的 description 字段);可能为 null */
	description: string | null;
	/** 最近一次推送时间 ISO 8601;用于前端显示"3 周前" */
	pushedAt: string | null;
	/** 当前开放的 issue 数 */
	openIssues: number;
	/** 是否归档 */
	archived: boolean;
	/** 抓取时间戳(ms),用于调试缓存命中 */
	fetchedAt: number;
}

/* ----------------------------------------------------------------------------
 * 配置
 * ---------------------------------------------------------------------------- */

/** 缓存 TTL:24 小时(用户决策) */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** 超时:GitHub API 理论很快,6s 超时给 CI 网络差留一点余量 */
const REQUEST_TIMEOUT_MS = 6_000;

/**
 * 定位项目根:本文件在 `<root>/src/lib/github.ts`,上溯 2 级就是根。
 * 用 fileURLToPath 兼容 Node / Bun / Vite 各种运行时的 ESM。
 */
const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(MODULE_DIR, "..", "..");

/**
 * 磁盘缓存文件位置。
 * 用 node_modules/.cache/ 而非项目根或 .astro/ 目录:
 *   - .gitignore 已天然忽略
 *   - 跨工具约定位置,不会被当作"项目资产"误判
 */
const CACHE_DIR = resolve(PROJECT_ROOT, "node_modules/.cache");
const CACHE_FILE = resolve(CACHE_DIR, "zerx-github-stats.json");

/**
 * 环境变量读取(兼容 Astro/Vite 的 import.meta.env 与 Node/Bun 的 process.env)。
 * 与 src/lib/directus.ts 里的 readEnv 行为一致,避免 SSG 构建时拿不到变量。
 */
function readEnv(key: string): string | undefined {
	try {
		const viteEnv = (import.meta as ImportMeta | undefined)?.env as
			| Record<string, string | undefined>
			| undefined;
		if (viteEnv && typeof viteEnv[key] === "string") return viteEnv[key];
	} catch {
		// 在非 ESM / 非 Vite 环境访问 import.meta.env 会抛错,降级
	}
	if (typeof process !== "undefined" && process.env) return process.env[key];
	return undefined;
}

const GITHUB_TOKEN = readEnv("GITHUB_TOKEN") ?? readEnv("GH_TOKEN");

/* ----------------------------------------------------------------------------
 * 缓存层
 * ---------------------------------------------------------------------------- */

/**
 * 进程内缓存。
 * key = "owner/repo"(小写标准化后),value = stats 或 null(表示曾拉过但失败)。
 * null 也缓存,避免连续页面都去重试同一个挂掉的 repo。
 */
const processCache = new Map<string, GithubRepoStats | null>();

/**
 * 磁盘缓存的序列化形态。
 * 用 "owner/repo" 作为 key,value 里包含 fetchedAt 时间戳用于 TTL 判断。
 * null 值在磁盘上表示"上次拉失败",也遵守 TTL —— 24h 内不重试。
 */
interface DiskCacheShape {
	version: 1;
	entries: Record<string, { fetchedAt: number; stats: GithubRepoStats | null }>;
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
		// version 校验;不匹配直接当空缓存,避免老结构破坏新代码
		if (
			parsed?.version === 1 &&
			parsed.entries &&
			typeof parsed.entries === "object"
		) {
			diskCache = { version: 1, entries: parsed.entries };
			return diskCache;
		}
	} catch (err) {
		// 缓存文件损坏:静默忽略,当作空缓存。不抛错让整个 build 挂掉。
		console.warn(
			`[github] 读取磁盘缓存失败,将当作空缓存处理: ${(err as Error).message}`,
		);
	}

	diskCache = fresh;
	return fresh;
}

/**
 * 立即落盘。
 *
 * 注意:这里故意不做 debounce。
 * 早期实现用过 setTimeout 合并短时间内的多次写,但 Astro SSG 构建期的进程
 * 生命周期并不保证 setTimeout 回调会被执行 —— 所有页面渲染完成后进程会
 * 立刻退出,未触发的定时器直接被丢弃,于是缓存永远不会落盘。
 *
 * 改成"每次 getGithubStats 得到新数据后直接 await 落盘":
 *   - 一次 build 内 7 个 repo 最多写 7 次,每次几 KB,耗时 < 10ms
 *   - 同一个 repo 已经被 processCache 去重,不会重复写
 *   - 调用方 `await getGithubStats(...)` 天然串行/并发,不会爆并发写冲突
 */
async function flushDiskCache(): Promise<void> {
	if (!diskCache) return;
	try {
		if (!existsSync(CACHE_DIR)) {
			await mkdir(CACHE_DIR, { recursive: true });
		}
		await writeFile(CACHE_FILE, JSON.stringify(diskCache, null, 2), "utf8");
	} catch (err) {
		// 写失败不致命,下一次 build 时正好重拉
		console.warn(
			`[github] 写入磁盘缓存失败(本次构建仍可用): ${(err as Error).message}`,
		);
	}
}

/* ----------------------------------------------------------------------------
 * GitHub API
 * ---------------------------------------------------------------------------- */

/** 原始 /repos/:owner/:repo 响应中我们关心的字段 */
interface RawGithubRepo {
	full_name: string;
	stargazers_count: number;
	forks_count: number;
	watchers_count: number;
	language: string | null;
	description: string | null;
	pushed_at: string | null;
	open_issues_count: number;
	archived: boolean;
}

/**
 * 真正打 GitHub API。
 * 返回 null 表示"这次调用没成功"—— 调用方(getGithubStats)会把 null 也缓存下来,
 * 避免 24h 内对同一个挂掉的 repo 反复重试。
 */
async function fetchFromGithub(
	fullName: string,
): Promise<GithubRepoStats | null> {
	const url = `https://api.github.com/repos/${fullName}`;

	const headers: Record<string, string> = {
		Accept: "application/vnd.github+json",
		// 明确 API 版本,避免未来 GitHub 默认版本变更导致字段漂移
		"X-GitHub-Api-Version": "2022-11-28",
		// 一个可识别的 UA 让 GitHub 好 debug(他们 API 明确要求带 UA)
		"User-Agent": "zerx-lab-website (+https://zerx.dev)",
	};
	if (GITHUB_TOKEN) {
		headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
	}

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const res = await fetch(url, { headers, signal: controller.signal });

		// 429 / 403(限流)/ 404(仓库不存在) / 5xx 都走失败路径
		if (!res.ok) {
			// 特殊提示限流,方便用户发现没配 GITHUB_TOKEN
			if (res.status === 403 || res.status === 429) {
				const remaining = res.headers.get("x-ratelimit-remaining");
				console.warn(
					`[github] ${fullName} 触发限流 (status=${res.status}, remaining=${remaining ?? "?"})。` +
						`建议在 .env 里配置 GITHUB_TOKEN 提升到 5000/h。`,
				);
			} else if (res.status === 404) {
				console.warn(
					`[github] ${fullName} 不存在 (404)。请检查 project.githubUrl 是否正确。`,
				);
			} else {
				console.warn(`[github] ${fullName} 拉取失败 status=${res.status}`);
			}
			return null;
		}

		const raw = (await res.json()) as RawGithubRepo;
		return {
			fullName: raw.full_name,
			stars: raw.stargazers_count ?? 0,
			forks: raw.forks_count ?? 0,
			watchers: raw.watchers_count ?? 0,
			language: raw.language ?? null,
			description: raw.description ?? null,
			pushedAt: raw.pushed_at ?? null,
			openIssues: raw.open_issues_count ?? 0,
			archived: Boolean(raw.archived),
			fetchedAt: Date.now(),
		};
	} catch (err) {
		// AbortError(超时)/ 网络 DNS 失败 / 解析失败 —— 一律静默返回 null
		const msg = (err as Error)?.message ?? String(err);
		console.warn(`[github] ${fullName} 请求异常: ${msg}`);
		return null;
	} finally {
		clearTimeout(timeoutId);
	}
}

/* ----------------------------------------------------------------------------
 * 工具
 * ---------------------------------------------------------------------------- */

/**
 * 把各种输入归一化为 "owner/repo":
 *   - "https://github.com/zerx-lab/wordZero"       → "zerx-lab/wordZero"
 *   - "https://github.com/zerx-lab/wordZero/"       → "zerx-lab/wordZero"
 *   - "https://github.com/zerx-lab/wordZero.git"    → "zerx-lab/wordZero"
 *   - "github.com/zerx-lab/wordZero"                → "zerx-lab/wordZero"
 *   - "zerx-lab/wordZero"                           → "zerx-lab/wordZero"
 * 不做大小写变换(GitHub 路径本身大小写不敏感,但 full_name 返回时保留原大小写)。
 *
 * 无法解析时返回 null,让调用方显式处理。
 */
export function normalizeRepo(input: string | null | undefined): string | null {
	if (!input) return null;
	let s = String(input).trim();
	if (!s) return null;

	// 剥协议
	s = s.replace(/^https?:\/\//, "");
	// 剥 github.com 前缀
	s = s.replace(/^(www\.)?github\.com\//, "");
	// 剥 .git 后缀和尾 /
	s = s.replace(/\.git$/, "").replace(/\/$/, "");
	// 只留 owner/repo,忽略 /tree/xxx 等尾巴
	const parts = s.split("/").filter(Boolean);
	if (parts.length < 2) return null;

	return `${parts[0]}/${parts[1]}`;
}

/* ----------------------------------------------------------------------------
 * 公开 API
 * ---------------------------------------------------------------------------- */

/**
 * 获取一个 repo 的 GitHub 统计数据。
 *
 * 缓存顺序:进程内 Map → 磁盘(24h TTL)→ GitHub API。
 * 任何一步失败都不抛错,返回 null 让调用方兜底。
 *
 * @param repo 可以是 "owner/repo" 形式,也可以是完整 GitHub URL
 * @returns 统计数据对象,或 null(API 失败且无有效缓存)
 */
export async function getGithubStats(
	repo: string | null | undefined,
): Promise<GithubRepoStats | null> {
	const fullName = normalizeRepo(repo);
	if (!fullName) return null;

	// 1. 进程内 Map(同一次 build 里 N 个页面查同一个 repo → 只打一次)
	if (processCache.has(fullName)) {
		return processCache.get(fullName) ?? null;
	}

	// 2. 磁盘缓存(24h TTL)
	const cache = await loadDiskCache();
	const entry = cache.entries[fullName];
	if (entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS) {
		processCache.set(fullName, entry.stats);
		return entry.stats;
	}

	// 3. 真实请求
	const fresh = await fetchFromGithub(fullName);

	// 无论成功(stats)还是失败(null),都写入两层缓存。
	// 失败也缓存是刻意的 —— 24h 内不重试已知挂掉的 repo,避免反复触发限流。
	processCache.set(fullName, fresh);
	cache.entries[fullName] = { fetchedAt: Date.now(), stats: fresh };
	await flushDiskCache();

	return fresh;
}

/**
 * 批量拉取多个 repo 的统计。对外暴露这个是为了让调用方可以 Promise.all
 * 去并发拉(比如 ProjectsPage 一次要 7 个 repo 的数据)。
 *
 * 内部复用 getGithubStats,所以缓存、去重、错误隔离全部自动继承。
 * 某个 repo 失败不影响其他 repo —— 对应位置返回 null。
 */
export async function getGithubStatsBatch(
	repos: ReadonlyArray<string | null | undefined>,
): Promise<Array<GithubRepoStats | null>> {
	return Promise.all(repos.map((r) => getGithubStats(r)));
}

/**
 * 强制刷新一个 repo(忽略缓存,直拉 API)。
 * 一般页面不用,留给可能的手动刷新脚本 / 调试用。
 */
export async function refreshGithubStats(
	repo: string | null | undefined,
): Promise<GithubRepoStats | null> {
	const fullName = normalizeRepo(repo);
	if (!fullName) return null;

	const fresh = await fetchFromGithub(fullName);
	const cache = await loadDiskCache();
	processCache.set(fullName, fresh);
	cache.entries[fullName] = { fetchedAt: Date.now(), stats: fresh };
	await flushDiskCache();
	return fresh;
}

/**
 * 探针:当前缓存文件的路径 + 是否存在 token。
 * 给调试脚本用,业务代码一般用不到。
 */
export const GITHUB_CONFIG = {
	cacheFile: CACHE_FILE,
	cacheTtlMs: CACHE_TTL_MS,
	hasToken: Boolean(GITHUB_TOKEN),
} as const;
