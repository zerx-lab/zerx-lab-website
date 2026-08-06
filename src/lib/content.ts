/**
 * ============================================================================
 * 结构化内容访问层
 * ----------------------------------------------------------------------------
 * 站点内容全部来自 src/content/(见 src/content.config.ts),本模块负责:
 *   1. 双语字段解包(Bilingual → string)
 *   2. 把 Content Layer 的 entry 投影成页面直接可用的普通对象
 *   3. 稳定排序 —— JSON 文件的书写顺序即展示顺序,不依赖 loader 的枚举顺序
 *
 * 文章相关的查询在 src/lib/queries/posts.ts,本文件只管「数据」集合。
 * ============================================================================
 */

import { getCollection, getEntry } from "astro:content";

import type { Lang } from "@/i18n/ui";

/** 所有面向读者的文案字段的统一形状 */
export interface Bilingual {
	readonly zh: string;
	readonly en: string;
}

/** 取当前语言的值;缺失时回落中文(与全站 i18n 策略一致) */
export function pickLang(value: Bilingual, lang: Lang): string {
	return value[lang] ?? value.zh;
}

/* ----------------------------------------------------------------------------
 * 集合读取
 * ----------------------------------------------------------------------------
 * Astro 的 Content Layer 在本版本里没能把 schema 推导传递到 `entry.data`
 * (`InferEntrySchema` 退化成 any),于是 `getCollection(...)` 的回调参数会被
 * TS 判成隐式 any。把断言收敛到这一个入口:本文件下方那些 *Data 接口就是
 * src/content.config.ts 里 schema 的手写镜像,两边必须同步修改。
 * -------------------------------------------------------------------------- */

type CollectionName = Parameters<typeof getCollection>[0];

async function readData<T>(collection: CollectionName): Promise<T[]> {
	const entries = (await getCollection(collection)) as { data: unknown }[];
	return entries.map((entry) => entry.data as T);
}

/** 同上,但保留 entry 外壳(需要 id / body 时用) */
async function readEntries<T>(
	collection: CollectionName,
): Promise<{ id: string; data: T }[]> {
	return (await getCollection(collection)) as { id: string; data: T }[];
}

/* ----------------------------------------------------------------------------
 * 站点单例
 * -------------------------------------------------------------------------- */

export interface SiteData {
	readonly siteName: string;
	readonly tagline: Bilingual;
	readonly description: Bilingual;
	readonly socialGithub: string;
	readonly socialX: string | null;
	readonly socialEmail: string | null;
	readonly socialDiscord: string | null;
	readonly establishedYear: number;
	readonly location: Bilingual;
	readonly focus: string;
	readonly contributors: number;
	readonly ogImage: string | null;
}

export async function loadSite(): Promise<SiteData> {
	const entry = await getEntry("site", "site");
	if (!entry) {
		throw new Error(
			"src/content/data/site.json 缺失或未通过 schema 校验 —— 站点单例是必需内容",
		);
	}
	return entry.data as SiteData;
}

/* ----------------------------------------------------------------------------
 * 作者 / 分类 / 标签
 * -------------------------------------------------------------------------- */

export interface AuthorData {
	readonly slug: string;
	readonly name: string;
	readonly avatar: string | null;
	readonly github: string | null;
	readonly x: string | null;
	readonly email: string | null;
	readonly bio: Bilingual;
}

export async function loadAuthors(): Promise<readonly AuthorData[]> {
	return readData<AuthorData>("authors");
}

/** slug → 作者,供文章渲染时 O(1) 关联 */
export async function loadAuthorMap(): Promise<ReadonlyMap<string, AuthorData>> {
	return new Map((await loadAuthors()).map((a) => [a.slug, a]));
}

export interface CategoryData {
	readonly slug: string;
	readonly name: Bilingual;
	readonly description: Bilingual;
}

export async function loadCategories(): Promise<readonly CategoryData[]> {
	return readData<CategoryData>("categories");
}

export async function loadCategoryMap(): Promise<
	ReadonlyMap<string, CategoryData>
> {
	return new Map((await loadCategories()).map((c) => [c.slug, c]));
}

export interface TagData {
	readonly slug: string;
	readonly name: Bilingual;
}

export async function loadTags(): Promise<readonly TagData[]> {
	return readData<TagData>("tags");
}

export async function loadTagMap(): Promise<ReadonlyMap<string, TagData>> {
	return new Map((await loadTags()).map((t) => [t.slug, t]));
}

/* ----------------------------------------------------------------------------
 * 项目
 * -------------------------------------------------------------------------- */

export type ProjectKind = "library" | "tool" | "app" | "experiment" | "service";

export interface ProjectData {
	readonly slug: string;
	readonly name: string;
	readonly description: Bilingual;
	readonly techStack: readonly string[];
	readonly kind: ProjectKind;
	readonly language: string;
	readonly githubUrl: string;
	readonly demoUrl: string | null;
	readonly docsUrl: string | null;
	readonly npmUrl: string | null;
	readonly stars: number;
	readonly forks: number;
	readonly featured: boolean;
	readonly highlights: Bilingual;
}

/** 按 stars 降序(快照口径);实时排序见 @lib/queries/projects */
export async function loadProjects(): Promise<readonly ProjectData[]> {
	const projects = await readData<ProjectData>("projects");
	return projects.sort((a, b) => b.stars - a.stars);
}

/* ----------------------------------------------------------------------------
 * AUR 包
 * -------------------------------------------------------------------------- */

export interface AurPackageData {
	readonly slug: string;
	readonly name: string;
	readonly version: string;
	readonly description: Bilingual;
	readonly badges: readonly string[];
	readonly aurUrl: string;
	readonly upstreamUrl: string | null;
	readonly maintained: boolean;
}

export async function loadAurPackages(): Promise<readonly AurPackageData[]> {
	return readData<AurPackageData>("aur");
}

/* ----------------------------------------------------------------------------
 * 语言占比
 * -------------------------------------------------------------------------- */

export interface LanguageStat {
	readonly name: string;
	readonly percent: number;
	readonly color: string;
}

/** 按占比降序 */
export async function loadLanguageStats(): Promise<readonly LanguageStat[]> {
	const stats = await readData<LanguageStat>("languageStats");
	return stats.sort((a, b) => b.percent - a.percent);
}

/* ----------------------------------------------------------------------------
 * 聚合计数
 * -------------------------------------------------------------------------- */

export interface ContentCounts {
	readonly posts: number;
	readonly projects: number;
	readonly featuredProjects: number;
	readonly aurPackages: number;
	readonly categories: number;
	readonly tags: number;
	readonly authors: number;
	readonly totalStars: number;
	readonly totalForks: number;
}

/**
 * 全站计数。
 * totalStars / totalForks 由项目数据实时汇总 —— 迁移前 site_settings 里
 * 存过一份手写快照,两份数字必然漂移,这里只保留可计算的那一份。
 */
export async function loadCounts(): Promise<ContentCounts> {
	const [projects, aur, categories, tags, authors, posts] = await Promise.all([
		loadProjects(),
		loadAurPackages(),
		loadCategories(),
		loadTags(),
		loadAuthors(),
		readEntries<{ draft: boolean }>("posts"),
	]);

	return {
		// 一篇文章两个语言文件,只数中文那份;draft 不计入
		posts: posts.filter((e) => e.id.endsWith("/zh") && !e.data.draft).length,
		projects: projects.length,
		featuredProjects: projects.filter((p) => p.featured).length,
		aurPackages: aur.length,
		categories: categories.length,
		tags: tags.length,
		authors: authors.length,
		totalStars: projects.reduce((sum, p) => sum + p.stars, 0),
		totalForks: projects.reduce((sum, p) => sum + p.forks, 0),
	};
}
