/**
 * ============================================================================
 * 站点设置查询层(Content Collections)
 * ----------------------------------------------------------------------------
 * 唯一数据源:src/content/data/site.json(单例)。
 *
 * 说明:
 *   - totalStars 由 projects 的 stars 实时汇总,不在 site.json 里存第二份
 *     ——两处存同一个数字必然漂移。
 *   - ogImage 是 /public 下的路径(如 "/og.png"),未配置时为 null。
 * ========================================================================== */

import { loadCounts, loadSite, pickLang } from "@/lib/content";
import type { Lang } from "@/i18n/ui";

/**
 * 站点设置 ViewModel(已按当前语言解包)。
 *
 *   - focus             关注方向,如 "FULL-STACK / RUST / GO",不翻译
 *   - establishedYear   建立年份,用于左栏 "ESTABLISHED" meta
 *   - contributors      贡献者数量(手填)
 *   - totalStars        全部项目 star 汇总
 *   - ogImage           OG 分享图路径;未配置为 null
 */
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

export async function loadSiteSettings(lang: Lang): Promise<SiteSettingsVM> {
	const [site, counts] = await Promise.all([loadSite(), loadCounts()]);

	return {
		siteName: site.siteName,
		tagline: pickLang(site.tagline, lang),
		description: pickLang(site.description, lang),
		location: pickLang(site.location, lang),
		focus: site.focus || null,
		establishedYear: site.establishedYear,
		contributors: site.contributors,
		totalStars: counts.totalStars,
		ogImage: site.ogImage,
		socialGithub: site.socialGithub || null,
		socialX: site.socialX,
		socialEmail: site.socialEmail,
		socialDiscord: site.socialDiscord,
	};
}
