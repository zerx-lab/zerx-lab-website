# ZerxLab Website

> ZerxLab 官网与博客，基于 Astro 6 的全静态双语站点，内容全部随仓库版本化。

线上地址：[zerx.dev](https://zerx.dev)

---

## 技术栈

| 层       | 选型                                                                    |
| :------- | :---------------------------------------------------------------------- |
| 框架     | [Astro 6](https://astro.build/) (`output: "static"`，全站构建期预渲染) |
| UI       | Tailwind CSS v4 (CSS-first) + 少量 React 19 交互岛                      |
| 内容源   | 仓库内 Markdown（Astro Content Collections，见 `src/content/`）          |
| Markdown | Astro 内置 remark/rehype + Shiki（双主题 github-light / github-dark-dimmed） |
| 包管理   | Bun                                                                      |
| 部署     | GitHub Actions 构建 + `rsync` 到自有服务器（OpenResty 伺服静态文件）      |

---

## 特性

- **双语路由**：`/` 中文（默认无前缀）、`/en/` 英文，目录即路由，不依赖 Astro 内建 i18n
- **全静态预渲染**：构建期一次性读完 `src/content/**` 生成全部页面，产物是纯静态文件，运行时零外部依赖、零服务端进程
- **博客能力**：分页与分类走路径而非查询参数（`/blog/page/2`、`/blog/cat/news`）、客户端搜索（构建期产出 `/search/<lang>.json` 静态索引，输入即过滤并高亮命中词）、TOC 目录、代码高亮、阅读时长、按语言拆分的 RSS feed、giscus 评论（未配置时静默跳过）
- **移动端完整适配**：`< md` 汉堡菜单，`< lg` 双栏塌陷，TOC 默认展开
- **SEO**：sitemap 带 `hreflang`、canonical URL、双语 RSS feed、OG 图

---

## 目录结构

```text
zerx-lab-website/
├── public/                     # 静态资源（favicon 等），原样发布到站点根
├── scripts/
│   └── serve-dist.mjs          # 本地伺服 dist/ 的最小静态服务器，用于冒烟
├── src/
│   ├── content/                # 唯一内容源
│   │   ├── posts/<slug>/       # 文章：{zh,en}.md，一篇两语言两文件
│   │   └── data/*.json         # 站点 / 作者 / 分类 / 标签 / 项目 / AUR / 语言占比
│   ├── content.config.ts       # Content Collections schema 定义（内容 = 唯一真相源）
│   ├── pages/                  # 路由：/ (zh) 与 /en/* (en) 对称
│   │   ├── blog/               # /blog、/blog/page/<n>、/blog/cat/<cat>[/page/<n>]、/blog/<slug>
│   │   ├── search/[lang].json.ts   # 构建期产出的客户端搜索索引
│   │   ├── en/                 # 英文镜像路由
│   │   ├── about.astro / aur.astro / projects.astro / 404.astro
│   │   └── rss.xml.ts          # 按语言拆分的 RSS
│   ├── components/             # 布局 / blog（含评论区 Comments.astro）/ home / projects / ui
│   │   └── home/ProjectShowcase.astro  # 首页项目九宫格：构建期按 GitHub star 降序动态生成
│   ├── layouts/
│   ├── lib/
│   │   ├── content.ts          # 内容访问层：双语字段解包、data/* 读取
│   │   ├── queries/            # 页面级查询：posts / site-settings / projects（GitHub 实时清单 × 内容登记）
│   │   ├── reading-time.ts     # 阅读时长估算
│   │   ├── highlight.ts        # 搜索命中高亮
│   │   ├── github.ts           # 构建期拉 GitHub 仓库清单与 stars（可选，见环境变量）
│   │   └── aur-rpc.ts          # 构建期拉 AUR RPC 数据
│   ├── i18n/                   # 自建 i18n（ui.ts 文案 + utils.ts 工具）
│   └── styles/global.css       # Tailwind v4 CSS-first + 设计 tokens
├── astro.config.mjs
└── package.json
```

详细的架构说明见 `astro.config.mjs` 与 `src/content.config.ts` 内的注释，关键决策均在文件头注明。

---

## 内容结构

内容全部以文件形式随仓库版本化，构建期由 Astro Content Layer 静态读取，schema 定义见 `src/content.config.ts`。

### `src/content/posts/<slug>/{zh,en}.md`

一篇文章两语言两个文件，共享同一个 `slug` 目录名（URL 靠 `/en/` 前缀区分，不翻译 slug）。frontmatter 字段：

| 字段              | 类型               | 默认值    | 说明                                                             |
| :---------------- | :----------------- | :-------- | :----------------------------------------------------------------- |
| `title`           | `string`            | 必填      | 标题，语言相关                                                     |
| `excerpt`         | `string`            | `""`      | 摘要，用于列表卡片、搜索索引，语言相关                              |
| `coverLabel`      | `string`            | `""`      | 无封面图时列表卡片上显示的大字标签，语言相关                        |
| `seoTitle`        | `string?`           | 无        | 覆盖 `<title>`，缺省时用 `title`                                    |
| `seoDescription`  | `string?`           | 无        | 覆盖 meta description，缺省时用 `excerpt`                           |
| `date`            | `date`              | 必填      | 发布时间（ISO），**语言无关，以 zh.md 为准**                        |
| `updatedDate`     | `date?`             | 无        | 更新时间，语言无关，以 zh.md 为准                                   |
| `author`          | `string`            | `"zerx"`  | 作者 slug，对应 `data/authors.json`，语言无关                       |
| `category`        | `string`            | `"notes"` | 分类 slug，对应 `data/categories.json`，语言无关                    |
| `tags`            | `string[]`          | `[]`      | 标签 slug 数组，对应 `data/tags.json`，语言无关                     |
| `featured`        | `boolean`           | `false`   | 是否在首页 / 精选位展示，语言无关                                   |
| `cover`           | `string?`           | 无        | 封面图 URL 或 `/public` 下的绝对路径；不设置则用 `coverLabel` 展示  |
| `draft`           | `boolean`           | `false`   | `true` 时不进入任何列表 / feed / sitemap，也不生成详情页            |

**双语约定**：语言无关字段（`date` / `updatedDate` / `author` / `category` / `tags` / `featured` / `cover` / `draft`）**以 `zh.md` 为准**，`en.md` 里的同名字段仅为 schema 完整性保留，读取时会被忽略——避免两份文件对同一事实各写一份导致漂移。`en.md` 缺失时，英文页正文回落到中文版（与全站 i18n 策略一致）。

### `src/content/data/*.json`

| 文件                  | 内容                                                                                          |
| :--------------------- | :---------------------------------------------------------------------------------------------- |
| `site.json`            | 单例。站点名、标语、描述、社交链接、建站年份、地点、关注方向、贡献者数、OG 图                     |
| `authors.json`         | 作者资料数组：slug、name、avatar、github、x、email、bio（双语）                                  |
| `categories.json`      | 分类数组：slug、name（双语）、description（双语）                                                |
| `tags.json`            | 标签数组：slug、name（双语）                                                                     |
| `projects.json`        | 项目**登记**数组：slug、name、description、techStack、kind、各类链接、featured、highlights。stars/forks/language 只是快照，构建期 GitHub 可达时以 API 为准；首页与 `/projects` 的清单与排序都由 `src/lib/queries/projects.ts` 从 GitHub 账号仓库实时生成，本文件负责补双语文案 |
| `aur.json`              | AUR 包数组：slug、name、version（静态快照）、description、badges、aurUrl、upstreamUrl、maintained |
| `language-stats.json`  | 语言占比条：name、percent、color（GitHub linguist 配色）                                          |

所有面向读者的双语字段统一为 `{ zh: string; en: string }` 形状，由 `src/lib/content.ts` 的 `pickLang()` 按当前语言解包（缺失时回落中文）。

---

## 本地开发

### 环境要求

- Node.js ≥ 22.12（与 `package.json` 的 `engines.node` 对齐）
- [Bun](https://bun.sh/) ≥ 1.0

### 启动

```sh
# 1. 安装依赖
bun install

# 2. 配置环境变量（全部可选，缺省也能正常构建）
cp .env.example .env

# 3. 启动 dev server
bun dev            # http://localhost:4321
```

### 常用命令

| Command               | 作用                                                                 |
| :--------------------- | :--------------------------------------------------------------------- |
| `bun dev`              | 本地开发服务器（带 HMR）                                                |
| `bun build`            | 生产构建，产出纯静态产物 `./dist/`                                      |
| `bun preview`          | 预览生产构建                                                            |
| `bun lint`             | `astro check` 类型与模板诊断                                            |
| `bun format`           | Prettier 格式化 astro/ts/tsx/md/mdx/json                                |

---

## 环境变量

全部变量均为**构建期**使用，运行时（静态产物）不需要任何环境变量。详见 `.env.example` 里每项的中文说明。

| 变量                        | 用途                                       | 必填                             |
| :--------------------------- | :------------------------------------------- | :--------------------------------- |
| `SITE_URL`                   | 站点 canonical 域名（RSS/sitemap 绝对 URL）   | 可选（默认 `https://zerx.dev`）   |
| `GITHUB_TOKEN`                | 构建时拉取 GitHub repo stars/forks（提升限流额度） | 可选（不配则用内容快照兜底）      |
| `PUBLIC_GISCUS_REPO`          | giscus 评论所在仓库（`owner/repo`）           | 可选（四项缺一即不渲染评论区）     |
| `PUBLIC_GISCUS_REPO_ID`       | 上述仓库的 GitHub ID                          | 可选                                |
| `PUBLIC_GISCUS_CATEGORY`      | giscus Discussion 分类名                      | 可选                                |
| `PUBLIC_GISCUS_CATEGORY_ID`   | 上述分类的 ID                                 | 可选                                |

---

## 部署（rsync 到自有服务器）

push 到 `main` 触发 `.github/workflows/deploy.yml`：`bun install` → `bun build` → `rsync -az --delete dist/` 推到服务器站点根目录 → 从服务器本机回源自检首页 200。

**GitHub Secrets（敏感）：**

| Secret                | 说明                                                                    |
| :-------------------- | :---------------------------------------------------------------------- |
| `DEPLOY_SSH_KEY`      | 部署用 ed25519 私钥；公钥在服务器 `~/.ssh/authorized_keys`，注释为 `github-actions-deploy@zerx-lab-website` |
| `DEPLOY_KNOWN_HOSTS`  | 服务器 SSH 主机公钥，钉住防中间人（不用 `StrictHostKeyChecking=no`）      |

**GitHub Variables（非敏感）：**

| Variable      | 当前值                                  | 说明                                            |
| :------------ | :-------------------------------------- | :---------------------------------------------- |
| `DEPLOY_HOST` | `8.211.176.172`                         | 服务器地址                                       |
| `DEPLOY_USER` | `root`                                  | SSH 用户                                         |
| `DEPLOY_PATH` | `/opt/1panel/www/sites/zerx.dev/index`  | 站点根目录，**必须落在 nginx 容器能读到的挂载点内** |

> `--delete` 会清掉目标目录里不属于本次构建的文件——`DEPLOY_PATH` 必须是站点专用目录，不要指向任何还放着别的东西的路径。

> Web 服务器（1Panel / OpenResty）侧的站点、证书、缓存头由人工在面板里配置，仓库不管这一层。

---

## 每日技术资讯自动发布

仓库内置一条 GitHub Actions 工作流 `.github/workflows/daily-tech-news.yml`，每天北京时间 07:00（UTC 23:00）自动运行：

1. Claude Code Action 加载 `.claude/skills/daily-tech-news/SKILL.md` 技能，WebSearch + WebFetch 多源搜集全球技术资讯，交叉验证、重要性评分、Top 3 深度分析
2. 按 `src/content.config.ts` 的 posts schema，直接在仓库里写出两个文件：
   `src/content/posts/daily-tech-news-<YYYY-MM-DD>/zh.md` 与 `en.md`
   frontmatter 必须含 `title`、`excerpt`、`coverLabel`、`date`（当天 ISO）、`author: "ai"`、`category: "news"`、`tags`（含 `"daily-news"`）、`featured: false`
3. 工作流校验 frontmatter 完整性与正文非占位符（长度、无 `TBD`/`TODO` 等子串）
4. `git commit` + `push` 到 `main`
5. 显式调用 `deploy.yml`（reusable workflow，带上刚 push 的 SHA）重新构建并 rsync 到服务器
   —— GitHub 禁止默认 `GITHUB_TOKEN` 推送触发新 workflow，所以 push 本身**不会**自动部署，必须显式调用
6. 站点上线后，用 `dawidd6/action-send-mail`（已钉 commit SHA）通过 SMTP 给订阅者发信（邮件里的链接此时必然可访问）

**GitHub Secrets（敏感，值不可见）：**

| Secret                    | 说明                                                      |
| :------------------------ | :-------------------------------------------------------- |
| `CLAUDE_CODE_OAUTH_TOKEN` | Claude Code Action 授权（本地 `claude setup-token` 生成）  |
| `SMTP_USER`               | 发信邮箱账号                                               |
| `SMTP_PASS`               | 发信邮箱密码 / 授权码                                       |
| `PUBLIC_GISCUS_*`（可选） | 启用评论区时的四项 giscus 配置，供构建期注入                 |

**GitHub Variables（非敏感，值可见可改）：**

| Variable    | 当前值                | 说明                                                        |
| :---------- | :-------------------- | :---------------------------------------------------------- |
| `SMTP_HOST` | `smtp.163.com`        | SMTP 服务器地址                                              |
| `SMTP_PORT` | `465`                 | 465 = 隐式 TLS；587 / 25 = STARTTLS，工作流按端口自动判定     |
| `MAIL_FROM` | `17600575208@163.com` | 发件地址（163 要求与 `SMTP_USER` 一致）                       |
| `MAIL_TO`   | `1603852@qq.com`      | 收件人，**逗号分隔**；加订阅者只需编辑这一个变量               |

> 加订阅者：`gh variable set MAIL_TO --body "a@x.com,b@y.com"`，或在 Settings → Secrets and variables → Actions → Variables 里直接改。
> 人数多了建议换成邮件列表别名——163 单封信的收件人数量有上限。

**手动触发 / 指定日期：**

在 GitHub Actions 页面点 "Run workflow"，可选填 `date` 参数（`YYYY-MM-DD`），留空则用北京时间昨天。

---

## 关键约定

- **i18n 走目录结构，不启用 Astro 内建 i18n**：避免 `/en` 虚拟路由与实体目录 `/en/` 冲突。所有翻译字典在 `src/i18n/ui.ts`，工具函数在 `src/i18n/utils.ts`
- **`src/content/` 为唯一内容源**：构建期静态读取，不存在运行时数据源或降级链路
- **博客分页 / 分类走路径，不用查询参数**：`/blog/page/2`、`/blog/cat/news`、`/blog/cat/news/page/2`，中英文结构对称（英文加 `/en` 前缀）
- **搜索在客户端完成**：构建期产出 `/search/<lang>.json` 静态索引，列表页加载后在浏览器里过滤匹配、高亮命中词，不依赖任何后端
- **RSS 按语言拆分**：`/rss.xml` 为中文，`/en/rss.xml` 为英文，符合 RSS 2.0 `<language>` 语义
- **Surgical changes**：代码风格贴合既有模式，改动只涉及需求本身

---

## License

MIT © ZerxLab
