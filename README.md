# ZerxLab Website

> ZerxLab 官网与博客，基于 Astro 6 + Directus 11 的全站 SSR 双语站点。

线上地址：[zerx.dev](https://zerx.dev) · CMS：[directus.zerx.dev](https://directus.zerx.dev)

---

## 技术栈

| 层       | 选型                                                                 |
| :------- | :------------------------------------------------------------------- |
| 框架     | [Astro 6](https://astro.build/) (`output: "server"`, Node standalone) |
| UI       | Tailwind CSS v4 (CSS-first) + 少量 React 19 交互岛                    |
| 内容源   | [Directus 11](https://directus.io/) (唯一数据源，实时 SSR)            |
| Markdown | `marked` + `marked-shiki` (双主题 github-light / github-dark-dimmed)  |
| 包管理   | 本地 Bun，镜像内 npm ci                                              |
| 部署     | Docker 多阶段构建，Dokploy 托管                                      |

---

## 特性

- **双语路由**：`/` 中文（默认无前缀）、`/en/` 英文，目录即路由，不依赖 Astro 内建 i18n
- **全站 SSR**：Directus 后台改动对用户立即可见，缓存由 `src/middleware.ts` 统一下发 `Cache-Control`，边缘缓存交给上游 CDN / nginx
- **博客能力**：分页（`?page=N`）、按当前页面语言对 `title + excerpt + content` 做 `_icontains` 模糊搜索并在列表高亮、TOC 目录、代码高亮、阅读时长、按语言拆分的 RSS feed
- **Directus 一键初始化**：`scripts/bootstrap-directus.ts` 幂等地建 collections / fields / relations / roles / policies / 受限 AI Writer 身份，配套 `seed` 与 `typegen`
- **三层降级**：Directus → `src/lib/fallback-data.ts` → 空值/404，离线或 CMS 未就绪也能出页
- **移动端完整适配**：`< md` 汉堡菜单，`< lg` 双栏塌陷，TOC 默认展开
- **SEO**：sitemap 带 `hreflang`、canonical URL、双语 RSS feed、OG 图

---

## 目录结构

```text
zerx-lab-website/
├── public/                     # 静态资源（favicon 等）
├── scripts/
│   ├── bootstrap-directus.ts   # 幂等初始化 Directus 结构
│   ├── seed-directus.ts        # 把 fallback-data 灌进 Directus
│   ├── generate-directus-types.ts  # 基于 OpenAPI 生成类型
│   └── _shared.ts
├── src/
│   ├── pages/                  # 路由：/ (zh) 与 /en/* (en) 对称
│   │   ├── blog/               # 博客列表 + 详情
│   │   ├── en/                 # 英文镜像路由
│   │   ├── about.astro
│   │   ├── aur.astro
│   │   ├── projects.astro
│   │   ├── 404.astro
│   │   └── rss.xml.ts          # 按语言拆分的 RSS
│   ├── components/             # 布局 / blog / projects / ui
│   ├── layouts/
│   ├── lib/
│   │   ├── queries/            # Directus 查询（posts / site-settings ...）
│   │   ├── fallback-data.ts    # 降级数据
│   │   └── markdown.ts         # marked + shiki 管线
│   ├── i18n/                   # 自建 i18n（ui.ts 文案 + utils.ts 工具）
│   ├── styles/global.css       # Tailwind v4 CSS-first + 设计 tokens
│   └── middleware.ts           # 统一 Cache-Control
├── astro.config.mjs
├── Dockerfile                  # 三阶段构建（deps / build / runner）
├── docker-compose.yml
└── package.json
```

详细的架构说明见 `astro.config.mjs` 与 `Dockerfile` 内的注释，关键决策均在文件头注明。

---

## 本地开发

### 环境要求

- Node.js ≥ 22.12（与 `package.json` 的 `engines.node` 对齐）
- [Bun](https://bun.sh/) ≥ 1.0（本地开发首选，镜像内不需要）

### 启动

```sh
# 1. 安装依赖
bun install

# 2. 配置环境变量
cp .env.example .env
#   填入 DIRECTUS_URL / DIRECTUS_READ_TOKEN / SITE_URL
#   （如需跑 bootstrap/seed 还要 DIRECTUS_ADMIN_TOKEN）

# 3. 启动 dev server
bun dev            # http://localhost:4321
```

### 常用命令

| Command          | 作用                                                               |
| :--------------- | :----------------------------------------------------------------- |
| `bun dev`        | 本地开发服务器（带 HMR）                                           |
| `bun build`      | 生产构建，产出 `./dist/`（`dist/server/entry.mjs` 为 SSR 入口）    |
| `bun preview`    | 预览生产构建                                                       |
| `bun lint`       | `astro check` 类型与模板诊断                                       |
| `bun format`     | Prettier 格式化 astro/ts/tsx/md/mdx/json                           |
| `bun bootstrap`  | 幂等初始化 Directus（collections / fields / roles / AI Writer 等） |
| `bun seed`       | 把 `fallback-data.ts` 灌进 Directus，用于冷启动                     |
| `bun typegen`    | 根据 Directus OpenAPI 生成 TS 类型                                 |

---

## 环境变量

| 变量                      | 用途                                       | 必填          |
| :------------------------ | :----------------------------------------- | :------------ |
| `DIRECTUS_URL`            | Directus 实例地址                          | ✅            |
| `DIRECTUS_READ_TOKEN`     | 运行时读数据用的受限 token                 | ✅            |
| `SITE_URL`                | 站点 canonical 域名（RSS/sitemap 绝对 URL） | ✅（默认 `https://zerx.dev`） |
| `DIRECTUS_ADMIN_TOKEN`    | 仅 `bootstrap` / `seed` / `typegen` 需要   | 脚本场景      |
| `DIRECTUS_AI_WRITER_TOKEN`| bootstrap 每次轮换生成，供 MCP 写作身份 + 每日资讯 workflow 发布用 | 自动产出 |
| `HOST` / `PORT`           | Node 监听地址（镜像默认 `0.0.0.0:4321`）   | 可选          |

---

## 部署（Docker）

Dockerfile 采用 `deps → build → runner` 三阶段，最终镜像只含生产依赖与 `./dist`，以非 root `node` 用户运行。

```sh
# 构建并启动
docker compose up -d --build

# 跟日志
docker compose logs -f website

# 停止
docker compose down
```

注意：

- 构建阶段**不注入** `DIRECTUS_*` 变量 —— SSR 模式下数据拉取全在运行时，避免 token 被固化到镜像层
- 容器内置 `HEALTHCHECK` 命中首页 `/` 判活，`start-period=20s` 留给冷启动
- 生产反向代理（Dokploy / Cloudflare / nginx）负责 TLS 与边缘缓存，消费 `middleware.ts` 下发的 `Cache-Control`

---

## Directus 数据模型

由 `scripts/bootstrap-directus.ts` 幂等建立，核心 collections：

- `site_settings`（单例）— 站点标题、描述、og_image 等
- `authors` — 作者资料（avatar 为 file 关系）
- `categories` / `tags` — 分类与标签
- `posts` + `posts_translations` — 博客正文（中英翻译，字段级 i18n）
- `projects` + `projects_translations` — 项目展示
- `aur_packages` — AUR 包列表

权限模型：

- **Reader 角色**：只读，绑定 `DIRECTUS_READ_TOKEN`，给前端 SSR 使用
- **AI Blog Writer 角色**：受限写权限（仅 `posts` / `posts_translations`），绑定专用用户与 token，配套 system prompt 通过 MCP 供 AI 写作

---

## 每日技术资讯自动发布（MCP 直发）

仓库内置一条 GitHub Actions 工作流 `.github/workflows/daily-tech-news.yml`，每天北京时间 07:00（UTC 23:00）自动运行。Claude Code 通过 **Directus MCP 一步到位** 搜集全球技术资讯并直接发布到 Directus，全程不经任何中转文件或脚本。

**流程：**

1. Claude Code Action 加载 `.claude/skills/daily-tech-news/SKILL.md` 技能
2. **Phase 0**：通过 `mcp__directus__items` 查近 7 天已发文章建立去重基线，查出 `ai` 作者 / `news` 分类 / tags 的 id
3. **Phase 1-4**：WebSearch + WebFetch 多源搜集 → 交叉验证 → 重要性评分 → Top 3 深度分析 → 双语正文撰写
4. **Phase 5**：`mcp__directus__items` 一次性 `create`（带嵌套 translations + tags）或 `update` 已有文章到 `posts` 集合，`status=published`

**身份与权限：**

- Directus MCP 用 `DIRECTUS_AI_WRITER_TOKEN` 鉴权（走 AI Writer policy）
- `bootstrap-directus.ts` 已放宽该 policy：允许 posts 任意 status，允许 create 新 author / category / tag（不能修改/删除已有），仍禁止 delete 与其它集合的写入
- Directus `settings.mcp_system_prompt` 写入了软约束：交互式 MCP 对话用 `draft`，自动化脚本调度（本 workflow）用 `published`
- 固定作者 `slug=ai`，固定分类 `slug=news`，均由 `seed-directus.ts` 预置

**GitHub Secrets（仓库需配置）：**

| Secret                      | 说明                                       |
| :-------------------------- | :----------------------------------------- |
| `CLAUDE_CODE_OAUTH_TOKEN`   | Claude Code Action 授权（本地 `claude setup-token` 生成） |
| `DIRECTUS_URL`              | Directus 实例地址（如 `https://directus.zerx.dev`） |
| `DIRECTUS_AI_WRITER_TOKEN`  | 与本地 `.env` 同名的 token，Directus MCP 鉴权用 |

**首次启用前需跑一次：**

```sh
bun bootstrap    # 同步放宽后的 AI Writer policy + 更新 system prompt
bun seed         # 预置 ai 作者、news 分类、daily-news 等新 tags
```

**手动触发 / 指定日期：**

在 GitHub Actions 页面点 "Run workflow"，可选填 `date` 参数（`YYYY-MM-DD`），留空则用北京时间昨天。Claude 最终会输出 `PUBLISHED: daily-tech-news-YYYY-MM-DD` 作为成功标志，发布后前端立即可访问 `https://zerx.dev/blog/daily-tech-news-YYYY-MM-DD`。

**MCP endpoint 验证：**

```sh
# 握手测试(需把 <TOKEN> 替换为 DIRECTUS_AI_WRITER_TOKEN)
curl -X POST https://directus.zerx.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
```

返回 `serverInfo.name === "directus-mcp"` 即表示 MCP 可用。

---

## 关键约定

- **i18n 走目录结构，不启用 Astro 内建 i18n**：避免 `/en` 虚拟路由与实体目录 `/en/` 冲突。所有翻译字典在 `src/i18n/ui.ts`，工具函数在 `src/i18n/utils.ts`
- **Directus 为唯一数据源**：`fallback-data.ts` 仅用于 CMS 不可达时降级，不承担业务真实态
- **RSS 按语言拆分**：`/rss.xml` 为中文，`/en/rss.xml` 为英文，符合 RSS 2.0 `<language>` 语义
- **Surgical changes**：代码风格贴合既有模式，改动只涉及需求本身

---

## License

MIT © ZerxLab