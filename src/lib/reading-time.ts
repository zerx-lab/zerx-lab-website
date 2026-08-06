/**
 * ============================================================================
 * 阅读时长估算
 * ----------------------------------------------------------------------------
 * 从 Markdown 原文直接估算,不依赖渲染管线 —— 列表页需要在不渲染正文的
 * 前提下拿到时长,详情页复用同一份结果保证前后一致。
 *
 * 口径(与迁移前 lib/markdown.ts 保持一致):
 *   - CJK(中日韩)字符按「每字 1 词」计
 *   - 其余按连续字母 / 数字串分词
 *   - 两者加总,避免中英混排时偏低
 *   - 300 词/分钟,向上取整,至少 1 分钟
 * ============================================================================
 */

const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;

const WORDS_PER_MINUTE = 300;

/**
 * 粗剥 Markdown 语法,只留下会被读者真正阅读的文本。
 * 不追求精确 —— 目标是让字数不被代码块和链接地址严重灌水。
 */
export function stripMarkdown(source: string): string {
	return source
		// 围栏代码块:整块移除(读者通常扫读,不逐字读)
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/~~~[\s\S]*?~~~/g, " ")
		// 行内代码保留内容,去掉反引号
		.replace(/`([^`]*)`/g, "$1")
		// 图片整体移除,链接只留文字
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		// 引用 / 标题 / 列表标记
		.replace(/^\s{0,3}>{1,}\s?/gm, "")
		.replace(/^\s{0,3}#{1,6}\s+/gm, "")
		.replace(/^\s{0,3}([-*+]|\d+\.)\s+/gm, "")
		// 强调符号与水平线
		.replace(/[*_~]{1,3}/g, "")
		.replace(/^\s{0,3}(-{3,}|\*{3,}|_{3,})\s*$/gm, " ")
		// 残留 HTML 标签
		.replace(/<[^>]+>/g, " ");
}

/** CJK 按字 + 拉丁按词的混合字数统计 */
export function countWords(text: string): number {
	if (!text) return 0;

	const cjkMatches = text.match(CJK);
	const cjkCount = cjkMatches ? cjkMatches.length : 0;

	const nonCjk = text.replace(CJK, " ");
	const wordMatches = nonCjk.match(/[A-Za-z0-9]+/g);

	return cjkCount + (wordMatches ? wordMatches.length : 0);
}

export interface ReadingStats {
	/** 正文字数 */
	readonly wordCount: number;
	/** 估算阅读时长(分钟,至少 1) */
	readonly minutes: number;
}

/** 从 Markdown 原文估算阅读量 */
export function readingStats(markdown: string): ReadingStats {
	const wordCount = countWords(stripMarkdown(markdown));
	return {
		wordCount,
		minutes: Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
	};
}
