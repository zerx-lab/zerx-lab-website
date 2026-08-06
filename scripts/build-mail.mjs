/**
 * ============================================================================
 * 把当日资讯的中文成稿渲染成邮件 HTML
 * ----------------------------------------------------------------------------
 * 用法(daily-tech-news.yml 的 notify job 调用):
 *   bun scripts/build-mail.mjs --slug daily-tech-news-2026-08-05 --out mail.html
 *
 * 为什么不直接把 Markdown 塞进 <pre>:
 *   收件人看到的就是满屏 `##` 和 `- ` 的原文,标题层级、列表、链接全丢。
 *   这里用 marked 渲染成 HTML,再把样式**内联**到每个标签上。
 *
 * 为什么样式必须内联而不是写 <style>:
 *   Gmail / QQ 邮箱 / Outlook 对 <head><style> 的支持各不相同,Gmail 会剥掉
 *   整个 <head>。内联 style 属性是唯一在所有客户端都稳的做法。
 *
 * 为什么读 zh.md 而不是抓线上页面:
 *   不依赖网络与站点 HTML 结构,构建产物换个 class 名不会把邮件搞坏。
 * ============================================================================
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { marked } from "marked";

/* ----------------------------------------------------------------------------
 * 参数
 * -------------------------------------------------------------------------- */

function parseArgs(argv) {
	const out = {};
	for (let i = 0; i < argv.length; i += 2) {
		const key = argv[i]?.replace(/^--/, "");
		if (!key) continue;
		out[key] = argv[i + 1];
	}
	return out;
}

const args = parseArgs(process.argv.slice(2));
const slug = args.slug;
const outPath = args.out ?? "mail.html";

if (!slug) {
	console.error("用法: bun scripts/build-mail.mjs --slug <slug> [--out mail.html]");
	process.exit(1);
}

const SITE = "https://zerx.dev";
const source = resolve("src/content/posts", slug, "zh.md");

/* ----------------------------------------------------------------------------
 * frontmatter
 * ----------------------------------------------------------------------------
 * 生成端(SKILL.md)约定所有字符串标量都用双引号包裹,与 JSON 字符串字面量
 * 兼容,所以可以直接 JSON.parse,不需要引 YAML 解析器。
 * -------------------------------------------------------------------------- */

const raw = await readFile(source, "utf8");
const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
if (!match) {
	console.error(`${source} 缺少 frontmatter`);
	process.exit(1);
}
const [, frontmatter, body] = match;

function field(name) {
	const line = frontmatter.match(new RegExp(`^${name}:\\s*(.+)$`, "m"));
	if (!line) return "";
	const value = line[1].trim();
	try {
		return typeof JSON.parse(value) === "string" ? JSON.parse(value) : value;
	} catch {
		return value;
	}
}

const title = field("title");
const excerpt = field("excerpt");
const datePublished = (field("date") || "").slice(0, 10);

/* ----------------------------------------------------------------------------
 * Markdown → HTML,再把样式内联
 * -------------------------------------------------------------------------- */

// 字体名里必须用单引号:整串会被插进 style="..." 属性,双引号会把属性
// 在第一个字体名处截断,后面的声明全部失效。
const FONT =
	"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif";
const INK = "#1f2328";
const MUTED = "#59636e";
const LINE = "#d1d9e0";
const LINK = "#0969da";

/** 标签 → 内联样式。marked 输出的标签都不带属性,直接按 `<tag>` / `<tag ` 匹配替换。 */
const STYLES = {
	h1: `margin:32px 0 16px;font-size:24px;line-height:1.3;font-weight:600;color:${INK};border-bottom:1px solid ${LINE};padding-bottom:8px`,
	h2: `margin:32px 0 16px;font-size:20px;line-height:1.3;font-weight:600;color:${INK};border-bottom:1px solid ${LINE};padding-bottom:8px`,
	h3: `margin:24px 0 12px;font-size:17px;line-height:1.4;font-weight:600;color:${INK}`,
	h4: `margin:20px 0 10px;font-size:15px;line-height:1.4;font-weight:600;color:${INK}`,
	p: `margin:0 0 14px;font-size:15px;line-height:1.75;color:${INK}`,
	ul: "margin:0 0 14px;padding-left:22px",
	ol: "margin:0 0 14px;padding-left:22px",
	li: `margin:0 0 6px;font-size:15px;line-height:1.75;color:${INK}`,
	a: `color:${LINK};text-decoration:none`,
	strong: `font-weight:600;color:${INK}`,
	blockquote: `margin:0 0 14px;padding:2px 0 2px 14px;border-left:3px solid ${LINE};color:${MUTED}`,
	hr: `border:0;border-top:1px solid ${LINE};margin:28px 0`,
	code: `background:#eff1f3;border-radius:4px;padding:2px 5px;font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`,
	pre: `background:#f6f8fa;border:1px solid ${LINE};border-radius:6px;padding:12px 14px;overflow-x:auto;font-size:13px;line-height:1.6`,
	table: `border-collapse:collapse;width:100%;margin:0 0 14px;font-size:14px`,
	th: `border:1px solid ${LINE};padding:6px 10px;text-align:left;background:#f6f8fa;font-weight:600`,
	td: `border:1px solid ${LINE};padding:6px 10px`,
};

function inlineStyles(html) {
	let out = html;
	for (const [tag, style] of Object.entries(STYLES)) {
		// <tag> → <tag style="…">;<tag attr=…> → <tag style="…" attr=…>
		out = out.replaceAll(
			new RegExp(`<${tag}(\\s|>)`, "g"),
			`<${tag} style="${style}"$1`,
		);
	}
	// <pre> 里的 <code> 不该再有自己的底色和内边距
	return out.replaceAll(
		/(<pre [^>]*>)\s*<code style="[^"]*"/g,
		'$1<code style="background:none;padding:0;font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace"',
	);
}

marked.setOptions({ gfm: true, breaks: false });
const bodyHtml = inlineStyles(marked.parse(body.trim()));

/* ----------------------------------------------------------------------------
 * 组装
 * -------------------------------------------------------------------------- */

const esc = (s) =>
	String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const zhUrl = `${SITE}/blog/${slug}/`;
const enUrl = `${SITE}/en/blog/${slug}/`;

const html = `<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff">
<div style="max-width:720px;margin:0 auto;padding:24px 20px;font-family:${FONT};color:${INK}">

  <div style="font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${MUTED};margin:0 0 20px">
    ZerxLab 每日资讯
  </div>

  <h1 style="margin:0 0 12px;font-size:22px;line-height:1.35;font-weight:600;color:${INK}">${esc(title)}</h1>

  <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${MUTED}">${esc(excerpt)}</p>

  <p style="margin:0 0 4px;font-size:13px;color:${MUTED}">发布时间：${esc(datePublished)}</p>
  <p style="margin:0 0 24px;font-size:14px;line-height:1.9">
    中文版：<a href="${zhUrl}" style="color:${LINK};text-decoration:none">${zhUrl}</a><br>
    English：<a href="${enUrl}" style="color:${LINK};text-decoration:none">${enUrl}</a>
  </p>

  <hr style="border:0;border-top:1px solid ${LINE};margin:0 0 24px">

  ${bodyHtml}

  <hr style="border:0;border-top:1px solid ${LINE};margin:32px 0 16px">
  <p style="margin:0;font-size:12px;line-height:1.7;color:${MUTED}">
    本邮件由 <a href="${SITE}" style="color:${LINK};text-decoration:none">ZerxLab</a> 每日资讯工作流自动发送。
  </p>

</div>
</body>
</html>
`;

await writeFile(outPath, html, "utf8");
console.log(`✓ ${outPath} 已生成 (${Buffer.byteLength(html)} 字节, 标题: ${title})`);
