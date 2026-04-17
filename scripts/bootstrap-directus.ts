/**
 * ============================================================================
 * ZerxLab Website - Directus Bootstrap
 * ----------------------------------------------------------------------------
 * 幂等地在 Directus 后端创建站点所需的全部数据模型。
 *
 * 执行顺序(严格依赖):
 *   1. 确保 languages 系统表里有 zh-CN / en-US 两条语言
 *   2. 创建 8 个主 collection(含字段 + 原生 translations 特殊字段)
 *        - site_settings (singleton)
 *        - authors / categories / tags
 *        - posts  + posts_tags (M2M)
 *        - projects
 *        - aur_packages
 *        - pages
 *      translations 子表由 Directus 自动生成(translations interface 机制)
 *   3. 为 Public role 开放已发布内容的读权限,让匿名 SDK 能 readItems
 *
 * 幂等策略:
 *   - collection 已存在 → 跳过建表(不改字段,避免破坏线上手改)
 *   - 字段已存在 → 跳过
 *   - 语言已存在 → 跳过
 *   - 权限已存在(按 collection+action 判断) → 跳过
 *
 * 重复运行完全安全。如果要重建,请在 Directus UI 里手动删除对应 collection。
 *
 * 关于 "translations" 的设计:
 *   本脚本使用 Directus 原生的 translations interface:
 *     - 在主表上建一个 `translations` 字段
 *       (type: alias, special: [translations], interface: translations)
 *     - Directus 自动创建 {collection}_translations 子表、O2M 关系
 *     - Data Studio 后台会显示"中文 / English"两 tab 切换的编辑器
 *   与手工建 *_translations 子表相比,后台编辑体验、翻译复制、未来接入
 *   AI 翻译扩展都更顺,且对外 REST / SDK API 行为完全一致。
 * ============================================================================
 */

import { randomBytes } from "node:crypto";
import {
	DIRECTUS_URL,
	fetchDirectus,
	collectionExists,
	fieldExists,
	log,
	runMain,
	updateDotenv,
	DOTENV_PATH,
} from "./_shared";

/* ============================================================================
 * 语言表
 * ========================================================================== */

const LANGUAGES: ReadonlyArray<{
	code: string;
	name: string;
	direction: "ltr" | "rtl";
}> = [
	{ code: "zh-CN", name: "简体中文", direction: "ltr" },
	{ code: "en-US", name: "English", direction: "ltr" },
];

/**
 * 主动创建 languages collection(及其字段)并塞入语言项。
 *
 * 关键事实(实测于 Directus 11.12):
 *   - `languages` 不是 Directus 内置系统表,只是一个**约定**的 collection 名,
 *     专门给 translations interface 消费
 *   - 在没有任何 translations 子表存在时,`languages` 完全不存在,此时
 *     访问 /items/languages 会返回 403("Collection doesn't exist")
 *   - Data Studio UI 的翻译向导会隐式建 languages;REST 路径下必须自己建
 *
 * 本函数负责把这个 collection 建全:
 *   1. 建 collection 本身(主键不是默认自增 id,而是 code 字符串)
 *   2. 建 name / direction 两个元数据字段
 *   3. 塞入 zh-CN / en-US 两条语言
 *
 * 幂等:collection 已存在则跳过建表,字段已存在则跳过,语言条目已存在则跳过。
 */
async function ensureLanguages(): Promise<void> {
	log.step(1, "languages collection(翻译基础)");

	// 1. collection
	if (!(await collectionExists("languages"))) {
		await fetchDirectus("/collections", {
			method: "POST",
			body: {
				collection: "languages",
				meta: {
					icon: "translate",
					note: "翻译可用的语言列表,code 作为主键",
					hidden: false,
					singleton: false,
					collection: "languages",
				},
				schema: {},
				// 显式声明 code 字段作为主键(string 类型,不用默认自增 int)
				fields: [
					{
						field: "code",
						type: "string",
						meta: {
							interface: "input",
							readonly: false,
							hidden: false,
							width: "full",
							note: 'BCP 47 语言代码,如 "zh-CN"',
							sort: 1,
							required: true,
						},
						schema: {
							is_primary_key: true,
							is_nullable: false,
							is_unique: true,
							length: 16,
						},
					},
				],
			},
		});
		log.success("创建 languages collection(主键 code)");
	} else {
		log.skip("languages collection 已存在");
	}

	// 2. 业务字段 name / direction
	await createFieldIfMissing("languages", {
		field: "name",
		type: "string",
		nullable: false,
		interface: "input",
		sort: 2,
	});
	await createFieldIfMissing("languages", {
		field: "direction",
		type: "string",
		default_value: "ltr",
		nullable: false,
		interface: "select-dropdown",
		options: {
			choices: [
				{ text: "Left-to-Right", value: "ltr" },
				{ text: "Right-to-Left", value: "rtl" },
			],
		},
		sort: 3,
	});

	// 3. 塞入语言项
	for (const lang of LANGUAGES) {
		const exists = await fetchDirectus(
			`/items/languages/${encodeURIComponent(lang.code)}`,
			{ allowStatuses: [403, 404] },
		);
		if (exists.status === 200) {
			log.skip(`languages[${lang.code}] 已存在`);
			continue;
		}
		await fetchDirectus("/items/languages", {
			method: "POST",
			body: lang,
		});
		log.success(`创建 languages[${lang.code}]`);
	}
}

/* ============================================================================
 * Field 创建的小型 DSL
 * ----------------------------------------------------------------------------
 * 直接贴 Directus REST /fields 的 payload 形状;封装一层方便重复使用。
 * 参考: https://docs.directus.io/reference/system/fields.html#create-a-field
 * ========================================================================== */

interface FieldDef {
	field: string;
	type: string; // 'string' | 'text' | 'integer' | 'boolean' | 'json' | 'uuid' | 'timestamp' | 'date' | 'alias' | ...
	/** Directus 特殊标记,如 ["translations"] / ["file"] / ["m2o"] / ["o2m"] / ["m2m"] */
	special?: string[];
	/** 是否允许 NULL,默认 true */
	nullable?: boolean;
	/** 是否唯一 */
	unique?: boolean;
	/** Data Studio 里显示的 interface */
	interface?: string;
	/** interface 的 options */
	options?: Record<string, unknown>;
	/** 只读展示形态 */
	display?: string;
	/** display 的 options */
	display_options?: Record<string, unknown>;
	/** 字段排序 */
	sort?: number;
	/** 字段所在的组 */
	group?: string | null;
	/** 默认值 */
	default_value?: unknown;
	/** 是否必填 */
	required?: boolean;
	/** 关系配置(用于 M2O / File / O2M)。Directus 要求 fields API 先建字段,再单独建 relation */
	relation?: {
		type: "m2o" | "o2m" | "m2m" | "file";
		related_collection: string;
		/** m2m 时的中间集合名 */
		junction_collection?: string;
		/** o2m 时在关联表里的反向字段名 */
		one_field?: string;
	};
	/** 注释 */
	note?: string;
}

async function createFieldIfMissing(
	collection: string,
	def: FieldDef,
): Promise<void> {
	if (await fieldExists(collection, def.field)) {
		log.skip(`字段 ${collection}.${def.field} 已存在`);
		return;
	}

	// 组装 Directus 期望的 payload
	const body: Record<string, unknown> = {
		field: def.field,
		type: def.type,
		meta: {
			interface: def.interface ?? null,
			options: def.options ?? null,
			display: def.display ?? null,
			display_options: def.display_options ?? null,
			special: def.special ?? null,
			note: def.note ?? null,
			sort: def.sort ?? null,
			group: def.group ?? null,
			required: def.required ?? false,
			hidden: false,
			readonly: false,
		},
		schema: {
			name: def.field,
			data_type: def.type, // Directus 会按 type 映射到底层 SQL 类型
			is_nullable: def.nullable ?? true,
			is_unique: def.unique ?? false,
			default_value: def.default_value ?? null,
		},
	};

	// alias 类型(如 translations / o2m 反向字段)没有实际 SQL 列,不要传 schema
	if (def.type === "alias") {
		delete body.schema;
	}

	await fetchDirectus(`/fields/${collection}`, {
		method: "POST",
		body,
	});
	log.success(`创建字段 ${collection}.${def.field}`);

	// 如果 field 带关系,需要显式建 relation。
	// Directus 默认主键是 integer(auto-increment),所以 M2O 字段的存储列类型
	// 必须也是 integer,否则建外键时会报
	// "foreign key constraint ... cannot be implemented"。
	if (def.relation && def.relation.type === "m2o") {
		await ensureRelation({
			collection,
			field: def.field,
			related_collection: def.relation.related_collection,
		});
	}
}

/** 确保一条 M2O relation 存在。支持 translations 语义(带 one_field 反向字段) */
async function ensureRelation(rel: {
	collection: string;
	field: string;
	related_collection: string;
	/** 反向 O2M 字段名;对 translations 子表指向主表时使用 */
	one_field?: string | null;
	/** 指定 translations 语义,使 Directus UI 识别为翻译子表 */
	one_collection_field?: string | null;
	one_allowed_collections?: string[] | null;
	junction_field?: string | null;
	sort_field?: string | null;
	on_delete?: "SET NULL" | "CASCADE" | "NO ACTION";
}): Promise<void> {
	// 查 /relations/{collection}/{field}
	const existing = await fetchDirectus(
		`/relations/${rel.collection}/${rel.field}`,
		{ allowStatuses: [403, 404] },
	);
	if (existing.status === 200) {
		log.skip(`relation ${rel.collection}.${rel.field} 已存在`);
		return;
	}
	await fetchDirectus("/relations", {
		method: "POST",
		body: {
			collection: rel.collection,
			field: rel.field,
			related_collection: rel.related_collection,
			meta: {
				one_field: rel.one_field ?? null,
				one_collection_field: rel.one_collection_field ?? null,
				one_allowed_collections: rel.one_allowed_collections ?? null,
				junction_field: rel.junction_field ?? null,
				sort_field: rel.sort_field ?? null,
			},
			schema: { on_delete: rel.on_delete ?? "SET NULL" },
		},
	});
	log.success(
		`创建 relation ${rel.collection}.${rel.field} → ${rel.related_collection}`,
	);
}

/* ============================================================================
 * Collection 创建
 * ========================================================================== */

interface CollectionDef {
	collection: string;
	/** 单例(如 site_settings) */
	singleton?: boolean;
	/** 后台显示名称 */
	note?: string;
	icon?: string;
	/** collection 默认排序字段(通常 sort / date_created) */
	sort_field?: string;
	/** 是否显示 archive/status 过滤 */
	archive_field?: string;
	archive_value?: string;
	unarchive_value?: string;
}

async function createCollectionIfMissing(def: CollectionDef): Promise<boolean> {
	if (await collectionExists(def.collection)) {
		log.skip(`collection ${def.collection} 已存在`);
		return false;
	}

	const body: Record<string, unknown> = {
		collection: def.collection,
		meta: {
			singleton: def.singleton ?? false,
			icon: def.icon ?? null,
			note: def.note ?? null,
			sort_field: def.sort_field ?? null,
			archive_field: def.archive_field ?? null,
			archive_value: def.archive_value ?? null,
			unarchive_value: def.unarchive_value ?? null,
			collection: def.collection,
			hidden: false,
		},
		schema: {},
		// Directus 会自动建主键 id(uuid),如果想用 integer 自增就显式声明 fields
	};

	await fetchDirectus("/collections", {
		method: "POST",
		body,
	});
	log.success(`创建 collection ${def.collection}`);
	return true;
}

/* ============================================================================
 * 通用字段模板
 * ========================================================================== */

/** status: draft / published / archived,带 dropdown interface */
const STATUS_FIELD: FieldDef = {
	field: "status",
	type: "string",
	nullable: false,
	default_value: "draft",
	interface: "select-dropdown",
	options: {
		choices: [
			{ text: "$t:published", value: "published" },
			{ text: "$t:draft", value: "draft" },
			{ text: "$t:archived", value: "archived" },
		],
	},
	display: "labels",
	display_options: {
		showAsDot: true,
		choices: [
			{
				text: "$t:published",
				value: "published",
				foreground: "#FFFFFF",
				background: "var(--theme--primary)",
			},
			{
				text: "$t:draft",
				value: "draft",
				foreground: "#18222F",
				background: "#D3DAE4",
			},
			{
				text: "$t:archived",
				value: "archived",
				foreground: "#FFFFFF",
				background: "var(--theme--warning)",
			},
		],
	},
	sort: 1,
};

/** sort: 用于手动拖拽排序 */
const SORT_FIELD: FieldDef = {
	field: "sort",
	type: "integer",
	interface: "input",
	nullable: true,
	sort: 2,
};

/** date_created / date_updated,由 Directus 自动维护 */
const DATE_CREATED_FIELD: FieldDef = {
	field: "date_created",
	type: "timestamp",
	special: ["date-created"],
	interface: "datetime",
	display: "datetime",
	nullable: true,
	sort: 90,
};

const DATE_UPDATED_FIELD: FieldDef = {
	field: "date_updated",
	type: "timestamp",
	special: ["date-updated"],
	interface: "datetime",
	display: "datetime",
	nullable: true,
	sort: 91,
};

/** slug:URL 安全字符串,唯一 */
function slugField(sort = 10): FieldDef {
	return {
		field: "slug",
		type: "string",
		nullable: false,
		unique: true,
		interface: "input",
		options: { slug: true, trim: true },
		sort,
		note: "URL 安全 slug,用作路由",
	};
}

/** 原生 translations alias 字段 - 主表上只建字段,子表和 O2M relation 另外手建 */
function translationsField(sort = 99): FieldDef {
	return {
		field: "translations",
		type: "alias",
		special: ["translations"],
		interface: "translations",
		sort,
		note: "多语言字段(Directus 原生 translations interface)",
	};
}

/**
 * 一次性建立 "主表 ↔ translations 子表" 的完整结构。
 *
 * 单独用 REST 建一个 special=["translations"] 的 alias field 并不会触发
 * Directus 自动生成子表 —— 自动化只在 Data Studio UI 向导里发生。
 * 所以我们自己完成以下 4 步,达成与 UI 向导等价的结果:
 *
 *   1. 建 {parent}_translations collection(id / {parent}_id / languages_code)
 *   2. 建反向 M2O:子表.{parent}_id  → 主表
 *   3. 建 M2O:       子表.languages_code → languages(系统表,code 主键)
 *   4. 主表上建 translations alias field(交由调用方在主表字段序列里调用)
 *
 * 第 2 步的 relation 的 meta.one_field 指向 "translations",这是让 Directus
 * 在主表渲染 translations interface、正确识别语言 tab 切换的关键。
 *
 * 参数顺序说明:应在调用方先建好主表本身(让主表存在),再调用此函数建子表。
 */
async function ensureTranslationsChild(
	parentCollection: string,
	extraFields: FieldDef[],
): Promise<void> {
	const childCollection = `${parentCollection}_translations`;
	const parentIdField = `${parentCollection}_id`;

	// 1. 子表
	if (!(await collectionExists(childCollection))) {
		await fetchDirectus("/collections", {
			method: "POST",
			body: {
				collection: childCollection,
				meta: {
					hidden: true,
					icon: "translate",
					note: `${parentCollection} 多语言内容`,
					collection: childCollection,
				},
				schema: {},
			},
		});
		log.success(`创建 translations 子表 ${childCollection}`);
	} else {
		log.skip(`translations 子表 ${childCollection} 已存在`);
	}

	// 2. 子表.{parent}_id:反向 M2O 到主表
	await createFieldIfMissing(childCollection, {
		field: parentIdField,
		type: "integer",
		special: ["m2o"],
		interface: "select-dropdown-m2o",
		sort: 1,
		relation: {
			type: "m2o",
			related_collection: parentCollection,
		},
	});
	// createFieldIfMissing 已经建了 relation,但默认没有 one_field。
	// 我们需要 PATCH 一下这个 relation,填上 one_field = "translations",
	// 让 Directus UI 在主表上把 translations field 认成"翻译"而不是普通 O2M。
	await patchRelationMeta(childCollection, parentIdField, {
		one_field: "translations",
		one_collection_field: null,
		one_allowed_collections: null,
		junction_field: "languages_code",
		sort_field: null,
	});

	// 3. 子表.languages_code:M2O 到 languages 系统表(主键是 code)
	await createFieldIfMissing(childCollection, {
		field: "languages_code",
		type: "string",
		special: ["m2o"],
		interface: "select-dropdown-m2o",
		options: { template: "{{name}}" },
		sort: 2,
	});
	// languages 的主键类型是 string(code),不走默认 integer M2O 逻辑,
	// 这里单独建 relation。
	await ensureRelation({
		collection: childCollection,
		field: "languages_code",
		related_collection: "languages",
		junction_field: parentIdField,
		on_delete: "SET NULL",
	});

	// 4. 业务字段
	for (const def of extraFields) {
		await createFieldIfMissing(childCollection, def);
	}
}

/**
 * 补齐现有 relation 的 meta 字段。用于在 createFieldIfMissing 自动建好
 * relation 之后,再把 one_field / junction_field 等 translations 语义
 * 所需的 meta 填上(直接 POST 时一起带也行,但我们 m2o helper 已经抽了一层,
 * 走 PATCH 最不侵入)。
 */
async function patchRelationMeta(
	collection: string,
	field: string,
	meta: {
		one_field?: string | null;
		one_collection_field?: string | null;
		one_allowed_collections?: string[] | null;
		junction_field?: string | null;
		sort_field?: string | null;
	},
): Promise<void> {
	await fetchDirectus(`/relations/${collection}/${field}`, {
		method: "PATCH",
		body: { meta },
		allowStatuses: [404],
	});
}

/** 文件(图片)字段 - M2O 到 directus_files */
function fileField(field: string, sort: number, note?: string): FieldDef {
	return {
		field,
		type: "uuid",
		special: ["file"],
		interface: "file-image",
		display: "image",
		sort,
		note,
	};
}

/* ============================================================================
 * 具体集合定义
 * ==========================================================================
 * 每个集合一个函数:ensureXxx()
 *   1. 建 collection
 *   2. 建本表字段
 *   3. 建 translations alias 字段(触发 Directus 自动建 _translations 子表)
 *   4. 往 _translations 子表里补业务字段
 *
 * 步骤 4 的时机:translations alias 字段创建之后,_translations 子表
 * 会立刻存在(带 id / {parent}_id / languages_code 三个系统字段),
 * 我们再往里补 title / content 这些业务字段。
 * ========================================================================== */

/* ---------- site_settings (singleton) ---------- */

async function ensureSiteSettings(): Promise<void> {
	log.step("2.1", "site_settings (singleton)");
	const created = await createCollectionIfMissing({
		collection: "site_settings",
		singleton: true,
		icon: "settings",
		note: "站点全局配置(单例)",
	});

	// 本表字段
	await createFieldIfMissing("site_settings", {
		field: "site_name",
		type: "string",
		nullable: false,
		default_value: "ZerxLab",
		interface: "input",
		sort: 1,
	});
	await createFieldIfMissing(
		"site_settings",
		fileField("og_image", 2, "默认 OG 分享图"),
	);
	await createFieldIfMissing("site_settings", {
		field: "social_github",
		type: "string",
		interface: "input",
		sort: 10,
		note: "GitHub 组织/账户链接",
	});
	await createFieldIfMissing("site_settings", {
		field: "social_x",
		type: "string",
		interface: "input",
		sort: 11,
	});
	await createFieldIfMissing("site_settings", {
		field: "social_email",
		type: "string",
		interface: "input",
		sort: 12,
	});
	await createFieldIfMissing("site_settings", {
		field: "social_discord",
		type: "string",
		interface: "input",
		sort: 13,
	});
	await createFieldIfMissing("site_settings", {
		field: "rss_url",
		type: "string",
		interface: "input",
		sort: 14,
		note: "自定义 RSS URL,留空则用站点自动生成",
	});
	await createFieldIfMissing("site_settings", {
		field: "established_year",
		type: "integer",
		interface: "input",
		sort: 20,
	});
	await createFieldIfMissing("site_settings", {
		field: "location",
		type: "string",
		interface: "input",
		sort: 21,
	});
	await createFieldIfMissing("site_settings", {
		field: "focus",
		type: "string",
		interface: "input",
		sort: 22,
		note: '关注方向,如 "FULL-STACK / RUST / GO"',
	});
	await createFieldIfMissing("site_settings", {
		field: "total_stars",
		type: "integer",
		interface: "input",
		sort: 30,
		note: "GitHub 总 star 数(冗余,seed 自动回填)",
	});
	await createFieldIfMissing("site_settings", {
		field: "contributors",
		type: "integer",
		interface: "input",
		sort: 31,
	});

	// translations:先建子表 + O2M,再建主表 alias field
	await ensureTranslationsChild("site_settings", [
		{
			field: "tagline",
			type: "string",
			nullable: false,
			interface: "input",
			note: '一句话副标题,如 "全栈实验室"',
			sort: 10,
		},
		{
			field: "description",
			type: "text",
			interface: "input-multiline",
			sort: 11,
		},
	]);
	await createFieldIfMissing("site_settings", translationsField(99));

	if (created) log.info("site_settings 结构建立完成");
}

/* ---------- authors ---------- */

async function ensureAuthors(): Promise<void> {
	log.step("2.2", "authors");
	await createCollectionIfMissing({
		collection: "authors",
		icon: "person",
		sort_field: "sort",
		note: "文章作者",
	});
	await createFieldIfMissing("authors", SORT_FIELD);
	await createFieldIfMissing("authors", slugField(10));
	await createFieldIfMissing("authors", {
		field: "name",
		type: "string",
		nullable: false,
		interface: "input",
		sort: 11,
	});
	await createFieldIfMissing("authors", fileField("avatar", 12, "头像"));
	await createFieldIfMissing("authors", {
		field: "github",
		type: "string",
		interface: "input",
		sort: 20,
	});
	await createFieldIfMissing("authors", {
		field: "x",
		type: "string",
		interface: "input",
		sort: 21,
	});
	await createFieldIfMissing("authors", {
		field: "email",
		type: "string",
		interface: "input",
		sort: 22,
	});
	await createFieldIfMissing("authors", DATE_CREATED_FIELD);
	await createFieldIfMissing("authors", DATE_UPDATED_FIELD);

	await ensureTranslationsChild("authors", [
		{
			field: "bio",
			type: "text",
			interface: "input-multiline",
			sort: 10,
		},
	]);
	await createFieldIfMissing("authors", translationsField(99));
}

/* ---------- categories ---------- */

async function ensureCategories(): Promise<void> {
	log.step("2.3", "categories");
	await createCollectionIfMissing({
		collection: "categories",
		icon: "folder",
		sort_field: "sort",
		note: "博客分类",
	});
	await createFieldIfMissing("categories", SORT_FIELD);
	await createFieldIfMissing("categories", slugField(10));

	await ensureTranslationsChild("categories", [
		{
			field: "name",
			type: "string",
			nullable: false,
			interface: "input",
			sort: 10,
		},
		{
			field: "description",
			type: "text",
			interface: "input-multiline",
			sort: 11,
		},
	]);
	await createFieldIfMissing("categories", translationsField(99));
}

/* ---------- tags ---------- */

async function ensureTags(): Promise<void> {
	log.step("2.4", "tags");
	await createCollectionIfMissing({
		collection: "tags",
		icon: "sell",
		note: "博客标签",
	});
	await createFieldIfMissing("tags", slugField(10));

	await ensureTranslationsChild("tags", [
		{
			field: "name",
			type: "string",
			nullable: false,
			interface: "input",
			sort: 10,
		},
	]);
	await createFieldIfMissing("tags", translationsField(99));
}

/* ---------- posts + posts_tags (M2M) ---------- */

async function ensurePosts(): Promise<void> {
	log.step("2.5", "posts + posts_tags");
	await createCollectionIfMissing({
		collection: "posts",
		icon: "article",
		note: "博客文章",
		sort_field: "sort",
		archive_field: "status",
		archive_value: "archived",
		unarchive_value: "draft",
	});

	await createFieldIfMissing("posts", STATUS_FIELD);
	await createFieldIfMissing("posts", SORT_FIELD);
	await createFieldIfMissing("posts", slugField(10));
	await createFieldIfMissing("posts", fileField("cover", 11, "封面图"));
	await createFieldIfMissing("posts", {
		field: "reading_time",
		type: "integer",
		interface: "input",
		sort: 12,
		note: "阅读时长(分钟)",
	});
	await createFieldIfMissing("posts", {
		field: "featured",
		type: "boolean",
		interface: "boolean",
		default_value: false,
		nullable: false,
		sort: 13,
	});
	await createFieldIfMissing("posts", {
		field: "date_published",
		type: "timestamp",
		interface: "datetime",
		display: "datetime",
		sort: 14,
	});
	await createFieldIfMissing("posts", DATE_CREATED_FIELD);
	await createFieldIfMissing("posts", DATE_UPDATED_FIELD);

	// M2O: author(integer 类型匹配 Directus 默认自增主键)
	await createFieldIfMissing("posts", {
		field: "author",
		type: "integer",
		special: ["m2o"],
		interface: "select-dropdown-m2o",
		options: { template: "{{name}}" },
		display: "related-values",
		display_options: { template: "{{name}}" },
		sort: 20,
		relation: { type: "m2o", related_collection: "authors" },
	});
	// M2O: category
	await createFieldIfMissing("posts", {
		field: "category",
		type: "integer",
		special: ["m2o"],
		interface: "select-dropdown-m2o",
		options: { template: "{{slug}}" },
		display: "related-values",
		display_options: { template: "{{slug}}" },
		sort: 21,
		relation: { type: "m2o", related_collection: "categories" },
	});

	// translations 子表 + 业务字段
	await ensureTranslationsChild("posts", [
		{
			field: "title",
			type: "string",
			nullable: false,
			interface: "input",
			sort: 10,
		},
		{
			field: "excerpt",
			type: "text",
			interface: "input-multiline",
			sort: 11,
		},
		{
			field: "content",
			type: "text",
			interface: "input-rich-text-md",
			sort: 12,
		},
		{
			field: "cover_label",
			type: "string",
			interface: "input",
			sort: 13,
			note: "列表占位图上的大字标签(如 v1.0 Release)",
		},
		{
			field: "seo_title",
			type: "string",
			interface: "input",
			sort: 20,
		},
		{
			field: "seo_description",
			type: "text",
			interface: "input-multiline",
			sort: 21,
		},
	]);
	await createFieldIfMissing("posts", translationsField(90));

	// M2M: posts ↔ tags via posts_tags
	await ensureM2M({
		collection: "posts",
		field: "tags",
		junction_collection: "posts_tags",
		related_collection: "tags",
		sort: 95,
	});
}

/* ---------- projects ---------- */

async function ensureProjects(): Promise<void> {
	log.step("2.6", "projects");
	await createCollectionIfMissing({
		collection: "projects",
		icon: "terminal",
		sort_field: "sort",
		archive_field: "status",
		archive_value: "archived",
		unarchive_value: "draft",
		note: "开源项目(Lab 展示)",
	});

	await createFieldIfMissing("projects", STATUS_FIELD);
	await createFieldIfMissing("projects", SORT_FIELD);
	await createFieldIfMissing("projects", slugField(10));
	await createFieldIfMissing("projects", {
		field: "name",
		type: "string",
		nullable: false,
		interface: "input",
		sort: 11,
	});
	await createFieldIfMissing("projects", fileField("cover", 12));
	await createFieldIfMissing("projects", {
		field: "tech_stack",
		type: "json",
		special: ["cast-json"],
		interface: "tags",
		sort: 20,
		note: '技术栈标签数组,如 ["Go", "Rust"]',
	});
	await createFieldIfMissing("projects", {
		field: "kind",
		type: "string",
		interface: "select-dropdown",
		options: {
			choices: [
				{ text: "Library", value: "library" },
				{ text: "Tool", value: "tool" },
				{ text: "App", value: "app" },
				{ text: "Experiment", value: "experiment" },
				{ text: "Service", value: "service" },
			],
		},
		sort: 21,
	});

	await createFieldIfMissing("projects", {
		field: "github_url",
		type: "string",
		interface: "input",
		sort: 30,
	});
	await createFieldIfMissing("projects", {
		field: "demo_url",
		type: "string",
		interface: "input",
		sort: 31,
	});
	await createFieldIfMissing("projects", {
		field: "docs_url",
		type: "string",
		interface: "input",
		sort: 32,
	});
	await createFieldIfMissing("projects", {
		field: "npm_url",
		type: "string",
		interface: "input",
		sort: 33,
	});

	await createFieldIfMissing("projects", {
		field: "stars",
		type: "integer",
		interface: "input",
		sort: 40,
	});
	await createFieldIfMissing("projects", {
		field: "forks",
		type: "integer",
		interface: "input",
		sort: 41,
	});
	await createFieldIfMissing("projects", {
		field: "featured",
		type: "boolean",
		interface: "boolean",
		default_value: false,
		nullable: false,
		sort: 42,
	});
	await createFieldIfMissing("projects", DATE_CREATED_FIELD);
	await createFieldIfMissing("projects", DATE_UPDATED_FIELD);

	await ensureTranslationsChild("projects", [
		{
			field: "description",
			type: "text",
			interface: "input-multiline",
			nullable: false,
			sort: 10,
			note: "短描述(卡片用)",
		},
		{
			field: "content",
			type: "text",
			interface: "input-rich-text-md",
			sort: 11,
			note: "长介绍(Markdown,详情页用)",
		},
		{
			field: "highlights",
			type: "json",
			special: ["cast-json"],
			interface: "tags",
			sort: 12,
			note: '高亮点列表,如 ["零依赖", "21x 更快"]',
		},
	]);
	await createFieldIfMissing("projects", translationsField(99));
}

/* ---------- aur_packages ---------- */

async function ensureAurPackages(): Promise<void> {
	log.step("2.7", "aur_packages");
	await createCollectionIfMissing({
		collection: "aur_packages",
		icon: "inventory_2",
		sort_field: "sort",
		archive_field: "status",
		archive_value: "archived",
		unarchive_value: "draft",
		note: "AUR 软件包",
	});

	await createFieldIfMissing("aur_packages", STATUS_FIELD);
	await createFieldIfMissing("aur_packages", SORT_FIELD);
	await createFieldIfMissing("aur_packages", slugField(10));
	await createFieldIfMissing("aur_packages", {
		field: "name",
		type: "string",
		nullable: false,
		interface: "input",
		sort: 11,
		note: "AUR 官方包名,如 zerx-lab-pencil-bin",
	});
	await createFieldIfMissing("aur_packages", {
		field: "version",
		type: "string",
		interface: "input",
		sort: 12,
	});
	await createFieldIfMissing("aur_packages", {
		field: "maintained",
		type: "boolean",
		interface: "boolean",
		default_value: true,
		nullable: false,
		sort: 13,
	});
	await createFieldIfMissing("aur_packages", {
		field: "badges",
		type: "json",
		special: ["cast-json"],
		interface: "tags",
		sort: 20,
	});
	await createFieldIfMissing("aur_packages", {
		field: "aur_url",
		type: "string",
		interface: "input",
		sort: 30,
	});
	await createFieldIfMissing("aur_packages", {
		field: "upstream_url",
		type: "string",
		interface: "input",
		sort: 31,
	});
	await createFieldIfMissing("aur_packages", DATE_CREATED_FIELD);
	await createFieldIfMissing("aur_packages", DATE_UPDATED_FIELD);

	await ensureTranslationsChild("aur_packages", [
		{
			field: "description",
			type: "text",
			nullable: false,
			interface: "input-multiline",
			sort: 10,
		},
	]);
	await createFieldIfMissing("aur_packages", translationsField(99));
}

/* ---------- pages ---------- */

async function ensurePages(): Promise<void> {
	log.step("2.8", "pages");
	await createCollectionIfMissing({
		collection: "pages",
		icon: "description",
		archive_field: "status",
		archive_value: "archived",
		unarchive_value: "draft",
		note: "通用静态页(About 等)",
	});

	await createFieldIfMissing("pages", STATUS_FIELD);
	await createFieldIfMissing("pages", slugField(10));
	await createFieldIfMissing("pages", DATE_CREATED_FIELD);
	await createFieldIfMissing("pages", DATE_UPDATED_FIELD);

	await ensureTranslationsChild("pages", [
		{
			field: "title",
			type: "string",
			nullable: false,
			interface: "input",
			sort: 10,
		},
		{
			field: "content",
			type: "text",
			interface: "input-rich-text-md",
			sort: 11,
		},
	]);
	await createFieldIfMissing("pages", translationsField(99));
}

/* ============================================================================
 * (已废弃)translations 子表业务字段补写
 * ----------------------------------------------------------------------------
 * 早期实现假设 Directus 会在主表 translations alias field 创建后自动建子表,
 * 实测不会:自动化只在 Data Studio UI 的向导里发生。
 * 现在由 ensureTranslationsChild() 手工建子表 + relation + 业务字段。
 * 该函数保留但不再被调用。
 * ========================================================================== */

/* ============================================================================
 * M2M(posts ↔ tags)
 * ----------------------------------------------------------------------------
 * Directus 的 M2M 创建分三步:
 *   1. 先建 junction collection(posts_tags),带三个字段 id / posts_id / tags_id
 *   2. 在 junction 上建两条 m2o 关系(指向 posts 和 tags)
 *   3. 在 posts 上建一个 alias field(special: m2m),让 Directus 认出来这是 M2M
 * 为了省掉中间字段的手工建立,我们直接走 "fields API 的 m2m special" 路径:
 *   POST /fields/{collection} 带 { type: 'alias', special: ['m2m'], meta.interface: 'list-m2m' }
 *   + 手建 junction collection。
 * ========================================================================== */

async function ensureM2M(cfg: {
	collection: string;
	field: string;
	junction_collection: string;
	related_collection: string;
	sort: number;
}): Promise<void> {
	// 1. 建 junction collection(裸表,id 主键)
	if (!(await collectionExists(cfg.junction_collection))) {
		await fetchDirectus("/collections", {
			method: "POST",
			body: {
				collection: cfg.junction_collection,
				meta: {
					hidden: true,
					icon: "import_export",
					note: `${cfg.collection} ↔ ${cfg.related_collection} 中间表`,
				},
				schema: {},
			},
		});
		log.success(`创建 junction ${cfg.junction_collection}`);
	} else {
		log.skip(`junction ${cfg.junction_collection} 已存在`);
	}

	// 2. junction 的两个 m2o 字段(type=integer 匹配主表默认主键)
	const parentIdField = `${cfg.collection}_id`;
	// Directus 惯例是 collection 名 + _id,不做单复数变换
	const relatedIdFieldActual = `${cfg.related_collection}_id`;

	await createFieldIfMissing(cfg.junction_collection, {
		field: parentIdField,
		type: "integer",
		special: ["m2o"],
		interface: "select-dropdown-m2o",
		sort: 1,
		relation: {
			type: "m2o",
			related_collection: cfg.collection,
		},
	});
	await createFieldIfMissing(cfg.junction_collection, {
		field: relatedIdFieldActual,
		type: "integer",
		special: ["m2o"],
		interface: "select-dropdown-m2o",
		sort: 2,
		relation: {
			type: "m2o",
			related_collection: cfg.related_collection,
		},
	});

	// 补齐 M2M 语义:junction 上两个 M2O 互为对方的 junction_field,
	// 主表上建 alias field 时 Directus 才认出来这是 M2M。
	await patchRelationMeta(cfg.junction_collection, parentIdField, {
		one_field: cfg.field,
		junction_field: relatedIdFieldActual,
	});
	await patchRelationMeta(cfg.junction_collection, relatedIdFieldActual, {
		junction_field: parentIdField,
	});

	// 3. 在主表上建 m2m alias field
	await createFieldIfMissing(cfg.collection, {
		field: cfg.field,
		type: "alias",
		special: ["m2m"],
		interface: "list-m2m",
		options: { template: "{{tags_id.slug}}" },
		display: "related-values",
		display_options: { template: "{{tags_id.slug}}" },
		sort: cfg.sort,
	});

	// 4. 建立反向 relation,让 SDK 正确展开
	//    由 Directus 自动管理,通常在建 field 时就完成了;此处不手工干预。
}

/* ============================================================================
 * Public 只读权限
 * ----------------------------------------------------------------------------
 * 站点构建时匿名用 DIRECTUS_READ_TOKEN(可选),但也允许完全匿名。
 * 这里给 Public role 开放所有内容表的 read 权限:
 *   - posts / projects / aur_packages 只读 status = published
 *   - site_settings / authors / categories / tags / pages 全读
 *   - 所有 _translations 子表全读
 *   - directus_files 只读(用于图片)
 *
 * Directus v10+ 用 policies 管理权限,Public role 默认带一个 Public policy。
 * 我们通过 /permissions 端点为该 policy 添加规则。如果已存在同 collection+action 的
 * 规则就跳过。
 * ========================================================================== */

interface PermissionRule {
	collection: string;
	action: "read" | "create" | "update" | "delete" | "share";
	fields?: string[] | "*";
	permissions?: Record<string, unknown> | null;
}

/**
 * 查找 Public policy 的 id。
 *
 * Directus 11 给自带的 Public policy 的 name 存成 i18n key "$t:public_label",
 * 不是字面量 "Public"。不同版本表现不一致,所以我们做多重匹配:
 *   1. icon = "public"(最稳,自带策略一定是这个图标)
 *   2. name 匹配 "$t:public_label" 或 "Public"(兼容旧版本 / 用户改过名字)
 *
 * 都找不到就抛错,让用户到 UI 里确认。
 */
async function getPublicPolicyId(): Promise<string> {
	// 拉全部 policy,本地筛选(总量极少,通常 ≤ 5)
	const result = await fetchDirectus<
		Array<{ id: string; name: string; icon?: string | null }>
	>("/policies", {
		query: { fields: "id,name,icon", limit: 100 },
	});
	const policies = Array.isArray(result.data) ? result.data : [];

	// 1. 按 icon 匹配
	const byIcon = policies.find((p) => p.icon === "public");
	if (byIcon?.id) {
		log.child(`按 icon=public 匹配到 policy "${byIcon.name}"`);
		return byIcon.id;
	}

	// 2. 按 name 匹配(兼容 i18n key 与字面量)
	const byName = policies.find(
		(p) =>
			p.name === "$t:public_label" ||
			p.name === "Public" ||
			p.name?.toLowerCase() === "public",
	);
	if (byName?.id) {
		log.child(`按 name 匹配到 policy "${byName.name}"`);
		return byName.id;
	}

	throw new Error(
		"[bootstrap] 未找到 Public policy。已查询到的 policies:\n" +
			policies
				.map((p) => `    - ${p.name} (icon=${p.icon ?? "null"})`)
				.join("\n") +
			"\n请到 Directus UI 的 Settings → Access Policies 确认 Public 策略存在。",
	);
}

async function ensurePublicPermissions(): Promise<void> {
	log.step(3, "Public 只读权限");

	const policyId = await getPublicPolicyId();
	log.info(`Public policy id = ${policyId}`);

	// 拉已有权限,做集合判重
	const existing = await fetchDirectus<
		Array<{ id: number; collection: string; action: string; policy: string }>
	>("/permissions", {
		query: {
			filter: JSON.stringify({ policy: { _eq: policyId } }),
			limit: -1,
			fields: "id,collection,action,policy",
		},
	});
	const existingSet = new Set(
		(Array.isArray(existing.data) ? existing.data : []).map(
			(p) => `${p.collection}:${p.action}`,
		),
	);

	const rules: PermissionRule[] = [
		// 发布类过滤 status = published
		{
			collection: "posts",
			action: "read",
			permissions: { status: { _eq: "published" } },
			fields: "*",
		},
		{
			collection: "projects",
			action: "read",
			permissions: { status: { _eq: "published" } },
			fields: "*",
		},
		{
			collection: "aur_packages",
			action: "read",
			permissions: { status: { _eq: "published" } },
			fields: "*",
		},
		{
			collection: "pages",
			action: "read",
			permissions: { status: { _eq: "published" } },
			fields: "*",
		},
		// 元数据类全读
		{ collection: "site_settings", action: "read", fields: "*" },
		{ collection: "authors", action: "read", fields: "*" },
		{ collection: "categories", action: "read", fields: "*" },
		{ collection: "tags", action: "read", fields: "*" },
		// translations 子表全读
		{ collection: "site_settings_translations", action: "read", fields: "*" },
		{ collection: "authors_translations", action: "read", fields: "*" },
		{ collection: "categories_translations", action: "read", fields: "*" },
		{ collection: "tags_translations", action: "read", fields: "*" },
		{ collection: "posts_translations", action: "read", fields: "*" },
		{ collection: "projects_translations", action: "read", fields: "*" },
		{ collection: "aur_packages_translations", action: "read", fields: "*" },
		{ collection: "pages_translations", action: "read", fields: "*" },
		// M2M 中间表
		{ collection: "posts_tags", action: "read", fields: "*" },
		// 图片文件
		{ collection: "directus_files", action: "read", fields: "*" },
	];

	for (const rule of rules) {
		const key = `${rule.collection}:${rule.action}`;
		if (existingSet.has(key)) {
			log.skip(`permission ${key} 已存在`);
			continue;
		}
		await fetchDirectus("/permissions", {
			method: "POST",
			body: {
				policy: policyId,
				collection: rule.collection,
				action: rule.action,
				fields: rule.fields ?? "*",
				permissions: rule.permissions ?? {},
				validation: {},
				presets: null,
			},
		});
		log.success(`授予 Public ${key}`);
	}
}

/* ============================================================================
 * Frontend Reader 用户 + Static Token
 * ----------------------------------------------------------------------------
 * Astro SSG 构建时需要一个只读 token 来调用 Directus REST API。
 * 匿名访问虽然因为我们配了 Public policy 也能读,但使用带 token 的请求有两个好处:
 *   1. 可以单独吊销/轮换,不影响其他客户端
 *   2. 未来想加 request logging / per-user rate limit 时,能看到到底是哪个消费者
 *
 * 本步骤做的:
 *   1. 按 email = frontend-reader@zerx.dev 查找用户,不存在则创建
 *   2. 给用户挂上 Public policy(通过 policies M2M)—— 和匿名拥有相同的读权限
 *   3. 若用户没有 token,生成一个 64 字符 hex 串并 PATCH 上去
 *   4. 把最终 token 回写到项目根目录 .env 的 DIRECTUS_READ_TOKEN=
 *
 * 幂等:重复运行只会复用现有用户 + 现有 token,不会改已有值。
 *
 * 注意事项:
 *   - Directus 11 的 users 同时支持 role(旧模型)和 policies(新模型)。
 *     我们给这个用户 role=null,只靠 policies 授权,符合 v10+ 推荐用法。
 *   - token 在 Directus 里以明文存储(而不是 hash),所以生成后能直接从 /users/:id
 *     读回来 —— 这是我们幂等复用 token 的基础。
 * ========================================================================== */

const READER_EMAIL = "frontend-reader@zerx.dev";
const READER_FIRST_NAME = "Frontend";
const READER_LAST_NAME = "Reader";

interface DirectusUser {
	id: string;
	email: string | null;
	token: string | null;
	status?: string;
	policies?: Array<string | { policy?: string; id?: number }>;
}

async function ensureReaderUser(): Promise<void> {
	log.step(4, "Frontend Reader 用户 + Static Token");

	const policyId = await getPublicPolicyId();

	// 1. 按 email 查找用户
	const found = await fetchDirectus<DirectusUser[]>("/users", {
		query: {
			filter: JSON.stringify({ email: { _eq: READER_EMAIL } }),
			fields: "id,email,token,status",
			limit: 1,
		},
	});
	const existingUser = Array.isArray(found.data) ? found.data[0] : undefined;

	let userId: string;

	// Directus v11 的 token 行为(实测):
	//   - GET /users 读回时 token 字段永远被脱敏为 "**********",无法复用
	//   - POST /users 带 token 字段,Directus 可能不按我们给的值存(实测:创建后用
	//     该 token 调 API 返回 INVALID_CREDENTIALS)
	//   - PATCH /users/:id 带 token 字段,会被接受且立即生效
	// 策略:
	//   1. 始终 PATCH token(无论用户是新建还是已存在)
	//   2. 脚本本地保留生成的 token 明文副本 → 写回 .env
	//   3. 幂等性让位给"总是能拿到能用的 token":每次 bootstrap 生成新 token
	//      覆盖旧的。旧 token 自动失效,没有安全残留。
	const freshToken = randomBytes(32).toString("hex");

	if (existingUser?.id) {
		userId = existingUser.id;
		log.skip(`user ${READER_EMAIL} 已存在 (id=${userId}),将轮换 token`);
	} else {
		// 创建用户时 NOT 带 token,避免 Directus 把它和真实 token 混淆
		const created = await fetchDirectus<DirectusUser>("/users", {
			method: "POST",
			body: {
				email: READER_EMAIL,
				first_name: READER_FIRST_NAME,
				last_name: READER_LAST_NAME,
				status: "active",
				// role 留空:v10+ 推荐用 policies 直接授权
				role: null,
			},
		});
		if (!created.data?.id) {
			throw new Error(
				"[bootstrap] 创建 frontend-reader 用户失败,响应里没有 id",
			);
		}
		userId = created.data.id;
		log.success(`创建 user ${READER_EMAIL} (id=${userId})`);
	}

	// 通过 PATCH 写入 token(这是实测唯一可靠的方式)
	await fetchDirectus(`/users/${userId}`, {
		method: "PATCH",
		body: { token: freshToken },
	});
	const currentToken = freshToken;
	log.success(`写入 user.token(${freshToken.length} 字符)`);

	// 3. 挂 Public policy(如果还没挂)
	// policies 是 M2M,通过 directus_access junction 管理。
	// 直接查 /access 过滤 user=userId 更精确。
	const accessRes = await fetchDirectus<
		Array<{ id: number; user: string; policy: string }>
	>("/access", {
		query: {
			filter: JSON.stringify({
				_and: [{ user: { _eq: userId } }, { policy: { _eq: policyId } }],
			}),
			fields: "id,user,policy",
			limit: 1,
		},
	});
	const alreadyLinked =
		Array.isArray(accessRes.data) && accessRes.data.length > 0;

	if (alreadyLinked) {
		log.skip(`user ↔ Public policy 绑定已存在`);
	} else {
		await fetchDirectus("/access", {
			method: "POST",
			body: { user: userId, policy: policyId },
		});
		log.success(`绑定 user → Public policy`);
	}

	// 4. 写回 .env
	const result = await updateDotenv("DIRECTUS_READ_TOKEN", currentToken);
	log.success(
		`DIRECTUS_READ_TOKEN 已${result.action === "replaced" ? "更新" : result.action === "appended" ? "追加" : "写入新文件"} (${DOTENV_PATH})`,
	);
	log.info("如果此前 Astro dev server 正在运行,请重启以加载新 token");
}

/* ============================================================================
 * 入口
 * ========================================================================== */

async function main(): Promise<void> {
	log.info(`目标: ${DIRECTUS_URL}`);

	// 1. 语言表(首次可能无权限,稍后补写)
	await ensureLanguages();

	// 2. 业务 collection + 字段 + translations
	await ensureSiteSettings();
	await ensureAuthors();
	await ensureCategories();
	await ensureTags();
	await ensurePosts();
	await ensureProjects();
	await ensureAurPackages();
	await ensurePages();

	// 3. 权限
	await ensurePublicPermissions();

	// 4. 前端专用只读 user + token,自动写回 .env
	await ensureReaderUser();

	log.info("下一步:`bun run seed` 把 fallback 数据写入 Directus");
	log.info("     然后:`bun run typegen` 从 Directus schema 重新生成 TS 类型");
}

runMain("Bootstrap Directus", main);
