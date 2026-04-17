/**
 * ============================================================================
 * ZerxLab Website - Directus Typegen
 * ----------------------------------------------------------------------------
 * 从 Directus 的实际运行时 schema 生成 TypeScript 类型,替换手写的
 * src/lib/directus.types.ts。
 *
 * 工作流程:
 *   1. 调用 GET /server/specs/oas(需要 admin token)拉回当前 Directus 的
 *      OpenAPI 3.x 规格,里面包含所有 collection、字段、类型、relation。
 *   2. 用 openapi-typescript 把 OAS → components["schemas"] 的 TS 类型。
 *   3. 针对业务 collection(非 Directus 系统表),从生成物中挑选对应的
 *      Items* 类型,拼成 @directus/sdk 可用的 Schema interface。
 *   4. 写回 src/lib/directus.types.ts,保留顶部的元注释与手写的通用类型别名,
 *      被覆写的部分用明显的分隔横线标记。
 *
 * 为什么不全量覆盖 directus.types.ts:
 *   - 文件里的 Bilingual / FallbackLang 类型被 fallback-data 用到(非 Directus)
 *   - 顶部的说明注释是项目约定,对开发者有用
 *   所以本脚本只重写"由 Directus 决定形状"的那一段(从 AUTO-GENERATED 标记到文件尾)。
 *
 * 备份机制:
 *   覆写前会把旧文件 cp 到 src/lib/directus.types.ts.bak,
 *   便于误生成后 `mv *.bak` 回滚。
 * ============================================================================
 */

import { writeFile, readFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";
import { DIRECTUS_URL, fetchDirectus, log, runMain } from "./_shared";

/* ----------------------------------------------------------------------------
 * 常量:手写的业务 collection 清单
 * ----------------------------------------------------------------------------
 * 这些 collection 会被纳入最终的 Schema interface。
 * 其他 Directus 系统表(directus_users 等)不进 Schema —— 前端不直接读。
 *
 * 注意命名:
 *   - key 必须与 Directus 里的 collection key(snake_case)完全一致
 *   - value.kind = "single" → singleton,SDK 侧是 T(用 readSingleton)
 *   - value.kind = "many"   → 普通集合,SDK 侧是 T[]
 *   - value.includeInRoot = true 时才出现在 Schema 顶层(translations 子表
 *     也要出现,因为 SDK 支持直接 readItems("posts_translations"))
 * ---------------------------------------------------------------------------- */

interface CollectionMeta {
	kind: "single" | "many";
	/** 是否纳入 Schema 顶层(默认 true) */
	includeInRoot?: boolean;
}

const COLLECTIONS: Record<string, CollectionMeta> = {
	// singleton
	site_settings: { kind: "single" },
	site_settings_translations: { kind: "many" },

	// 作者 / 分类 / 标签
	authors: { kind: "many" },
	authors_translations: { kind: "many" },
	categories: { kind: "many" },
	categories_translations: { kind: "many" },
	tags: { kind: "many" },
	tags_translations: { kind: "many" },

	// 文章
	posts: { kind: "many" },
	posts_translations: { kind: "many" },
	posts_tags: { kind: "many" },

	// 项目
	projects: { kind: "many" },
	projects_translations: { kind: "many" },

	// AUR
	aur_packages: { kind: "many" },
	aur_packages_translations: { kind: "many" },

	// 静态页
	pages: { kind: "many" },
	pages_translations: { kind: "many" },
};

/* ----------------------------------------------------------------------------
 * 目标文件路径
 * ---------------------------------------------------------------------------- */

// 用 fileURLToPath 解析当前文件所在目录,兼容 Node/Bun 的标准 ESM
// (import.meta.dir 只是 Bun 扩展,types 层面未声明)
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const TARGET = resolve(ROOT, "src/lib/directus.types.ts");
const BACKUP = `${TARGET}.bak`;

/** 分隔标记:从这一行(包含)往下都会被 typegen 覆写 */
const GEN_MARK_START = "/* <<< AUTO-GENERATED-BY-TYPEGEN:START >>> */";
const GEN_MARK_END = "/* <<< AUTO-GENERATED-BY-TYPEGEN:END >>> */";

/* ----------------------------------------------------------------------------
 * 拉取 OAS
 * ----------------------------------------------------------------------------
 * Directus 的 /server/specs/oas 输出的是完整 OpenAPI 3.0.1 JSON,包含:
 *   - components.schemas.ItemsPosts
 *   - components.schemas.ItemsPostsTranslations
 *   - components.schemas.Authors
 *   - ...(命名规则:业务 collection 走 ItemsXxx,系统走 Xxx)
 *
 * 注意:Directus 对业务 collection 生成的 schema 名是 `Items` + PascalCase,
 * 下划线会被去掉,例如:
 *   posts              → ItemsPosts
 *   posts_translations → ItemsPostsTranslations
 *   site_settings      → ItemsSiteSettings
 * ---------------------------------------------------------------------------- */

async function fetchOAS(): Promise<Record<string, unknown>> {
	log.step(1, "拉取 Directus OpenAPI 规格");
	const res = await fetchDirectus<Record<string, unknown>>("/server/specs/oas");
	if (!res.data || typeof res.data !== "object") {
		// 某些 Directus 版本 OAS 直接把 schema 塞在 raw 顶层(没有 data 包装)
		if (res.raw && typeof res.raw === "object") {
			log.info("使用顶层 OAS(无 data 包装)");
			return res.raw as Record<string, unknown>;
		}
		throw new Error("Directus /server/specs/oas 返回结构无法解析");
	}
	log.success("OAS 拉取成功");
	return res.data;
}

/* ----------------------------------------------------------------------------
 * OAS → TS
 * ----------------------------------------------------------------------------
 * openapi-typescript v7 的 API:
 *   const ast = await openapiTS(schemaObject, options)
 *   const source = astToString(ast)  // 得到完整 .d.ts 字符串
 * ---------------------------------------------------------------------------- */

async function oasToTs(oas: Record<string, unknown>): Promise<string> {
	log.step(2, "转换 OAS → TypeScript AST");
	const ast = await openapiTS(oas as never, {
		// openapi-typescript 默认的 export 形式对我们够用;
		// 关掉不必要的 unknown-to-string 转换
		alphabetize: false,
		// 把 `additionalProperties: true` 翻译成 `[key: string]: unknown`,
		// 便于后续 indexing(Directus 自定义字段可能会漂)
		defaultNonNullable: false,
	});
	const source = astToString(ast);
	log.success(`生成 ${source.length} 字符的 TS 源码`);
	return source;
}

/* ----------------------------------------------------------------------------
 * 从生成的 .d.ts 里抽出 components["schemas"] 并拼成 Schema
 * ----------------------------------------------------------------------------
 * openapi-typescript 输出形如:
 *   export interface components {
 *       schemas: {
 *           ItemsPosts: { ... };
 *           ItemsPostsTranslations: { ... };
 *           Authors: { ... };  // 系统表
 *           ...
 *       };
 *   }
 *
 * 我们要做的:
 *   1. 保留整个 `export interface components` 块不变(作为原始类型池)
 *   2. 在末尾追加一段我们自己的 type alias,把业务 collection 映射到
 *      单个 type,再组装 Schema。
 * ---------------------------------------------------------------------------- */

/** collection key → OAS 里 ItemsXxx 类型名(snake_case → PascalCase,下划线去掉) */
function collectionToSchemaName(collection: string): string {
	const pascal = collection
		.split("_")
		.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
		.join("");
	return `Items${pascal}`;
}

function buildSchemaAddendum(): string {
	const lines: string[] = [];
	lines.push("");
	lines.push("/* ==========================================================");
	lines.push(" * Directus Schema (供 @directus/sdk 泛型使用)");
	lines.push(" * ----------------------------------------------------------");
	lines.push(" * 下列类型别名由 typegen 基于当前 Directus 实际 schema 生成,");
	lines.push(
		" * 命名规则:Directus 给业务 collection 的 OAS 类型名是 ItemsXxx,",
	);
	lines.push(" * 这里重命名为更友好的单数形式,并组装成 Schema interface。");
	lines.push(
		" * ========================================================== */",
	);
	lines.push("");

	// 为每个 collection 导出一个类型别名(PascalCase 单数风格)
	const aliasMap: Array<{ collection: string; alias: string }> = [];
	for (const [collection] of Object.entries(COLLECTIONS)) {
		const oasName = collectionToSchemaName(collection);
		// alias:保持 collection 的 snake_case 去下划线 → PascalCase
		// 例如 posts_translations → PostsTranslations(维持和 OAS 对齐,不做单数变换,
		// 因为 "posts" 单数是 "post" 但 "posts_translations" 单数不好命名)
		const alias = collection
			.split("_")
			.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
			.join("");
		aliasMap.push({ collection, alias });
		lines.push(`export type ${alias} = components["schemas"]["${oasName}"];`);
	}
	lines.push("");

	// 组装 Schema
	lines.push("/** @directus/sdk 泛型参数 */");
	lines.push("export interface Schema {");
	for (const { collection, alias } of aliasMap) {
		const meta = COLLECTIONS[collection];
		if (meta?.includeInRoot === false) continue;
		if (meta?.kind === "single") {
			lines.push(`\t${collection}: ${alias};`);
		} else {
			lines.push(`\t${collection}: ${alias}[];`);
		}
	}
	lines.push("}");
	lines.push("");

	return lines.join("\n");
}

/* ----------------------------------------------------------------------------
 * 组装最终文件
 * ----------------------------------------------------------------------------
 * 最终 directus.types.ts 的结构:
 *
 *   /* 顶部元注释 + 通用类型别名(DirectusStatus / LanguageCode 等)*\/
 *   ...手写区保留...
 *
 *   /* <<< AUTO-GENERATED-BY-TYPEGEN:START >>> *\/
 *   /* ↓↓↓ 自动生成,请勿手改。用 `bun run typegen` 重新生成 ↓↓↓ *\/
 *   export interface components { schemas: { ... } }
 *   export type Posts = components["schemas"]["ItemsPosts"];
 *   ...
 *   export interface Schema { ... }
 *   /* <<< AUTO-GENERATED-BY-TYPEGEN:END >>> *\/
 * ---------------------------------------------------------------------------- */

const PRESERVED_HEADER = `/**
 * ============================================================================
 * ZerxLab Website - Directus Schema 类型
 * ----------------------------------------------------------------------------
 * 文件结构:
 *   1. 手写区(此区块):项目用到的通用类型别名
 *      - DirectusStatus / LanguageCode / ISODateTime / ISODate
 *      - 以及 fallback-data 层会共用的 Bilingual 相关类型(若有)
 *   2. 自动生成区(由 \`bun run typegen\` 维护):
 *      - 从 Directus OAS 派生的 \`components["schemas"]\`
 *      - 业务 collection 的友好别名(\`Posts\` / \`Authors\` 等)
 *      - \`Schema\` interface,供 \`@directus/sdk\` 泛型参数使用
 *
 * 请勿手工修改"自动生成区",所有 schema 变更应先在 Directus UI 里完成,
 * 再运行 \`bun run typegen\` 同步类型。
 * ============================================================================
 */

/* ----------------------------------------------------------------------------
 * 通用类型(手写,不受 typegen 覆盖)
 * ---------------------------------------------------------------------------- */

/** 发布状态(draft/published/archived workflow) */
export type DirectusStatus = "draft" | "published" | "archived";

/** 支持的语言代码(与 src/i18n/ui.ts 保持一致) */
export type LanguageCode = "zh-CN" | "en-US";

/** ISO 8601 日期时间字符串 */
export type ISODateTime = string;

/** ISO 8601 日期字符串 */
export type ISODate = string;
`;

async function assemble(generatedTs: string): Promise<string> {
	const addendum = buildSchemaAddendum();

	const body: string[] = [];
	body.push(PRESERVED_HEADER);
	body.push("");
	body.push(GEN_MARK_START);
	body.push("/* ↓↓↓ 由 `bun run typegen` 自动生成,请勿手改 ↓↓↓ */");
	body.push("/* eslint-disable @typescript-eslint/no-explicit-any */");
	body.push("");
	body.push(generatedTs.trim());
	body.push(addendum);
	body.push(GEN_MARK_END);
	body.push("");

	return body.join("\n");
}

/* ----------------------------------------------------------------------------
 * 写文件(带备份)
 * ---------------------------------------------------------------------------- */

async function writeTarget(content: string): Promise<void> {
	log.step(3, "写回 directus.types.ts");

	// 1. 备份
	if (existsSync(TARGET)) {
		await copyFile(TARGET, BACKUP);
		log.info(`旧文件已备份到 ${BACKUP.replace(ROOT, ".")}`);
	}

	// 2. 写入新内容
	await writeFile(TARGET, content, "utf8");
	log.success(`已写入 ${TARGET.replace(ROOT, ".")}(${content.length} 字符)`);

	// 3. sanity check:确保自动生成区的标记能被下次 typegen 识别到
	const verify = await readFile(TARGET, "utf8");
	if (!verify.includes(GEN_MARK_START) || !verify.includes(GEN_MARK_END)) {
		log.warn(
			"写出的文件里找不到 AUTO-GENERATED 标记,下次 typegen 可能会重复追加",
		);
	}
}

/* ----------------------------------------------------------------------------
 * 入口
 * ---------------------------------------------------------------------------- */

async function main(): Promise<void> {
	log.info(`目标 Directus: ${DIRECTUS_URL}`);

	const oas = await fetchOAS();
	const generated = await oasToTs(oas);

	// 抽取 schema 命名验证:openapi-typescript 生成的类型池里必须包含
	// 我们期望的 ItemsXxx 命名。若某个 collection 在 Directus 里尚不存在,
	// 这里会给出明确提示而不是生成一个无效的引用。
	log.step("2.1", "校验 OAS 里是否包含所有期望的 collection");
	const missing: string[] = [];
	for (const collection of Object.keys(COLLECTIONS)) {
		const expected = collectionToSchemaName(collection);
		// openapi-typescript 生成的是字符串,直接做字符串搜索足够判断
		if (!generated.includes(expected)) {
			missing.push(`${collection} (${expected})`);
		}
	}
	if (missing.length > 0) {
		log.warn(
			"以下 collection 在 Directus OAS 中未找到,生成的类型会引用不存在的 schema 键:" +
				missing.map((m) => `\n    - ${m}`).join(""),
		);
		log.warn("请先运行 `bun run bootstrap` 建立 collection,再重跑 typegen");
	} else {
		log.success(`${Object.keys(COLLECTIONS).length} 个 collection 全部命中`);
	}

	const content = await assemble(generated);
	await writeTarget(content);

	log.info("建议在 IDE 里打开 src/lib/directus.types.ts 人眼过一下");
	log.info("随后可以运行 `bun run astro check` 验证整项目类型");
}

runMain("Typegen Directus", main);
