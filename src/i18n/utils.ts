/**
 * ============================================================================
 * ZerxLab Website - i18n 工具函数
 * ----------------------------------------------------------------------------
 * 提供:
 *   - getLangFromUrl(url):    从 URL 推断当前语言
 *   - useTranslations(lang):  返回一个 t(key) 翻译函数(带 fallback)
 *   - useTranslatedPath(lang):返回一个 tp(path) 路径生成函数(考虑 showDefaultLang)
 *   - getAlternateLanguageUrl: 语言切换时,计算对应语言的目标 URL
 *
 * 路由策略(与 astro.config.mjs 的 i18n 配置保持一致):
 *   - 默认语言 zh 不带前缀:  /             /blog           /blog/hello
 *   - 其他语言 en 带前缀:    /en/          /en/blog        /en/blog/hello
 * ============================================================================
 */

import {
	ui,
	defaultLang,
	showDefaultLang,
	languages,
	type Lang,
	type UIKey,
} from "./ui";

/**
 * 从 URL 推断当前语言。
 * 规则:
 *   1. 如果 pathname 第一段是受支持的语言代码(非默认语言),返回该语言
 *   2. 否则返回默认语言 zh
 */
export function getLangFromUrl(url: URL): Lang {
	const [, maybeLang] = url.pathname.split("/");
	if (maybeLang && maybeLang in languages) {
		return maybeLang as Lang;
	}
	return defaultLang;
}

/**
 * 翻译函数工厂。
 * 用法:
 *   const t = useTranslations(lang);
 *   t("nav.home")  // -> "首页" / "Home"
 *
 * 若目标语言缺失该 key,自动 fallback 到默认语言(zh)。
 * 若默认语言也缺失,返回 key 本身,便于开发时发现漏翻。
 */
export function useTranslations(lang: Lang) {
	return function t(key: UIKey): string {
		const dict = ui[lang] as Record<string, string>;
		const fallbackDict = ui[defaultLang] as Record<string, string>;
		return dict[key] ?? fallbackDict[key] ?? key;
	};
}

/**
 * 翻译路径函数工厂。
 * 用法:
 *   const tp = useTranslatedPath(lang);
 *   tp("/blog")          // lang=zh -> "/blog"   (默认语言无前缀)
 *   tp("/blog")          // lang=en -> "/en/blog"
 *   tp("/blog", "en")    // 强制用 en -> "/en/blog"
 *
 * 注意: 传入的 path 必须以 "/" 开头。
 */
export function useTranslatedPath(lang: Lang) {
	return function tp(path: string, targetLang: Lang = lang): string {
		if (!path.startsWith("/")) {
			path = `/${path}`;
		}

		// 默认语言且配置为隐藏前缀
		if (!showDefaultLang && targetLang === defaultLang) {
			return path;
		}

		// 根路径特殊处理: "/en/" 而不是 "/en"
		if (path === "/") {
			return `/${targetLang}/`;
		}

		return `/${targetLang}${path}`;
	};
}

/**
 * 从当前 URL 剥离语言前缀,得到"中性路径"。
 * 用于语言切换器:保留当前页面位置,只换语言。
 *
 * 例如:
 *   URL: /en/blog/hello?x=1   ->  "/blog/hello"
 *   URL: /blog/hello?x=1      ->  "/blog/hello"  (默认语言无前缀)
 *   URL: /                    ->  "/"
 *   URL: /en                  ->  "/"
 *   URL: /en/                 ->  "/"
 */
export function stripLangFromPath(pathname: string): string {
	const segments = pathname.split("/").filter(Boolean);
	if (segments.length === 0) return "/";

	const first = segments[0];
	if (first && first in languages) {
		const rest = segments.slice(1).join("/");
		return rest ? `/${rest}` : "/";
	}
	return pathname || "/";
}

/**
 * 计算切换到目标语言后的 URL 路径。
 * 语言切换器的核心:保持当前页面位置不变,仅替换语言前缀。
 */
export function getAlternateLanguageUrl(url: URL, targetLang: Lang): string {
	const neutralPath = stripLangFromPath(url.pathname);
	const tp = useTranslatedPath(targetLang);
	return tp(neutralPath);
}

/**
 * 列出所有"语言切换项",用于渲染语言选择器。
 * 返回: [{ code, label, href, isActive }]
 */
export interface LanguageLink {
	code: Lang;
	label: string;
	href: string;
	isActive: boolean;
}

export function listLanguageLinks(url: URL): LanguageLink[] {
	const currentLang = getLangFromUrl(url);
	return (Object.entries(languages) as [Lang, string][]).map(
		([code, label]) => ({
			code,
			label,
			href: getAlternateLanguageUrl(url, code),
			isActive: code === currentLang,
		}),
	);
}

/**
 * 获取本页所有语言版本的 <link rel="alternate" hreflang="..."> 信息。
 * 用于 SEO,在 <head> 中声明多语言对应关系。
 *
 * @param url 当前页面 URL (Astro.url)
 * @param siteUrl 站点基础 URL (import.meta.env.SITE 或 process.env.SITE_URL)
 */
export interface HreflangLink {
	hreflang: string;
	href: string;
}

export function getHreflangLinks(url: URL, siteUrl: string): HreflangLink[] {
	const base = siteUrl.replace(/\/$/, "");
	const links: HreflangLink[] = [];

	for (const code of Object.keys(languages) as Lang[]) {
		const altPath = getAlternateLanguageUrl(url, code);
		links.push({
			hreflang: code === "zh" ? "zh-CN" : code === "en" ? "en-US" : code,
			href: `${base}${altPath}`,
		});
	}

	// x-default 指向默认语言
	const defaultPath = getAlternateLanguageUrl(url, defaultLang);
	links.push({
		hreflang: "x-default",
		href: `${base}${defaultPath}`,
	});

	return links;
}

/**
 * 格式化日期,根据当前语言本地化输出。
 * 例如: "2026-04-17" -> "2026年4月17日" (zh) / "Apr 17, 2026" (en)
 */
export function formatDate(date: Date | string, lang: Lang): string {
	const d = typeof date === "string" ? new Date(date) : date;
	if (Number.isNaN(d.getTime())) return "";

	const locale = lang === "zh" ? "zh-CN" : "en-US";
	return d.toLocaleDateString(locale, {
		year: "numeric",
		month: lang === "zh" ? "long" : "short",
		day: "numeric",
	});
}

/**
 * 紧凑日期格式,用于文章列表等空间有限的场景。
 * 例如: "2026-04-17" -> "2026-04-17" (两种语言都一样,ISO-ish)
 */
export function formatDateCompact(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	if (Number.isNaN(d.getTime())) return "";
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}
