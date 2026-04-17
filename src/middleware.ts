/**
 * ============================================================================
 * 全局 Middleware — 统一下发 Cache-Control
 * ----------------------------------------------------------------------------
 * 为什么放在 middleware 而不是每个页面自己设:
 *   - 全站 SSR 下,"哪些页面缓存多久"是站点级策略,不是页面级业务
 *   - 集中在一处,调缓存参数只改一个文件,不会漏页
 *   - 页面组件专注内容渲染,缓存由基础设施层负责(关注点分离)
 *
 * 生效位置:
 *   上游的 CDN / nginx 读 `Cache-Control` 做边缘缓存,浏览器也会遵守。
 *   源站(Node 进程)本身不做内存缓存,Directus 数据变更后只要边缘缓存过期
 *   用户就能看到最新内容,实时性由 s-maxage 决定。
 *
 * 缓存策略(业界标准参考:Vercel / Cloudflare / Next.js ISR 默认值):
 *
 *   路径类别                | s-maxage | stale-while-revalidate | 备注
 *   ------------------------|----------|------------------------|---------------------------
 *   /blog, /en/blog         |   60s    |         600s           | 列表页,发文后 1 分钟可见
 *   /blog/*, /en/blog/*     |   60s    |         600s           | 详情页,改错别字 1 分钟可见
 *   /rss.xml, /en/rss.xml   |  300s    |        3600s           | RSS 阅读器轮询间隔大,5min 足够
 *   /404 及其它状态非 200   | no-store |           —            | 错误响应禁缓存,避免污染
 *   其余页面(首页/项目等) |  300s    |        3600s           | 低频变更,5 分钟窗口合理
 *
 *   不在本表覆盖范围:
 *     /sitemap-*.xml —— 由 @astrojs/sitemap 在 build 期生成的静态 XML,
 *     Node standalone 的静态文件中间件直接服务,**不经过本 middleware**。
 *     默认下发 `Cache-Control: public, max-age=0` 配合 ETag/Last-Modified,
 *     搜索引擎 crawler 会发 If-None-Match 拿 304,对带宽友好,保留默认即可。
 *
 *   stale-while-revalidate 的意义:
 *     s-maxage 过期后,CDN 仍可在 SWR 窗口内继续返回旧缓存给用户,
 *     同时后台异步回源拉新数据。用户感知永远是"秒开",实时性用
 *     s-maxage 控制,稳定性用 SWR 控制。
 *
 * 仅对 GET / HEAD 设缓存头。其它方法(POST 等)当前站点不涉及,但保持安全默认。
 *
 * 参考:
 *   https://docs.astro.build/en/guides/middleware/
 *   https://web.dev/articles/stale-while-revalidate
 *   https://developers.cloudflare.com/cache/concepts/cache-control/
 * ============================================================================ */

import { defineMiddleware } from "astro:middleware";

/* ----------------------------------------------------------------------------
 * 缓存档位定义
 * ----------------------------------------------------------------------------
 * 集中为几个具名档位,避免 Cache-Control 字符串散落在各处。
 * 后续要调参只改这里。
 * -------------------------------------------------------------------------- */

/** RSS:5 分钟边缘缓存 + 1 小时 SWR */
const CACHE_RSS = "public, s-maxage=300, stale-while-revalidate=3600";

/** 博客列表 / 详情:60 秒边缘缓存 + 10 分钟 SWR(实时性最高档) */
const CACHE_BLOG = "public, s-maxage=60, stale-while-revalidate=600";

/** 其余页面(首页 / 项目 / 关于 / AUR 等):5 分钟边缘缓存 + 1 小时 SWR */
const CACHE_DEFAULT = "public, s-maxage=300, stale-while-revalidate=3600";

/** 错误响应 / 非 GET 请求:禁止任何缓存 */
const CACHE_NONE = "no-store";

/* ----------------------------------------------------------------------------
 * 路径 → 缓存档位 映射
 * ----------------------------------------------------------------------------
 * 只看 pathname,不考虑 querystring。命中优先级从上到下,first match wins。
 *
 * 注意:
 *   - Astro 的 pathname 永远以 "/" 开头
 *   - /en/ 前缀视同同类页面,用 endsWith / startsWith 精确匹配
 *   - sitemap 由 @astrojs/sitemap 生成多文件(sitemap-index.xml / sitemap-0.xml)
 *     所以用 startsWith("/sitemap")
 * -------------------------------------------------------------------------- */

function resolveCachePolicy(pathname: string): string {
	// 1. RSS feed
	if (pathname === "/rss.xml" || pathname === "/en/rss.xml") {
		return CACHE_RSS;
	}

	// 2. 博客列表
	if (
		pathname === "/blog" ||
		pathname === "/blog/" ||
		pathname === "/en/blog" ||
		pathname === "/en/blog/"
	) {
		return CACHE_BLOG;
	}

	// 3. 博客详情(/blog/:slug, /en/blog/:slug)
	if (pathname.startsWith("/blog/") || pathname.startsWith("/en/blog/")) {
		return CACHE_BLOG;
	}

	// 4. 其余页面(首页 / about / projects / aur / en/* 等)
	// 注意:/sitemap-*.xml 是构建期静态产物,由 Node 静态文件中间件直接服务,
	// 根本不进入 Astro middleware,所以这里不需要(也无法)为它设策略。
	return CACHE_DEFAULT;
}

/* ----------------------------------------------------------------------------
 * Middleware 主体
 * ----------------------------------------------------------------------------
 * 执行时机:每个请求进入页面组件之前。
 * 工作流:
 *   1. 调 next() 生成 Response(页面组件执行,Directus 数据拉取发生在这一步)
 *   2. 检查 Response 状态码与请求方法,决定是否可缓存
 *   3. 设置 Cache-Control / Vary 头
 *   4. 返回给客户端
 *
 * 为什么只缓存 200:
 *   3xx 重定向、4xx 客户端错误、5xx 源站错误都不应该被 CDN 长期缓存。
 *   特别是 Directus 抖动导致的 500,若被缓存会把错误放大到整个 SWR 窗口。
 *
 * 为什么设 Vary: Accept-Language:
 *   本站通过 URL 前缀分流 /en/,按理说 Vary 可有可无。但上游 CDN
 *   如果配了按 Accept-Language 分流的话,不加 Vary 可能出现 zh 用户看到
 *   en 缓存。加上保险没坏处。
 * -------------------------------------------------------------------------- */

export const onRequest = defineMiddleware(async (context, next) => {
	const response = await next();

	const method = context.request.method.toUpperCase();
	const pathname = new URL(context.request.url).pathname;

	// 非 GET / HEAD:禁缓存,不碰其它头
	if (method !== "GET" && method !== "HEAD") {
		response.headers.set("Cache-Control", CACHE_NONE);
		return response;
	}

	// 非 200 响应(404 / 500 / 重定向等):禁缓存
	// 注意 Astro 的 Response.status 在 SSR 下是真实 HTTP 状态码
	if (response.status !== 200) {
		response.headers.set("Cache-Control", CACHE_NONE);
		return response;
	}

	// 正常 200:按路径下发对应缓存档位
	response.headers.set("Cache-Control", resolveCachePolicy(pathname));

	// Vary:保险起见声明语言会影响内容
	// 如果 Response 已经有 Vary,追加而非覆盖
	const existingVary = response.headers.get("Vary");
	if (existingVary && !existingVary.toLowerCase().includes("accept-language")) {
		response.headers.set("Vary", `${existingVary}, Accept-Language`);
	} else if (!existingVary) {
		response.headers.set("Vary", "Accept-Language");
	}

	return response;
});
