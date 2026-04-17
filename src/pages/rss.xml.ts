/**
 * ============================================================================
 * RSS Feed
 * ----------------------------------------------------------------------------
 * 端点:
 *   /rss.xml
 *
 * 行为:
 *   聚合博客所有已发布文章(中英两种语言版本都收录,使用 slug + 语言前缀区分),
 *   按发布时间降序输出 RSS 2.0 XML。
 *
 * 设计决策:
 *   1. 订阅源只有一个根 feed,不按语言拆分成 /rss.xml 和 /rss-en.xml:
 *      - 读者通常只关心"有没有新内容",而不是"用哪种语言写的"
 *      - 同一篇文章的中英版本都作为独立 <item> 收录,title / description
 *        根据语言拼接可识别的前缀(如 "[EN]"),避免 feed 阅读器内两条重复
 *   2. 正文只放 excerpt(摘要),不放完整 content:
 *      - 避免 feed 体积膨胀(Markdown → HTML 展开后单篇可达数十 KB)
 *      - 鼓励读者点回站内阅读(有更好的排版与暗色模式)
 *   3. link 使用绝对 URL(基于 SITE_URL),确保 feed 阅读器能正确跳转
 *   4. guid 使用 canonical URL(含语言前缀),保证唯一且稳定
 *
 * 数据源:
 *   - 当前阶段从 src/lib/fallback-data.ts 的 FALLBACK_POSTS 读取
 *   - 未来接入 Directus 后可在此处改为优先从 Directus 拉取 published 文章,
 *     失败时回退到 fallback
 *
 * 参考:
 *   https://docs.astro.build/en/recipes/rss/
 *   https://www.rssboard.org/rss-specification
 * ============================================================================
 */

import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import {
	listFallbackPosts,
	pickLang,
	findAuthor,
	findCategory,
} from "@lib/fallback-data";

/* ----------------------------------------------------------------------------
 * Feed 基础元信息
 * ----------------------------------------------------------------------------
 * 这些字段会出现在 feed 阅读器的"订阅源信息"面板,影响默认展示名与介绍。
 * 不涉及任何文章级数据,可视作站点级常量。
 * -------------------------------------------------------------------------- */

const FEED_TITLE = "ZerxLab";
const FEED_DESCRIPTION_ZH =
	"ZerxLab 博客 — 工程笔记、项目发布与架构决策。所有文章双语发布。";
const FEED_DESCRIPTION_EN =
	"ZerxLab blog — engineering notes, release logs, and architecture decisions. All posts available in Chinese and English.";

/** RSS <language> 字段:使用 zh-cn 作为主语言(默认语言) */
const FEED_LANGUAGE = "zh-cn";

/**
 * 把任意字符串转成 CDATA 安全的文本。
 *
 * 技术说明:
 *   RSS 的 title / description 允许 CDATA 包裹,@astrojs/rss 会帮我们处理,
 *   但我们仍然主动清理一些容易炸的字符:
 *     - 零宽字符(用户粘贴时偶尔带入)
 *     - 不可打印控制字符(XML 1.0 不允许部分控制字符即便 CDATA)
 *   对正常文本完全是 no-op,安全起见保留。
 */
function cleanText(input: string): string {
	return (
		input
			// 去除 XML 1.0 不允许的控制字符(除 \t \n \r 外的 0x00-0x1F)
			.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
			// 去除零宽与 BOM
			.replace(/[\u200B-\u200F\uFEFF]/g, "")
			.trim()
	);
}

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

/* ----------------------------------------------------------------------------
 * Feed item 构造
 * ----------------------------------------------------------------------------
 * 每篇文章被展开为两条 <item>(中文 + 英文),方便不同语言读者。
 * 如未来希望严格按用户偏好 feed,可改为仅导出默认语言条目。
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

/**
 * 构建 feed items 列表。
 *
 * 约束:
 *   - 仅收录有 date 字段的文章(无 date 的条目会被 @astrojs/rss 当作无效)
 *   - 同一篇文章中英各一条 item,guid 靠 canonical URL 区分
 *   - 按 pubDate 降序排序,保证阅读器顶部永远是最新文章
 */
function buildFeedItems(site: URL | undefined): FeedItem[] {
	const posts = listFallbackPosts();
	const items: FeedItem[] = [];

	for (const post of posts) {
		const pubDate = new Date(post.date);
		if (Number.isNaN(pubDate.getTime())) {
			// 日期无效的条目直接跳过,避免 @astrojs/rss 抛错
			continue;
		}

		const author = findAuthor(post.authorSlug);
		const category = findCategory(post.categorySlug);

		// 中文版
		const zhTitle = cleanText(pickLang(post.title, "zh"));
		const zhExcerpt = cleanText(pickLang(post.excerpt, "zh"));
		const zhLink = absolute(site, `/blog/${post.slug}`);

		items.push({
			title: zhTitle,
			pubDate,
			description: zhExcerpt,
			link: zhLink,
			guid: zhLink,
			author: author?.email ? `${author.email} (${author.name})` : author?.name,
			categories: category
				? [pickLang(category.name, "zh"), "zh-CN"]
				: ["zh-CN"],
		});

		// 英文版
		const enTitle = cleanText(pickLang(post.title, "en"));
		const enExcerpt = cleanText(pickLang(post.excerpt, "en"));
		const enLink = absolute(site, `/en/blog/${post.slug}`);

		items.push({
			title: `[EN] ${enTitle}`,
			pubDate,
			description: enExcerpt,
			link: enLink,
			guid: enLink,
			author: author?.email ? `${author.email} (${author.name})` : author?.name,
			categories: category
				? [pickLang(category.name, "en"), "en-US"]
				: ["en-US"],
		});
	}

	// 按日期降序(同一天的两条中英并列,保持原插入顺序)
	items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

	return items;
}

/* ----------------------------------------------------------------------------
 * Astro 端点
 * ----------------------------------------------------------------------------
 * 静态端点:构建期生成一次 /rss.xml,运行时零成本。
 * 文章更新后需要重新构建站点以刷新 feed(符合 SSG 模型)。
 * -------------------------------------------------------------------------- */

export async function GET(context: APIContext): Promise<Response> {
	const items = buildFeedItems(context.site);

	return rss({
		title: FEED_TITLE,
		description: `${FEED_DESCRIPTION_ZH}\n\n${FEED_DESCRIPTION_EN}`,
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
			`<language>${FEED_LANGUAGE}</language>`,
			// self-link:指向 feed 本身,帮助 feed 阅读器做"断开订阅"判断
			`<atom:link href="${absolute(context.site, "/rss.xml")}" rel="self" type="application/rss+xml" />`,
			// 更新频率提示(纯建议,feed 阅读器可忽略)
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
}
