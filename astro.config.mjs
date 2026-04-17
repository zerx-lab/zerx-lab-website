// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
	site: process.env.SITE_URL || "https://zerx.dev",

	// 部署策略:全站 SSR (Node standalone)
	// - 以 Directus 实时数据为准,后台改动立即对用户可见
	// - 缓存策略在 src/middleware.ts 统一下发 Cache-Control 头,
	//   由上游 CDN / nginx 做边缘缓存,实时性与源站压力在 HTTP 层平衡
	// - 运行时需要环境变量:DIRECTUS_URL / DIRECTUS_READ_TOKEN / SITE_URL
	// - 入口:node ./dist/server/entry.mjs,默认监听 4321
	output: "server",
	adapter: node({ mode: "standalone" }),

	// i18n 策略:
	// --------------------------------------------------------------------------
	// 故意不使用 Astro 内建的 i18n 配置。原因:
	//   1. 内建 i18n 在 prefixDefaultLocale: false 时,会为非默认语言自动创建
	//      一个无斜杠的虚拟路由 `/en`,与实体文件 `src/pages/en/index.astro`
	//      映射的 `/en/` 产生优先级冲突,构建时输出 "Could not render /en" 警告。
	//   2. 本站的全部 i18n 逻辑(语言检测、翻译字典、hreflang、语言切换)
	//      都由 src/i18n/utils.ts 自建完成,不需要 Astro 运行时 i18n 特性。
	//   3. 双语路由天然由目录结构表达:
	//        src/pages/blog/      → /blog       (中文,默认语言无前缀)
	//        src/pages/en/blog/   → /en/blog    (英文)
	//      这是最简单、最可控、零冲突的方案。
	//
	// 如果未来需要用到 Astro 内建 i18n 的某些特性(如自动 redirect 或
	// routing fallback),再重新启用并解决 /en 冲突。
	// --------------------------------------------------------------------------

	integrations: [
		react(),
		mdx({
			optimize: true,
		}),
		sitemap({
			// sitemap 的 i18n 配置与 Astro 内建 i18n 解耦,这里独立声明,
			// 仅影响 sitemap XML 中 <xhtml:link rel="alternate"> 的生成。
			// 由于我们不启用 Astro 内建 i18n,sitemap 需要自己识别 /en/ 前缀
			// 来归属英文路由;@astrojs/sitemap 5+ 能基于目录结构自动识别。
			i18n: {
				defaultLocale: "zh",
				locales: {
					zh: "zh-CN",
					en: "en-US",
				},
			},
		}),
	],

	vite: {
		// tailwindcss() 返回的是根 vite 版本的 Plugin[],而 Astro 内嵌了另一份 vite,
		// 两份 vite 的 Plugin 类型在 hotUpdate hook 的 this 签名上不兼容(只是类型噪音,
		// 运行时完全正常)。用 any 断言绕过编译期类型检查。
		plugins: [/** @type {any} */ (tailwindcss())],
	},

	// Markdown 渲染配置
	markdown: {
		shikiConfig: {
			// 浅色/深色双主题,Shiki 自动注入 CSS 变量
			themes: {
				light: "github-light",
				dark: "github-dark-dimmed",
			},
			wrap: true,
		},
	},

	// 开发服务器
	server: {
		port: 4321,
		host: true,
	},

	// 预获取:提升站内跳转体验
	prefetch: {
		prefetchAll: false,
		defaultStrategy: "hover",
	},

	devToolbar: {
		enabled: true,
	},
});
