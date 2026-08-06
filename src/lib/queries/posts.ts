/**
 * ============================================================================
 * 文章查询层(Content Collections)
 * ----------------------------------------------------------------------------
 * 唯一数据源:src/content/posts/<slug>/{zh,en}.md(见 src/content.config.ts)。
 *
 * 双语模型:
 *   一篇文章 = 一个目录 + 两个语言文件。entry.id 形如 "<slug>/zh"。
 *   语言无关字段(date / author / category / tags / featured / cover / draft)
 *   **以 zh 文件为准**,en 文件的同名字段被忽略,避免同一事实两处漂移。
 *   en 文件缺失时英文页回落到中文正文。
 *
 * 与迁移前的差异:
 *   - 不再有 status;用 frontmatter 的 draft 表达"不发布"
 *   - listPostsPaged 不再接受搜索词 —— 静态站的搜索在客户端做
 *     (索引由 src/pages/search/[lang].json.ts 构建期产出)
 *   - PostVM 多带一个 entry 字段,供详情页调用 render() 渲染正文与 TOC
 * ========================================================================== */

import { getCollection, type CollectionEntry } from "astro:content";

import {
	loadAuthorMap,
	loadCategoryMap,
	loadTagMap,
	pickLang,
	type AuthorData,
	type CategoryData,
} from "@/lib/content";
import { readingStats } from "@/lib/reading-time";
import type { Lang } from "@/i18n/ui";

/**
 * 文章 frontmatter —— `src/content.config.ts` 里 posts schema 的手写镜像。
 *
 * Astro 本版本的 Content Layer 没把 zod 推导传到 `entry.data`(退化成 any),
 * 所以这里显式声明一次形状,再把 CollectionEntry 的 data 换掉。两边字段必须
 * 同步修改,schema 是唯一的运行时校验。
 */
export interface PostFrontmatter {
	title: string;
	excerpt: string;
	coverLabel: string;
	seoTitle?: string;
	seoDescription?: string;
	date: Date;
	updatedDate?: Date;
	author: string;
	category: string;
	tags: string[];
	featured: boolean;
	cover?: string;
	draft: boolean;
}

export type PostEntry = Omit<CollectionEntry<"posts">, "data"> & {
	data: PostFrontmatter;
};

/* ----------------------------------------------------------------------------
 * 对外类型
 * -------------------------------------------------------------------------- */

/** 单个标签的展示形态(slug 做 key / 链接,name 做显示文本) */
export interface PostTagVM {
	slug: string;
	name: string;
}

/**
 * 博客详情页 / 列表卡片共用的 ViewModel。
 *
 * 关键字段说明:
 *   - content      Markdown 原文,未渲染(搜索索引、摘要截断用)
 *   - entry        Content Layer 条目;详情页 `render(entry)` 拿 Content + headings
 *   - coverLabel   封面缺失时的大字占位文本
 *   - updatedDate  文章被编辑过才有值,否则 null —— 页面据此决定是否显示
 */
export interface PostVM {
	slug: string;
	title: string;
	excerpt: string;
	content: string;
	coverLabel: string;
	cover: string | null;
	authorName: string | null;
	authorBio: string | null;
	authorGithub: string | null;
	authorAvatar: string | null;
	categorySlug: string | null;
	categoryName: string | null;
	tags: readonly PostTagVM[];
	date: string;
	updatedDate: string | null;
	readingTime: number;
	featured: boolean;
	seoTitle: string | null;
	seoDescription: string | null;
	entry: PostEntry;
}

/* ----------------------------------------------------------------------------
 * entry.id 解析
 * -------------------------------------------------------------------------- */

interface ParsedId {
	readonly slug: string;
	readonly lang: Lang;
}

/** "<slug>/zh" → { slug, lang }。不符合约定的 id 返回 null(会被静默跳过)。 */
function parseId(id: string): ParsedId | null {
	const cut = id.lastIndexOf("/");
	if (cut <= 0) return null;
	const lang = id.slice(cut + 1);
	if (lang !== "zh" && lang !== "en") return null;
	return { slug: id.slice(0, cut), lang };
}

/* ----------------------------------------------------------------------------
 * 索引:一次装载,全站共享
 * ----------------------------------------------------------------------------
 * 构建期同一个 Node 进程会渲染上百个页面,每页都重扫一遍 collection 是纯浪费。
 * 这里按语言缓存一份「已排序的 slug → entry」索引。
 * -------------------------------------------------------------------------- */

interface PostIndex {
	/** 按发布时间倒序 */
	readonly ordered: readonly string[];
	/** slug → 中文条目(语言无关字段的权威来源) */
	readonly zh: ReadonlyMap<string, PostEntry>;
	/** slug → 英文条目;缺失表示该文尚无英文版 */
	readonly en: ReadonlyMap<string, PostEntry>;
}

let indexPromise: Promise<PostIndex> | null = null;

async function buildIndex(): Promise<PostIndex> {
	const entries = (await getCollection("posts")) as PostEntry[];

	const zh = new Map<string, PostEntry>();
	const en = new Map<string, PostEntry>();

	for (const entry of entries) {
		const parsed = parseId(entry.id);
		if (!parsed) continue;
		(parsed.lang === "zh" ? zh : en).set(parsed.slug, entry);
	}

	// 发布与否只看中文条目的 draft —— 它是语言无关字段的权威来源
	const ordered = [...zh.entries()]
		.filter(([, entry]) => !entry.data.draft)
		.sort((a, b) => b[1].data.date.getTime() - a[1].data.date.getTime())
		.map(([slug]) => slug);

	return { ordered, zh, en };
}

function getIndex(): Promise<PostIndex> {
	indexPromise ??= buildIndex();
	return indexPromise;
}

/* ----------------------------------------------------------------------------
 * entry → PostVM
 * -------------------------------------------------------------------------- */

interface Relations {
	readonly authors: ReadonlyMap<string, AuthorData>;
	readonly categories: ReadonlyMap<string, CategoryData>;
	readonly tags: ReadonlyMap<string, { slug: string; name: { zh: string; en: string } }>;
}

let relationsPromise: Promise<Relations> | null = null;

function getRelations(): Promise<Relations> {
	relationsPromise ??= (async () => {
		const [authors, categories, tags] = await Promise.all([
			loadAuthorMap(),
			loadCategoryMap(),
			loadTagMap(),
		]);
		return { authors, categories, tags };
	})();
	return relationsPromise;
}

/**
 * 组装 ViewModel。
 * `base` 是中文条目(语言无关字段来源),`localized` 是目标语言条目
 * (英文缺失时二者相同 —— 英文页会显示中文正文,好过 404)。
 */
function toVM(
	slug: string,
	base: PostEntry,
	localized: PostEntry,
	lang: Lang,
	rel: Relations,
): PostVM {
	const shared = base.data;
	const text = localized.data;

	const author = rel.authors.get(shared.author);
	const category = rel.categories.get(shared.category);

	return {
		slug,
		title: text.title,
		excerpt: text.excerpt,
		content: localized.body ?? "",
		coverLabel: text.coverLabel,
		cover: shared.cover ?? null,
		authorName: author?.name ?? null,
		authorBio: author ? pickLang(author.bio, lang) : null,
		authorGithub: author?.github ?? null,
		authorAvatar: author?.avatar ?? null,
		categorySlug: shared.category,
		categoryName: category ? pickLang(category.name, lang) : null,
		tags: shared.tags.flatMap((tagSlug) => {
			const tag = rel.tags.get(tagSlug);
			// 未登记的 tag 直接丢弃 —— 显示裸 slug 比不显示更糟
			return tag ? [{ slug: tag.slug, name: pickLang(tag.name, lang) }] : [];
		}),
		date: shared.date.toISOString(),
		updatedDate: shared.updatedDate?.toISOString() ?? null,
		readingTime: readingStats(localized.body ?? "").minutes,
		featured: shared.featured,
		seoTitle: text.seoTitle ?? null,
		seoDescription: text.seoDescription ?? null,
		entry: localized,
	};
}

/** 在索引里取某篇文章某语言的条目对;文章不存在或未发布时返回 null */
async function resolve(
	slug: string,
	lang: Lang,
	index: PostIndex,
): Promise<{ base: PostEntry; localized: PostEntry } | null> {
	const base = index.zh.get(slug);
	if (!base || base.data.draft) return null;
	const localized = lang === "en" ? (index.en.get(slug) ?? base) : base;
	return { base, localized };
}

/* ============================================================================
 * 1. listPublishedPostSlugs() —— 供 getStaticPaths / sitemap 使用
 * ========================================================================== */

export async function listPublishedPostSlugs(): Promise<readonly string[]> {
	return (await getIndex()).ordered;
}

/* ============================================================================
 * 2. loadPostBySlug(slug, lang) —— 单篇详情
 * ========================================================================== */

export async function loadPostBySlug(
	slug: string,
	lang: Lang,
): Promise<PostVM | null> {
	const index = await getIndex();
	const pair = await resolve(slug, lang, index);
	if (!pair) return null;
	return toVM(slug, pair.base, pair.localized, lang, await getRelations());
}

/* ============================================================================
 * 3. loadAdjacentPosts(slug, lang) —— 上一篇 / 下一篇
 * ----------------------------------------------------------------------------
 * 顺序与列表页一致(发布时间倒序):
 *   previous = 时间上更早的一篇(列表中排在后面)
 *   next     = 时间上更晚的一篇(列表中排在前面)
 * ========================================================================== */

export interface AdjacentPostVM {
	slug: string;
	title: string;
	date: string;
}

export interface AdjacentPair {
	previous: AdjacentPostVM | null;
	next: AdjacentPostVM | null;
}

export async function loadAdjacentPosts(
	slug: string,
	lang: Lang,
): Promise<AdjacentPair> {
	const index = await getIndex();
	const at = index.ordered.indexOf(slug);
	if (at < 0) return { previous: null, next: null };

	const pick = (i: number): AdjacentPostVM | null => {
		const target = index.ordered[i];
		if (!target) return null;
		const base = index.zh.get(target);
		if (!base) return null;
		const localized = lang === "en" ? (index.en.get(target) ?? base) : base;
		return {
			slug: target,
			title: localized.data.title,
			date: base.data.date.toISOString(),
		};
	};

	return { previous: pick(at + 1), next: pick(at - 1) };
}

/* ============================================================================
 * 4. listPostsPaged({ lang, page, pageSize, categorySlug }) —— 列表页分页
 * ----------------------------------------------------------------------------
 * 静态站的分页走路径(/blog/page/2),page 由 getStaticPaths 生成,一定合法;
 * 仍然做 clamp,避免手写路由时静默产出空页。
 * ========================================================================== */

export const DEFAULT_PAGE_SIZE = 10;

export interface PostsPageResult {
	items: readonly PostVM[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface PostsPageParams {
	lang: Lang;
	/** 1-indexed */
	page: number;
	/** 每页条数,默认 10 */
	pageSize?: number;
	/** 分类 slug;空串 / undefined / "all" 表示不过滤 */
	categorySlug?: string;
}

/** 归一化分类参数:空串 / "all" / 全空白 → 空串("不过滤") */
function normalizeCategorySlug(v: string | undefined | null): string {
	const s = (v ?? "").trim();
	return s === "" || s === "all" ? "" : s;
}

export async function listPostsPaged(
	params: PostsPageParams,
): Promise<PostsPageResult> {
	const { lang } = params;
	const pageSize = Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE);
	const category = normalizeCategorySlug(params.categorySlug);

	const index = await getIndex();
	const slugs = category
		? index.ordered.filter((s) => index.zh.get(s)?.data.category === category)
		: index.ordered;

	const total = slugs.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const page = Math.min(Math.max(1, Math.floor(params.page) || 1), totalPages);

	const rel = await getRelations();
	const items = slugs
		.slice((page - 1) * pageSize, page * pageSize)
		.flatMap((slug) => {
			const base = index.zh.get(slug);
			if (!base) return [];
			const localized = lang === "en" ? (index.en.get(slug) ?? base) : base;
			return [toVM(slug, base, localized, lang, rel)];
		});

	return { items, total, page, pageSize, totalPages };
}

/** 某个分类下的总页数 —— 供 getStaticPaths 枚举分页路由 */
export async function countPagesFor(
	categorySlug: string | undefined,
	pageSize = DEFAULT_PAGE_SIZE,
): Promise<number> {
	const category = normalizeCategorySlug(categorySlug);
	const index = await getIndex();
	const total = category
		? index.ordered.filter((s) => index.zh.get(s)?.data.category === category)
				.length
		: index.ordered.length;
	return Math.max(1, Math.ceil(total / pageSize));
}

/* ============================================================================
 * 5. listCategoryCounts() —— 分类切换器的计数条
 * ========================================================================== */

export interface CategoryCounts {
	/** slug → 已发布文章数;计数为 0 的分类不会出现在这里 */
	byCategory: Record<string, number>;
	/** 已发布文章总数 */
	total: number;
}

export async function listCategoryCounts(): Promise<CategoryCounts> {
	const index = await getIndex();
	const byCategory: Record<string, number> = {};

	for (const slug of index.ordered) {
		const category = index.zh.get(slug)?.data.category;
		if (!category) continue;
		byCategory[category] = (byCategory[category] ?? 0) + 1;
	}

	return { byCategory, total: index.ordered.length };
}

/* ============================================================================
 * 6. listCategories(lang) —— 分类切换器的可选项
 * ----------------------------------------------------------------------------
 * 只返回「至少有一篇已发布文章」的分类:空分类点进去是空页,不值得占位置。
 * ========================================================================== */

export interface CategoryVM {
	slug: string;
	name: string;
}

export async function listCategories(
	lang: Lang,
): Promise<readonly CategoryVM[]> {
	const [{ byCategory }, categories] = await Promise.all([
		listCategoryCounts(),
		loadCategoryMap(),
	]);

	return [...categories.values()]
		.filter((c) => (byCategory[c.slug] ?? 0) > 0)
		.map((c) => ({ slug: c.slug, name: pickLang(c.name, lang) }));
}

/** 有文章的分类 slug 列表 —— 供 getStaticPaths 枚举分类路由 */
export async function listCategorySlugsWithPosts(): Promise<readonly string[]> {
	return Object.keys((await listCategoryCounts()).byCategory);
}

/* ============================================================================
 * 7. listPostsForFeed() —— RSS(双语一次取齐)
 * ========================================================================== */

/**
 * Feed 消费需要的最小字段集。
 *
 * 字段命名刻意扁平化(titleZh / titleEn 而非 { title: { zh, en } }):
 * RSS 构造代码按语言分支写,扁平结构更贴近消费点。
 */
export interface FeedPost {
	slug: string;
	/** ISO 8601 */
	date: string;
	titleZh: string;
	titleEn: string;
	excerptZh: string;
	excerptEn: string;
	categoryNameZh: string | null;
	categoryNameEn: string | null;
	authorName: string | null;
	/** 用于 RSS <author>,按 RFC 拼成 "email (name)" */
	authorEmail: string | null;
}

export async function listPostsForFeed(): Promise<readonly FeedPost[]> {
	const [index, rel] = await Promise.all([getIndex(), getRelations()]);

	return index.ordered.flatMap((slug) => {
		const zh = index.zh.get(slug);
		if (!zh) return [];
		const en = index.en.get(slug) ?? zh;

		const author = rel.authors.get(zh.data.author);
		const category = rel.categories.get(zh.data.category);

		return [
			{
				slug,
				date: zh.data.date.toISOString(),
				titleZh: zh.data.title,
				titleEn: en.data.title,
				excerptZh: zh.data.excerpt,
				excerptEn: en.data.excerpt,
				categoryNameZh: category?.name.zh ?? null,
				categoryNameEn: category?.name.en ?? null,
				authorName: author?.name ?? null,
				authorEmail: author?.email ?? null,
			},
		];
	});
}
