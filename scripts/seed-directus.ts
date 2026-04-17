/**
 * ============================================================================
 * ZerxLab Website - Directus Seed
 * ----------------------------------------------------------------------------
 * 把 src/lib/fallback-data.ts 里的数据 upsert 进 Directus。
 *
 * 策略:
 *   - 以 slug(或 code / name 等 natural key)为幂等主键
 *   - 遇到已存在记录 → 覆盖(用户决策)
 *   - 双语内容走 Directus 原生 translations 子表:
 *       主表一次 upsert → 读取自动生成的 id → 再 upsert 两条
 *       {collection}_translations(zh-CN / en-US)
 *
 * 依赖顺序(严格):
 *   1. languages 补写(bootstrap 已完成,这里只做 sanity check)
 *   2. authors
 *   3. categories
 *   4. tags
 *   5. site_settings (singleton)
 *   6. posts(依赖 authors / categories),再补 posts_tags M2M
 *   7. projects
 *   8. aur_packages
 *
 * 非本次 seed 范围:
 *   - 图片文件(fallback cover 全为 null)
 *   - pages(当前无 fallback 数据,About 等页面正文在代码里维护)
 *
 * 运行前提:
 *   - `bun run bootstrap` 已跑过一次,所有 collection / 字段 / 权限就位
 *   - .env 里 DIRECTUS_ADMIN_TOKEN 有效
 * ============================================================================ */

import {
	FALLBACK_AUTHORS,
	FALLBACK_CATEGORIES,
	FALLBACK_TAGS,
	FALLBACK_POSTS,
	FALLBACK_PROJECTS,
	FALLBACK_AUR_PACKAGES,
	FALLBACK_SITE_SETTINGS,
	type FallbackCategory,
	type FallbackTag,
	type FallbackPost,
	type FallbackProject,
	type FallbackAurPackage,
} from "../src/lib/fallback-data";
import {
	DIRECTUS_URL,
	fetchDirectus,
	findItemByKey,
	log,
	runMain,
	upsertByKey,
	upsertSingleton,
} from "./_shared";

/* ----------------------------------------------------------------------------
 * 语言代码常量
 * ---------------------------------------------------------------------------- */

const LANG_ZH = "zh-CN";
const LANG_EN = "en-US";

/* ----------------------------------------------------------------------------
 * translations 子表的 upsert
 * ----------------------------------------------------------------------------
 * Directus 自动生成的翻译子表结构:
 *   - id                    (主键,integer 或 uuid)
 *   - {parent}_id           (反向 M2O 到主表,值为父记录 id)
 *   - languages_code        (M2O 到 languages,值为 "zh-CN" / "en-US")
 *   - ...业务字段            (bootstrap 里手工补的 title / content 等)
 *
 * 幂等策略:按 (parent_id, languages_code) 唯一键查,命中则 PATCH,否则 POST。
 * 这两个字段的组合天然是"每个父记录每种语言一条"的唯一索引。
 * ---------------------------------------------------------------------------- */

async function upsertTranslation(
	translationsCollection: string,
	parentField: string,
	parentId: string | number,
	languageCode: string,
	fields: Record<string, unknown>,
): Promise<void> {
	// 查现有翻译
	const existingRes = await fetchDirectus<Array<{ id: number | string }>>(
		`/items/${translationsCollection}`,
		{
			query: {
				[`filter[${parentField}][_eq]`]: String(parentId),
				[`filter[languages_code][_eq]`]: languageCode,
				limit: 1,
				fields: "id",
			},
		},
	);
	const existing = Array.isArray(existingRes.data) ? existingRes.data : [];

	if (existing[0]?.id !== undefined) {
		await fetchDirectus(
			`/items/${translationsCollection}/${encodeURIComponent(String(existing[0].id))}`,
			{ method: "PATCH", body: fields },
		);
		log.child(`翻译 ${translationsCollection}[${languageCode}] 更新`);
		return;
	}

	await fetchDirectus(`/items/${translationsCollection}`, {
		method: "POST",
		body: {
			[parentField]: parentId,
			languages_code: languageCode,
			...fields,
		},
	});
	log.child(`翻译 ${translationsCollection}[${languageCode}] 创建`);
}

/** 同时写入中英两种语言的快捷方式 */
async function upsertBothTranslations(
	translationsCollection: string,
	parentField: string,
	parentId: string | number,
	zhFields: Record<string, unknown>,
	enFields: Record<string, unknown>,
): Promise<void> {
	await upsertTranslation(
		translationsCollection,
		parentField,
		parentId,
		LANG_ZH,
		zhFields,
	);
	await upsertTranslation(
		translationsCollection,
		parentField,
		parentId,
		LANG_EN,
		enFields,
	);
}

/* ----------------------------------------------------------------------------
 * sanity check:languages 必须包含 zh-CN / en-US
 * ---------------------------------------------------------------------------- */

async function ensureLanguagesPresent(): Promise<void> {
	for (const code of [LANG_ZH, LANG_EN]) {
		const res = await fetchDirectus(
			`/items/languages/${encodeURIComponent(code)}`,
			{ allowStatuses: [403, 404] },
		);
		if (res.status !== 200) {
			throw new Error(
				`[seed] languages 表中缺少 ${code}。请先运行 \`bun run bootstrap\`。`,
			);
		}
	}
}

/* ============================================================================
 * 1. authors
 * ========================================================================== */

async function seedAuthors(): Promise<Map<string, string>> {
	log.step(1, "authors");
	const slugToId = new Map<string, string>();

	for (const a of FALLBACK_AUTHORS) {
		const saved = await upsertByKey<Record<string, unknown>>(
			"authors",
			"slug",
			{
				slug: a.slug,
				name: a.name,
				// avatar 是 URL 字符串;我们的 schema 里 avatar 是 uuid(file),
				// 线上 fallback 的 avatar 是个 URL(GitHub 头像),没法直接作为 file id 写入。
				// 暂时跳过 avatar,让用户后续在 Directus UI 里手动上传/填入。
				github: a.github,
				x: a.x,
				email: a.email,
			},
		);
		const id = String((saved as { id: string | number }).id);
		slugToId.set(a.slug, id);

		await upsertBothTranslations(
			"authors_translations",
			"authors_id",
			id,
			{ bio: a.bio.zh },
			{ bio: a.bio.en },
		);
	}

	log.info(`共写入 ${FALLBACK_AUTHORS.length} 位作者`);
	return slugToId;
}

/* ============================================================================
 * 2. categories
 * ========================================================================== */

async function seedCategories(): Promise<Map<string, string>> {
	log.step(2, "categories");
	const slugToId = new Map<string, string>();

	let sort = 1;
	for (const c of FALLBACK_CATEGORIES as readonly FallbackCategory[]) {
		const saved = await upsertByKey<Record<string, unknown>>(
			"categories",
			"slug",
			{
				slug: c.slug,
				sort: sort++,
			},
		);
		const id = (saved as { id: string }).id;
		slugToId.set(c.slug, id);

		await upsertBothTranslations(
			"categories_translations",
			"categories_id",
			id,
			{ name: c.name.zh, description: c.description.zh },
			{ name: c.name.en, description: c.description.en },
		);
	}

	log.info(`共写入 ${FALLBACK_CATEGORIES.length} 个分类`);
	return slugToId;
}

/* ============================================================================
 * 3. tags
 * ========================================================================== */

async function seedTags(): Promise<Map<string, string>> {
	log.step(3, "tags");
	const slugToId = new Map<string, string>();

	for (const t of FALLBACK_TAGS as readonly FallbackTag[]) {
		const saved = await upsertByKey<Record<string, unknown>>("tags", "slug", {
			slug: t.slug,
		});
		const id = (saved as { id: string }).id;
		slugToId.set(t.slug, id);

		await upsertBothTranslations(
			"tags_translations",
			"tags_id",
			id,
			{ name: t.name.zh },
			{ name: t.name.en },
		);
	}

	log.info(`共写入 ${FALLBACK_TAGS.length} 个标签`);
	return slugToId;
}

/* ============================================================================
 * 4. site_settings (singleton)
 * ========================================================================== */

async function seedSiteSettings(): Promise<void> {
	log.step(4, "site_settings");
	const s = FALLBACK_SITE_SETTINGS;

	// 单例 PATCH
	await upsertSingleton("site_settings", {
		site_name: s.siteName,
		social_github: s.socialGithub,
		social_x: s.socialX,
		social_email: s.socialEmail,
		social_discord: s.socialDiscord,
		established_year: s.establishedYear,
		// location 在 fallback 里是 Bilingual(有 zh/en),在 Directus schema 里是
		// 单字符串(保留给 "CN" 这种 code);取 en 做默认,双语文案通过 translations
		// 兜一份,让前端按语言选择。
		location: s.location.en,
		focus: s.focus,
		// 基于 fallback 计算一次总 star;seed 完 projects 后不需要再回填
		// (前端页面自己会做 SUM,这个字段是冗余快照)
		total_stars: FALLBACK_PROJECTS.reduce((sum, p) => sum + p.stars, 0),
		contributors: s.contributors,
	});

	// 拿 singleton 的 id(通常是 1,但保险起见查一下)
	const singletonRes = await fetchDirectus<{ id: number }>(
		"/items/site_settings",
		{ query: { fields: "id" } },
	);
	const id = (singletonRes.data as { id: number } | null)?.id ?? 1;

	await upsertBothTranslations(
		"site_settings_translations",
		"site_settings_id",
		id,
		{ tagline: s.tagline.zh, description: s.description.zh },
		{ tagline: s.tagline.en, description: s.description.en },
	);

	log.info(`site_settings 写入完成 (id=${id})`);
}

/* ============================================================================
 * 5. posts (+ posts_tags M2M)
 * ========================================================================== */

async function seedPosts(
	authorSlugToId: Map<string, string>,
	categorySlugToId: Map<string, string>,
	tagSlugToId: Map<string, string>,
): Promise<void> {
	log.step(5, "posts");

	for (const p of FALLBACK_POSTS as readonly FallbackPost[]) {
		const authorId = authorSlugToId.get(p.authorSlug);
		const categoryId = categorySlugToId.get(p.categorySlug);
		if (!authorId) {
			log.warn(`post "${p.slug}" 找不到作者 ${p.authorSlug},跳过`);
			continue;
		}
		if (!categoryId) {
			log.warn(`post "${p.slug}" 找不到分类 ${p.categorySlug},跳过`);
			continue;
		}

		const saved = await upsertByKey<Record<string, unknown>>("posts", "slug", {
			slug: p.slug,
			status: "published",
			featured: p.featured,
			reading_time: p.readingTime,
			date_published: p.date,
			author: authorId,
			category: categoryId,
		});
		const postId = (saved as { id: string }).id;

		await upsertBothTranslations(
			"posts_translations",
			"posts_id",
			postId,
			{
				title: p.title.zh,
				excerpt: p.excerpt.zh,
				content: p.content.zh,
				cover_label: p.coverLabel.zh,
			},
			{
				title: p.title.en,
				excerpt: p.excerpt.en,
				content: p.content.en,
				cover_label: p.coverLabel.en,
			},
		);

		// posts_tags M2M:先清掉这篇 post 的旧关联,再重建
		await syncPostTags(postId, p.tagSlugs, tagSlugToId);
	}

	log.info(`共写入 ${FALLBACK_POSTS.length} 篇文章`);
}

/**
 * 同步一篇 post 的 tags:
 *   1. 查 posts_tags 里已有的 (posts_id=postId) 行
 *   2. 目标 tagIds 中已存在的保留,不存在的 DELETE
 *   3. 目标 tagIds 中缺失的 POST 新增
 */
async function syncPostTags(
	postId: string,
	tagSlugs: readonly string[],
	tagSlugToId: Map<string, string>,
): Promise<void> {
	// 过滤无效 slug
	const targetIds = new Set<string>();
	for (const slug of tagSlugs) {
		const id = tagSlugToId.get(slug);
		if (id) targetIds.add(id);
		else log.warn(`post ${postId} 引用了未知 tag "${slug}",已忽略`);
	}

	// 查现有
	const existingRes = await fetchDirectus<
		Array<{ id: number; tags_id: string }>
	>("/items/posts_tags", {
		query: {
			[`filter[posts_id][_eq]`]: postId,
			limit: -1,
			fields: "id,tags_id",
		},
	});
	const existing = Array.isArray(existingRes.data) ? existingRes.data : [];
	const existingTagIds = new Set(existing.map((r) => r.tags_id));

	// 删除多余
	for (const row of existing) {
		if (!targetIds.has(row.tags_id)) {
			await fetchDirectus(`/items/posts_tags/${row.id}`, {
				method: "DELETE",
			});
			log.child(`清理 posts_tags[${row.id}]`);
		}
	}

	// 新增缺失
	for (const tagId of targetIds) {
		if (existingTagIds.has(tagId)) continue;
		await fetchDirectus("/items/posts_tags", {
			method: "POST",
			body: { posts_id: postId, tags_id: tagId },
		});
		log.child(`关联 posts_tags(${postId} ↔ ${tagId})`);
	}
}

/* ============================================================================
 * 6. projects
 * ========================================================================== */

async function seedProjects(): Promise<void> {
	log.step(6, "projects");

	let sort = 1;
	for (const p of FALLBACK_PROJECTS as readonly FallbackProject[]) {
		const saved = await upsertByKey<Record<string, unknown>>(
			"projects",
			"slug",
			{
				slug: p.slug,
				status: "published",
				sort: sort++,
				name: p.name,
				tech_stack: [...p.techStack],
				kind: p.kind,
				github_url: p.githubUrl,
				demo_url: p.demoUrl,
				docs_url: p.docsUrl,
				npm_url: p.npmUrl,
				stars: p.stars,
				forks: p.forks,
				featured: p.featured,
			},
		);
		const id = (saved as { id: string }).id;

		await upsertBothTranslations(
			"projects_translations",
			"projects_id",
			id,
			{
				description: p.description.zh,
				content: null,
				// highlights 在 fallback 是双语字符串("零依赖 · 2.62ms ...")
				// schema 是 string[];拆成数组存(按 · 或逗号分割)
				highlights: splitHighlights(p.highlights.zh),
			},
			{
				description: p.description.en,
				content: null,
				highlights: splitHighlights(p.highlights.en),
			},
		);
	}

	log.info(`共写入 ${FALLBACK_PROJECTS.length} 个项目`);
}

/** 把 "A · B · C" / "A, B, C" 形式的 highlight 字符串拆成数组 */
function splitHighlights(text: string): string[] {
	return text
		.split(/\s*[·•,]\s*/)
		.map((s) => s.trim())
		.filter(Boolean);
}

/* ============================================================================
 * 7. aur_packages
 * ========================================================================== */

async function seedAurPackages(): Promise<void> {
	log.step(7, "aur_packages");

	let sort = 1;
	for (const pkg of FALLBACK_AUR_PACKAGES as readonly FallbackAurPackage[]) {
		const saved = await upsertByKey<Record<string, unknown>>(
			"aur_packages",
			"slug",
			{
				slug: pkg.slug,
				status: "published",
				sort: sort++,
				name: pkg.name,
				version: pkg.version,
				maintained: pkg.maintained,
				badges: [...pkg.badges],
				aur_url: pkg.aurUrl,
				upstream_url: pkg.upstreamUrl,
			},
		);
		const id = (saved as { id: string }).id;

		await upsertBothTranslations(
			"aur_packages_translations",
			"aur_packages_id",
			id,
			{ description: pkg.description.zh },
			{ description: pkg.description.en },
		);
	}

	log.info(`共写入 ${FALLBACK_AUR_PACKAGES.length} 个 AUR 包`);
}

/* ============================================================================
 * 入口
 * ========================================================================== */

async function main(): Promise<void> {
	log.info(`目标: ${DIRECTUS_URL}`);

	// 0. sanity check
	await ensureLanguagesPresent();

	// 1-3. 元数据(被 posts / site_settings 依赖)
	const authorSlugToId = await seedAuthors();
	const categorySlugToId = await seedCategories();
	const tagSlugToId = await seedTags();

	// 4. site_settings
	await seedSiteSettings();

	// 5. posts + posts_tags
	await seedPosts(authorSlugToId, categorySlugToId, tagSlugToId);

	// 6. projects
	await seedProjects();

	// 7. aur_packages
	await seedAurPackages();

	log.info("下一步:`bun run typegen` 基于 Directus 实际 schema 重生成 TS 类型");
	// 提示未在 seed 覆盖的字段,方便用户回后台补
	log.warn(
		"以下资产需要你在 Directus UI 手动补:" +
			"\n    - authors.avatar (图片上传,当前用 GitHub URL 无法直接入库)" +
			"\n    - posts.cover / projects.cover / aur_packages cover(fallback 全为 null)" +
			"\n    - site_settings.og_image",
	);

	// 触发 findItemByKey 至少被引用一次以便静态分析不抱怨
	void findItemByKey;
}

runMain("Seed Directus", main);
