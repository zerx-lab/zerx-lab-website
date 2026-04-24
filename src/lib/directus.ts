/**
 * ============================================================================
 * ZerxLab Website - Directus SDK 客户端
 * ----------------------------------------------------------------------------
 * 统一的 Directus 客户端工厂与辅助函数。
 *
 * 使用场景区分:
 *   1. 构建时读取 (Astro SSG): 使用 DIRECTUS_READ_TOKEN,只读公开内容
 *   2. 脚本写入 (scripts/*):   使用 DIRECTUS_ADMIN_TOKEN,管理级操作
 *
 * 约定:
 *   - 所有 collection 类型从 ./directus.types.ts 导入
 *   - 该文件在 bootstrap 脚本跑完后可用 `bun run typegen` 重新生成
 *   - 本文件只暴露"客户端 + 轻量辅助",业务查询放在 src/lib/queries/
 * ============================================================================
 */

import {
	createDirectus,
	rest,
	staticToken,
	readItems,
	readItem,
	readSingleton,
	aggregate,
	type RestClient,
	type StaticTokenClient,
	type DirectusClient,
} from "@directus/sdk";
import type { Schema } from "./directus.types";

/* ----------------------------------------------------------------------------
 * 运行时环境变量读取
 * ---------------------------------------------------------------------------- */

/**
 * 读取环境变量,按优先级:
 *   1. import.meta.env (Astro/Vite 构建时注入)
 *   2. process.env      (Node/Bun 脚本运行时)
 *
 * 这样同一份客户端代码既能在 Astro 页面里用,也能在 scripts/ 下跑。
 */
function readEnv(key: string): string | undefined {
	// Astro/Vite 侧: import.meta.env 在 Astro 构建/运行时始终可用
	try {
		const viteEnv = (import.meta as ImportMeta | undefined)?.env as
			| Record<string, string | undefined>
			| undefined;
		if (viteEnv && typeof viteEnv[key] === "string") {
			return viteEnv[key];
		}
	} catch {
		// 极端情况下(非 ESM 运行时)访问 import.meta 抛错,降级到 process.env
	}

	// Node/Bun 侧: scripts/ 下的管理脚本通过 process.env 读取
	if (typeof process !== "undefined" && process.env) {
		return process.env[key];
	}

	return undefined;
}

const DIRECTUS_URL = readEnv("DIRECTUS_URL") ?? "https://directus.zerx.dev";
const DIRECTUS_READ_TOKEN = readEnv("DIRECTUS_READ_TOKEN");
const DIRECTUS_ADMIN_TOKEN = readEnv("DIRECTUS_ADMIN_TOKEN");

/* ----------------------------------------------------------------------------
 * 客户端类型别名 (方便外部引用)
 * ---------------------------------------------------------------------------- */

export type DirectusReadClient = DirectusClient<Schema> &
	RestClient<Schema> &
	StaticTokenClient<Schema>;

export type DirectusAdminClient = DirectusClient<Schema> &
	RestClient<Schema> &
	StaticTokenClient<Schema>;

/* ----------------------------------------------------------------------------
 * 客户端工厂
 * ---------------------------------------------------------------------------- */

/**
 * 创建只读客户端 (构建时 Astro 页面使用)。
 *
 * 若未配置 DIRECTUS_READ_TOKEN,会 fallback 到匿名访问(Public role),
 * 此时只能读到 Public role 有权限的内容。正式环境请务必配置 token。
 *
 * @throws 仅当 DIRECTUS_URL 缺失时抛出(理论上不会,有默认值)
 */
export function createReadClient(): DirectusReadClient {
	if (!DIRECTUS_URL) {
		throw new Error("[directus] DIRECTUS_URL 未设置。请检查 .env 文件。");
	}

	const token = DIRECTUS_READ_TOKEN ?? "";

	if (!DIRECTUS_READ_TOKEN) {
		// 生产构建时静默匿名访问;开发环境给个提示
		if (readEnv("NODE_ENV") !== "production") {
			console.warn(
				"[directus] DIRECTUS_READ_TOKEN 未设置,将使用匿名访问。" +
					"运行 `bun run bootstrap` 可自动生成只读 token。",
			);
		}
	}

	return createDirectus<Schema>(DIRECTUS_URL)
		.with(staticToken(token))
		.with(rest()) as DirectusReadClient;
}

/**
 * 创建管理员客户端 (仅用于 scripts/ 下的 bootstrap / seed / 迁移脚本)。
 *
 * 强制要求 DIRECTUS_ADMIN_TOKEN 存在,否则抛错,避免误用。
 * 严禁在 Astro 页面 / 组件中调用此函数。
 */
export function createAdminClient(): DirectusAdminClient {
	if (!DIRECTUS_URL) {
		throw new Error("[directus] DIRECTUS_URL 未设置。请检查 .env 文件。");
	}
	if (!DIRECTUS_ADMIN_TOKEN) {
		throw new Error(
			"[directus] DIRECTUS_ADMIN_TOKEN 未设置。\n" +
				"  - 仅 scripts/ 下的管理脚本需要此 token\n" +
				"  - 请在 Directus 后台为 Admin 用户生成 token 后填入 .env",
		);
	}

	return createDirectus<Schema>(DIRECTUS_URL)
		.with(staticToken(DIRECTUS_ADMIN_TOKEN))
		.with(rest()) as DirectusAdminClient;
}

/* ----------------------------------------------------------------------------
 * 单例:页面层只用这一个只读客户端
 * ----------------------------------------------------------------------------
 * Astro SSG 构建时,每个页面都会 new 一次客户端会有性能损耗。
 * 这里做成懒加载单例,整个构建过程共用一个 HTTP Agent。
 * ---------------------------------------------------------------------------- */

let _readClient: DirectusReadClient | null = null;

export function directus(): DirectusReadClient {
	if (!_readClient) {
		_readClient = createReadClient();
	}
	return _readClient;
}

/* ----------------------------------------------------------------------------
 * 公共配置导出
 * ---------------------------------------------------------------------------- */

export const DIRECTUS_CONFIG = {
	url: DIRECTUS_URL,
	hasReadToken: Boolean(DIRECTUS_READ_TOKEN),
	hasAdminToken: Boolean(DIRECTUS_ADMIN_TOKEN),
} as const;

/**
 * 拼接 Directus assets URL。
 *
 * Directus 自带图片转换:
 *   https://directus.zerx.dev/assets/{file-id}?width=800&format=webp&quality=80
 *
 * @param fileId 文件 UUID,来自某字段(如 posts.cover)
 * @param options 图片变换参数
 * @returns 绝对 URL 字符串;若 fileId 为空返回空串
 */
export interface AssetOptions {
	/** 宽度(像素) */
	width?: number;
	/** 高度(像素) */
	height?: number;
	/** 适配模式 */
	fit?: "cover" | "contain" | "inside" | "outside";
	/** 输出格式;auto 让 Directus 按浏览器 Accept 头决定 */
	format?: "auto" | "webp" | "avif" | "jpg" | "png";
	/** 质量 1-100 */
	quality?: number;
	/** Directus 预设 key,优先级最高(后台 Settings → Storage Asset Presets 里定义) */
	key?: string;
	/** 强制下载 */
	download?: boolean;
}

export function assetUrl(
	fileId: string | null | undefined,
	options: AssetOptions = {},
): string {
	if (!fileId) return "";

	const base = `${DIRECTUS_URL}/assets/${fileId}`;
	const params = new URLSearchParams();

	if (options.key) {
		params.set("key", options.key);
	} else {
		if (options.width) params.set("width", String(options.width));
		if (options.height) params.set("height", String(options.height));
		if (options.fit) params.set("fit", options.fit);
		if (options.format) params.set("format", options.format);
		if (options.quality) params.set("quality", String(options.quality));
	}

	if (options.download) params.set("download", "true");

	const qs = params.toString();
	return qs ? `${base}?${qs}` : base;
}

/* ----------------------------------------------------------------------------
 * 便捷重导出
 * ----------------------------------------------------------------------------
 * 常用的 SDK 查询助手直接从这里导出,页面代码只 import 一次。
 * ---------------------------------------------------------------------------- */

export { readItems, readItem, readSingleton, aggregate };
