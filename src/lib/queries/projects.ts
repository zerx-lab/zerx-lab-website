/**
 * ============================================================================
 * 项目查询层(GitHub 实时清单 × 内容仓库登记)
 * ----------------------------------------------------------------------------
 * 唯一排序真相:GitHub。首页九宫格与 /projects 列表都从这里取数,保证同一次
 * 构建里两个页面的 star 数与顺序完全一致。
 *
 * 数据合并:
 *   - GitHub(@lib/github 的 getOwnerRepos)提供仓库清单、stars / forks /
 *     language / description / fork / archived —— 会漂的字段一律以它为准。
 *   - 内容仓库(src/content/data/projects.json)提供 GitHub 上没有的东西:
 *     双语描述、highlights、techStack、kind、demo / docs / npm 链接、featured。
 *
 * 收录规则(见 shouldList):
 *   1. 在 projects.json 里登记过 → 永远收录(人工精选优先)
 *   2. star ≥ 1 → 收录(含 fork:账号里 star 最高的仓库不该因为是 fork 被藏起来)
 *   3. 其余(0 star 的练手 / 配置 / awesome-list fork)不收录
 *   例外:GitHub 个人资料仓库(与账号同名)永远不收录,它是 README 不是项目。
 *
 * 降级:
 *   GitHub 拉取失败时 live=false,items 回落到 projects.json 快照,页面照常
 *   渲染,只是数字不是实时的。
 * ========================================================================== */

import {
	loadCounts,
	loadProjects,
	loadSite,
	type Bilingual,
	type ContentCounts,
	type ProjectData,
	type ProjectKind,
} from "@/lib/content";
import { getOwnerRepos, normalizeRepo, type GithubRepoStats } from "@/lib/github";

/**
 * 合并后的项目形状。
 * description / highlights 保持 Bilingual,由调用方按当前语言解包 ——
 * 未登记的仓库两种语言都是 GitHub 上那一份原文。
 */
export interface LiveProject {
	readonly slug: string;
	readonly name: string;
	readonly description: Bilingual;
	readonly highlights: Bilingual;
	readonly techStack: readonly string[];
	readonly kind: ProjectKind | null;
	readonly language: string;
	readonly githubUrl: string;
	readonly demoUrl: string | null;
	readonly docsUrl: string | null;
	readonly npmUrl: string | null;
	readonly stars: number;
	readonly forks: number;
	readonly featured: boolean;
	/** fork 来的仓库 —— 展示时要标注,不冒充自研 */
	readonly fork: boolean;
	readonly archived: boolean;
	/** 是否在 projects.json 里登记过(决定有没有双语文案可用) */
	readonly registered: boolean;
}

export interface LiveProjectsResult {
	/** 按 stars 降序 */
	readonly items: readonly LiveProject[];
	/** true = 来自 GitHub 实时清单;false = 回落到内容仓库快照 */
	readonly live: boolean;
}

/** 未登记仓库:GitHub 的单语描述同时填进 zh / en */
function monolingual(text: string): Bilingual {
	return { zh: text, en: text };
}

function repoName(fullName: string): string {
	return fullName.split("/")[1] ?? fullName;
}

function fromRepo(repo: GithubRepoStats, matched: ProjectData | null): LiveProject {
	const name = repoName(repo.fullName);
	const localLanguage =
		matched?.language && matched.language !== "Unknown" ? matched.language : null;

	return {
		slug: matched?.slug ?? name.toLowerCase(),
		name: matched?.name ?? name,
		description: matched?.description ?? monolingual(repo.description ?? ""),
		highlights: matched?.highlights ?? monolingual(""),
		techStack: matched?.techStack ?? repo.topics,
		kind: matched?.kind ?? null,
		// 人工判断优先:"TypeScript 项目但主要代码是 Go"这类结论 GitHub 给不出来
		language: localLanguage ?? repo.language ?? "Unknown",
		githubUrl: `https://github.com/${repo.fullName}`,
		demoUrl: matched?.demoUrl ?? null,
		docsUrl: matched?.docsUrl ?? null,
		npmUrl: matched?.npmUrl ?? null,
		stars: repo.stars,
		forks: repo.forks,
		featured: matched?.featured ?? false,
		fork: repo.fork,
		archived: repo.archived,
		registered: matched !== null,
	};
}

/** projects.json 条目在 GitHub 上找不到时(私有 / 改名 / 非 GitHub 托管)的兜底形状 */
function fromContent(project: ProjectData): LiveProject {
	return {
		slug: project.slug,
		name: project.name,
		description: project.description,
		highlights: project.highlights,
		techStack: project.techStack,
		kind: project.kind,
		language: project.language,
		githubUrl: project.githubUrl,
		demoUrl: project.demoUrl,
		docsUrl: project.docsUrl,
		npmUrl: project.npmUrl,
		stars: project.stars,
		forks: project.forks,
		featured: project.featured,
		fork: false,
		archived: false,
		registered: true,
	};
}

/**
 * 构建期记忆化:一次 astro build 里有 5 个页面(zh/en 首页、zh/en 项目页、
 * 关于页)要同一份清单,合并逻辑没必要跑 5 遍。按 includeUnlisted 分两档缓存。
 */
const memo = new Map<boolean, Promise<LiveProjectsResult>>();

/**
 * 载入合并后的项目清单,按 stars 降序。
 *
 * @param options.includeUnlisted true 时跳过收录规则,返回账号下全部公开仓库
 *        (首页"star 最多的前 N 个"用这个口径,不能被收录规则改变排名)
 */
export function loadLiveProjects(
	options: { includeUnlisted?: boolean } = {},
): Promise<LiveProjectsResult> {
	const key = options.includeUnlisted ?? false;
	let pending = memo.get(key);
	if (!pending) {
		pending = buildLiveProjects(key);
		memo.set(key, pending);
	}
	return pending;
}

async function buildLiveProjects(
	includeUnlisted: boolean,
): Promise<LiveProjectsResult> {
	const [site, registered] = await Promise.all([loadSite(), loadProjects()]);

	const owner = site.socialGithub.replace(/\/+$/, "").split("/").pop() ?? "";
	const repos = await getOwnerRepos(owner, {
		includeForks: true,
		includeArchived: true,
	});

	// GitHub 全挂:回落到内容仓库快照(loadProjects 已按 stars 降序)
	if (!repos) {
		return { items: registered.map(fromContent), live: false };
	}

	/** "owner/repo"(小写)→ projects.json 条目 */
	const byRepo = new Map(
		registered.flatMap((p) => {
			const full = normalizeRepo(p.githubUrl);
			return full ? [[full.toLowerCase(), p] as const] : [];
		}),
	);

	const ownerLower = owner.toLowerCase();

	const items: LiveProject[] = [];
	const consumed = new Set<string>();

	for (const repo of repos) {
		const key = repo.fullName.toLowerCase();
		const matched = byRepo.get(key) ?? null;
		if (matched) consumed.add(key);

		// GitHub 个人资料仓库是 README 卡片,任何口径下都不是项目
		if (repoName(key) === ownerLower) continue;
		if (!includeUnlisted && !matched && repo.stars < 1) continue;

		items.push(fromRepo(repo, matched));
	}

	// 登记过但 GitHub 清单里没有的(私有 / 改名 / 非 GitHub 托管):用快照补上
	for (const p of registered) {
		const full = normalizeRepo(p.githubUrl);
		if (full && consumed.has(full.toLowerCase())) continue;
		items.push(fromContent(p));
	}

	items.sort((a, b) => b.stars - a.stars);
	return { items, live: true };
}

/**
 * 全站计数,其中 projects / totalStars / totalForks 用 GitHub 实时清单覆盖。
 *
 * 为什么不直接改 @lib/content 的 loadCounts:那是纯内容层,不该依赖网络;
 * 而首页 meta、关于页 "IN NUMBERS" 与 /projects 左栏必须报同一个数,
 * 所以在查询层做这一次合并,三处共用。
 */
export async function loadLiveCounts(): Promise<ContentCounts> {
	const [counts, { items }] = await Promise.all([loadCounts(), loadLiveProjects()]);

	let totalStars = 0;
	let totalForks = 0;
	for (const p of items) {
		totalStars += p.stars;
		totalForks += p.forks;
	}

	return { ...counts, projects: items.length, totalStars, totalForks };
}
