/**
 * ============================================================================
 * ZerxLab Website - Posts 查询层
 * ----------------------------------------------------------------------------
 * 博客详情页与相关路由的"数据网关"。把三个前端真正需要的操作收敛到此:
 *
 *   1. listPublishedPostSlugs()    - 枚举所有已发布文章的 slug
 *      供 `src/pages/blog/[slug].astro` 与 `src/pages/en/blog/[slug].astro`
 *      的 getStaticPaths 用。两个入口共用同一套 slug(URL 不做翻译,靠 /en/
 *      前缀区分)。
 *
 *   2. loadPostBySlug(slug, lang)  - 单篇文章 + 关联(作者 / 分类 / 标签)
 *      返回渲染就绪的 PostVM;文章不存在返回 null;Directus 失败回落 fallback。
 *
 *   3. loadAdjacentPosts(slug)     - 按 date_published 降序相邻的文章
 *      生成"上一篇 / 下一篇"卡片,返回的已经是 PostVM(需要传 lang),
 *      以避免调用方重复处理 Bilingual 解包。
 *
 * 数据源优先级(每个函数都遵守):
 *   Directus(带 DIRECTUS_READ_TOKEN)→ fallback-data → 空值
 *
 *   - 任一层异常不会向外抛错,只打 console.warn 并降级
 *   - fallback 的存在保证 Directus 挂掉 / token 失效 / schema 变更不影响构建
 *
 * 为什么把这一块独立成文件:
 *   - BlogPostPage.astro 已经 300+ 行,再塞三段异构数据加载逻辑会更糟
 *   - RSS / sitemap / blog-index 未来可能复用 listPublishedPostSlugs
 *   - 抽离后配合 posts/index.ts 可以做单元测试(目前还没建,预留通路)
 * ============================================================================ */

import { directus, readItems, DIRECTUS_CONFIG, assetUrl } from "@/lib/directus";
import {
	findFallbackPost,
	listFallbackPosts,
	getAdjacentPosts,
	findAuthor,
	findCategory,
	findTag,
	pickLang,
	type FallbackPost,
} from "@/lib/fallback-data";
import type { Lang } from "@/i18n/ui";

/* ----------------------------------------------------------------------------
 * 对外类型
 * ----------------------------------------------------------------------------
 * PostVM 是"博客详情页最终会渲染的形状"。两个数据源都要折成这个形状,
 * 页面组件 BlogPostPage.astro 已经按此消费,改动最小。
 * ---------------------------------------------------------------------------- */

/** 单个标签的展示形态(slug 做 key / 链接,name 做显示文本) */
export interface PostTagVM {
	slug: string;
	name: string;
}

/**
 * 博客详情页的 ViewModel。
 *
 * 关键字段说明:
 *   - content      Markdown 原文,未渲染
 *   - coverLabel   封面缺失时的大字占位文本(列表卡片、OG 图都能用)
 *   - cover        封面图绝对 URL(Directus 来源会自动拼 /assets/<uuid>?...)
 *   - updatedDate  文章被编辑过才有值,未编辑过为 null —— 页面据此决定是否显示
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
}

/* ----------------------------------------------------------------------------
 * 语言代码映射
 * ----------------------------------------------------------------------------
 * 项目内部用 "zh" / "en" 这种短码(URL 与 i18n/ui.ts 的惯例);
 * Directus translations 表用完整 BCP 47 "zh-CN" / "en-US"。
 * 所有 Directus 交互都在本文件内完成,映射也收敛在此。
 * ---------------------------------------------------------------------------- */

function langToDirectusCode(lang: Lang): "zh-CN" | "en-US" {
	return lang === "zh" ? "zh-CN" : "en-US";
}

/**
 * 在一组 translations 里按语言代码挑一条。
 * 兼容 languages_code 是 M2O 被展开成 { code: "zh-CN" } 对象,或者只留字符串 code 两种形态。
 *
 * 返回值类型故意是 Record<string, any>:
 *   - Directus SDK 对深层嵌套 translations 的泛型推导覆盖不到业务字段
 *     (title / bio / name / cover_label 等都是 bootstrap 动态添加的)
 *   - 如果沿用传入泛型 T,调用处访问 .title / .bio 会触发 TS "Property does not exist"
 *   - 本文件已经把 Directus 查询结果当 any 处理,translation 子对象也保持同级别的宽松
 *
 * 本函数仅用于本文件内部,风险可控。
 */
function pickTranslation(
	translations: readonly { languages_code?: unknown }[] | undefined | null,
	langCode: string,
): Record<string, any> | undefined {
	if (!translations || translations.length === 0) return undefined;
	return translations.find((x) => {
		const code = x?.languages_code;
		if (typeof code === "string") return code === langCode;
		if (code && typeof code === "object" && "code" in code) {
			return (code as { code?: string }).code === langCode;
		}
		return false;
	}) as Record<string, any> | undefined;
}

/* ----------------------------------------------------------------------------
 * Fallback → PostVM
 * ----------------------------------------------------------------------------
 * 与 BlogPostPage.astro 里原本的 fallbackToVM 逻辑一致,这里收编以保持一致性。
 * 注意:authorAvatar 在 fallback 里是 URL 字符串(GitHub 头像),直接透传即可;
 * Directus 路径上则是 file uuid,需要经 assetUrl 拼完整 URL。
 * ---------------------------------------------------------------------------- */

function fallbackToVM(post: FallbackPost, lang: Lang): PostVM {
	const author = findAuthor(post.authorSlug);
	const category = findCategory(post.categorySlug);

	const tags = post.tagSlugs
		.map((s): PostTagVM | null => {
			const tag = findTag(s);
			if (!tag) return null;
			return { slug: tag.slug, name: pickLang(tag.name, lang) };
		})
		.filter((x): x is PostTagVM => x !== null);

	return {
		slug: post.slug,
		title: pickLang(post.title, lang),
		excerpt: pickLang(post.excerpt, lang),
		content: pickLang(post.content, lang),
		coverLabel: pickLang(post.coverLabel, lang),
		cover: post.cover,
		authorName: author?.name ?? null,
		authorBio: author ? pickLang(author.bio, lang) : null,
		authorGithub: author?.github ?? null,
		authorAvatar: author?.avatar ?? null,
		categorySlug: category?.slug ?? null,
		categoryName: category ? pickLang(category.name, lang) : null,
		tags,
		date: post.date,
		updatedDate: post.updatedDate,
		readingTime: post.readingTime,
		featured: post.featured,
	};
}

/* ----------------------------------------------------------------------------
 * Directus → PostVM
 * ----------------------------------------------------------------------------
 * 展开规则(fields 参数):
 *   - posts 主体字段
 *   - translations:按当前语言挑 title/excerpt/content/cover_label
 *   - author(M2O): name / github / avatar / translations.bio(当前语言)
 *   - category(M2O): slug / translations.name(当前语言)
 *   - tags(M2M via posts_tags): tags_id.slug / tags_id.translations.name
 *
 * 返回的 row 形状取自 Directus 实际 OAS(typegen 生成的 Schema),
 * 但嵌套 translations / M2M 的 fields 深度 Schema 很难 100% 推到底,
 * 所以内部查询用 `any` 断言,由本函数自己保证字段访问安全。
 * ---------------------------------------------------------------------------- */

const POST_FIELDS_FULL = [
	"id",
	"slug",
	"status",
	"featured",
	"reading_time",
	"date_published",
	"date_updated",
	"cover",
	{
		author: [
			"id",
			"slug",
			"name",
			"github",
			"avatar",
			{
				translations: ["languages_code", "bio"],
			},
		],
	},
	{
		category: [
			"id",
			"slug",
			{
				translations: ["languages_code", "name"],
			},
		],
	},
	{
		tags: [
			{
				tags_id: [
					"id",
					"slug",
					{
						translations: ["languages_code", "name"],
					},
				],
			},
		],
	},
	{
		translations: [
			"languages_code",
			"title",
			"excerpt",
			"content",
			"cover_label",
		],
	},
];

function directusRowToVM(row: any, lang: Lang): PostVM | null {
	if (!row || typeof row !== "object" || !row.slug) return null;

	const langCode = langToDirectusCode(lang);

	const tr =
		pickTranslation(row.translations, langCode) ?? row.translations?.[0];
	const catTr = pickTranslation(row.category?.translations, langCode);
	const authorTr = pickTranslation(row.author?.translations, langCode);

	// tags: posts_tags 中间表 → tags_id 是展开后的 tag 对象
	const tags: PostTagVM[] = Array.isArray(row.tags)
		? row.tags
				.map((link: any): PostTagVM | null => {
					const tag = link?.tags_id;
					if (!tag?.slug) return null;
					const tagTr = pickTranslation(tag.translations, langCode);
					return {
						slug: tag.slug,
						name: tagTr?.name ?? tag.slug,
					};
				})
				.filter((x: PostTagVM | null): x is PostTagVM => x !== null)
		: [];

	// cover 是 file uuid,需要拼 /assets/<uuid>?... 才能直接用作 <img src>
	const cover =
		typeof row.cover === "string" && row.cover
			? assetUrl(row.cover, { width: 1200, format: "webp", quality: 85 })
			: null;

	// author.avatar 同理
	const authorAvatar =
		typeof row.author?.avatar === "string" && row.author.avatar
			? assetUrl(row.author.avatar, {
					width: 96,
					height: 96,
					fit: "cover",
					format: "webp",
				})
			: null;

	return {
		slug: String(row.slug),
		title: tr?.title ?? "(untitled)",
		excerpt: tr?.excerpt ?? "",
		content: tr?.content ?? "",
		coverLabel: tr?.cover_label ?? tr?.title ?? "",
		cover,
		authorName: row.author?.name ?? null,
		authorBio: authorTr?.bio ?? null,
		authorGithub: row.author?.github ?? null,
		authorAvatar,
		categorySlug: row.category?.slug ?? null,
		categoryName: catTr?.name ?? null,
		tags,
		date: row.date_published ?? new Date().toISOString(),
		updatedDate: row.date_updated ?? null,
		readingTime: typeof row.reading_time === "number" ? row.reading_time : 0,
		featured: Boolean(row.featured),
	};
}

/* ============================================================================
 * 1. listPublishedPostSlugs() — 供 getStaticPaths 使用
 * ----------------------------------------------------------------------------
 * 返回全部"已发布且可以生成详情页"的 slug。
 *
 * 为什么要合并两个来源:
 *   - Directus 是权威源,真实内容都在这
 *   - 但 fallback-data 里的文章可能还没迁进 Directus(bootstrap/seed 之前的状态),
 *     如果只用 Directus,老链接会 404
 *   → 取两边的 slug 并集,优先信任 Directus 顺序
 *
 * 去重策略:Directus 的 slug 先进集合,fallback 只补缺失项。
 * 排序策略:不排序,返回顺序仅影响 Astro 生成页面的顺序,不影响用户可见结果。
 * ========================================================================== */

export async function listPublishedPostSlugs(): Promise<readonly string[]> {
	const slugs = new Set<string>();

	// 1. Directus
	if (DIRECTUS_CONFIG.hasReadToken || !DIRECTUS_CONFIG.hasReadToken) {
		// 即使没有 token 也尝试匿名读 —— Public policy 允许读 published。
		// 失败无所谓,下面 fallback 兜底。
		try {
			const client = directus();
			const rows = (await client.request(
				readItems("posts", {
					filter: { status: { _eq: "published" } },
					fields: ["slug"],
					limit: -1,
				}),
			)) as Array<{ slug?: string }>;

			for (const row of rows) {
				if (row?.slug) slugs.add(row.slug);
			}
		} catch (err) {
			console.warn(
				"[posts] listPublishedPostSlugs 从 Directus 读取失败,仅使用 fallback:",
				(err as Error)?.message ?? err,
			);
		}
	}

	// 2. Fallback 补充(并集,保证老链接永远有页面)
	for (const p of listFallbackPosts()) {
		slugs.add(p.slug);
	}

	return Array.from(slugs);
}

/* ============================================================================
 * 2. loadPostBySlug(slug, lang) — 单篇详情
 * ----------------------------------------------------------------------------
 * 先从 Directus 拉,拉不到或报错则查 fallback-data;都找不到返回 null。
 * 返回的 PostVM 已经按 lang 解包完毕,页面直接渲染。
 * ========================================================================== */

export async function loadPostBySlug(
	slug: string,
	lang: Lang,
): Promise<PostVM | null> {
	if (!slug) return null;

	// 1. Directus
	try {
		const client = directus();
		// 用 readItems + filter 而不是 readItem:readItem 要传数字/uuid id,
		// 而我们只有 slug;readItems + limit:1 是 Directus 官方推荐模式。
		const rows = (await client.request(
			readItems("posts", {
				filter: {
					_and: [{ status: { _eq: "published" } }, { slug: { _eq: slug } }],
				},
				fields: POST_FIELDS_FULL as any,
				limit: 1,
			}),
		)) as any[];

		const row = rows[0];
		const vm = directusRowToVM(row, lang);
		if (vm) return vm;
	} catch (err) {
		console.warn(
			`[posts] loadPostBySlug("${slug}") Directus 读取失败,尝试 fallback:`,
			(err as Error)?.message ?? err,
		);
	}

	// 2. Fallback
	const fb = findFallbackPost(slug);
	if (fb) return fallbackToVM(fb, lang);

	// 3. 真的没这篇文章
	return null;
}

/* ============================================================================
 * 3. loadAdjacentPosts(slug, lang) — 上一篇 / 下一篇
 * ----------------------------------------------------------------------------
 * "相邻"语义:按 date_published 降序排列,当前文章的前后两条即为 next/previous。
 *
 *   sorted(desc by date_published):
 *     [0] 最新        ← 如果当前是 [i],那 [i-1] 是 next(更新)
 *     [1]
 *     [i] ← 当前
 *     [i+1] 是 previous(更老)
 *
 * 当前策略:拉全部已发布的 { slug, title, date_published },在内存里定位。
 * 成本极低(博客总量几百篇以内),避免"两次带 _lt/_gt 的复杂查询"。
 *
 * 返回的是已经按 lang 解包的轻量 VM(只含卡片需要的 slug / title / date),
 * 调用方不需要再跑一次 loadPostBySlug。
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
	if (!slug) return { previous: null, next: null };

	// 1. Directus
	try {
		const client = directus();
		const langCode = langToDirectusCode(lang);

		const rows = (await client.request(
			readItems("posts", {
				filter: { status: { _eq: "published" } },
				sort: ["-date_published"],
				fields: [
					"slug",
					"date_published",
					{ translations: ["languages_code", "title"] },
				] as any,
				limit: -1,
			}),
		)) as any[];

		const index = rows.findIndex((r) => r?.slug === slug);
		if (index === -1) {
			// Directus 里没有这篇(可能还在 fallback 里),交给下面降级
			throw new Error("slug not in Directus result");
		}

		const toVM = (row: any): AdjacentPostVM | null => {
			if (!row?.slug) return null;
			const tr = pickTranslation(row.translations, langCode);
			return {
				slug: String(row.slug),
				title: tr?.title ?? String(row.slug),
				date: row.date_published ?? "",
			};
		};

		// 降序数组里:i-1 更新(next),i+1 更老(previous)
		return {
			previous: toVM(rows[index + 1] ?? null),
			next: toVM(rows[index - 1] ?? null),
		};
	} catch (err) {
		// 错误不打 warn:slug 不在 Directus 里是正常分支(fallback only 文章)
		void err;
	}

	// 2. Fallback
	const { previous, next } = getAdjacentPosts(slug);
	const fbToAdj = (p: FallbackPost | null): AdjacentPostVM | null =>
		p ? { slug: p.slug, title: pickLang(p.title, lang), date: p.date } : null;

	return {
		previous: fbToAdj(previous),
		next: fbToAdj(next),
	};
}

/* ============================================================================
 * 4. listPostsForFeed() — 供 RSS / sitemap 等"全量双语列表"场景
 * ----------------------------------------------------------------------------
 * RSS feed 的消费特征与详情页不同:
 *   - 需要同一篇文章的中英两个版本(作为两条 <item>)
 *   - 每条只要 title / excerpt / author / category name,不需要 content
 *   - 对 tag / cover / reading_time / featured 等字段不关心
 *
 * 直接复用 loadPostBySlug 逐篇查会引发 N+1 请求(博客越多越慢),
 * 这里用一次查询把全部已发布文章连同两种语言的 translation 拉回来,
 * 在内存里把 Bilingual 解包成 FeedPost 的扁平结构。
 *
 * 三层降级:Directus → fallback-data → 空数组(极端情况,不抛错)。
 * ========================================================================== */

/**
 * Feed 消费需要的最小字段集。
 *
 * 字段命名刻意扁平化(titleZh / titleEn 而非 { title: { zh, en } }):
 *   - RSS 构造代码按语言分支写,扁平结构更贴近消费点
 *   - 避免把 Bilingual 类型向 queries 层外暴露(该类型是 fallback-data 的内部约定)
 */
export interface FeedPost {
	slug: string;
	/** ISO 8601;已经过 Date 合法性校验,调用方可以直接 new Date() */
	date: string;
	titleZh: string;
	titleEn: string;
	excerptZh: string;
	excerptEn: string;
	categoryNameZh: string | null;
	categoryNameEn: string | null;
	authorName: string | null;
	/** 作者 email;用于 RSS <author> 字段(按 RFC 要求拼成 "email (name)") */
	authorEmail: string | null;
}

/**
 * 把 Directus 返回的 posts 行转成 FeedPost。
 *
 * 与 directusRowToVM 不同的是:translations 一次挑两种语言,
 * 不依赖调用方传入 lang。
 */
function directusRowToFeed(row: any): FeedPost | null {
	if (!row || typeof row !== "object" || !row.slug) return null;

	const trZh = pickTranslation(row.translations, "zh-CN");
	const trEn = pickTranslation(row.translations, "en-US");
	const catTrZh = pickTranslation(row.category?.translations, "zh-CN");
	const catTrEn = pickTranslation(row.category?.translations, "en-US");

	return {
		slug: String(row.slug),
		date: row.date_published ?? "",
		titleZh: trZh?.title ?? row.slug,
		titleEn: trEn?.title ?? row.slug,
		excerptZh: trZh?.excerpt ?? "",
		excerptEn: trEn?.excerpt ?? "",
		categoryNameZh: catTrZh?.name ?? null,
		categoryNameEn: catTrEn?.name ?? null,
		authorName: row.author?.name ?? null,
		authorEmail: row.author?.email ?? null,
	};
}

/** fallback 条目 → FeedPost */
function fallbackToFeed(post: FallbackPost): FeedPost {
	const author = findAuthor(post.authorSlug);
	const category = findCategory(post.categorySlug);
	return {
		slug: post.slug,
		date: post.date,
		titleZh: pickLang(post.title, "zh"),
		titleEn: pickLang(post.title, "en"),
		excerptZh: pickLang(post.excerpt, "zh"),
		excerptEn: pickLang(post.excerpt, "en"),
		categoryNameZh: category ? pickLang(category.name, "zh") : null,
		categoryNameEn: category ? pickLang(category.name, "en") : null,
		authorName: author?.name ?? null,
		authorEmail: author?.email ?? null,
	};
}

/* ============================================================================
 * 5. listPostsPaged({ lang, page, pageSize, q }) — 博客列表页分页 + 搜索
 * ----------------------------------------------------------------------------
 * 为什么独立函数而不是扩展 loadPosts:
 *   - 博客列表页(SSR)每次请求都会调用,性能是最敏感的
 *   - 需要 Directus 侧原生分页(limit + offset + meta.filter_count),不是内存切片
 *   - 搜索条件要按当前 lang 过滤 translations 的 title/excerpt/content,逻辑更重
 *
 * 返回:
 *   {
 *     items:     当前页命中的 PostVM 列表(已按 -date_published 排序)
 *     total:     命中文章总数(分页前;搜索时为搜索结果总数)
 *     page:      实际用的页码(1-indexed;可能与传入 page 不同 —— 超出会 clamp)
 *     pageSize:  每页条数
 *     totalPages:总页数(Math.ceil(total/pageSize),至少 1)
 *     query:     归一化后的搜索词(去空白 + 全小写前的原文),无搜索时为空串
 *   }
 *
 * 搜索语义:
 *   - q 为空 / 全空白 → 返回全部已发布文章(按日期倒序)分页
 *   - q 非空 → 用 Directus `_icontains`(不区分大小写,SQL 侧 ILIKE %q%)
 *     同时匹配当前 lang 翻译行的 title / excerpt / content 三个字段(OR 关系)
 *     通过 translations 的关系过滤器实现:translations.{title|excerpt|content}._icontains
 *
 * 性能提醒:
 *   - content 字段可能上百 KB;Directus 端的 ILIKE 在没有 GIN/trigram 索引时
 *     对 50+ 篇内容是全表扫 + 逐行字符串匹配,实测 5 篇 < 100ms
 *   - 数量上升后可以在 Directus/Postgres 层加 pg_trgm 索引,或切换全文搜索引擎
 *   - middleware 对 /blog 下发 s-maxage=60 的边缘缓存,搜索查询 99% 不会打到源站
 *
 * 降级:
 *   Directus 出错 → fallback-data 内存过滤(支持同样的 q 语义),
 *   fallback 再失败(不会发生)→ 空列表 + total=0。
 * ========================================================================== */

export interface PostsPageResult {
	items: readonly PostVM[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
	/** 归一化后的搜索词(trim),未搜索时为空串 */
	query: string;
}

export interface PostsPageParams {
	lang: Lang;
	/** 1-indexed,非法值会被 clamp 到 [1, totalPages] */
	page: number;
	/** 每页条数,默认 10 */
	pageSize?: number;
	/** 搜索关键词,未传或全空白视为"不搜索" */
	q?: string;
}

/** clamp 到 [min, max] 闭区间;NaN → min */
function clampPage(n: unknown, min: number, max: number): number {
	const v = Math.floor(Number(n));
	if (!Number.isFinite(v)) return min;
	if (v < min) return min;
	if (v > max) return max;
	return v;
}

/**
 * 对 Directus 的关系过滤器构造搜索条件。
 *
 * Directus 的 translations 是 O2M,filter 里用 `translations: { field: { _op: val } }`
 * 会被翻译成:"存在一条 translations 行同时满足 field OP val 且 languages_code = langCode"。
 * 多个字段 OR:外层 _or,内层同层 translations。
 *
 * 这里额外用 _and 把"必须是当前语言 + 必须命中任一字段"两个条件显式绑定,
 * 避免 Directus 在同一 relation 内部把跨行条件合并(例如 zh 行命中 title,
 * en 行命中 content 也被视为 match,会出现语言错位的搜索结果)。
 */
function buildSearchFilter(q: string, langCode: "zh-CN" | "en-US"): any {
	return {
		translations: {
			_and: [
				{ languages_code: { _eq: langCode } },
				{
					_or: [
						{ title: { _icontains: q } },
						{ excerpt: { _icontains: q } },
						{ content: { _icontains: q } },
					],
				},
			],
		},
	};
}

/**
 * fallback-data 内存搜索:大小写不敏感的 includes 匹配 title/excerpt/content。
 * 仅在 Directus 完全不可用时兜底,实际线上几乎不会走到。
 */
function fallbackSearch(
	posts: readonly FallbackPost[],
	q: string,
	lang: Lang,
): readonly FallbackPost[] {
	if (!q) return posts;
	const needle = q.toLowerCase();
	return posts.filter((p) => {
		const title = pickLang(p.title, lang).toLowerCase();
		const excerpt = pickLang(p.excerpt, lang).toLowerCase();
		const content = pickLang(p.content, lang).toLowerCase();
		return (
			title.includes(needle) ||
			excerpt.includes(needle) ||
			content.includes(needle)
		);
	});
}

export async function listPostsPaged(
	params: PostsPageParams,
): Promise<PostsPageResult> {
	const { lang } = params;
	const pageSize = Math.max(1, Math.floor(params.pageSize ?? 10));
	const q = (params.q ?? "").trim();
	const langCode = langToDirectusCode(lang);

	// 1. Directus(首选)
	try {
		const client = directus();

		// 组合 filter:status = published [+ 搜索条件]
		const filter: any =
			q.length > 0
				? {
						_and: [
							{ status: { _eq: "published" } },
							buildSearchFilter(q, langCode),
						],
					}
				: { status: { _eq: "published" } };

		// Directus 要求显式声明 `meta: "filter_count"` 才会返回总数
		// (否则 response 只有 data,不含 meta)
		const requestedPage = Math.max(1, Math.floor(Number(params.page) || 1));

		const response = (await client.request(
			readItems("posts", {
				filter,
				sort: ["-date_published"],
				fields: POST_FIELDS_FULL as any,
				limit: pageSize,
				offset: (requestedPage - 1) * pageSize,
				// SDK 类型已暴露 meta,运行时透传到 query string ?meta=filter_count,
				// 响应会多一个 meta.filter_count 字段(过滤后的总数,用于分页)
				meta: "filter_count",
			}),
		)) as any;

		// SDK 在传 meta 时会返回 { data, meta } 结构;不传时直接返回数组。
		// 两种形态都兼容。
		const rows: any[] = Array.isArray(response)
			? response
			: (response?.data ?? []);
		const total: number = Array.isArray(response)
			? rows.length
			: Number(response?.meta?.filter_count ?? rows.length);

		const totalPages = Math.max(1, Math.ceil(total / pageSize));
		const actualPage = clampPage(requestedPage, 1, totalPages);

		// 如果 clamp 后的 page 与请求页不同(用户请求 page=999),
		// 说明返回的 rows 不是用户想要的页。为了正确,重新请求一次。
		// 但首次请求 offset 过大时 Directus 会返回空数组,此时 total 仍正确,
		// 所以我们用 total 判断是否需要二次请求。
		let finalRows = rows;
		if (actualPage !== requestedPage && total > 0) {
			const refetch = (await client.request(
				readItems("posts", {
					filter,
					sort: ["-date_published"],
					fields: POST_FIELDS_FULL as any,
					limit: pageSize,
					offset: (actualPage - 1) * pageSize,
				}),
			)) as any[];
			finalRows = Array.isArray(refetch) ? refetch : [];
		}

		const items = finalRows
			.map((row) => directusRowToVM(row, lang))
			.filter((vm): vm is PostVM => vm !== null);

		return {
			items,
			total,
			page: actualPage,
			pageSize,
			totalPages,
			query: q,
		};
	} catch (err) {
		console.warn(
			"[posts] listPostsPaged Directus 读取失败,降级到 fallback:",
			(err as Error)?.message ?? err,
		);
	}

	// 2. Fallback(内存分页 + 内存搜索)
	const allFb = listFallbackPosts();
	const filteredFb = fallbackSearch(allFb, q, lang);
	// fallback 也保持按 date 倒序(FALLBACK_POSTS 已经是此顺序,但保险再排)
	const sortedFb = [...filteredFb].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);
	const total = sortedFb.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const actualPage = clampPage(params.page, 1, totalPages);
	const start = (actualPage - 1) * pageSize;
	const items = sortedFb
		.slice(start, start + pageSize)
		.map((p) => fallbackToVM(p, lang));

	return {
		items,
		total,
		page: actualPage,
		pageSize,
		totalPages,
		query: q,
	};
}

export async function listPostsForFeed(): Promise<readonly FeedPost[]> {
	// 1. Directus
	try {
		const client = directus();
		const rows = (await client.request(
			readItems("posts", {
				filter: { status: { _eq: "published" } },
				sort: ["-date_published"],
				fields: [
					"slug",
					"date_published",
					{
						author: ["name", "email"],
					},
					{
						category: ["slug", { translations: ["languages_code", "name"] }],
					},
					{
						translations: ["languages_code", "title", "excerpt"],
					},
				] as any,
				limit: -1,
			}),
		)) as any[];

		const items: FeedPost[] = [];
		for (const row of rows) {
			const item = directusRowToFeed(row);
			if (!item) continue;
			// 日期无效直接丢,避免 RSS 阶段再过滤
			if (Number.isNaN(new Date(item.date).getTime())) continue;
			items.push(item);
		}

		if (items.length > 0) return items;
		// Directus 返回了 0 条 → 可能是权限问题或真的没文章,继续走 fallback
	} catch (err) {
		console.warn(
			"[posts] listPostsForFeed 从 Directus 读取失败,使用 fallback:",
			(err as Error)?.message ?? err,
		);
	}

	// 2. Fallback
	return listFallbackPosts()
		.map(fallbackToFeed)
		.filter((p) => !Number.isNaN(new Date(p.date).getTime()));
}
