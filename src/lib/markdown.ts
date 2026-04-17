/**
 * ============================================================================
 * ZerxLab Website - Markdown 渲染工具
 * ----------------------------------------------------------------------------
 * 用途:
 *   把从 Directus / Fallback 数据层拿到的 Markdown 字符串渲染为 HTML,
 *   供博客详情页、项目介绍页等内容型页面消费。
 *
 * 技术选型:
 *   - marked    —— 轻量、稳定、API 简单,无运行时依赖
 *   - marked-shiki —— 把 marked 的代码块交给 Shiki 做高亮,与 astro.config 中
 *                     markdown.shikiConfig 的配色保持一致
 *   - Shiki     —— 与 Astro 内置 Markdown 引擎同款,保证 Markdown 文件
 *                  和字符串 Markdown 渲染出视觉一致的代码块
 *
 * 为什么不用 Astro 的 Content Collections:
 *   - Content Collections 要求 Markdown 位于 src/content/ 文件系统,
 *     而我们的文章内容是 Directus 返回的字符串(或 fallback 字符串)
 *   - 运行时从字符串渲染 → 必须使用 marked 或 markdown-it 等独立渲染器
 *
 * 安全边界:
 *   - 默认开启 GFM(表格、删除线、任务列表)
 *   - 不启用 raw HTML 透传(marked 默认会渲染内嵌 HTML,我们保留默认,
 *     因为内容来源于可信后台,若未来开放评论或 UGC,需改为 sanitize)
 *
 * 结构化副产品:
 *   - renderMarkdown(md) → { html, headings, wordCount, readingTimeMin }
 *   - 文章详情页靠 headings 生成右侧 TOC(目录)
 *   - 首次字数 / 阅读时长用于显示在 meta 行
 * ============================================================================
 */

import { Marked } from "marked";
import markedShiki from "marked-shiki";
import {
	createHighlighter,
	type Highlighter,
	type BundledLanguage,
	type BundledTheme,
} from "shiki";

/* ----------------------------------------------------------------------------
 * Shiki 单例:高亮器只初始化一次,供整个构建过程复用
 * ----------------------------------------------------------------------------
 * createHighlighter 需要异步加载语法包,在 Astro SSG 构建时会被多次调用
 * (每个博客页一次),所以必须缓存。懒加载:首次调用时创建,后续复用。
 * -------------------------------------------------------------------------- */

/** 与 astro.config.mjs 的 markdown.shikiConfig 保持完全一致 */
const SHIKI_THEMES = {
	light: "github-light",
	dark: "github-dark-dimmed",
} as const;

/**
 * 预装语言列表:覆盖站点内绝大多数代码块。
 * 未在此列表中的语言,marked-shiki 会降级为纯 plain 文本渲染,不会崩溃。
 * 按需增删,不要无脑全装(每个语言包约 50-150 KB)。
 */
const SHIKI_LANGUAGES: readonly BundledLanguage[] = [
	"bash",
	"shell",
	"powershell",
	"javascript",
	"typescript",
	"tsx",
	"jsx",
	"json",
	"jsonc",
	"yaml",
	"toml",
	"markdown",
	"mdx",
	"html",
	"css",
	"scss",
	"astro",
	"go",
	"rust",
	"python",
	"java",
	"c",
	"cpp",
	"csharp",
	"sql",
	"dockerfile",
	"nginx",
	"ini",
	"diff",
	"xml",
	"lua",
	"php",
	"ruby",
] as const;

let _highlighter: Highlighter | null = null;
let _highlighterPromise: Promise<Highlighter> | null = null;

/**
 * 获取 Shiki 高亮器单例(懒加载)。
 * 并发调用安全:多个并发请求共享同一个 Promise。
 */
async function getHighlighter(): Promise<Highlighter> {
	if (_highlighter) return _highlighter;
	if (_highlighterPromise) return _highlighterPromise;

	_highlighterPromise = createHighlighter({
		themes: [SHIKI_THEMES.light, SHIKI_THEMES.dark] as BundledTheme[],
		langs: [...SHIKI_LANGUAGES],
	}).then((h) => {
		_highlighter = h;
		return h;
	});

	return _highlighterPromise;
}

/* ----------------------------------------------------------------------------
 * marked 实例:启用 GFM + 自定义渲染扩展
 * -------------------------------------------------------------------------- */

/**
 * 收集渲染过程中遇到的标题,供外部构建 TOC 使用。
 * 每次 renderMarkdown() 都会重置此数组(通过创建新的 Marked 实例)。
 */
export interface MarkdownHeading {
	/** 标题层级:1-6 */
	level: number;
	/** 显示文本(已去除 Markdown 符号) */
	text: string;
	/** slug 化后的 id,与 <h*> 的 id 一致 */
	slug: string;
}

/**
 * GitHub 风格 slug 化:
 *   - 全部小写
 *   - 非字母/数字/连字符的字符替换为 "-"
 *   - 合并连续 "-"
 *   - 去除首尾 "-"
 *   - CJK 字符保留原样(GitHub 也是这样做的)
 */
function slugify(input: string): string {
	return input
		.trim()
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s-]/gu, "") // 保留字母、数字、空格、连字符
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

/**
 * 为避免 slug 冲突,给每个标题附加一个递增后缀(仅在重复时)。
 * 例如两个 "## 安装",第二个会变成 "安装-1"。
 */
function ensureUniqueSlug(slug: string, used: Map<string, number>): string {
	const count = used.get(slug) ?? 0;
	used.set(slug, count + 1);
	return count === 0 ? slug : `${slug}-${count}`;
}

/* ----------------------------------------------------------------------------
 * 主渲染入口
 * -------------------------------------------------------------------------- */

export interface RenderMarkdownResult {
	/** 渲染后的 HTML 字符串(可直接通过 set:html 注入) */
	html: string;
	/** 有序的标题列表,用于生成 TOC */
	headings: readonly MarkdownHeading[];
	/** 正文字数(CJK 按字计,其他语言按空白分词) */
	wordCount: number;
	/** 估算阅读时长(分钟,向上取整,至少 1 分钟) */
	readingTimeMin: number;
}

/**
 * 把一段 Markdown 字符串渲染为 HTML,并附带 TOC / 字数 / 阅读时长。
 *
 * 实现要点:
 *   - 每次调用都 new 一个独立的 Marked 实例,避免全局副作用污染
 *   - heading 扩展重写:为每个 H1-H6 注入稳定的 id,并把标题收入 headings 数组
 *   - link 扩展重写:为外链自动补 target="_blank" + rel="noopener noreferrer"
 *   - code 扩展:交给 Shiki 渲染(异步)
 *
 * @param source 原始 Markdown 字符串
 * @returns 渲染结果对象
 */
export async function renderMarkdown(
	source: string,
): Promise<RenderMarkdownResult> {
	if (!source || source.trim().length === 0) {
		return {
			html: "",
			headings: [],
			wordCount: 0,
			readingTimeMin: 0,
		};
	}

	const highlighter = await getHighlighter();

	// ---- 独立实例,避免共享状态 ----
	const marked = new Marked({
		gfm: true,
		breaks: false,
	});

	// 本次渲染收集到的标题 & slug 去重记录
	const headings: MarkdownHeading[] = [];
	const usedSlugs = new Map<string, number>();

	// ---- Shiki 代码块高亮(marked-shiki 扩展) ----
	marked.use(
		markedShiki({
			highlight(code: string, lang: string) {
				// 语言归一化 + 未支持的语言 fallback 到 txt
				const normalizedLang = normalizeLang(lang);

				try {
					return highlighter.codeToHtml(code, {
						lang: normalizedLang as BundledLanguage,
						themes: {
							light: SHIKI_THEMES.light,
							dark: SHIKI_THEMES.dark,
						},
						defaultColor: false, // 输出 CSS 变量,前端 .dark 类切换即可
					});
				} catch {
					// 未知语言 / Shiki 内部错误 → 降级为 <pre><code> 纯文本
					return renderFallbackCodeBlock(code, lang);
				}
			},
		}),
	);

	// ---- 标题扩展:注入 id + 收集 headings ----
	marked.use({
		renderer: {
			heading({ tokens, depth }) {
				// this.parser.parseInline 会递归渲染 inline tokens 成 HTML,
				// 但 TOC 需要纯文本,另外手工拼。
				const html = this.parser!.parseInline(tokens);
				const text = tokensToPlainText(tokens);
				const rawSlug = slugify(text);
				const slug = rawSlug
					? ensureUniqueSlug(rawSlug, usedSlugs)
					: `heading-${headings.length + 1}`;

				headings.push({ level: depth, text, slug });

				return `<h${depth} id="${slug}" class="md-heading md-heading-${depth}"><a href="#${slug}" class="md-anchor" aria-label="${escapeAttr(text)} 永久链接">#</a>${html}</h${depth}>\n`;
			},

			// 外链自动补 target + rel;内链 / 锚点保持默认
			link({ href, title, tokens }) {
				const text = this.parser!.parseInline(tokens);
				const isExternal =
					typeof href === "string" && /^https?:\/\//i.test(href);
				const attrs = [`href="${escapeAttr(href ?? "")}"`];
				if (title) attrs.push(`title="${escapeAttr(title)}"`);
				if (isExternal) {
					attrs.push(`target="_blank"`);
					attrs.push(`rel="noopener noreferrer"`);
				}
				return `<a ${attrs.join(" ")}>${text}</a>`;
			},

			// 给图片加 loading="lazy" 与 decoding="async"
			image({ href, title, text }) {
				const attrs = [
					`src="${escapeAttr(href ?? "")}"`,
					`alt="${escapeAttr(text ?? "")}"`,
					`loading="lazy"`,
					`decoding="async"`,
				];
				if (title) attrs.push(`title="${escapeAttr(title)}"`);
				return `<img ${attrs.join(" ")} />`;
			},
		},
	});

	// ---- 执行渲染 ----
	const html = (await marked.parse(source, { async: true })) as string;

	// ---- 统计字数 / 阅读时长 ----
	const plain = stripMarkdownForCount(source);
	const wordCount = countWords(plain);
	const readingTimeMin = Math.max(1, Math.ceil(wordCount / 300));

	return {
		html,
		headings,
		wordCount,
		readingTimeMin,
	};
}

/* ----------------------------------------------------------------------------
 * 辅助函数
 * -------------------------------------------------------------------------- */

/**
 * 把 marked 的 tokens 数组递归拉成纯文本。
 * 仅用于提取 heading 的 TOC 文本,不追求完美覆盖所有 token 类型。
 */
function tokensToPlainText(tokens: readonly any[] | undefined): string {
	if (!tokens) return "";
	let out = "";
	for (const token of tokens) {
		if (!token) continue;
		if (typeof token.text === "string") {
			out += token.text;
		} else if (Array.isArray(token.tokens)) {
			out += tokensToPlainText(token.tokens);
		}
	}
	return out.trim();
}

/**
 * 语言别名归一化。Shiki 的 BundledLanguage 使用规范名,
 * 日常 Markdown 里常出现的别名统一映射到规范名。
 */
function normalizeLang(lang: string | undefined | null): string {
	const raw = (lang ?? "").trim().toLowerCase();
	if (!raw) return "txt";
	const alias: Record<string, string> = {
		sh: "bash",
		zsh: "bash",
		terminal: "bash",
		console: "bash",
		ps: "powershell",
		ps1: "powershell",
		js: "javascript",
		ts: "typescript",
		"node.js": "javascript",
		node: "javascript",
		py: "python",
		rb: "ruby",
		yml: "yaml",
		md: "markdown",
		docker: "dockerfile",
		"c++": "cpp",
		"c#": "csharp",
		cs: "csharp",
		golang: "go",
		rs: "rust",
		plain: "txt",
		text: "txt",
	};
	return alias[raw] ?? raw;
}

/**
 * 当 Shiki 无法识别语言或渲染失败时的降级方案:
 * 输出一个带适度样式的 <pre><code> 块,保证页面不炸。
 */
function renderFallbackCodeBlock(code: string, lang: string): string {
	const escaped = escapeHtml(code);
	const langLabel = lang ? ` data-lang="${escapeAttr(lang)}"` : "";
	return `<pre class="md-code-fallback"${langLabel}><code>${escaped}</code></pre>`;
}

/**
 * 极简的 Markdown → 纯文本(仅用于字数统计,不追求完美):
 * - 去掉代码围栏及其内容(代码不计入字数)
 * - 去掉行内代码标记
 * - 去掉图片 / 链接的 URL 部分,保留描述
 * - 去掉标题 / 列表 / 引用等标记符号
 */
function stripMarkdownForCount(source: string): string {
	return (
		source
			// 去除围栏代码块(含内容)
			.replace(/```[\s\S]*?```/g, " ")
			// 去除行内代码
			.replace(/`[^`]*`/g, " ")
			// 图片:![alt](url) → alt
			.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
			// 链接:[text](url) → text
			.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
			// 标题 / 列表 / 引用符号
			.replace(/^[ \t]*#{1,6}\s+/gm, "")
			.replace(/^[ \t]*>\s?/gm, "")
			.replace(/^[ \t]*[-*+]\s+/gm, "")
			.replace(/^[ \t]*\d+\.\s+/gm, "")
			// 加粗 / 斜体 / 删除线
			.replace(/\*\*([^*]+)\*\*/g, "$1")
			.replace(/\*([^*]+)\*/g, "$1")
			.replace(/_([^_]+)_/g, "$1")
			.replace(/~~([^~]+)~~/g, "$1")
	);
}

/**
 * 字数统计:
 *   - CJK(中日韩)字符按"每字 1 词"计
 *   - 其他按空白分词,连续字母 / 数字串算一个"词"
 *   - 两种统计加总,避免中英混排时结果偏低
 */
function countWords(text: string): number {
	if (!text) return 0;

	// CJK:\p{Script=Han}(汉) + \p{Script=Hiragana} + \p{Script=Katakana} + \p{Script=Hangul}
	const cjkMatches = text.match(
		/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu,
	);
	const cjkCount = cjkMatches ? cjkMatches.length : 0;

	// 非 CJK 词(连续字母 / 数字串)
	const nonCjk = text.replace(
		/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu,
		" ",
	);
	const wordMatches = nonCjk.match(/[A-Za-z0-9]+/g);
	const wordCount = wordMatches ? wordMatches.length : 0;

	return cjkCount + wordCount;
}

/**
 * HTML 转义(正文文本)。
 */
function escapeHtml(input: string): string {
	return input
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

/**
 * HTML 属性值转义(只处理双引号与 & <,避免破坏属性语法)。
 */
function escapeAttr(input: string): string {
	return input
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;");
}

/* ----------------------------------------------------------------------------
 * 低阶工具导出(供测试 / 其他模块复用)
 * -------------------------------------------------------------------------- */

export const __internal = {
	slugify,
	normalizeLang,
	stripMarkdownForCount,
	countWords,
	escapeHtml,
	escapeAttr,
};

