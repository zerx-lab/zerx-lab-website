/**
 * ============================================================================
 * ZerxLab Website - 共享 Fallback 数据
 * ----------------------------------------------------------------------------
 * 用途:
 *   在 Directus schema 尚未 bootstrap 或线上 API 不可达时,
 *   提供一份"永远能渲染"的兜底数据。保证站点任何页面第一屏都有内容。
 *
 * 数据来源:
 *   - 基于 github.com/zerx-lab 的真实公开信息(仓库、star、语言占比等)
 *   - 基于用户历史 Vercel 站点 website-sandy-sigma-39.vercel.app 中的展示内容
 *   - 博客文章 content 字段为手写示例 Markdown(非正文,仅骨架演示)
 *
 * 关键约定:
 *   1. 所有"双语字段"统一结构: { zh: string; en: string }
 *   2. slug 在两种语言间共享,URL 靠 /en/ 前缀区分,不做 URL 翻译
 *   3. 文章 date 使用 ISO 8601 字符串,前端再用 formatDate 本地化
 *   4. 一旦 Directus schema 建好并 typegen 完成,本文件的 shape 会被
 *      directus.types.ts 的 shape 取代;接口上会保留 Fallback* 前缀类型
 *      作为"离线兜底"的入口,页面代码通过同一套 adapter 层消费
 *
 * 如何追加新数据:
 *   - 博客:在 FALLBACK_POSTS 数组末尾 push 一个对象(注意 slug 唯一)
 *   - 项目:在 FALLBACK_PROJECTS 末尾 push(保持按 stars 降序)
 *   - AUR:在 FALLBACK_AUR_PACKAGES 末尾 push
 * ============================================================================
 */

export type Bilingual = {
	readonly zh: string;
	readonly en: string;
};

/** 支持的语言键 —— 与 src/i18n/ui.ts 的 Lang 类型保持一致 */
export type FallbackLang = "zh" | "en";

/**
 * 从 Bilingual 对象中取出对应语言的值。
 * 如果目标语言缺失,fallback 到 zh(与全站 i18n 策略一致)。
 */
export function pickLang<T extends Bilingual>(
	value: T,
	lang: FallbackLang,
): string {
	return value[lang] ?? value.zh;
}

/* ============================================================================
 * 站点设置(对应 Directus site_settings 单例)
 * ========================================================================== */

export interface FallbackSiteSettings {
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
	/** 总 star 数(projects 汇总,便于首页快速展示) */
	readonly totalStars: number;
	/** 贡献者数量(面向社区页) */
	readonly contributors: number;
}

export const FALLBACK_SITE_SETTINGS: FallbackSiteSettings = {
	siteName: "ZerxLab",
	tagline: {
		zh: "全栈实验室",
		en: "Full-Stack Laboratory",
	},
	description: {
		zh: "聚焦高性能应用、现代技术架构与开源工具,探索代码与工程的边界。",
		en: "Building high-performance apps, exploring modern architecture, and shipping open-source tools.",
	},
	socialGithub: "https://github.com/zerx-lab",
	socialX: null,
	socialEmail: "1603852@qq.com",
	socialDiscord: null,
	establishedYear: 2020,
	location: {
		zh: "中国 · 北京",
		en: "Beijing, CN",
	},
	focus: "FULL-STACK / RUST / GO",
	totalStars: 750,
	contributors: 12,
} as const;

/* ============================================================================
 * 作者(对应 Directus authors 集合)
 * ========================================================================== */

export interface FallbackAuthor {
	readonly slug: string;
	readonly name: string;
	readonly avatar: string | null;
	readonly github: string | null;
	readonly x: string | null;
	readonly email: string | null;
	readonly bio: Bilingual;
}

export const FALLBACK_AUTHORS: readonly FallbackAuthor[] = [
	{
		slug: "zerx",
		name: "zerx",
		avatar: "https://github.com/zerx-lab.png",
		github: "https://github.com/zerx-lab",
		x: null,
		email: "1603852@qq.com",
		bio: {
			zh: "全栈工程师,专注于 Go 与 Rust 构建高性能工具链,喜欢把「一分钟完成」的小体验打磨到极致。",
			en: "Full-stack engineer focused on building high-performance tools with Go and Rust. Polishes micro-interactions until they shine.",
		},
	},
] as const;

/** 按 slug 快速查找作者 */
export function findAuthor(slug: string): FallbackAuthor | undefined {
	return FALLBACK_AUTHORS.find((a) => a.slug === slug);
}

/* ============================================================================
 * 博客分类(对应 Directus categories 集合)
 * ========================================================================== */

export interface FallbackCategory {
	readonly slug: string;
	readonly name: Bilingual;
	readonly description: Bilingual;
}

export const FALLBACK_CATEGORIES: readonly FallbackCategory[] = [
	{
		slug: "engineering",
		name: { zh: "工程", en: "Engineering" },
		description: {
			zh: "架构、性能、工具链与代码质量。",
			en: "Architecture, performance, tooling and code quality.",
		},
	},
	{
		slug: "release",
		name: { zh: "发布", en: "Releases" },
		description: {
			zh: "开源项目的版本发布与变更记录。",
			en: "Release notes and changelogs of open-source projects.",
		},
	},
	{
		slug: "notes",
		name: { zh: "笔记", en: "Notes" },
		description: {
			zh: "零散的技术笔记与实验手记。",
			en: "Scattered engineering notes and experiment logs.",
		},
	},
	{
		slug: "meta",
		name: { zh: "关于", en: "Meta" },
		description: {
			zh: "关于实验室本身、这个网站与内容方针。",
			en: "About the lab, this site, and editorial notes.",
		},
	},
] as const;

export function findCategory(slug: string): FallbackCategory | undefined {
	return FALLBACK_CATEGORIES.find((c) => c.slug === slug);
}

/* ============================================================================
 * 博客标签(对应 Directus tags 集合)
 * ========================================================================== */

export interface FallbackTag {
	readonly slug: string;
	readonly name: Bilingual;
}

export const FALLBACK_TAGS: readonly FallbackTag[] = [
	{ slug: "go", name: { zh: "Go", en: "Go" } },
	{ slug: "rust", name: { zh: "Rust", en: "Rust" } },
	{ slug: "typescript", name: { zh: "TypeScript", en: "TypeScript" } },
	{ slug: "performance", name: { zh: "性能", en: "Performance" } },
	{ slug: "open-source", name: { zh: "开源", en: "Open Source" } },
	{ slug: "architecture", name: { zh: "架构", en: "Architecture" } },
	{ slug: "astro", name: { zh: "Astro", en: "Astro" } },
	{ slug: "bun", name: { zh: "Bun", en: "Bun" } },
	{ slug: "docker", name: { zh: "Docker", en: "Docker" } },
	{ slug: "wordzero", name: { zh: "WordZero", en: "WordZero" } },
] as const;

export function findTag(slug: string): FallbackTag | undefined {
	return FALLBACK_TAGS.find((t) => t.slug === slug);
}

/* ============================================================================
 * 博客文章(对应 Directus posts 集合)
 * ============================================================================
 * 字段说明:
 *   - slug:          URL 关键字(双语共用)
 *   - title/excerpt: 列表展示
 *   - content:       Markdown 正文(详情页渲染)
 *   - cover:         可选封面图 URL(null 时列表用纯文字卡片)
 *   - coverLabel:    列表占位图上的大字标签(如 "v1.0 Release")
 *   - authorSlug:    关联 FALLBACK_AUTHORS
 *   - categorySlug:  关联 FALLBACK_CATEGORIES
 *   - tagSlugs:      关联 FALLBACK_TAGS
 *   - date:          ISO 8601(UTC)
 *   - readingTime:   估算分钟数(手动维护,后续由 hook 自动计算)
 *   - featured:      是否置顶
 * ========================================================================== */

export interface FallbackPost {
	readonly slug: string;
	readonly title: Bilingual;
	readonly excerpt: Bilingual;
	readonly content: Bilingual;
	readonly cover: string | null;
	readonly coverLabel: Bilingual;
	readonly authorSlug: string;
	readonly categorySlug: string;
	readonly tagSlugs: readonly string[];
	readonly date: string;
	readonly updatedDate: string | null;
	readonly readingTime: number;
	readonly featured: boolean;
}

/* -------------------------------------------------------------------------- *
 * 文章 1:实验室上线 (meta 类)
 * -------------------------------------------------------------------------- */

const POST_LAB_LAUNCH_CONTENT_ZH = `# ZerxLab 正式上线

经过若干个周末的打磨,ZerxLab 终于有了一个属于自己的站点。

## 为什么要做这个站点?

我做过很多小项目,散落在 GitHub、AUR、NPM、个人博客、技术平台之间。它们没有一个**统一的收纳与叙事场所**。于是这个站点诞生了 —— 不只是博客,也不只是作品集,而是一间"实验室"的公开橱窗。

## 技术栈

- **Astro 6** —— 博客和官网的最佳形态,默认零 JS
- **Bun** —— 本地包管理与脚本执行
- **Tailwind CSS v4** —— CSS-first,设计 tokens 即变量
- **Directus** —— Headless CMS,内容可视化编辑
- **Dokploy** —— 自建服务器部署,完全自主
- **MIT 许可** —— 一切开源,包括这个站点本身

## 约定

这里的文章不会追求"日更"或"热点",而是聚焦:

1. 真实做过的项目与遇到的问题
2. 可复现的性能优化与架构决策
3. 开源工具的发布与迭代记录

每一篇文章都应该能帮到"明年此时的自己"。如果恰好也对你有帮助,那最好不过。

---

欢迎通过 [GitHub](https://github.com/zerx-lab) 与我交流。Issues、PR、Discussions 都是我乐于阅读的。`;

const POST_LAB_LAUNCH_CONTENT_EN = `# Introducing ZerxLab

After a few weekends of polish, ZerxLab finally has a home of its own.

## Why a new site?

I have shipped many small projects scattered across GitHub, AUR, NPM, personal blogs, and various tech platforms. None of them had a **single place to live and tell their story**. Hence this site — not a blog, not a portfolio, but a public shopfront for a "lab".

## Stack

- **Astro 6** — the best shape for blog + landing, zero JS by default
- **Bun** — local package management and script runner
- **Tailwind CSS v4** — CSS-first, design tokens as variables
- **Directus** — headless CMS with visual editing
- **Dokploy** — self-hosted deployment, fully in control
- **MIT licensed** — everything open, including this site

## Editorial rules

Posts here will not chase "daily updates" or "hot news". The focus is:

1. Real projects and problems I ran into
2. Reproducible performance work and architecture decisions
3. Release notes and iteration logs of open-source tools

Every post should be helpful to "future me a year from now". If it happens to help you too, that is a bonus.

---

Reach out via [GitHub](https://github.com/zerx-lab). Issues, PRs, and Discussions — all welcome.`;

/* -------------------------------------------------------------------------- *
 * 文章 2:WordZero 性能
 * -------------------------------------------------------------------------- */

const POST_WORDZERO_CONTENT_ZH = `# WordZero 为什么比 Python 方案快 21 倍

WordZero 是一个用纯 Go 实现的 Word 文档处理引擎。平均处理耗时 2.62ms,而对应 Python 的方案需要 55.98ms。差距不是 2 倍,是 21 倍。

## 基准怎么做的

基准测试的前提永远比数字重要:

- **任务**:一份 20 页、含表格与样式的 .docx,读取全部段落并改写标题样式后输出
- **环境**:MacBook Pro M1,Go 1.22,Python 3.12,关闭虚拟机、禁用后台服务
- **重复**:单次任务跑 200 轮,去掉前后各 10 个样本取均值

## 为什么 Go 快这么多

1. **零依赖 OOXML 解析**。没有 DOM 树、没有反射,直接按字节流扫描 XML
2. **样式继承在类型系统中表达**,避免运行时递归查表
3. **输出用 Writer 组合** 而不是先构建完整树再 marshal
4. Python 方案的 \`python-docx\` 基于 lxml,解析整个 DOM 进内存是开销大头

## 这对用户意味着什么

当处理单份文档时,21 倍感知不强。但如果是**服务端批处理**(合同生成、报告导出),这个差距意味着同样的硬件能支撑 20 倍并发,或省掉 90% 的实例费用。

\`\`\`go
package main

import "github.com/zerx-lab/wordzero"

func main() {
    doc, err := wordzero.Open("report.docx")
    if err != nil {
        panic(err)
    }
    doc.ApplyStyle("Heading 1", wordzero.StyleBold)
    doc.SaveAs("report-styled.docx")
}
\`\`\`

完整 benchmark 源码在仓库的 \`benchmark/\` 目录。`;

const POST_WORDZERO_CONTENT_EN = `# Why WordZero is 21× Faster than the Python Path

WordZero is a pure-Go Word document engine. Average processing time is 2.62ms, while the corresponding Python solution takes 55.98ms. That is not 2× — it is 21×.

## How the benchmark was run

Benchmark context matters more than the number itself:

- **Task**: a 20-page .docx with tables and styles; read all paragraphs and restyle headings, then write out
- **Environment**: MacBook Pro M1, Go 1.22, Python 3.12, VMs off, background services disabled
- **Repetition**: 200 runs per task; mean computed after trimming the first and last 10 samples

## Why Go is this much faster

1. **Zero-dependency OOXML parsing**. No DOM tree, no reflection — XML is walked as a byte stream
2. **Style inheritance expressed in the type system**, avoiding runtime recursive lookups
3. **Output built via Writer composition** rather than building a full tree then marshalling
4. The Python path's \`python-docx\` relies on lxml; parsing the entire DOM into memory dominates cost

## What this means for users

For a single document, 21× is barely felt. But for **server-side batch workloads** (contract generation, report export), the gap means the same hardware can serve 20× concurrent requests, or 90% cheaper infra.

\`\`\`go
package main

import "github.com/zerx-lab/wordzero"

func main() {
    doc, err := wordzero.Open("report.docx")
    if err != nil {
        panic(err)
    }
    doc.ApplyStyle("Heading 1", wordzero.StyleBold)
    doc.SaveAs("report-styled.docx")
}
\`\`\`

Full benchmark source lives in \`benchmark/\` under the repo.`;

/* -------------------------------------------------------------------------- *
 * 文章 3:rmx Release
 * -------------------------------------------------------------------------- */

const POST_RMX_CONTENT_ZH = `# rmx v0.2 发布:Windows 目录删除的正确打开方式

如果你在 Windows 上删过一个 \`node_modules\`,你就知道资源管理器会花上几分钟列出每一个文件再删除。\`rmx\` 用 Rust 把这件事拆成可并行的任务图。

## 新版本做了什么

- **并发模型重写**:从 Tokio 的 async fs 改为 Rayon + \`std::fs\`,在 NTFS 上快 1.8×
- **符号链接安全**:默认不跟进,避免删到系统目录
- **实时进度**:删除过程按秒刷新吞吐,长目录不再"黑屏"
- **CI 二进制**:GitHub Actions 自动出 x86_64 / aarch64 两套 exe

## 安装

\`\`\`bash
cargo install rmx
# 或下载预编译:
# https://github.com/zerx-lab/rmx/releases
\`\`\`

## 为什么不用 PowerShell?

\`Remove-Item -Recurse -Force\` 本身不慢,慢的是它走的是托管文件 API,每一级目录都要通过 .NET 层过一遍。而 \`rmx\` 直接调原生 Win32 \`RemoveDirectoryW\`,并用线程池把"枚举 + 删除"流水线化。`;

const POST_RMX_CONTENT_EN = `# rmx v0.2: The Right Way to Delete Directories on Windows

If you have ever deleted a \`node_modules\` on Windows, you know Explorer will sit there enumerating every file before it removes anything. \`rmx\` is a Rust tool that turns this into a parallelizable task graph.

## What is new

- **Rewritten concurrency**: switched from Tokio async fs to Rayon + \`std::fs\`, 1.8× faster on NTFS
- **Symlink safe**: no follow by default, no more accidental system-wide rm
- **Live progress**: per-second throughput while deleting, no more "black screen" on huge trees
- **CI binaries**: GitHub Actions now ships x86_64 and aarch64 executables

## Install

\`\`\`bash
cargo install rmx
# or grab a prebuilt binary:
# https://github.com/zerx-lab/rmx/releases
\`\`\`

## Why not PowerShell?

\`Remove-Item -Recurse -Force\` is not slow per se; it is slow because it runs through the managed file API — every directory level goes through the .NET layer. \`rmx\` talks directly to Win32 \`RemoveDirectoryW\` and pipelines "enumerate + delete" via a thread pool.`;

/* -------------------------------------------------------------------------- *
 * 文章 4:Astro 选型笔记
 * -------------------------------------------------------------------------- */

const POST_ASTRO_CONTENT_ZH = `# 为什么这个站点最终选了 Astro

做完这个站的选型调研,我把最后的结论写下来,给未来的自己备查。

## 备选清单

- Next.js 15 App Router
- Astro 5 (现已 6) + React Islands
- Nuxt 3
- SvelteKit 2
- 纯静态 + MDX

## Astro 胜出的理由

1. **博客和官网 100% 可 SSG**,Lighthouse 默认 95+
2. **Islands 架构**,只有需要交互的组件才带 JS
3. **Content Collections** 对 Markdown/MDX 一等公民支持
4. **零服务器运行时**(选 SSG 模式时),Dokploy 部署就是一份 \`dist/\`

## Next.js 的劣势(仅针对本场景)

- RSC 对博客这种静态场景是大炮打蚊子
- 默认 \`fetch\` 缓存策略需要逐个设置,踩坑多
- 镜像比 Astro 静态产物大 10 倍以上

## 不是"Astro 最好",是"最合适"

这套选择只有在"博客 + 官网 + 偶尔需要一点交互"的场景下成立。如果要做仪表盘、实时数据、富交互应用,Next.js / Nuxt 仍然是更好的答案。`;

const POST_ASTRO_CONTENT_EN = `# Why This Site Finally Picked Astro

After finishing the framework evaluation for this site, I am writing down the final call for future me.

## Candidates

- Next.js 15 App Router
- Astro 5 (now 6) + React Islands
- Nuxt 3
- SvelteKit 2
- Plain static + MDX

## Why Astro won

1. **Blog and landing are 100% SSG-able**, Lighthouse 95+ out of the box
2. **Islands architecture**: JS only ships for components that need it
3. **Content Collections**: first-class support for Markdown/MDX
4. **Zero server runtime** (in SSG mode), so Dokploy just serves a \`dist/\` folder

## Next.js downsides (for this scope only)

- RSC is overkill for a static blog
- Default \`fetch\` cache behavior needs manual overrides, many footguns
- Final image is >10× the size of Astro's static output

## Not "Astro is best", but "Astro fits"

This call only holds when the scope is "blog + landing + occasional interactivity". For dashboards, real-time data, or heavy interaction, Next.js / Nuxt still win.`;

export const FALLBACK_POSTS: readonly FallbackPost[] = [
	{
		slug: "zerxlab-launch",
		title: {
			zh: "ZerxLab 正式上线",
			en: "Introducing ZerxLab",
		},
		excerpt: {
			zh: "一个属于实验室的公开橱窗,为什么它存在、用什么做的,以及接下来会有什么。",
			en: "A public shopfront for the lab — why it exists, what it runs on, and what comes next.",
		},
		content: {
			zh: POST_LAB_LAUNCH_CONTENT_ZH,
			en: POST_LAB_LAUNCH_CONTENT_EN,
		},
		cover: null,
		coverLabel: {
			zh: "v0.1 上线",
			en: "v0.1 Launch",
		},
		authorSlug: "zerx",
		categorySlug: "meta",
		tagSlugs: ["astro", "bun", "open-source"],
		date: "2026-04-17T00:00:00.000Z",
		updatedDate: null,
		readingTime: 3,
		featured: true,
	},
	{
		slug: "wordzero-21x-faster",
		title: {
			zh: "WordZero 为什么比 Python 方案快 21 倍",
			en: "Why WordZero is 21× Faster than the Python Path",
		},
		excerpt: {
			zh: "零依赖、类型驱动样式继承、Writer 组合式输出 —— 把 OOXML 解析做到 2.62ms 的三件事。",
			en: "Zero deps, type-driven style inheritance, Writer-composed output — three things that bring OOXML parsing down to 2.62ms.",
		},
		content: {
			zh: POST_WORDZERO_CONTENT_ZH,
			en: POST_WORDZERO_CONTENT_EN,
		},
		cover: null,
		coverLabel: {
			zh: "Benchmark",
			en: "Benchmark",
		},
		authorSlug: "zerx",
		categorySlug: "engineering",
		tagSlugs: ["go", "performance", "wordzero"],
		date: "2026-03-22T00:00:00.000Z",
		updatedDate: null,
		readingTime: 6,
		featured: true,
	},
	{
		slug: "rmx-v0-2-release",
		title: {
			zh: "rmx v0.2 发布:Windows 目录删除的正确打开方式",
			en: "rmx v0.2: The Right Way to Delete Directories on Windows",
		},
		excerpt: {
			zh: "并发模型重写、符号链接安全、实时进度、CI 二进制。在 NTFS 上比上个版本快 1.8×。",
			en: "Rewritten concurrency, symlink safety, live progress, CI binaries. 1.8× faster than the previous release on NTFS.",
		},
		content: {
			zh: POST_RMX_CONTENT_ZH,
			en: POST_RMX_CONTENT_EN,
		},
		cover: null,
		coverLabel: {
			zh: "v0.2 Release",
			en: "v0.2 Release",
		},
		authorSlug: "zerx",
		categorySlug: "release",
		tagSlugs: ["rust", "performance"],
		date: "2026-02-08T00:00:00.000Z",
		updatedDate: null,
		readingTime: 4,
		featured: false,
	},
	{
		slug: "why-astro-for-this-site",
		title: {
			zh: "为什么这个站点最终选了 Astro",
			en: "Why This Site Finally Picked Astro",
		},
		excerpt: {
			zh: "博客 + 官网 + 偶尔需要一点交互。对比 Next/Nuxt/SvelteKit 后的选型决策记录。",
			en: "Blog + landing + occasional interactivity. A decision log after comparing Next, Nuxt, and SvelteKit.",
		},
		content: {
			zh: POST_ASTRO_CONTENT_ZH,
			en: POST_ASTRO_CONTENT_EN,
		},
		cover: null,
		coverLabel: {
			zh: "选型笔记",
			en: "Decision Log",
		},
		authorSlug: "zerx",
		categorySlug: "notes",
		tagSlugs: ["astro", "architecture", "typescript"],
		date: "2026-01-15T00:00:00.000Z",
		updatedDate: null,
		readingTime: 5,
		featured: false,
	},
] as const;

/** 按发布日期降序排序的博客列表(列表页直接消费) */
export function listFallbackPosts(): readonly FallbackPost[] {
	return [...FALLBACK_POSTS].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);
}

/** 按 slug 查找博客 */
export function findFallbackPost(slug: string): FallbackPost | undefined {
	return FALLBACK_POSTS.find((p) => p.slug === slug);
}

/** 获取相邻文章(用于文章详情页的"上一篇 / 下一篇") */
export function getAdjacentPosts(slug: string): {
	previous: FallbackPost | null;
	next: FallbackPost | null;
} {
	const sorted = listFallbackPosts();
	const index = sorted.findIndex((p) => p.slug === slug);
	if (index === -1) return { previous: null, next: null };
	// 列表按日期降序:index-1 是更新的一篇(next),index+1 是更老的一篇(previous)
	return {
		previous: sorted[index + 1] ?? null,
		next: sorted[index - 1] ?? null,
	};
}

/* ============================================================================
 * 开源项目(对应 Directus projects 集合)
 * ============================================================================
 * 数据口径:
 *   - 基于 github.com/zerx-lab 的真实仓库
 *   - stars/forks 截止 2026-04,后续由构建脚本回填真实数据
 *   - tech_stack 里第一项用于首页卡片徽标
 * ========================================================================== */

export type ProjectKind = "library" | "tool" | "app" | "experiment" | "service";

export interface FallbackProject {
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

export const FALLBACK_PROJECTS: readonly FallbackProject[] = [
	{
		slug: "wordzero",
		name: "wordZero",
		description: {
			zh: "零依赖 Go 语言 Word 文档处理引擎,比主流 Python 方案快 21 倍。支持 18 种预定义样式与完整 OOXML。",
			en: "Zero-dependency Go engine for Word docs, 21× faster than the Python path. 18 built-in styles, full OOXML coverage.",
		},
		techStack: ["Go", "OOXML", "Zero-dep"],
		kind: "library",
		language: "Go",
		githubUrl: "https://github.com/zerx-lab/wordZero",
		demoUrl: null,
		docsUrl: "https://github.com/zerx-lab/wordZero#readme",
		npmUrl: null,
		stars: 646,
		forks: 53,
		featured: true,
		highlights: {
			zh: "零依赖 · 2.62ms 平均耗时 · 18 种预定义样式",
			en: "Zero deps · 2.62ms avg · 18 preset styles",
		},
	},
	{
		slug: "penbridge",
		name: "PenBridge",
		description: {
			zh: "一键发布博客到多平台(知乎、掘金、CSDN 等),自动适配 Markdown 方言与图片托管。",
			en: "One-click blog publishing across multiple platforms with dialect-aware Markdown and image hosting.",
		},
		techStack: ["TypeScript", "Tauri", "Rust"],
		kind: "app",
		language: "TypeScript",
		githubUrl: "https://github.com/zerx-lab/PenBridge",
		demoUrl: null,
		docsUrl: null,
		npmUrl: null,
		stars: 202,
		forks: 18,
		featured: true,
		highlights: {
			zh: "多平台同步 · Markdown 方言适配 · 桌面端",
			en: "Cross-platform sync · Dialect-aware Markdown · Desktop app",
		},
	},
	{
		slug: "siyuan-share",
		name: "siyuan-share",
		description: {
			zh: "思源笔记的分享扩展,让笔记以精致的页面公开分享,支持自定义主题与访问控制。",
			en: "A sharing extension for SiYuan Note — publish notes as polished pages with custom themes and access control.",
		},
		techStack: ["TypeScript", "SiYuan"],
		kind: "tool",
		language: "TypeScript",
		githubUrl: "https://github.com/zerx-lab/siyuan-share",
		demoUrl: null,
		docsUrl: null,
		npmUrl: null,
		stars: 65,
		forks: 8,
		featured: false,
		highlights: {
			zh: "思源笔记扩展 · 主题可定制 · 访问控制",
			en: "SiYuan plugin · Themeable · Access control",
		},
	},
	{
		slug: "rmx",
		name: "rmx",
		description: {
			zh: "Windows 上的高性能并行目录删除工具,处理 node_modules 这类深层嵌套目录比原生方式快一个数量级。",
			en: "High-performance parallel directory remover for Windows. Handles deeply nested trees like node_modules an order of magnitude faster than native.",
		},
		techStack: ["Rust", "Rayon", "Win32"],
		kind: "tool",
		language: "Rust",
		githubUrl: "https://github.com/zerx-lab/rmx",
		demoUrl: null,
		docsUrl: null,
		npmUrl: null,
		stars: 58,
		forks: 4,
		featured: true,
		highlights: {
			zh: "Rust 并行删除 · NTFS 优化 · 符号链接安全",
			en: "Parallel Rust remover · NTFS-tuned · Symlink safe",
		},
	},
	{
		slug: "axon-ai",
		name: "axon-ai",
		description: {
			zh: "探索性的 Agent 编排框架,研究 LLM 作为「写代码的同事」而非玩具的可能性。",
			en: "An experimental agent orchestration framework exploring LLMs as coworkers that ship code, not toys.",
		},
		techStack: ["TypeScript", "LLM", "Agents"],
		kind: "experiment",
		language: "TypeScript",
		githubUrl: "https://github.com/zerx-lab/axon-ai",
		demoUrl: null,
		docsUrl: null,
		npmUrl: null,
		stars: 15,
		forks: 2,
		featured: false,
		highlights: {
			zh: "Agent 编排 · 工具调用 · 异步工作流",
			en: "Agent orchestration · Tool calling · Async workflows",
		},
	},
	{
		slug: "lspproxy",
		name: "LspProxy",
		description: {
			zh: "LSP 中文翻译代理。以透明代理形式插入编辑器与 LSP 进程之间,将 hover、completion、diagnostics 的英文文档实时翻译为中文。",
			en: "A transparent LSP proxy that sits between your editor and the LSP server, translating hover / completion / diagnostics from English into Chinese in real time.",
		},
		techStack: ["Go", "LSP"],
		kind: "tool",
		language: "Go",
		githubUrl: "https://github.com/zerx-lab/LspProxy",
		demoUrl: null,
		docsUrl: null,
		npmUrl: null,
		stars: 12,
		forks: 1,
		featured: false,
		highlights: {
			zh: "透明代理 · 支持 VSCode / Neovim / Zed",
			en: "Transparent proxy · VSCode / Neovim / Zed",
		},
	},
	{
		slug: "zerxlab-website",
		name: "zerx-lab-website",
		description: {
			zh: "你正在看的这个站点。Astro + Bun + Tailwind v4 + Directus,部署在 Dokploy 上。",
			en: "The site you are reading. Astro + Bun + Tailwind v4 + Directus, deployed on Dokploy.",
		},
		techStack: ["Astro", "Bun", "Tailwind"],
		kind: "app",
		language: "TypeScript",
		githubUrl: "https://github.com/zerx-lab/zerx-lab-website",
		demoUrl: "https://zerx.dev",
		docsUrl: null,
		npmUrl: null,
		stars: 0,
		forks: 0,
		featured: false,
		highlights: {
			zh: "Astro 6 · 双语 · 全 SSG · 自建部署",
			en: "Astro 6 · Bilingual · Full SSG · Self-hosted",
		},
	},
] as const;

/** 按 star 数降序排序的项目列表 */
export function listFallbackProjects(): readonly FallbackProject[] {
	return [...FALLBACK_PROJECTS].sort((a, b) => b.stars - a.stars);
}

/** 仅首页展示的 featured 项目 */
export function listFeaturedProjects(): readonly FallbackProject[] {
	return listFallbackProjects().filter((p) => p.featured);
}

/** 按 slug 查找项目 */
export function findFallbackProject(slug: string): FallbackProject | undefined {
	return FALLBACK_PROJECTS.find((p) => p.slug === slug);
}

/* ============================================================================
 * AUR 软件包(对应 Directus aur_packages 集合)
 * ========================================================================== */

export interface FallbackAurPackage {
	readonly slug: string;
	/** AUR 包全名,安装命令中直接使用 */
	readonly name: string;
	readonly version: string;
	readonly description: Bilingual;
	/** 徽章标签,用于列表卡片右上角 */
	readonly badges: readonly string[];
	readonly aurUrl: string;
	readonly upstreamUrl: string | null;
	readonly maintained: boolean;
}

export const FALLBACK_AUR_PACKAGES: readonly FallbackAurPackage[] = [
	{
		slug: "pencil",
		name: "zerx-lab-pencil-bin",
		version: "1.1.46-1",
		description: {
			zh: "Pencil — 原生性能的全画布设计工具,适合快速原型与想法可视化。",
			en: "Pencil — full-canvas design tool with native performance, great for rapid prototyping and visual thinking.",
		},
		badges: ["BIN", "DESIGN"],
		aurUrl: "https://aur.archlinux.org/packages/zerx-lab-pencil-bin",
		upstreamUrl: "https://www.pencil.dev",
		maintained: true,
	},
	{
		slug: "fluxdown",
		name: "zerx-lab-fluxdown-bin",
		version: "0.1.36-1",
		description: {
			zh: "FluxDown — Rust 驱动的多协议下载管理器,支持 HTTP / FTP / BitTorrent。",
			en: "FluxDown — Rust-powered download manager supporting HTTP / FTP / BitTorrent.",
		},
		badges: ["BIN", "RUST", "DOWNLOAD"],
		aurUrl: "https://aur.archlinux.org/packages/zerx-lab-fluxdown-bin",
		upstreamUrl: "https://fluxdown.zerx.dev",
		maintained: true,
	},
	{
		slug: "dida365",
		name: "zerx-lab-dida365-bin",
		version: "8.0.0-1",
		description: {
			zh: "滴答清单 — 跨平台的 Todo / 任务管理器,支持多端同步与日历视图。",
			en: "TickTick (Dida365) — cross-platform todo / task manager with sync and calendar views.",
		},
		badges: ["BIN", "PRODUCTIVITY"],
		aurUrl: "https://aur.archlinux.org/packages/zerx-lab-dida365-bin",
		upstreamUrl: "https://dida365.com",
		maintained: true,
	},
	{
		slug: "hexhub",
		name: "zerx-lab-hexhub-bin",
		version: "1.3.1-1",
		description: {
			zh: "HexHub — 为开发者和运维人员打造的一站式工具,集 Database / Docker / SSH / SFTP 于一身。",
			en: "HexHub — all-in-one tool for devs and ops, combining Database / Docker / SSH / SFTP.",
		},
		badges: ["BIN", "DEVOPS", "DATABASE"],
		aurUrl: "https://aur.archlinux.org/packages/zerx-lab-hexhub-bin",
		upstreamUrl: "https://www.hexhub.cn",
		maintained: true,
	},
] as const;

export function listFallbackAurPackages(): readonly FallbackAurPackage[] {
	return [...FALLBACK_AUR_PACKAGES];
}

export function findFallbackAurPackage(
	slug: string,
): FallbackAurPackage | undefined {
	return FALLBACK_AUR_PACKAGES.find((p) => p.slug === slug);
}

/* ============================================================================
 * 通用聚合(供首页左栏 meta / 社区页统计消费)
 * ========================================================================== */

export interface FallbackCounts {
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

export function getFallbackCounts(): FallbackCounts {
	const totalStars = FALLBACK_PROJECTS.reduce(
		(sum, p) => sum + (p.stars ?? 0),
		0,
	);
	const totalForks = FALLBACK_PROJECTS.reduce(
		(sum, p) => sum + (p.forks ?? 0),
		0,
	);
	return {
		posts: FALLBACK_POSTS.length,
		projects: FALLBACK_PROJECTS.length,
		featuredProjects: FALLBACK_PROJECTS.filter((p) => p.featured).length,
		aurPackages: FALLBACK_AUR_PACKAGES.length,
		categories: FALLBACK_CATEGORIES.length,
		tags: FALLBACK_TAGS.length,
		authors: FALLBACK_AUTHORS.length,
		totalStars,
		totalForks,
	};
}

/* ============================================================================
 * 语言占比(基于 GitHub 实际占比,供关于页 / 技术雷达使用)
 * ========================================================================== */

export interface FallbackLanguageStat {
	readonly name: string;
	readonly percent: number;
	/** 16 进制颜色,参考 GitHub linguist 颜色表 */
	readonly color: string;
}

export const FALLBACK_LANGUAGE_STATS: readonly FallbackLanguageStat[] = [
	{ name: "TypeScript", percent: 40.9, color: "#3178c6" },
	{ name: "Go", percent: 22.7, color: "#00ADD8" },
	{ name: "Rust", percent: 12.5, color: "#dea584" },
	{ name: "C#", percent: 9.1, color: "#178600" },
	{ name: "HTML", percent: 5.2, color: "#e34c26" },
	{ name: "JavaScript", percent: 4.1, color: "#f1e05a" },
	{ name: "MDX", percent: 3.0, color: "#fcb32c" },
	{ name: "Other", percent: 2.5, color: "#8c8c8c" },
] as const;
