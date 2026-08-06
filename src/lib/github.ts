/**
 * ============================================================================
 * ZerxLab Website - GitHub 仓库清单拉取
 * ----------------------------------------------------------------------------
 * 在 Astro SSG 构建时,拉取一个 GitHub 账号的全部公开仓库(stars / forks /
 * language / description / fork / archived),供首页九宫格与 /projects 排序。
 *
 * 设计目标:
 *   - 构建期"零成本"感:一次 build 里 5 个页面共用一次拉取(进程内缓存)
 *   - 跨次构建复用:24h 磁盘缓存,避免每次 `astro build` 都真的去拉
 *   - 零 token 也能跑:匿名 GitHub API 60/h/IP,列清单一次只花 1~3 个额度
 *   - 失败降级:网络/超限/404 时返回 null,由调用方回落到内容仓库快照
 *
 * 缓存分层(调用顺序):
 *   1. 进程内变量:同一次 astro build 中只查一次(永不过期)
 *   2. 磁盘文件:  node_modules/.cache/zerx-github-stats.json,24h TTL
 *   3. GitHub API: 二者都 miss 时真的网络请求
 *
 * 为什么缓存放在 node_modules/.cache:
 *   - 该目录是工具链约定的缓存位置(Webpack/Babel/SWC 等都用这里)
 *   - 已被 .gitignore 覆盖(node_modules 整体忽略),不会意外提交
 *   - 包管理器不会清理该子目录(bun install 只管 node_modules 顶层)
 *
 * 使用示例:
 *   import { getOwnerRepos } from "@/lib/github";
 *   const repos = await getOwnerRepos("zerx-lab");
 *   // repos 可能为 null(API 失败),调用方要有兜底
 *
 * 关于 GITHUB_TOKEN:
 *   - 可选,但推荐:匿名限额 60/h,带 token 后 5000/h
 *   - 只需要 public_repo scope(最小权限,只读公开仓库元数据)
 *   - 在 .env 里 GITHUB_TOKEN=ghp_xxx 即可,本模块自动识别
 * ============================================================================
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/* ----------------------------------------------------------------------------
 * 类型
 * ---------------------------------------------------------------------------- */

/**
 * 从 GitHub 抽取的"够前端用"的最小字段集。
 * 完整响应字段很多(见 https://docs.github.com/en/rest/repos/repos),
 * 这里只保留我们真的会渲染或用于筛选的。
 */
export interface GithubRepoStats {
	/** 形如 "owner/repo",保留 GitHub 返回的原始大小写 */
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
	/** 是否是 fork 来的仓库(只展示自研项目时要过滤掉) */
	fork: boolean;
	/** GitHub topics 标签,可能为空数组 */
	topics: readonly string[];
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

/** 单页 100 条,最多翻 3 页 —— 300 个仓库足够覆盖本站场景 */
const PER_PAGE = 100;
const MAX_PAGES = 3;

/**
 * 磁盘缓存文件位置。
 * 锚点用 `process.cwd()`(即执行 `astro build` 的项目根),不用
 * `import.meta.url` —— 构建后本模块被打包进 `dist/` 里,按模块位置上溯会把
 * 缓存写成 `dist/node_modules/.cache/`,那份垃圾会跟着静态产物一起被发布。
 */
const CACHE_DIR = resolve(process.cwd(), "node_modules/.cache");
const CACHE_FILE = resolve(CACHE_DIR, "zerx-github-stats.json");

/**
 * 环境变量读取(兼容 Astro/Vite 的 import.meta.env 与 Node/Bun 的 process.env)。
 * 避免 SSG 构建时拿不到变量。
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
 * 磁盘缓存的序列化形态。
 * key = 小写 owner(用户名或组织名),repos 为 null 表示上次拉取失败 ——
 * 失败也缓存是刻意的:24h 内不重试已知挂掉的账号,避免反复触发限流。
 */
interface DiskCacheShape {
	version: 3;
	owners: Record<string, { fetchedAt: number; repos: GithubRepoStats[] | null }>;
}

/** 磁盘缓存的内存投影。首次加载后就不再读盘,所有读写都走它 + 落盘。 */
let diskCache: DiskCacheShape | null = null;
/** 是否已经在本次进程中读过盘;读盘失败也不重试,避免刷屏 */
let diskCacheLoaded = false;

/** 进程内缓存:同一次 build 里 N 个页面查同一个 owner → 只解析一次 */
const processCache = new Map<string, GithubRepoStats[] | null>();

async function loadDiskCache(): Promise<DiskCacheShape> {
	if (diskCacheLoaded && diskCache) return diskCache;
	diskCacheLoaded = true;

	const fresh: DiskCacheShape = { version: 3, owners: {} };

	if (!existsSync(CACHE_FILE)) {
		diskCache = fresh;
		return fresh;
	}

	try {
		const raw = await readFile(CACHE_FILE, "utf8");
		const parsed = JSON.parse(raw) as Partial<DiskCacheShape>;
		// version 校验;不匹配直接当空缓存,避免老结构破坏新代码
		if (
			parsed?.version === 3 &&
			parsed.owners &&
			typeof parsed.owners === "object"
		) {
			diskCache = { version: 3, owners: parsed.owners };
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

/** 原始 /users/:owner/repos 响应中我们关心的字段 */
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
	fork: boolean;
	topics?: string[] | null;
}

function toStats(raw: RawGithubRepo): GithubRepoStats {
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
		fork: Boolean(raw.fork),
		topics: raw.topics ?? [],
		fetchedAt: Date.now(),
	};
}

/**
 * 真正打 GitHub API,翻页拉完整清单。
 *
 * 用 `/users/:owner/repos` 而不是 `/orgs/:owner/repos`:前者对个人账号和组织
 * 都返回公开仓库,后者对个人账号直接 404(zerx-lab 就是个人账号)。
 *
 * 任一页失败即整体返回 null —— 半截清单排出来的"star 最多的前 N 个"是错的,
 * 宁可让调用方回落到内容仓库快照。
 */
async function fetchOwnerRepos(owner: string): Promise<GithubRepoStats[] | null> {
	const headers: Record<string, string> = {
		Accept: "application/vnd.github+json",
		// 明确 API 版本,避免未来 GitHub 默认版本变更导致字段漂移
		"X-GitHub-Api-Version": "2022-11-28",
		// 一个可识别的 UA 让 GitHub 好 debug(他们 API 明确要求带 UA)
		"User-Agent": "zerx-lab-website (+https://zerx.dev)",
	};
	if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;

	const all: GithubRepoStats[] = [];

	for (let page = 1; page <= MAX_PAGES; page++) {
		const url =
			`https://api.github.com/users/${owner}/repos` +
			`?per_page=${PER_PAGE}&type=owner&sort=pushed&page=${page}`;

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

		try {
			const res = await fetch(url, { headers, signal: controller.signal });

			// 429 / 403(限流)/ 404(账号不存在)/ 5xx 都走失败路径
			if (!res.ok) {
				if (res.status === 403 || res.status === 429) {
					const remaining = res.headers.get("x-ratelimit-remaining");
					console.warn(
						`[github] 列出 ${owner} 仓库触发限流 (status=${res.status}, remaining=${remaining ?? "?"})。` +
							`建议在 .env 里配置 GITHUB_TOKEN 提升到 5000/h。`,
					);
				} else {
					console.warn(`[github] 列出 ${owner} 仓库失败 status=${res.status}`);
				}
				return null;
			}

			const raw = (await res.json()) as RawGithubRepo[];
			all.push(...raw.map(toStats));
			// 不满一页说明已经到底,不用再翻
			if (raw.length < PER_PAGE) break;
		} catch (err) {
			// AbortError(超时)/ 网络 DNS 失败 / 解析失败 —— 一律静默返回 null
			const msg = (err as Error)?.message ?? String(err);
			console.warn(`[github] 列出 ${owner} 仓库请求异常: ${msg}`);
			return null;
		} finally {
			clearTimeout(timeoutId);
		}
	}

	return all;
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
 * 非 GitHub 链接(如产品官网)无法解析,返回 null,让调用方显式处理。
 */
export function normalizeRepo(input: string | null | undefined): string | null {
	if (!input) return null;
	let s = String(input).trim();
	if (!s) return null;

	// 非 github.com 的绝对 URL(产品官网 / AUR / npm)不是仓库地址
	if (/^https?:\/\//i.test(s) && !/^https?:\/\/(www\.)?github\.com\//i.test(s)) {
		return null;
	}

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

export interface OwnerReposOptions {
	/** 是否保留 fork 来的仓库,默认 false */
	includeForks?: boolean;
	/** 是否保留已归档仓库,默认 false */
	includeArchived?: boolean;
}

/**
 * 列出某个 GitHub 账号的公开仓库,按 star 降序。
 *
 * 缓存顺序:进程内 → 磁盘(24h TTL)→ API。任何一步失败都不抛错。
 *
 * @returns 仓库数组;null 表示拉取失败,调用方需要自己兜底
 */
export async function getOwnerRepos(
	owner: string,
	options: OwnerReposOptions = {},
): Promise<readonly GithubRepoStats[] | null> {
	const key = owner.trim().toLowerCase();
	if (!key) return null;

	let repos: GithubRepoStats[] | null;

	if (processCache.has(key)) {
		repos = processCache.get(key) ?? null;
	} else {
		const cache = await loadDiskCache();
		const entry = cache.owners[key];

		if (entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS) {
			repos = entry.repos;
		} else {
			repos = await fetchOwnerRepos(key);
			cache.owners[key] = { fetchedAt: Date.now(), repos };
			await flushDiskCache();
		}
		processCache.set(key, repos);
	}

	if (!repos) return null;

	const { includeForks = false, includeArchived = false } = options;
	return repos
		.filter((r) => (includeForks || !r.fork) && (includeArchived || !r.archived))
		.sort((a, b) => b.stars - a.stars);
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
