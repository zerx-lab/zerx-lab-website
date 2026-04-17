/**
 * ============================================================================
 * ZerxLab Website - Site Settings 查询层
 * ----------------------------------------------------------------------------
 * 站点级单例配置(logo / 社交链接 / 双语 tagline / contributors 等)的
 * 读取网关。首页、关于页、footer 都会消费同一个 SiteSettingsVM。
 *
 * 数据源优先级:
 *   1. Directus 的 site_settings 单例(含当前语言的 translations)
 *   2. fallback-data 的 FALLBACK_SITE_SETTINGS(Directus 失败降级)
 *
 * 设计取舍:
 *   - 返回"已解包"的 VM 而不是原始 Directus row:
 *       不同页面都需要 pickLang 和 translations 选择,放到 queries 层收敛一次
 *   - 字段名按页面消费习惯命名(camelCase + 简短),而非 Directus 原始
 *       snake_case。这让 AboutPage / index.astro 从 fallback 切换到
 *       Directus 时,消费代码几乎不用改。
 *   - 所有字段可能为 null:Directus 里很多字段是可选的,页面已经用 ??
 *       做兜底,VM 层不强行补默认值,只透传。
 *
 * 与 posts.ts 的职责划分:
 *   posts.ts         文章相关(详情 / 列表 / 相邻 / feed)
 *   site-settings.ts 站点级单例(site_settings + translations + 社交链接)
 *   projects.ts      (未来)项目相关
 * ============================================================================
 */

import {
	directus,
	readSingleton,
	DIRECTUS_CONFIG,
	assetUrl,
} from "@/lib/directus";
import { FALLBACK_SITE_SETTINGS, pickLang } from "@/lib/fallback-data";
import type { Lang } from "@/i18n/ui";

/* ----------------------------------------------------------------------------
 * 对外类型
 * ----------------------------------------------------------------------------
 * SiteSettingsVM 是"站点级配置最终会渲染的形状"。
 * 两个数据源都折成这个形状;页面组件按需访问字段。
 *
 * 字段说明:
 *   - siteName          品牌名,永远不翻译(ZerxLab)
 *   - tagline           一句话副标题,已按 lang 解包
 *   - description       简介段落,已按 lang 解包
 *   - location          所在地;fallback 里是 Bilingual,Directus 里是单字符串
 *                       (存 code / 英文名即可),这里统一返回已解包的字符串
 *   - focus             关注方向,如 "FULL-STACK / RUST / GO",不翻译
 *   - establishedYear   建立年份,用于左栏 "ESTABLISHED" meta
 *   - contributors      贡献者数量(目前手填,未来可能从 GitHub 聚合回填)
 *   - totalStars        总 star 数快照;约定前端更信任 GitHub 实时数据,
 *                       这个字段只是兜底
 *   - ogImage           OG 分享图绝对 URL;Directus 存的是 file uuid,
 *                       本层自动拼成 /assets/<uuid>?... 完整 URL
 *   - socialGithub/X/Email/Discord  社交链接,URL 或 null
 * ---------------------------------------------------------------------------- */

export interface SiteSettingsVM {
	siteName: string;
	tagline: string;
	description: string;
	location: string;
	focus: string | null;
	establishedYear: number | null;
	contributors: number | null;
	totalStars: number | null;
	ogImage: string | null;
	socialGithub: string | null;
	socialX: string | null;
	socialEmail: string | null;
	socialDiscord: string | null;
}

/* ----------------------------------------------------------------------------
 * 语言代码映射 + translation 选择
 * ----------------------------------------------------------------------------
 * 与 posts.ts 同样的惯例:内部 "zh" / "en" ↔ Directus "zh-CN" / "en-US"。
 * 独立定义而不从 posts.ts 导出是刻意的:两个文件可能在不同语境下演化,
 * 小重复换低耦合值得。
 * ---------------------------------------------------------------------------- */

function langToDirectusCode(lang: Lang): "zh-CN" | "en-US" {
	return lang === "zh" ? "zh-CN" : "en-US";
}

/** 在 translations 数组里按 languages_code 挑一条,兼容字符串和 M2O 展开两种形态 */
function pickTranslation(
	translations: readonly { languages_code?: unknown }[] | undefined | null,
	langCode: string,
): Record<string, any> | undefined {
	if (!translations || translations.length === 0) return undefined;
	return translations.find((x) => {
		const code = x?.languages_code;
		if (typeof code === "string") return code === langCode;
		if (code && typeof code === "object" && "code" in code) {
			return (code as { code?: string }).code === langCode;
		}
		return false;
	}) as Record<string, any> | undefined;
}

/* ----------------------------------------------------------------------------
 * Fallback → VM
 * ----------------------------------------------------------------------------
 * fallback-data 的 FALLBACK_SITE_SETTINGS 字段是 camelCase,
 * 与 VM 很接近,主要工作是 pickLang 解包 Bilingual。
 * ---------------------------------------------------------------------------- */

function fallbackToVM(lang: Lang): SiteSettingsVM {
	const s = FALLBACK_SITE_SETTINGS;
	return {
		siteName: s.siteName,
		tagline: pickLang(s.tagline, lang),
		description: pickLang(s.description, lang),
		location: pickLang(s.location, lang),
		// fallback 没定义 focus 之外的兜底策略,直接透传
		focus: s.focus,
		establishedYear: s.establishedYear,
		contributors: s.contributors,
		totalStars: s.totalStars,
		// fallback 里没有 og_image 字段(本地 fallback 不负责素材),返回 null
		ogImage: null,
		socialGithub: s.socialGithub,
		socialX: s.socialX,
		socialEmail: s.socialEmail,
		socialDiscord: s.socialDiscord,
	};
}

/* ----------------------------------------------------------------------------
 * Directus → VM
 * ----------------------------------------------------------------------------
 * Directus SDK 对 readSingleton + 嵌套 translations 的泛型推断不稳定,
 * 本函数用 any 断言访问字段,由自己保证安全。
 * ---------------------------------------------------------------------------- */

const SITE_SETTINGS_FIELDS = [
	"site_name",
	"og_image",
	"social_github",
	"social_x",
	"social_email",
	"social_discord",
	"established_year",
	"location",
	"focus",
	"total_stars",
	"contributors",
	{
		translations: ["languages_code", "tagline", "description"],
	},
];

function directusRowToVM(row: any, lang: Lang): SiteSettingsVM | null {
	if (!row || typeof row !== "object") return null;

	const langCode = langToDirectusCode(lang);
	const tr = pickTranslation(row.translations, langCode);

	// Directus 的 location 约定存单字符串(如 "Beijing, CN" 或语言无关的 code);
	// 如果某天改成双语再走 translations,只需扩展 fields 参数即可。
	const location =
		typeof row.location === "string" && row.location
			? row.location
			: pickLang(FALLBACK_SITE_SETTINGS.location, lang);

	const ogImage =
		typeof row.og_image === "string" && row.og_image
			? assetUrl(row.og_image, { width: 1200, format: "webp", quality: 85 })
			: null;

	return {
		siteName: row.site_name ?? FALLBACK_SITE_SETTINGS.siteName,
		tagline: tr?.tagline ?? pickLang(FALLBACK_SITE_SETTINGS.tagline, lang),
		description:
			tr?.description ?? pickLang(FALLBACK_SITE_SETTINGS.description, lang),
		location,
		focus: row.focus ?? FALLBACK_SITE_SETTINGS.focus,
		establishedYear:
			typeof row.established_year === "number"
				? row.established_year
				: FALLBACK_SITE_SETTINGS.establishedYear,
		contributors:
			typeof row.contributors === "number"
				? row.contributors
				: FALLBACK_SITE_SETTINGS.contributors,
		totalStars:
			typeof row.total_stars === "number"
				? row.total_stars
				: FALLBACK_SITE_SETTINGS.totalStars,
		ogImage,
		socialGithub: row.social_github ?? FALLBACK_SITE_SETTINGS.socialGithub,
		socialX: row.social_x ?? FALLBACK_SITE_SETTINGS.socialX,
		socialEmail: row.social_email ?? FALLBACK_SITE_SETTINGS.socialEmail,
		socialDiscord: row.social_discord ?? FALLBACK_SITE_SETTINGS.socialDiscord,
	};
}

/* ============================================================================
 * 公开 API:loadSiteSettings(lang)
 * ----------------------------------------------------------------------------
 * 单次查询 + 双层降级。首页与关于页都可以直接:
 *   const settings = await loadSiteSettings(lang);
 *
 * 性能说明:
 *   SSG 构建时,本函数每个页面渲染各调一次。Directus 侧是内存级单例读,
 *   加上 HTTP keep-alive,一次 build 整个站点的额外成本 < 50ms,
 *   不值得做进程内缓存。如果未来发现瓶颈,可在本文件加一个 Map<lang, VM>
 *   缓存,由于 Astro 构建进程内不会变更数据,缓存 TTL 可以是 Infinity。
 * ========================================================================== */

export async function loadSiteSettings(lang: Lang): Promise<SiteSettingsVM> {
	// 触发一次引用,避免 DIRECTUS_CONFIG 在某些 tree-shake 场景被误判未使用
	// (directus() 内部会读 DIRECTUS_CONFIG.url,这里显式引用只是为了日志)
	void DIRECTUS_CONFIG;

	try {
		const client = directus();
		const row = (await client.request(
			readSingleton("site_settings", {
				fields: SITE_SETTINGS_FIELDS as any,
			}),
		)) as any;

		const vm = directusRowToVM(row, lang);
		if (vm) return vm;
	} catch (err) {
		console.warn(
			"[site-settings] Directus 读取失败,使用 fallback:",
			(err as Error)?.message ?? err,
		);
	}

	return fallbackToVM(lang);
}
