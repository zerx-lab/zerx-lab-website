/**
 * ============================================================================
 * 搜索索引端点 —— 构建期产出 /search/zh.json 与 /search/en.json
 * ----------------------------------------------------------------------------
 * 消费方: src/components/blog/BlogSearchBox.astro 的客户端脚本。
 *
 * 为什么在构建期而不是运行时生成:
 *   全站已切到纯静态构建(output: "static"),没有服务端可以按关键词实时
 *   查询。搜索改为"客户端拿到全量索引后在浏览器里过滤",索引本身只需要
 *   在构建期算一次,产物是普通的静态 JSON 文件,天然可被 CDN 缓存。
 *
 * 覆盖范围:
 *   每种语言各一份,包含该语言下全部已发布文章(不受任何分类筛选影响 ——
 *   客户端搜索是"站内检索",不是"当前列表视图的过滤器")。
 *
 * text 字段:
 *   `${title} ${excerpt} ${正文(已 stripMarkdown)}`,统一转小写。
 *   客户端只需把搜索词转小写后做 includes 匹配,不需要重新实现分词/清洗。
 *
 * 字段形状与本迁移的 Contract 严格一致,变更需要同步通知 BlogSearchBox。
 * ============================================================================
 */

import type { APIRoute } from "astro";

import { listPostsPaged } from "@lib/queries/posts";
import { stripMarkdown } from "@lib/reading-time";
import type { Lang } from "@i18n/ui";

export function getStaticPaths() {
	return [{ params: { lang: "zh" } }, { params: { lang: "en" } }];
}

/** 单条搜索索引记录,字段形状见文件头注释 */
interface SearchIndexRow {
	slug: string;
	title: string;
	excerpt: string;
	category: string;
	categoryName: string;
	date: string;
	readingTime: number;
	coverLabel: string;
	text: string;
}

export const GET: APIRoute = async ({ params }) => {
	const lang = (params.lang === "en" ? "en" : "zh") as Lang;

	// pageSize 给足够大的上限一次拿全量;全站文章数远小于该阈值
	const { items } = await listPostsPaged({ lang, page: 1, pageSize: 10000 });

	const rows: SearchIndexRow[] = items.map((post) => ({
		slug: post.slug,
		title: post.title,
		excerpt: post.excerpt,
		category: post.categorySlug ?? "",
		categoryName: post.categoryName ?? "",
		date: post.date,
		readingTime: post.readingTime,
		coverLabel: post.coverLabel,
		text: `${post.title} ${post.excerpt} ${stripMarkdown(post.content)}`.toLowerCase(),
	}));

	return new Response(JSON.stringify(rows), {
		headers: { "content-type": "application/json" },
	});
};
