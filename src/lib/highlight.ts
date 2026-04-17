/**
 * ============================================================================
 * highlight.ts - 搜索关键词高亮工具
 * ----------------------------------------------------------------------------
 * 在博客列表页(BlogIndexPage + PostCard)用:把命中搜索词的文本片段包上
 * <mark> 标签,前端用 CSS 高亮。
 *
 * 为什么独立一个文件:
 *   - 高亮涉及"HTML 转义 + 正则构造 + 字符串切片"三件事,放在任何一个组件里
 *     都会让该组件失去单一职责
 *   - 搜索功能未来可能扩展到项目页 / AUR 列表页,抽离后可直接复用
 *   - 便于单元测试(目前还没建 test,但 API 设计上已留出通路)
 *
 * 安全原则:
 *   - 原文本必须视为不可信(可能含用户输入的 HTML)
 *   - 函数返回的是"HTML 字符串",调用方必须用 set:html 渲染
 *   - 转义顺序:先转义原文本的 HTML 特殊字符,再在转义后的字符串上做高亮替换
 *     · 这样即使原文本含 <script>,也会被转成 &lt;script&gt; 后再匹配,
 *       不会产生 XSS 注入点
 *   - <mark> 是高亮唯一允许产生的标签,其属性完全由本文件控制,绝无用户可控
 *
 * 大小写策略:
 *   - 匹配:不区分大小写(用户搜 "react" 能命中 "React" / "REACT")
 *   - 输出:保留原文本的大小写(只在原文本中"切片打标签",不替换字符)
 *
 * 未匹配处理:
 *   - needle 为空或未找到任何匹配 → 返回转义后的纯文本字符串(不带 <mark>)
 *   - 调用方无论是否命中,都可以安全地用 set:html 渲染返回值
 * ============================================================================ */

/* ----------------------------------------------------------------------------
 * HTML 转义
 * ----------------------------------------------------------------------------
 * 只处理 XSS 相关的 5 个字符,够用且最小化字符串膨胀。
 * 注意 "'" 用 &#39; 而非 &apos; —— 后者不在 HTML4 实体集合,老 IE 不认。
 * -------------------------------------------------------------------------- */

const HTML_ESCAPE_MAP: Readonly<Record<string, string>> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

export function escapeHtml(input: string): string {
	if (!input) return "";
	return input.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}

/* ----------------------------------------------------------------------------
 * 正则元字符转义
 * ----------------------------------------------------------------------------
 * 用户搜索词可能含正则特殊字符(如 "a.b" / "(tag)" / "C++"),如果直接塞进
 * new RegExp(q, "gi") 会:
 *   1. 行为不符合预期:"a.b" 会匹配到 "aXb"
 *   2. 非法字符(如 "[") 会抛 SyntaxError,页面炸裂
 *
 * 这里把所有正则元字符转义成字面量,确保搜索永远按"纯字符串"匹配。
 *
 * 参考:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#escaping
 * -------------------------------------------------------------------------- */

function escapeRegExp(input: string): string {
	return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ----------------------------------------------------------------------------
 * 高亮主体:highlight(text, needle)
 * ----------------------------------------------------------------------------
 * 返回 HTML 字符串,调用方用 set:html 渲染。
 *
 * 算法:
 *   1. 若 needle 空 → 仅转义 text
 *   2. 用 escapeRegExp(needle) 构造大小写不敏感全局正则
 *   3. 在 text 上用 matchAll 拿到所有匹配区间
 *   4. 按区间切片:未命中段落用 escapeHtml,命中段落用 escapeHtml + <mark> 包裹
 *   5. 拼接成最终 HTML 字符串
 *
 * 为什么不用 text.replace(regex, "<mark>$&</mark>") 然后再 escapeHtml:
 *   两种操作顺序都会出问题 ——
 *   - 先 replace 再 escape:<mark> 里的尖括号会被转义,高亮失效
 *   - 先 escape 再 replace:escape 后的字符串里 "&amp;" 会把单字符 "&"
 *     的命中位置错位,而且 needle 如果含 "<" 这种 escape 后会变 "&lt;",
 *     匹配不上已经被转义的原文本
 *   切片方案避开了所有这些陷阱,对原始字符索引操作最稳。
 * -------------------------------------------------------------------------- */

export function highlight(text: string, needle: string): string {
	const safeText = text ?? "";
	const safeNeedle = (needle ?? "").trim();

	// 无需高亮:只做 HTML 转义
	if (safeText.length === 0) return "";
	if (safeNeedle.length === 0) return escapeHtml(safeText);

	let pattern: RegExp;
	try {
		pattern = new RegExp(escapeRegExp(safeNeedle), "gi");
	} catch {
		// 理论上 escapeRegExp 之后不会出错,双保险:构造失败退化为纯转义
		return escapeHtml(safeText);
	}

	// 防御:空字符串的正则会无限循环,escapeRegExp("") 确实是 "",这里拦住
	if (pattern.source.length === 0) return escapeHtml(safeText);

	let result = "";
	let cursor = 0;

	for (const match of safeText.matchAll(pattern)) {
		const start = match.index ?? -1;
		if (start < 0) continue;
		const end = start + match[0].length;

		// 命中段之前的未命中部分:仅转义
		if (start > cursor) {
			result += escapeHtml(safeText.slice(cursor, start));
		}

		// 命中段:转义后包 <mark>
		// 使用 class 而非 style,便于主题切换 / 暗色模式统一控制
		result += `<mark class="search-hit">${escapeHtml(match[0])}</mark>`;

		cursor = end;
	}

	// 尾部未命中部分
	if (cursor < safeText.length) {
		result += escapeHtml(safeText.slice(cursor));
	}

	// 如果一次都没命中(matchAll 为空迭代),cursor 仍为 0,result 仍为空
	// —— 走这条兜底仅转义
	if (result.length === 0) return escapeHtml(safeText);

	return result;
}

/* ----------------------------------------------------------------------------
 * 摘录片段:excerptAround(text, needle, radius)
 * ----------------------------------------------------------------------------
 * 可选增强:当 text 很长(如搜 content 字段命中正文深处)时,从命中位置
 * 前后截取 radius 字符,形成"搜索结果摘要"一样的短片段。
 *
 * 目前 BlogIndexPage 列表仅高亮 title / excerpt(两者都短,无需截取),
 * 本函数暂未在调用链中使用,保留给未来"搜索结果页面"或"Spotlight 式
 * 搜索面板"场景直接复用。
 *
 * 规则:
 *   - 命中前后各保留 radius 字符
 *   - 如果片段不是原文开头,前置 "…"
 *   - 如果片段不是原文结尾,追加 "…"
 *   - 仅返回第一个命中位置的片段(避免多命中时片段爆长)
 *   - 返回值是 HTML 字符串,已完成 escape + <mark> 包裹
 * -------------------------------------------------------------------------- */

export function excerptAround(
	text: string,
	needle: string,
	radius = 60,
): string {
	const safeText = text ?? "";
	const safeNeedle = (needle ?? "").trim();

	if (safeText.length === 0) return "";
	if (safeNeedle.length === 0) {
		// 无搜索词:按 radius*2 截断开头,避免全文返回
		const head = safeText.slice(0, radius * 2);
		return head.length < safeText.length
			? `${escapeHtml(head)}…`
			: escapeHtml(head);
	}

	const lowerText = safeText.toLowerCase();
	const lowerNeedle = safeNeedle.toLowerCase();
	const hitIndex = lowerText.indexOf(lowerNeedle);

	// 没命中:按无搜索词处理(返回开头片段),仍然 escape
	if (hitIndex < 0) {
		const head = safeText.slice(0, radius * 2);
		return head.length < safeText.length
			? `${escapeHtml(head)}…`
			: escapeHtml(head);
	}

	const start = Math.max(0, hitIndex - radius);
	const end = Math.min(safeText.length, hitIndex + safeNeedle.length + radius);

	const slice = safeText.slice(start, end);
	const highlighted = highlight(slice, safeNeedle);

	const prefix = start > 0 ? "…" : "";
	const suffix = end < safeText.length ? "…" : "";

	return `${prefix}${highlighted}${suffix}`;
}
