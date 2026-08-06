/**
 * ============================================================================
 * 内容集合定义(Astro Content Layer)
 * ----------------------------------------------------------------------------
 * 站点唯一内容源:全部内容以文件形式进仓库,构建期静态读取,
 * 运行时零外部依赖。
 *
 * 布局:
 *   src/content/posts/<slug>/{zh,en}.md   文章,一篇两语言两文件
 *   src/content/data/*.json               结构化数据(作者/分类/标签/项目/AUR/站点)
 *
 * 双语约定:
 *   - slug 由目录名决定,两种语言共享(URL 靠 /en/ 前缀区分,不翻译 slug)
 *   - 语言无关字段(date / author / category / tags / featured / cover)
 *     **以 zh.md 为准**;en.md 里的同名字段仅为 schema 完整性保留,读取时忽略。
 *     这样避免两份文件同一事实各写一份导致漂移。
 *   - en.md 缺失时该文章的英文版回落到中文正文(与 i18n 全站策略一致)。
 *
 * 数据集合的双语字段统一为 { zh, en } 对象,由 pickLang 解包。
 * ============================================================================
 */

import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { file, glob } from "astro/loaders";

/** 双语标量:所有面向读者的文案字段都长这样 */
const bilingual = z.object({
	zh: z.string(),
	en: z.string(),
});

/* ----------------------------------------------------------------------------
 * posts —— 博客文章
 * ----------------------------------------------------------------------------
 * entry.id 形如 "zerxlab-launch/zh",slug 与语言由 id 拆出(见 lib/queries/posts.ts)。
 * -------------------------------------------------------------------------- */

const posts = defineCollection({
	loader: glob({ pattern: "*/{zh,en}.md", base: "./src/content/posts" }),
	schema: z.object({
		/* 语言相关 */
		title: z.string().min(1),
		excerpt: z.string().default(""),
		/** 无封面图时列表卡片上的大字标签 */
		coverLabel: z.string().default(""),
		seoTitle: z.string().optional(),
		seoDescription: z.string().optional(),

		/* 语言无关(以 zh.md 为准) */
		date: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		author: z.string().default("zerx"),
		category: z.string().default("notes"),
		tags: z.array(z.string()).default([]),
		featured: z.boolean().default(false),
		/** 封面图 URL(绝对地址或 /public 下的绝对路径) */
		cover: z.string().optional(),
		/** true 时不进入任何列表 / feed / sitemap,也不生成详情页 */
		draft: z.boolean().default(false),
	}),
});

/* ----------------------------------------------------------------------------
 * data/* —— 结构化数据
 * ----------------------------------------------------------------------------
 * file() loader 要求每条记录带 id;源文件用 slug 做自然键,这里统一投影一次。
 * -------------------------------------------------------------------------- */

/** 数组型 JSON:以 slug 作为集合 id */
function bySlug(text: string): Record<string, unknown>[] {
	const rows = JSON.parse(text) as Record<string, unknown>[];
	return rows.map((row) => ({ ...row, id: row.slug }));
}

const authors = defineCollection({
	loader: file("src/content/data/authors.json", { parser: bySlug }),
	schema: z.object({
		slug: z.string(),
		name: z.string(),
		avatar: z.string().nullable().default(null),
		github: z.string().nullable().default(null),
		x: z.string().nullable().default(null),
		email: z.string().nullable().default(null),
		bio: bilingual,
	}),
});

const categories = defineCollection({
	loader: file("src/content/data/categories.json", { parser: bySlug }),
	schema: z.object({
		slug: z.string(),
		name: bilingual,
		description: bilingual,
	}),
});

const tags = defineCollection({
	loader: file("src/content/data/tags.json", { parser: bySlug }),
	schema: z.object({
		slug: z.string(),
		name: bilingual,
	}),
});

const projects = defineCollection({
	loader: file("src/content/data/projects.json", { parser: bySlug }),
	schema: z.object({
		slug: z.string(),
		name: z.string(),
		description: bilingual,
		techStack: z.array(z.string()).default([]),
		kind: z.enum(["library", "tool", "app", "experiment", "service"]),
		language: z.string(),
		githubUrl: z.string(),
		demoUrl: z.string().nullable().default(null),
		docsUrl: z.string().nullable().default(null),
		npmUrl: z.string().nullable().default(null),
		/** 静态快照;构建期若能拿到 GitHub API 数据会被覆盖 */
		stars: z.number().default(0),
		forks: z.number().default(0),
		featured: z.boolean().default(false),
		highlights: bilingual,
	}),
});

const aur = defineCollection({
	loader: file("src/content/data/aur.json", { parser: bySlug }),
	schema: z.object({
		slug: z.string(),
		/** AUR 包全名,安装命令直接使用 */
		name: z.string(),
		/** 静态快照;构建期若能拿到 AUR RPC 数据会被覆盖 */
		version: z.string(),
		description: bilingual,
		badges: z.array(z.string()).default([]),
		aurUrl: z.string(),
		upstreamUrl: z.string().nullable().default(null),
		maintained: z.boolean().default(true),
	}),
});

const languageStats = defineCollection({
	loader: file("src/content/data/language-stats.json", {
		parser: (text) =>
			(JSON.parse(text) as { name: string }[]).map((row) => ({
				...row,
				id: row.name,
			})),
	}),
	schema: z.object({
		name: z.string(),
		percent: z.number(),
		/** GitHub linguist 颜色 */
		color: z.string(),
	}),
});

/** 单例:整份 JSON 就是一条记录 */
const site = defineCollection({
	loader: file("src/content/data/site.json", {
		parser: (text) => [{ ...(JSON.parse(text) as object), id: "site" }],
	}),
	schema: z.object({
		siteName: z.string(),
		tagline: bilingual,
		description: bilingual,
		socialGithub: z.string(),
		socialX: z.string().nullable().default(null),
		socialEmail: z.string().nullable().default(null),
		socialDiscord: z.string().nullable().default(null),
		establishedYear: z.number(),
		location: bilingual,
		focus: z.string(),
		contributors: z.number(),
		/** OG 图路径,相对 /public(如 "/og.png");无图时留 null */
		ogImage: z.string().nullable().default(null),
	}),
});

export const collections = {
	posts,
	authors,
	categories,
	tags,
	projects,
	aur,
	languageStats,
	site,
};
