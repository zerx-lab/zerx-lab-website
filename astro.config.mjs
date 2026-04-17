// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
	site: process.env.SITE_URL || "https://zerx.dev",

	// Dokploy 部署策略:纯 SSG 静态产物
	// - 博客/官网场景 100% 可预渲染
	// - Dokploy 侧用 nginx/静态镜像托管 dist/,无需 Node 运行时
	// - 内容更新:Directus Webhook → Dokploy Deploy Webhook 触发重新构建
	output: "static",

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
		plugins: [tailwindcss()],
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
