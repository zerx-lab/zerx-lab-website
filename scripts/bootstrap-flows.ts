/**
 * ============================================================================
 * ZerxLab Website - Directus Flows 引导脚本
 * ----------------------------------------------------------------------------
 * 当前管理的 Flow:
 *   1) notify-on-news-published
 *      触发: posts 集合 items.create (Action / Non-Blocking)
 *      条件: status = "published" 且 category.slug = "news"
 *      动作: Read 拉全字段 → Send Mail (Markdown) 发到 NOTIFY_EMAIL
 *
 *      用途: GitHub Actions 每天自动发布"每日技术资讯"(category=news,
 *            slug=daily-tech-news-YYYY-MM-DD) 后,Directus 自动发邮件提醒。
 *
 * 设计要点:
 *   - 全脚本幂等: 按 flow.name 查找,存在则 PATCH operations,不存在则 POST
 *   - operations 按 key 幂等(同一 flow 内 key 唯一)
 *   - 用 fetchDirectus() 直接打 /flows /operations REST,不走 SDK
 *   - $trigger / $last 这种 $-key 在 JSON.stringify 后能正确入库
 *     (curl 命令行里转义会被吃掉,但 fetch+JSON.stringify 没问题)
 *
 * 使用:
 *   bun run scripts/bootstrap-flows.ts
 *   或 package.json 里的 `bun run bootstrap:flows`
 *
 * 前置条件:
 *   - Directus 容器侧 SMTP 已配置 (EMAIL_TRANSPORT / EMAIL_FROM / EMAIL_SMTP_*)
 *     可以先在 Data Studio 里给某用户点 "Send Password Reset" 验证邮件能发出去
 * ============================================================================
 */

import { DirectusHttpError, fetchDirectus, log, runMain } from "./_shared";

/* ----------------------------------------------------------------------------
 * 配置
 * ---------------------------------------------------------------------------- */

/** 收件邮箱 - 与 Directus admin 账号一致 */
const NOTIFY_EMAIL = "1603852@qq.com";

/** 站点公开 URL,用于邮件正文里的文章链接 */
const SITE_URL = "https://zerx.dev";

/* ----------------------------------------------------------------------------
 * 类型(只覆盖本脚本会用到的字段)
 * ---------------------------------------------------------------------------- */

type FlowTrigger = "event" | "webhook" | "schedule" | "operation" | "manual";
type FlowStatus = "active" | "inactive";

interface DirectusFlow {
	id: string;
	name: string;
	icon?: string | null;
	color?: string | null;
	description?: string | null;
	status: FlowStatus;
	trigger: FlowTrigger;
	accountability?: "all" | "activity" | null;
	options?: Record<string, unknown> | null;
	operation?: string | null;
}

type OperationType =
	| "log"
	| "mail"
	| "notification"
	| "item-create"
	| "item-read"
	| "item-update"
	| "item-delete"
	| "request"
	| "sleep"
	| "transform"
	| "trigger"
	| "condition"
	| "exec";

interface DirectusOperation {
	id: string;
	name: string;
	key: string;
	type: OperationType;
	position_x: number;
	position_y: number;
	options: Record<string, unknown> | null;
	resolve: string | null;
	reject: string | null;
	flow: string;
}

/** 脚本里描述一个 operation 的最小结构(不含 id / flow / resolve / reject) */
interface OperationSpec {
	name: string;
	key: string;
	type: OperationType;
	position_x: number;
	position_y: number;
	options: Record<string, unknown>;
}

/* ----------------------------------------------------------------------------
 * 通用幂等辅助
 * ---------------------------------------------------------------------------- */

/** 按 name 查 flow (Directus 不强制 name 唯一,但本脚本约定唯一) */
async function findFlowByName(name: string): Promise<DirectusFlow | null> {
	const result = await fetchDirectus<DirectusFlow[]>("/flows", {
		query: {
			[`filter[name][_eq]`]: name,
			fields: "id,name,status,trigger,accountability,options,operation",
			limit: 1,
		},
	});
	const arr = Array.isArray(result.data) ? result.data : [];
	return arr[0] ?? null;
}

/** 列出 flow 下所有 operations (用于按 key upsert / 关系串接) */
async function listOperationsByFlow(
	flowId: string,
): Promise<DirectusOperation[]> {
	const result = await fetchDirectus<DirectusOperation[]>("/operations", {
		query: {
			[`filter[flow][_eq]`]: flowId,
			fields:
				"id,name,key,type,position_x,position_y,options,resolve,reject,flow",
			limit: -1,
		},
	});
	return Array.isArray(result.data) ? result.data : [];
}

interface FlowUpsertInput {
	name: string;
	icon: string;
	description: string;
	status: FlowStatus;
	trigger: FlowTrigger;
	accountability: "all" | "activity";
	options: Record<string, unknown>;
}

/**
 * 创建或更新 flow 主体(不含 operations)。
 * 已存在时 PATCH 覆盖 status/trigger/options/accountability/description/icon。
 * 不传 operation 字段 — 起点 operation id 单独在 chainOperations() 里设置。
 */
async function upsertFlow(input: FlowUpsertInput): Promise<DirectusFlow> {
	const existing = await findFlowByName(input.name);
	if (existing) {
		const result = await fetchDirectus<DirectusFlow>(`/flows/${existing.id}`, {
			method: "PATCH",
			body: {
				icon: input.icon,
				description: input.description,
				status: input.status,
				trigger: input.trigger,
				accountability: input.accountability,
				options: input.options,
			},
		});
		log.child(`更新 flow [${input.name}] (id=${existing.id})`);
		return result.data as DirectusFlow;
	}
	const result = await fetchDirectus<DirectusFlow>("/flows", {
		method: "POST",
		body: {
			name: input.name,
			icon: input.icon,
			description: input.description,
			status: input.status,
			trigger: input.trigger,
			accountability: input.accountability,
			options: input.options,
		},
	});
	log.child(`创建 flow [${input.name}] (id=${result.data?.id})`);
	return result.data as DirectusFlow;
}

/**
 * 按 key 在 flow 内 upsert 一个 operation。
 * 不在这里设置 resolve/reject(留给 chainOperations 后置串接,避免引用未创建的 id)。
 */
async function upsertOperation(
	flowId: string,
	existing: DirectusOperation[],
	spec: OperationSpec,
): Promise<DirectusOperation> {
	const found = existing.find((op) => op.key === spec.key);
	if (found) {
		const result = await fetchDirectus<DirectusOperation>(
			`/operations/${found.id}`,
			{
				method: "PATCH",
				body: {
					name: spec.name,
					type: spec.type,
					position_x: spec.position_x,
					position_y: spec.position_y,
					options: spec.options,
				},
			},
		);
		log.child(`更新 operation [${spec.key}] (id=${found.id})`);
		return result.data as DirectusOperation;
	}
	const result = await fetchDirectus<DirectusOperation>("/operations", {
		method: "POST",
		body: {
			flow: flowId,
			name: spec.name,
			key: spec.key,
			type: spec.type,
			position_x: spec.position_x,
			position_y: spec.position_y,
			options: spec.options,
		},
	});
	log.child(`创建 operation [${spec.key}] (id=${result.data?.id})`);
	return result.data as DirectusOperation;
}

/**
 * 按给定线性顺序串接 operations:
 *   ops[0].resolve = ops[1].id
 *   ops[1].resolve = ops[2].id
 *   ...
 *   末尾 .resolve = null
 *
 * 同时把 flow.operation(起点)指向 ops[0]。
 * 全部用 PATCH(只在与现状不一致时发请求,避免无意义写入)。
 */
async function chainOperations(
	flowId: string,
	ops: DirectusOperation[],
): Promise<void> {
	if (ops.length === 0) return;

	for (let i = 0; i < ops.length; i++) {
		const cur = ops[i];
		if (!cur) continue;
		const nextId = ops[i + 1]?.id ?? null;
		if (cur.resolve !== nextId) {
			await fetchDirectus(`/operations/${cur.id}`, {
				method: "PATCH",
				body: { resolve: nextId },
			});
			log.child(`串接 ${cur.key} → ${nextId ? ops[i + 1]?.key : "(末端)"}`);
		}
	}

	// 起点 operation 设到 flow 上
	const head = ops[0];
	if (!head) return;
	await fetchDirectus(`/flows/${flowId}`, {
		method: "PATCH",
		body: { operation: head.id },
	});
	log.child(`设置 flow.operation 起点 = ${head.key}`);
}

/* ----------------------------------------------------------------------------
 * Flow 1: notify-on-news-published
 * ----------------------------------------------------------------------------
 * 数据链(data chain)说明:
 *   $trigger.event      = "posts.items.create"
 *   $trigger.collection = "posts"
 *   $trigger.key        = 新建条目的主键(items.create 是单数 key,不是 keys)
 *   $trigger.payload    = items.create 时入库的字段(可能不全,取决于客户端提交了什么)
 *   $last               = 上一个 operation 的输出
 *   <operationKey>      = 该 operation 的输出
 *
 * 拓扑:
 *   [trigger event]
 *      ↓
 *   [check_news] condition
 *      └ resolve(命中) → [load_post] read
 *                            └ resolve → [send_mail] mail
 *      └ reject(不命中) → 流程终止
 * ---------------------------------------------------------------------------- */

const NEWS_FLOW_NAME = "notify-on-news-published";

async function ensureNotifyNewsPublishedFlow(): Promise<void> {
	log.step(1, `Flow: ${NEWS_FLOW_NAME}`);

	// 1. 主体
	const flow = await upsertFlow({
		name: NEWS_FLOW_NAME,
		icon: "mark_email_unread",
		description:
			"posts 集合新建已发布的资讯文章(category.slug=news)时,自动发邮件到 " +
			NOTIFY_EMAIL +
			"。由 GitHub Actions 每日资讯 workflow 触发。",
		status: "active",
		trigger: "event",
		// "all" 让 condition / read / mail 拥有 admin 等价权限
		// 否则匿名 accountability 读不到 posts.translations
		accountability: "all",
		options: {
			type: "action", // Action / Non-Blocking, 不阻塞 MCP 写入
			scope: ["items.create"],
			collections: ["posts"],
		},
	});

	// 2. operations
	const existing = await listOperationsByFlow(flow.id);

	// 2.1 condition: status=published 且 category 是 news 分类
	//   注意 category 在 payload 里通常是 number(M2O id),不是 slug
	//   所以我们改成: 让 condition 只判断 status=published,
	//   category 的判断放到 read 节点之后用第二个 condition(更稳)。
	//
	//   但为了减少节点数,这里采用更简洁的策略:
	//   - condition 只判断 $trigger.payload.status = published
	//   - read 节点用 ID 反查时带上 filter category.slug=news(命中 0 条则下游 send_mail
	//     的 {{ load_post[0].xxx }} 取不到,邮件标题为空 — 不理想)
	//
	//   最终采用方案:condition 用 read 节点的输出长度判断
	//   也就是: read → condition → mail
	//
	//   但这样 read 会对所有新建 post 都执行一次,浪费但安全。
	//   每天最多创建几篇文章,可以接受。
	//   注意 load_post 输出形态:
	//   - items.create 的 $trigger.key 是单个主键(单数)
	//   - item-read handler 内部 toArray(key) 后,长度=1 走 readOne → 返回单个对象
	//   - 多条创建场景才会走 readMany → 返回数组
	//   日报 workflow 一次只创建一篇,所以 load_post 是**对象**,模板里直接 .xxx
	//   不要写 [0]。
	//
	//   translations 用 deep._filter 过滤为只取 zh-CN,这样 translations[0]
	//   就一定是中文版本(否则 zh-CN/en-US 顺序不保证)。
	const opLoadPost = await upsertOperation(flow.id, existing, {
		name: "Load Post",
		key: "load_post",
		type: "item-read",
		position_x: 19,
		position_y: 1,
		options: {
			collection: "posts",
			// items.create 事件 $trigger 形态(实测 Directus 11.12):
			//   { event: "posts.items.create", payload: {...}, key: 10, collection: "posts" }
			// 注意是 `key`(单数,单条 create)而非 `keys`(复数)。
			// 文档里的 "$trigger.keys" 适用于 manual / update / delete 这种可能多条的场景。
			// 用错了会变成字符串 "undefined",ItemsService 抛误导性的
			// "You don't have permission to access this." 错误。
			key: "{{ $trigger.key }}",
			query: {
				fields: [
					"id",
					"slug",
					"status",
					"date_published",
					"category.slug",
					"translations.languages_code",
					"translations.title",
					"translations.excerpt",
					"translations.content",
				],
				deep: {
					translations: {
						_filter: {
							languages_code: { _eq: "zh-CN" },
						},
					},
				},
			},
			permissions: "$full",
			emitEvents: false,
		},
	});

	// 2.2 condition: status=published 且 category.slug=news
	//   load_post 是对象(单条 readOne),直接对路径求值。
	const opCheckNews = await upsertOperation(flow.id, existing, {
		name: "Check Is News & Published",
		key: "check_news",
		type: "condition",
		position_x: 37,
		position_y: 1,
		options: {
			filter: {
				load_post: {
					status: { _eq: "published" },
					category: {
						slug: { _eq: "news" },
					},
				},
			},
		},
	});

	// 2.3 mail: 中文标题 + 摘要 + 完整中文正文 + 双语链接
	//   邮件正文用 Markdown,Directus 的模板引擎({{ }})会替换变量。
	//   load_post 是对象(单条),translations 经 deep filter 后只剩 zh-CN 一项,
	//   所以 translations[0] 一定是中文版。
	const opSendMail = await upsertOperation(flow.id, existing, {
		name: "Send Notify Mail",
		key: "send_mail",
		type: "mail",
		position_x: 55,
		position_y: 1,
		options: {
			to: [NOTIFY_EMAIL],
			subject: "[ZerxLab] 新资讯已发布: {{ load_post.translations[0].title }}",
			type: "markdown",
			body: [
				"# 📰 ZerxLab 每日资讯已上线",
				"",
				"**标题**: {{ load_post.translations[0].title }}",
				"",
				"**摘要**: {{ load_post.translations[0].excerpt }}",
				"",
				"**发布时间**: {{ load_post.date_published }}",
				"",
				`- 中文版: ${SITE_URL}/blog/{{ load_post.slug }}`,
				`- English: ${SITE_URL}/en/blog/{{ load_post.slug }}`,
				"",
				"---",
				"",
				"## 正文",
				"",
				"{{ load_post.translations[0].content }}",
				"",
				"---",
				"",
				"_This email was sent by Directus Flow `" + NEWS_FLOW_NAME + "`._",
			].join("\n"),
		},
	});

	// 3. 串接: load_post → check_news → send_mail
	//    check_news reject 路径不指向任何节点 = 流程终止 = 不发邮件
	await chainOperations(flow.id, [opLoadPost, opCheckNews, opSendMail]);

	log.success(
		`Flow [${NEWS_FLOW_NAME}] 已就绪 (id=${flow.id}, status=${flow.status})`,
	);
	log.info(
		"测试方法: 在 Directus 里手动建一篇 status=published / category=news 的 posts," +
			"几秒后查收 " +
			NOTIFY_EMAIL +
			" 邮箱。",
	);
	log.info(
		"如收不到邮件,先在 Data Studio 给某用户点 Send Password Reset 排查 SMTP。",
	);
}

/* ----------------------------------------------------------------------------
 * 入口
 * ---------------------------------------------------------------------------- */

async function main(): Promise<void> {
	await ensureNotifyNewsPublishedFlow();
}

void runMain("bootstrap-flows", main).catch((err: unknown) => {
	if (err instanceof DirectusHttpError) {
		log.error(`HTTP ${err.status} on ${err.method} ${err.path}`, err.body);
	} else {
		log.error("bootstrap-flows 失败", err);
	}
	process.exit(1);
});
