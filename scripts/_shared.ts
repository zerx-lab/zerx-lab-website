/**
 * ============================================================================
 * ZerxLab Website - 脚本共享工具
 * ----------------------------------------------------------------------------
 * 所有 scripts/ 下管理脚本(bootstrap / seed / typegen)共用的工具:
 *   - Admin 客户端工厂(强校验 DIRECTUS_ADMIN_TOKEN)
 *   - 结构化日志(分级 + 带时间戳)
 *   - 幂等辅助(存在性检查 / upsert by natural key)
 *   - Directus REST 兜底调用 fetchDirectus():
 *       @directus/sdk 的 Composable 客户端覆盖不到的系统接口
 *       (如 /collections、/fields、/relations、/server/specs/oas 等元数据 API),
 *       直接用 fetch + admin token 调用。
 *
 * 注意:
 *   - 本文件只给 scripts/ 用,不要被 src/ 引用
 *   - 所有对 Directus 的写入操作必须是幂等的(已存在则更新或跳过)
 * ============================================================================
 */

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
	createAdminClient,
	DIRECTUS_CONFIG,
	type DirectusAdminClient,
} from "../src/lib/directus";

/* ----------------------------------------------------------------------------
 * 环境变量(脚本场景下来自 process.env,Bun 自动加载 .env)
 * ---------------------------------------------------------------------------- */

const DIRECTUS_URL = DIRECTUS_CONFIG.url;
const DIRECTUS_ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

/* ----------------------------------------------------------------------------
 * 客户端单例
 * ----------------------------------------------------------------------------
 * 脚本生命周期内只 new 一次 admin 客户端,所有写入共用一个 HTTP Agent。
 * ---------------------------------------------------------------------------- */

let _adminClient: DirectusAdminClient | null = null;

export function admin(): DirectusAdminClient {
	if (!_adminClient) {
		_adminClient = createAdminClient();
	}
	return _adminClient;
}

export { DIRECTUS_URL };

/* ----------------------------------------------------------------------------
 * 日志工具
 * ----------------------------------------------------------------------------
 * 风格:带颜色、带分级前缀、带相对时间戳,方便在终端快速扫描。
 * 依赖:process.stdout.isTTY 判断是否走彩色输出,非 TTY(CI/管道)退化为纯文本。
 * ---------------------------------------------------------------------------- */

const isTTY = Boolean(process.stdout.isTTY);
const startedAt = Date.now();

const ANSI = {
	reset: "\x1b[0m",
	dim: "\x1b[2m",
	bold: "\x1b[1m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	gray: "\x1b[90m",
};

function paint(color: keyof typeof ANSI, text: string): string {
	if (!isTTY) return text;
	return `${ANSI[color]}${text}${ANSI.reset}`;
}

/** 相对时间戳,形如 "+0.12s" */
function elapsed(): string {
	const s = (Date.now() - startedAt) / 1000;
	return `+${s.toFixed(2)}s`;
}

export const log = {
	/** 顶层步骤分组,用于"1. 创建 collections"这种标题行 */
	step(n: number | string, title: string): void {
		console.log(
			`\n${paint("bold", `━━━ ${n}. ${title}`)} ${paint("gray", elapsed())}`,
		);
	},
	info(msg: string): void {
		console.log(`${paint("cyan", "ℹ")}  ${msg}`);
	},
	success(msg: string): void {
		console.log(`${paint("green", "✓")}  ${msg}`);
	},
	skip(msg: string): void {
		console.log(`${paint("gray", "○")}  ${paint("gray", msg)}`);
	},
	warn(msg: string): void {
		console.log(`${paint("yellow", "⚠")}  ${msg}`);
	},
	error(msg: string, err?: unknown): void {
		console.log(`${paint("red", "✗")}  ${msg}`);
		if (err) {
			const detail =
				err instanceof Error
					? (err.stack ?? err.message)
					: JSON.stringify(err, null, 2);
			console.log(paint("gray", detail));
		}
	},
	/** 子步骤缩进输出,用于"  - 已创建字段 title" */
	child(msg: string): void {
		console.log(`   ${paint("gray", "·")} ${paint("gray", msg)}`);
	},
};

/* ----------------------------------------------------------------------------
 * Directus REST 兜底调用
 * ----------------------------------------------------------------------------
 * 用于 SDK 不好表达的系统级接口。
 *
 * 为什么需要自己 fetch 而不是全程用 SDK:
 *   - @directus/sdk 的 `createCollection` / `createField` 等 helper 存在,
 *     但对 fields 的 meta / schema 细节(interface / options / translations)
 *     参数形状与后端原始 REST 输入不完全一致,出错时不好排查。
 *   - 直接打 /collections、/fields 这些 REST 端点,参数 1:1 对应文档,最稳。
 *
 * 约定:
 *   - path 以 "/" 开头,如 "/collections"
 *   - 自动带 Authorization: Bearer <admin-token>
 *   - 4xx/5xx 抛 DirectusHttpError,带完整 body 便于排查
 * ---------------------------------------------------------------------------- */

export class DirectusHttpError extends Error {
	constructor(
		public status: number,
		public path: string,
		public method: string,
		public body: unknown,
	) {
		super(
			`[directus] ${method} ${path} → ${status}\n${typeof body === "string" ? body : JSON.stringify(body, null, 2)}`,
		);
		this.name = "DirectusHttpError";
	}
}

export interface FetchOptions {
	method?: "GET" | "POST" | "PATCH" | "DELETE";
	/** 请求体(自动 JSON 序列化) */
	body?: unknown;
	/** 额外的 query 参数 */
	query?: Record<string, string | number | boolean | undefined>;
	/**
	 * 允许的"业务失败"状态码白名单。
	 * 例:exchange on "已存在"场景,后端会返回 400,我们想静默拿到 body 判断。
	 */
	allowStatuses?: number[];
}

export interface FetchResult<T> {
	status: number;
	data: T | null;
	/** 原始响应体(allowStatuses 命中时用) */
	raw: unknown;
}

/**
 * 调用 Directus REST 接口。
 *
 * @throws DirectusHttpError 当状态码不是 2xx 且不在 allowStatuses 里
 */
export async function fetchDirectus<T = unknown>(
	path: string,
	opts: FetchOptions = {},
): Promise<FetchResult<T>> {
	if (!DIRECTUS_ADMIN_TOKEN) {
		throw new Error(
			"[directus] DIRECTUS_ADMIN_TOKEN 未设置,无法执行 admin 操作。请检查 .env 文件。",
		);
	}
	const method = opts.method ?? "GET";

	// 拼 URL + query
	const url = new URL(path.replace(/^\//, ""), `${DIRECTUS_URL}/`);
	if (opts.query) {
		for (const [k, v] of Object.entries(opts.query)) {
			if (v === undefined) continue;
			url.searchParams.set(k, String(v));
		}
	}

	const init: RequestInit = {
		method,
		headers: {
			Authorization: `Bearer ${DIRECTUS_ADMIN_TOKEN}`,
			"Content-Type": "application/json",
			Accept: "application/json",
		},
	};
	if (opts.body !== undefined) {
		init.body = JSON.stringify(opts.body);
	}

	const res = await fetch(url.toString(), init);

	// 204 No Content - 常见于 DELETE
	if (res.status === 204) {
		return { status: 204, data: null, raw: null };
	}

	// 尝试解析 JSON,失败时退化为文本
	const text = await res.text();
	let raw: unknown;
	try {
		raw = text ? JSON.parse(text) : null;
	} catch {
		raw = text;
	}

	const allowed = opts.allowStatuses ?? [];
	if (!res.ok && !allowed.includes(res.status)) {
		throw new DirectusHttpError(res.status, url.pathname, method, raw);
	}

	// Directus REST 约定:成功响应体是 { data: T }
	const data =
		raw && typeof raw === "object" && raw !== null && "data" in raw
			? ((raw as { data: T }).data ?? null)
			: (raw as T | null);

	return { status: res.status, data, raw };
}

/* ----------------------------------------------------------------------------
 * 幂等辅助
 * ---------------------------------------------------------------------------- */

/**
 * 检查 collection 是否存在。
 * Directus 返回 403 / 404 都当作"不存在"处理(未登录时 permissions 可能丢)。
 */
export async function collectionExists(collection: string): Promise<boolean> {
	const result = await fetchDirectus(`/collections/${collection}`, {
		allowStatuses: [403, 404],
	});
	return result.status === 200;
}

/**
 * 检查某 collection 的某字段是否存在。
 */
export async function fieldExists(
	collection: string,
	field: string,
): Promise<boolean> {
	const result = await fetchDirectus(`/fields/${collection}/${field}`, {
		allowStatuses: [403, 404],
	});
	return result.status === 200;
}

/**
 * 按 natural key(通常是 slug / code / name)查找一条 item,找不到返回 null。
 */
export async function findItemByKey<T = Record<string, unknown>>(
	collection: string,
	keyField: string,
	keyValue: string,
): Promise<T | null> {
	const result = await fetchDirectus<T[]>(`/items/${collection}`, {
		query: {
			[`filter[${keyField}][_eq]`]: keyValue,
			limit: 1,
			fields: "*",
		},
	});
	const arr = Array.isArray(result.data) ? result.data : [];
	return arr[0] ?? null;
}

/**
 * Upsert by natural key - seed 的核心抽象。
 *
 * 行为(按当前项目决策:覆盖策略):
 *   - 按 keyField = keyValue 查找
 *   - 命中 → PATCH 覆盖(忽略 keyField 本身,避免改主键)
 *   - 未命中 → POST 创建
 *
 * 对于 M2O 关系字段,调用方需要自行先拿到目标 id 再传入。
 *
 * @returns 写入后的 item 全量数据
 */
export async function upsertByKey<T extends Record<string, unknown>>(
	collection: string,
	keyField: string,
	payload: T,
): Promise<T> {
	const keyValue = payload[keyField];
	if (typeof keyValue !== "string" && typeof keyValue !== "number") {
		throw new Error(
			`[upsert] payload.${keyField} 必须是 string/number,收到 ${typeof keyValue}`,
		);
	}
	const existing = await findItemByKey<Record<string, unknown>>(
		collection,
		keyField,
		String(keyValue),
	);

	if (existing) {
		// 已存在:覆盖(用户确认的策略)。不传 keyField 避免 Directus 抱怨改主键。
		const { [keyField]: _omit, ...rest } = payload;
		const id = existing.id;
		if (id === undefined || id === null) {
			throw new Error(
				`[upsert] 在 ${collection} 中找到同 ${keyField}=${keyValue} 的记录但没有 id 字段`,
			);
		}
		const result = await fetchDirectus<T>(
			`/items/${collection}/${encodeURIComponent(String(id))}`,
			{ method: "PATCH", body: rest },
		);
		log.child(`更新 ${collection}[${keyField}=${keyValue}]`);
		return result.data as T;
	}

	const result = await fetchDirectus<T>(`/items/${collection}`, {
		method: "POST",
		body: payload,
	});
	log.child(`创建 ${collection}[${keyField}=${keyValue}]`);
	return result.data as T;
}

/**
 * 把 singleton(如 site_settings)整体写入。
 * Directus 单例永远是 PATCH /items/{collection}(即使是首次)。
 */
export async function upsertSingleton<T extends Record<string, unknown>>(
	collection: string,
	payload: T,
): Promise<T> {
	const result = await fetchDirectus<T>(`/items/${collection}`, {
		method: "PATCH",
		body: payload,
	});
	log.child(`写入单例 ${collection}`);
	return result.data as T;
}

/* ----------------------------------------------------------------------------
 * 顶层错误处理
 * ----------------------------------------------------------------------------
 * 每个脚本的 main() 都套一层 runMain,保证:
 *   - 未捕获异常有统一的彩色输出
 *   - DirectusHttpError 把 status + body 展开,便于排查
 *   - 成功结束时打印总耗时
 * ---------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * .env 文件单行替换
 * ----------------------------------------------------------------------------
 * 用途:bootstrap 脚本完成 Directus 资源创建后,会自动生成一个 frontend-reader
 * 用户的 static token,需要写回项目根目录的 .env 以便 Astro 构建时能匿名读。
 *
 * 行为:
 *   - 定位 key=value 行(按精确的 `^KEY=` 匹配,行首无空格)
 *   - 只替换该行右侧的 value,不动注释、空行、其他变量
 *   - 找不到 key → 在文件末尾追加 `KEY=value`
 *   - 若 .env 文件不存在 → 创建一个只含本行的新文件
 *
 * 安全约束:
 *   - 本函数只在脚本上下文中使用,永远不会在浏览器端/Astro 构建期被调用
 *   - 调用者有责任保证 key / value 不含换行,以防破坏 .env 行结构
 * ---------------------------------------------------------------------------- */

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, "..");
const DOTENV_PATH = resolve(PROJECT_ROOT, ".env");

export async function updateDotenv(
	key: string,
	value: string,
): Promise<{ path: string; action: "replaced" | "appended" | "created" }> {
	// value 里不允许有换行,会破坏 .env 结构
	if (value.includes("\n") || value.includes("\r")) {
		throw new Error(
			`[updateDotenv] value 里包含换行符,会破坏 .env 格式: key=${key}`,
		);
	}

	// .env 不存在 → 新建
	if (!existsSync(DOTENV_PATH)) {
		await writeFile(DOTENV_PATH, `${key}=${value}\n`, "utf8");
		return { path: DOTENV_PATH, action: "created" };
	}

	const original = await readFile(DOTENV_PATH, "utf8");
	const lines = original.split(/\r?\n/);

	// 精确匹配行首的 KEY=(允许 export 前缀,但不允许前导空格)
	const keyPattern = new RegExp(`^(export\\s+)?${escapeRegExp(key)}=`);

	let replaced = false;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line === undefined) continue;
		if (keyPattern.test(line)) {
			const prefix = line.match(keyPattern)?.[0] ?? `${key}=`;
			lines[i] = `${prefix}${value}`;
			replaced = true;
			break; // 只替换第一条,避免文件里有重复 key 时全改
		}
	}

	if (!replaced) {
		// 没找到 key → 在末尾追加(如果最后一行不是空行就先加一个换行)
		if (lines.length > 0 && lines[lines.length - 1] !== "") {
			lines.push("");
		}
		lines.push(`${key}=${value}`);
	}

	// 保留原文件的换行风格:如果原来就是以 \n 结尾,新内容也以 \n 结尾
	const needsTrailingNewline = original.endsWith("\n");
	const joined = lines.join("\n");
	const out =
		needsTrailingNewline && !joined.endsWith("\n") ? `${joined}\n` : joined;

	await writeFile(DOTENV_PATH, out, "utf8");
	return { path: DOTENV_PATH, action: replaced ? "replaced" : "appended" };
}

/** 把字符串里的正则特殊字符转义,供 RegExp 构造函数使用 */
function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export { DOTENV_PATH };

/* ----------------------------------------------------------------------------
 * 顶层错误处理
 * ---------------------------------------------------------------------------- */

export async function runMain(
	label: string,
	fn: () => Promise<void>,
): Promise<never> {
	console.log(
		paint("bold", `\n▶ ${label}`) + paint("gray", `  (${DIRECTUS_URL})\n`),
	);
	try {
		await fn();
		console.log(
			`\n${paint("green", "■")} ${paint("bold", label)} 完成 ${paint(
				"gray",
				elapsed(),
			)}\n`,
		);
		process.exit(0);
	} catch (err) {
		if (err instanceof DirectusHttpError) {
			log.error(`${err.method} ${err.path} 返回 ${err.status}`, err.body);
		} else {
			log.error(`${label} 失败`, err);
		}
		process.exit(1);
	}
}
