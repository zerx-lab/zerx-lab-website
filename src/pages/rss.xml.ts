/**
 * ============================================================================
 * RSS Feed — 中文入口 (默认语言,无前缀)
 * ----------------------------------------------------------------------------
 * 端点:
 *   /rss.xml        本文件(zh,zh-cn)
 *   /en/rss.xml     src/pages/en/rss.xml.ts(en,en-us)
 *
 * 设计决策:
 *   1. 按语言拆分成两个独立 feed,而不是单 feed 塞双语 item:
 *      - 符合 RSS 2.0 规范:<language> 是 feed 级属性,不是 item 级
 *      - 阅读器体验更干净:中文用户只看中文条目,不会看到 "[EN] ..." 前缀
 *      - 与全站路由对称:其它资源都是 /foo(zh) + /en/foo(en)
 *   2. 核心构造逻辑抽到 buildLocalizedFeed(),两个语言入口只传一个参数:
 *      - 中文入口: export const GET = buildLocalizedFeed("zh")
 *      - 英文入口: export const GET = buildLocalizedFeed("en")
 *      保证两边 feed 的字段映射、排序、过滤完全一致
 *   3. 正文只放 excerpt(摘要),不放完整 content:
 *      - 避免 feed 体积膨胀(Markdown → HTML 展开后单篇可达数十 KB)
 *      - 鼓励读者点回站内阅读(有更好的排版与暗色模式)
 *   4. link / guid 使用含语言前缀的绝对 URL,保证跨 feed 全局唯一
 *
 * 数据源:
 *   - src/lib/queries/posts.ts 的 listPostsForFeed()
 *   - 内部已做 Directus → fallback-data 双层降级,本文件只负责 feed 成型
 *
 * 参考:
 *   https://docs.astro.build/en/recipes/rss/
 *   https://www.rssboard.org/rss-specification
 *   https://www.rssboard.org/rss-language-codes
 * ============================================================================
 */

import rss from "@astrojs/rss";
import type { APIContext, APIRoute } from "astro";
import type { Lang } from "@i18n/ui";
import { listPostsForFeed, type FeedPost } from "@lib/queries/posts";

/* ----------------------------------------------------------------------------
 * Feed 基础元信息(双语各一套)
 * ----------------------------------------------------------------------------
 * 这些字段会出现在 feed 阅读器的"订阅源信息"面板,影响默认展示名与介绍。
 * -------------------------------------------------------------------------- */

const FEED_TITLE = "ZerxLab";

/** 每种语言的 feed 级元数据 */
interface FeedLocaleMeta {
	/** RSS <description> channel 级简介 */
	description: string;
	/**
	 * RSS <language> 字段。
	 * 必须使用 RSS 规范允许的 code(zh-cn / en-us 等),与 BCP 47 区分:
	 *   BCP 47 是 "zh-CN" 大小写敏感,RSS 规范用小写。
	 */
	language: "zh-cn" | "en-us";
}

const LOCALES: Record<Lang, FeedLocaleMeta> = {
	zh: {
		description:
			"ZerxLab 博客 — 工程笔记、项目发布与架构决策。关注高性能应用与开源工具。",
		language: "zh-cn",
	},
	en: {
		description:
			"ZerxLab blog — engineering notes, release logs, and architecture decisions. Focused on high-performance apps and open-source tools.",
		language: "en-us",
	},
};

/* ----------------------------------------------------------------------------
 * 文本清理
 * ----------------------------------------------------------------------------
 * RSS 的 title / description 允许 CDATA 包裹,@astrojs/rss 会帮我们处理,
 * 但我们仍然主动清理一些容易炸的字符:
 *   - 零宽字符(用户粘贴时偶尔带入)
 *   - 不可打印控制字符(XML 1.0 不允许部分控制字符即便 CDATA)
 * 对正常文本完全是 no-op,安全起见保留。
 * -------------------------------------------------------------------------- */

// XML 1.0 不允许的控制字符(除 \t=0x09 \n=0x0A \r=0x0D 外的 0x00-0x1F)。
// 用 new RegExp + 字符串拼接动态构造,避免在源码里出现字面量控制字符
// (字面量写法会触发 no-control-regex 诊断)。pattern 在模块加载期编译一次复用。
const XML_INVALID_CONTROL_CHARS = new RegExp(
	"[" +
		"\\u0000-\\u0008" + // 排除 \t (\u0009)
		"\\u000B\\u000C" + // 排除 \n (\u000A) \r (\u000D)
		"\\u000E-\\u001F" +
		"]",
	"g",
);

function cleanText(input: string): string {
	return (
		input
			.replace(XML_INVALID_CONTROL_CHARS, "")
			// 去除零宽与 BOM
			.replace(/[\u200B-\u200F\uFEFF]/g, "")
			.trim()
	);
}

/* ----------------------------------------------------------------------------
 * 绝对 URL 拼接
 * -------------------------------------------------------------------------- */

/**
 * 把 SITE_URL 与相对路径拼成绝对 URL。
 *
 * @param site Astro 注入的 site URL 对象(来自 astro.config 的 site 字段)
 * @param path 以 "/" 开头的相对路径
 */
function absolute(site: URL | undefined, path: string): string {
	const base = (
		site?.toString() ??
		(typeof process !== "undefined" ? process.env.SITE_URL : undefined) ??
		"https://zerx.dev"
	).replace(/\/$/, "");
	const rel = path.startsWith("/") ? path : `/${path}`;
	return `${base}${rel}`;
}

/**
 * 按语言计算 RSS feed 自身的相对路径。
 *
 * 为什么不用 @i18n/utils 的 useTranslatedPath:
 *   - 该函数名以 `use` 开头,会被 React Hooks 的 lint 规则误判为 Hook,
 *     在工厂函数(非组件)里调用会触发 "hooks called conditionally" 报错
 *   - RSS 的路径映射极简(只有两种语言、一个文件名),本地实现一行就够,
 *     不值得为了复用引入 Hooks lint 抑制注释
 *
 * 约定与全站一致:
 *   zh(默认语言)→ /rss.xml        (无前缀)
 *   en           → /en/rss.xml
 */
function feedSelfPath(lang: Lang): string {
	return lang === "en" ? "/en/rss.xml" : "/rss.xml";
}

/* ----------------------------------------------------------------------------
 * 按语言从 FeedPost 抽字段
 * ----------------------------------------------------------------------------
 * FeedPost 是双语扁平结构(titleZh / titleEn 等),feed 只要一种语言,
 * 这个工具做单向选择。目的是把所有 "lang === "zh" ? a : b" 的决策
 * 收敛到一处,后续加新字段不会漏某处分支。
 * -------------------------------------------------------------------------- */

interface LocalizedPostFields {
	title: string;
	excerpt: string;
	categoryName: string | null;
	/** canonical URL 相对路径,不含 site 部分。后续由 absolute() 补全域名 */
	path: string;
}

function localizePost(post: FeedPost, lang: Lang): LocalizedPostFields {
	if (lang === "en") {
		return {
			title: post.titleEn,
			excerpt: post.excerptEn,
			categoryName: post.categoryNameEn,
			path: `/en/blog/${post.slug}`,
		};
	}
	// 默认语言 zh:URL 无前缀
	return {
		title: post.titleZh,
		excerpt: post.excerptZh,
		categoryName: post.categoryNameZh,
		path: `/blog/${post.slug}`,
	};
}

/* ----------------------------------------------------------------------------
 * Feed items 构造
 * ----------------------------------------------------------------------------
 * 每篇文章只产出一条 item(对应当前 lang)。
 * 相比早期"中英双 item"的设计,这里不会再出现 "[EN] ..." 的 title 前缀。
 *
 * 约束:
 *   - 只产出当前 lang 的 item
 *   - guid 用 canonical URL(含语言前缀),跨 feed 天然唯一
 *   - 按 pubDate 降序排序,阅读器顶部永远是最新文章
 * -------------------------------------------------------------------------- */

interface FeedItem {
	title: string;
	pubDate: Date;
	description: string;
	link: string;
	guid: string;
	author: string | undefined;
	categories: readonly string[];
}

function buildFeedItems(
	site: URL | undefined,
	posts: readonly FeedPost[],
	lang: Lang,
): FeedItem[] {
	const langTag = LOCALES[lang].language; // "zh-cn" | "en-us"
	const items: FeedItem[] = [];

	for (const post of posts) {
		const pubDate = new Date(post.date);
		if (Number.isNaN(pubDate.getTime())) {
			// 理论上 listPostsForFeed 已经过滤过,这里是最后一道保险
			continue;
		}

		const localized = localizePost(post, lang);
		const link = absolute(site, localized.path);

		// RSS <author> 规范要求 "email (name)" 形式;降级用纯 name,再降级 undefined
		const author =
			post.authorEmail && post.authorName
				? `${post.authorEmail} (${post.authorName})`
				: (post.authorName ?? undefined);

		items.push({
			title: cleanText(localized.title),
			pubDate,
			description: cleanText(localized.excerpt),
			link,
			guid: link,
			author,
			// 第一个 category 是分类名(可能为 null → 只用语言标签)
			// 第二个固定是语言标签,帮助阅读器做过滤
			categories: localized.categoryName
				? [localized.categoryName, langTag]
				: [langTag],
		});
	}

	// 按日期降序
	items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

	return items;
}

/* ----------------------------------------------------------------------------
 * Feed 端点工厂
 * ----------------------------------------------------------------------------
 * 返回一个 Astro APIRoute,供 /rss.xml 与 /en/rss.xml 各自 export GET 使用。
 *
 * 为什么导出工厂而不是两份拷贝:
 *   - 两种语言的 feed 90% 逻辑相同,不同的只是:文章字段取哪种语言、
 *     feed 级 description / language / self-link 路径
 *   - 把这几个"差异点"封装在 LOCALES 和 localizePost() 里,工厂只接一个
 *     lang 参数就能复用全部构造逻辑
 *   - 英文入口文件只有几行 import + export,后续想加西语/日语 feed 也无痛
 *
 * 使用示例:
 *   // src/pages/rss.xml.ts
 *   export const GET = buildLocalizedFeed("zh");
 *
 *   // src/pages/en/rss.xml.ts
 *   export const GET = buildLocalizedFeed("en");
 * -------------------------------------------------------------------------- */

export function buildLocalizedFeed(lang: Lang): APIRoute {
	const meta = LOCALES[lang];
	// feedSelfPath(lang) 在 zh 下返回 "/rss.xml",en 下返回 "/en/rss.xml"
	const selfPath = feedSelfPath(lang);

	return async function GET(context: APIContext): Promise<Response> {
		const posts = await listPostsForFeed();
		const items = buildFeedItems(context.site, posts, lang);

		return rss({
			title: FEED_TITLE,
			description: meta.description,
			// @astrojs/rss 要求绝对 URL;若 context.site 缺失回退到默认域名
			site: context.site ?? "https://zerx.dev",

			items: items.map((item) => ({
				title: item.title,
				pubDate: item.pubDate,
				description: item.description,
				link: item.link,
				// guid 由 @astrojs/rss 自动从 link 推断,这里显式传以避免歧义
				// (guid 必须全文唯一,用完整 URL 最稳)
				categories: [...item.categories],
				author: item.author,
			})),

			// feed 层级自定义字段(会原样插入 <rss><channel> 下)
			customData: [
				`<language>${meta.language}</language>`,
				// self-link:指向当前 feed 自己的绝对 URL
				// 帮助 feed 阅读器做"断开订阅"判断,以及 feed 迁移时的 301 识别
				`<atom:link href="${absolute(context.site, selfPath)}" rel="self" type="application/rss+xml" />`,
				// 更新频率提示(分钟,纯建议,feed 阅读器可忽略)
				`<ttl>60</ttl>`,
			].join(""),

			// 注册 atom 命名空间,让上面的 <atom:link> 合法
			xmlns: {
				atom: "http://www.w3.org/2005/Atom",
			},

			// 允许不转义的字段(marked 输出的 description 已经是纯文本,不需要此处改动)
			// stylesheet 指向一个可选的 XSL 文件,用于在浏览器直接打开 /rss.xml 时
			// 渲染为美观的页面;这里不启用,保持极简。
		});
	};
}

/* ============================================================================
 * 中文入口
 * ==========================================================================
 * 默认语言 zh,无 URL 前缀,对应 /rss.xml。
 * 英文 feed 在 src/pages/en/rss.xml.ts。
 * ========================================================================== */

export const GET: APIRoute = buildLocalizedFeed("zh");
