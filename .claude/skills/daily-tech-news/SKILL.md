---
name: daily-tech-news
description: "每日技术资讯搜集。多源搜索 AI、GitHub、前端、后端、开源等领域的最新技术动态，通过 Directus MCP 直接 create/update posts 发布到 ZerxLab 博客（中英双语 + 多源交叉验证 + 重要性评分）。关键词：资讯、新闻、daily news、tech news、AI news、GitHub trending、MCP 发布。"
---

# Daily Tech News - 每日技术资讯（Directus MCP 直发版）

自动搜索并汇总当日技术资讯，采用**多源交叉验证 + 深度调研 + 重要性评分**机制，**通过 Directus MCP 直接 create/update `posts` 集合**，一步到位发布到 ZerxLab 博客。

---

## ⚠️ 本 Skill 的核心架构

运行在 **zerx-lab-website** 仓库，数据源是 **Directus 11**。发布走 **Directus MCP**（不是 MDX，不是 JSON → 脚本）：

```text
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Claude Code      │     │ Directus MCP     │     │ Directus 11      │
│ (GitHub Actions) │────▶│ /mcp (HTTP)      │────▶│ posts            │
│ WebSearch        │     │ Bearer           │     │ posts_translations│
│ WebFetch         │     │ AI_WRITER_TOKEN  │     │ posts_tags       │
│ mcp__directus__* │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

与传统的"MDX + git push"或"生成 JSON + 脚本写库"方案**都不一样**。Claude 全程**只用 MCP 工具调 Directus**，发布完成即可见。

---

## ⚠️ 必需参数

调用此 skill 时必须在 prompt 中指定目标日期：

```text
TARGET_DATE: YYYY-MM-DD 格式的日期
示例: 2026-04-17
```

执行过程中的所有日期（slug、date_published、标题、搜索关键词）都必须使用此 TARGET_DATE。**禁止**使用"今天 / 昨天"等相对日期。

日期派生规则：
- slug：`daily-tech-news-{TARGET_DATE}`（例：`daily-tech-news-2026-04-17`）
- `date_published`：`{TARGET_DATE}T00:00:00.000Z`
- 中文标题日期：转中文格式（例：`2026年04月17日`）
- 英文标题日期：`Apr 17, 2026` 格式
- cover_label：日期缩写（例：`04/17`）

---

## ⚠️ status 判定规则

Directus system prompt 里的软约束：

| 场景 | status | 判断依据 |
|---|---|---|
| MCP 交互式对话（真人实时驱动） | `draft` | 需人工审核 |
| **GitHub Actions 自动化脚本调度（本场景）** | **`published`** | 受控批量产出 |

本 skill 在 **workflow 调度场景**下运行，一律 **`status = "published"`** 直接上线。

---

## 核心理念

> **准确性第一** → 多源交叉验证 + 深度阅读原文
> **质量优于数量** → 重要性评分筛选 + 去重降噪
> **深度优于广度** → Top 3 资讯深度分析 + 技术解读
> **双语对等** → 中英两版独立撰写，拒绝机翻

---

## Phase 0：Directus MCP 建立工作基线（必须最先执行）

在任何 WebSearch 之前，**必须**按顺序调用 Directus MCP，建立 5 项上下文：

### Step 0.1：读取 Directus system prompt（MCP 强制要求）

```json
mcp__directus__system-prompt  (无参数)
```

这会注入 Directus 侧的硬/软约束，你后续所有写操作都必须遵守。

### Step 0.2：查近 7 天已发文章（去重基线）

```json
mcp__directus__items
{
  "action": "read",
  "collection": "posts",
  "query": {
    "fields": [
      "id", "slug", "date_published",
      "translations.languages_code",
      "translations.title",
      "translations.excerpt"
    ],
    "filter": {
      "_and": [
        { "slug": { "_starts_with": "daily-tech-news-" } },
        { "date_published": { "_gte": "$NOW(-7 days)" } }
      ]
    },
    "sort": ["-date_published"],
    "limit": 10
  }
}
```

**用途**：从返回结果的 title + excerpt（中英双语都看）提取已报道的项目名 / 公司名 / 事件关键词，形成 `EXCLUDE_LIST`。Phase 2/3 搜索与评分时主动剔除已覆盖事件。同一产品的"增量进展"可以报，但必须写明与已有报道的差异。

### Step 0.3：检查目标 slug 是否已存在（决定 create vs update）

```json
mcp__directus__items
{
  "action": "read",
  "collection": "posts",
  "query": {
    "fields": ["id", "slug", "status"],
    "filter": { "slug": { "_eq": "daily-tech-news-{TARGET_DATE}" } },
    "limit": 1
  }
}
```

- 返回空数组 → 后面走 **create**
- 返回一条记录 → 后面走 **update**，记下返回的 `id`（即 `EXISTING_POST_ID`）

### Step 0.4：查元数据 id（author / category）

作者：
```json
mcp__directus__items
{
  "action": "read",
  "collection": "authors",
  "query": { "fields": ["id", "slug"], "filter": { "slug": { "_eq": "ai" } }, "limit": 1 }
}
```

分类：
```json
mcp__directus__items
{
  "action": "read",
  "collection": "categories",
  "query": { "fields": ["id", "slug"], "filter": { "slug": { "_eq": "news" } }, "limit": 1 }
}
```

记下 `AI_AUTHOR_ID` 和 `NEWS_CATEGORY_ID`。

**如果 ai 作者或 news 分类不存在**（比如 seed 还没跑）：
- 按 system prompt 权限（可 create authors / categories）自行新建
- authors 需带 translations：`[{"languages_code":"zh-CN","bio":"..."},{"languages_code":"en-US","bio":"..."}]`
- categories 同样需双语 translations（含 name + description）

### Step 0.5：查所有 tags（准备 M2M 关联）

```json
mcp__directus__items
{
  "action": "read",
  "collection": "tags",
  "query": { "fields": ["id", "slug"], "limit": -1 }
}
```

建立 `slug → id` 映射。本次文章需要用的 tag_slug（按内容动态选）：

| 标准 tag_slug | 含义 | 何时挂 |
|---|---|---|
| `daily-news` | 每日资讯 | **必挂**（每篇都要） |
| `ai` | AI 总括 | 当日 AI 分类有内容 |
| `llm` | 大模型 | 涉及具体 LLM 产品/模型 |
| `github` | GitHub / 开源 | GitHub 相关条目 |
| `frontend` | 前端 | 前端框架 / 工具链 |
| `backend` | 后端 | 后端框架 / 语言 |
| `infra` | 基础设施 | K8s / Docker / 云 |
| `devtools` | 开发工具 | IDE / CLI / 生产力工具 |

**缺失的 tag 允许自建**（system prompt 允许 create tags）：
- slug 小写 + 连字符（如 `ai-agent` / `edge-runtime`）
- 必须带 zh-CN + en-US 双语 translations（`name` 字段）
- 不能改或删已有 tag

---

## Phase 1：多源深度搜索（WebSearch + WebFetch）

### Step 1.1：权威官方源（优先级最高）

| 来源 | URL | 说明 |
|------|-----|------|
| Hacker News | https://news.ycombinator.com/ | 技术社区风向标 |
| GitHub Trending | https://github.com/trending | 开源项目趋势 |
| Trendshift | https://trendshift.io/ | GitHub 趋势分析 |
| Product Hunt | https://www.producthunt.com/ | 新产品发布 |

用 WebFetch 直接获取，提取当日热门内容 Top 10。

### Step 1.2：专业媒体源（每领域 2-3 个关键词组合）

**AI / LLM**：

```text
1. site:techcrunch.com AI {date}
2. site:theverge.com artificial intelligence {date}
3. "OpenAI" OR "Anthropic" OR "Google AI" announcement {date}
4. "LLM" OR "GPT" OR "Claude" release {date}
5. machine learning breakthrough research {date}
```

**GitHub / 开源**：

```text
1. site:github.blog {date}
2. "open source" major release {date}
3. GitHub "stars" trending repository {date}
```

**前端**：

```text
1. site:reactjs.org OR site:vuejs.org blog {date}
2. "React" OR "Vue" OR "Next.js" OR "Svelte" release {date}
3. frontend framework update {date}
4. JavaScript TypeScript major update {date}
```

**后端 / 基础设施**：

```text
1. site:kubernetes.io blog {date}
2. "Rust" OR "Go" programming release {date}
3. "Docker" OR "Kubernetes" announcement {date}
4. cloud infrastructure AWS Azure GCP {date}
```

**科技行业动态**：

```text
1. site:crunchbase.com funding {date}
2. tech startup Series A B C funding {date}
3. developer tools company announcement {date}
```

### Step 1.3：中文技术社区（补充中文原创）

```text
1. site:juejin.cn 热门 {date}
2. site:infoq.cn {date}
3. site:segmentfault.com 头条 {date}
```

---

## Phase 2：深度调研与验证

### Step 2.1：交叉验证（每条候选资讯）

```text
1. 核心事实提取 (5W):
   - WHO / WHAT / WHEN / WHERE / WHY

2. 多源验证 (至少 2 个独立来源):
   - 来源 A 报道 → WebFetch 获取原文
   - 来源 B 验证 → WebSearch 搜索相同事件
   - 对比核心事实是否一致

3. 置信度标记:
   ✓ 已验证 (2+ 源确认)
   ? 待验证 (仅单一来源)
   ⚠ 有争议 (来源间矛盾)
```

**置信度低于 "✓" 的资讯不进 Top 3**，仅在分类中保守收录并明确标注。

### Step 2.2：深度阅读原文

对 Top 10 候选，用 WebFetch 提取：
1. 核心论点
2. 关键数据和事实
3. 专家引用和评论
4. 技术细节和实现方式
5. 对开发者的实际影响

### Step 2.3：重要性评分（满分 100）

| 维度 | 权重 | 评分标准 |
|---|---|---|
| 影响范围 | 25% | 影响多少开发者？全球 vs 局部 |
| 实用性 | 25% | 能否立即应用？解决什么问题？ |
| 新颖性 | 20% | 首次公布 vs 重复报道？突破性 vs 渐进式 |
| 信息深度 | 15% | 有技术细节 vs 只有标题 |
| 权威性 | 15% | 官方发布 vs 小道消息 |

评分转星级：

- 90-100 → ⭐⭐⭐⭐⭐
- 80-89  → ⭐⭐⭐⭐
- 70-79  → ⭐⭐⭐
- 60-69  → ⭐⭐
- < 60   → 不收录

### Step 2.4：去重与降噪

```text
❌ 标题党:
  - 含 "震惊"、"重磅"、"曝光" 但无实质内容
  - 过多感叹号/问号

❌ 低质:
  - 与开发者无关的泛科技新闻
  - "AI 继续发展" 这类笼统报道
  - EXCLUDE_LIST 中 7 天已覆盖事件
  - 单一来源且无法验证的消息

❌ 内容去重:
  - 同事件多报道 → 只留信息最丰富的
  - 优先级: 官方来源 > 专业媒体 > 泛媒体
```

---

## Phase 3：Top 3 深度分析

选择评分最高的 3 条，按模板撰写（中英双语各一份，嵌入最终 `content`）：

```text
### [标题] ⭐⭐⭐⭐⭐

**核心要点：**
- 要点1
- 要点2
- 要点3

**技术解读：**
[对开发者的影响、技术实现、背景]

**开发者行动建议：**
- 建议1
- 建议2

**相关链接：**
- 官方公告：[链接]
- 技术文档：[链接]
- 社区讨论：[链接]
```

**中英双语要求**：两个版本独立写作，不做机翻。英文版用主动语态、具体数字、少客套，符合英文技术博客习惯。

---

## Phase 4：content 正文结构

### 中文版 content 骨架

```markdown
## 🔥 今日焦点

{Top 3 资讯的深度分析,每条按 Phase 3 模板}

---

## AI / 人工智能

### {标题} ⭐⭐⭐⭐

{3-5 句摘要}

**为什么重要：** {一句话对开发者的影响}

- 来源：[{来源名}]({URL})
- 验证：✓ 多源确认

### {标题2}
...

## GitHub / 开源

### GitHub 热门项目

本日 GitHub 趋势榜热门项目：

- **[owner/repo](https://github.com/owner/repo)** (TypeScript, 12.5k ⭐) ⭐⭐⭐⭐
  AI 驱动的代码编辑器插件。
  **亮点：** {为什么值得关注}

- 来源：[GitHub Trending](https://github.com/trending), [Trendshift](https://trendshift.io/)

### {其他开源资讯}
...

## 前端开发
...

## 后端 / 基础设施
...

## 科技动态
...

---

## 📊 今日数据

| 指标 | 数值 |
|------|------|
| 搜索源数量 | {N} 个 |
| 候选资讯 | {N} 条 |
| 去重后 | {N} 条 |
| 最终收录 | {N} 条 |
| 多源验证率 | {N}% |

---

> 本文由 AI 自动生成，采用多源交叉验证机制。如发现错误，欢迎反馈。
```

### 英文版 content 骨架

用英文分类标题（**AI** / **Open Source** / **Frontend** / **Backend & Infra** / **Tech Industry**），**独立撰写**，不是中文版的直译。

### Markdown 规范（posts.content 字段）

1. **开篇**：一段导引，交代"今日技术圈发生了什么"，不要直接进 `## 标题`
2. **标题层级**：`##` 和 `###` 为主结构（H2 / H3 自动进 TOC，H4+ 不进）
3. **代码块**：必须标注受支持的语言。33 个支持：
   `bash, shell, powershell, javascript, typescript, tsx, jsx, json, jsonc, yaml, toml, markdown, mdx, html, css, scss, astro, go, rust, python, java, c, cpp, csharp, sql, dockerfile, nginx, ini, diff, xml, lua, php, ruby`
   别名：`sh/zsh → bash`、`js → javascript`、`ts → typescript`、`py → python`、`yml → yaml`、`rs → rust`、`c++ → cpp`、`c# → csharp`、`golang → go`
4. **外链**：`[文字](https://...)`，前端自动加 `target="_blank"`
5. **图片**：用公开外链 `![alt](https://...)`。不引用需登录的图床
6. **引用块**：`>` 开头，用于"备注/提示/警告"
7. **GFM**：表格、任务列表（`[ ]`/`[x]`）、删除线（`~~~~`）全支持
8. **禁止**：正文顶部的 `---` front-matter（Astro 保留语法）
9. **无需转义**：`<`、`{}`、代码块语言任意 —— posts.content 走 marked 渲染，不是 MDX

---

## Phase 5：通过 Directus MCP 发布

### Step 5.1：create 路径（Phase 0.3 查到 slug 不存在时）

**一次性 create 带 nested translations + tags 的 posts**：

```json
mcp__directus__items
{
  "action": "create",
  "collection": "posts",
  "data": {
    "slug": "daily-tech-news-{TARGET_DATE}",
    "status": "published",
    "featured": false,
    "date_published": "{TARGET_DATE}T00:00:00.000Z",
    "author": "{AI_AUTHOR_ID}",
    "category": "{NEWS_CATEGORY_ID}",
    "translations": [
      {
        "languages_code": "zh-CN",
        "title": "每日技术资讯 - 2026年XX月XX日",
        "excerpt": "<50-150 字中文摘要,突出 Top 3>",
        "content": "<Phase 4 中文版完整 Markdown>",
        "cover_label": "XX/XX",
        "seo_title": "<可选,覆盖 <title>>",
        "seo_description": "<可选,覆盖 meta description>"
      },
      {
        "languages_code": "en-US",
        "title": "Daily Tech News - Mon DD, YYYY",
        "excerpt": "<50-150 word English excerpt, highlighting Top 3>",
        "content": "<Phase 4 英文版完整 Markdown>",
        "cover_label": "XX/XX",
        "seo_title": "<optional>",
        "seo_description": "<optional>"
      }
    ],
    "tags": [
      { "tags_id": "<daily-news 的 id>" },
      { "tags_id": "<其他 tag 的 id>" }
    ]
  }
}
```

**关键点**：
- `translations` 作为数组嵌入，Directus MCP 会自动拆到 `posts_translations` 子表
- `tags` 是 M2M 关系，用 `{ "tags_id": <id> }` 的对象数组写入中间表 `posts_tags`
- `reading_time` 留空，前端按字数自动算
- `cover` 留空（AI 无图片上传权限）

### Step 5.2：update 路径（Phase 0.3 查到 slug 已存在时）

已存在的情况有两种：

**情况 A：只需更新正文和 tags（最常见）**

先 update 主表基础字段：

```json
mcp__directus__items
{
  "action": "update",
  "collection": "posts",
  "keys": ["{EXISTING_POST_ID}"],
  "data": {
    "status": "published",
    "date_published": "{TARGET_DATE}T00:00:00.000Z",
    "author": "{AI_AUTHOR_ID}",
    "category": "{NEWS_CATEGORY_ID}"
  }
}
```

**情况 B：还要改双语正文** — 分别找到两条 translation 的 id 做 update：

```json
mcp__directus__items
{
  "action": "read",
  "collection": "posts_translations",
  "query": {
    "fields": ["id", "languages_code"],
    "filter": { "posts_id": { "_eq": "{EXISTING_POST_ID}" } }
  }
}
```

拿到 `ZH_TRANS_ID` 和 `EN_TRANS_ID` 后：

```json
mcp__directus__items
{
  "action": "update",
  "collection": "posts_translations",
  "keys": ["{ZH_TRANS_ID}"],
  "data": { "title": "...", "excerpt": "...", "content": "...", "cover_label": "..." }
}
```

英文 translation 同上。

**tags 更新**：

```json
mcp__directus__items
{
  "action": "read",
  "collection": "posts_tags",
  "query": {
    "fields": ["id", "tags_id"],
    "filter": { "posts_id": { "_eq": "{EXISTING_POST_ID}" } },
    "limit": -1
  }
}
```

只**新增**缺失的关联（不删除已有，保持保守）：

```json
mcp__directus__items
{
  "action": "create",
  "collection": "posts_tags",
  "data": { "posts_id": "{EXISTING_POST_ID}", "tags_id": "<新 tag id>" }
}
```

### Step 5.3：回读确认

create/update 完成后，**必须回读**一次确认：

```json
mcp__directus__items
{
  "action": "read",
  "collection": "posts",
  "query": {
    "fields": [
      "id", "slug", "status", "date_published",
      "translations.languages_code", "translations.title",
      "translations.excerpt", "translations.content",
      "tags.tags_id.slug"
    ],
    "filter": { "slug": { "_eq": "daily-tech-news-{TARGET_DATE}" } }
  }
}
```

确认（**任一项不过 → 立即走 Step 5.2 update 路径回填完整正文，然后再回读一次**）：
- `status === "published"`
- translations 包含 `zh-CN` + `en-US` 两条，title 非空
- **每条 translation 的 `content` 长度 ≥ 100 字符**
- **每条 translation 的 `content` 不得包含子串 `placeholder`**（大小写不敏感）
- **每条 translation 的 `excerpt` 非空**
- tags 至少含 `daily-news`

> ⚠️ 严禁用 `placeholder-zh` / `placeholder-en` / 任何占位字符串先写入、打算"之后再回填"。
> 必须在 Phase 4 完整撰写正文后，Phase 5 一次性带完整 content 调 create/update。

---

## Phase 6：自检清单（发布前必过）

```text
Phase 0（MCP 基线）
[ ] 已调 mcp__directus__system-prompt 注入角色
[ ] 已查近 7 天文章形成 EXCLUDE_LIST
[ ] 已检查目标 slug 是否存在(决定 create/update)
[ ] AI_AUTHOR_ID 与 NEWS_CATEGORY_ID 已拿到
[ ] 本次要用的 tag id 全部已查到(或按需新建)

内容质量
[ ] Top 3 资讯都经过多源验证(✓)
[ ] 每条资讯都有来源链接
[ ] 重要性评分星级标记完整
[ ] 无标题党
[ ] 已应用 EXCLUDE_LIST 去重
[ ] 中英双语独立撰写,不是机翻
[ ] Top 3 深度分析 200-400 字/词每条
[ ] 总资讯数 10-20 条(质量优先)
[ ] 至少覆盖 3 个分类

字段完整性
[ ] slug = daily-tech-news-{TARGET_DATE}
[ ] status = "published"
[ ] date_published = {TARGET_DATE}T00:00:00.000Z
[ ] author = AI_AUTHOR_ID
[ ] category = NEWS_CATEGORY_ID
[ ] translations 含 zh-CN + en-US 两条
[ ] 每条 translation 的 title / excerpt 非空
[ ] 每条 translation 的 content 长度 ≥ 100 字符,且不含 `placeholder` 子串（大小写不敏感）
[ ] tags 至少含 daily-news
[ ] cover 留空

Markdown
[ ] 代码块都标注了受支持的语言
[ ] 正文顶部无 --- front-matter
[ ] 外链格式正确
```

**任一项未过，不要调 create/update**，回头补齐。

---

## Phase 7：输出总结

发布成功后，向 workflow 输出简短总结（不需要 JSON，人类可读即可）：

```text
✅ 发布成功

- post_id: {返回的 id}
- slug: daily-tech-news-{TARGET_DATE}
- status: published
- 收录资讯: {N} 条（Top 3 深度分析 + {N} 条分类资讯）
- 多源验证率: {N}%
- 前端 URL:
  · 中文: https://zerx.dev/blog/daily-tech-news-{TARGET_DATE}
  · 英文: https://zerx.dev/en/blog/daily-tech-news-{TARGET_DATE}

PUBLISHED: daily-tech-news-{TARGET_DATE}
```

以 `PUBLISHED: <slug>` 作为结束标志，workflow 可据此判断成功。

---

## 严格禁止清单

| 操作 | 为什么禁止 |
|---|---|
| 通过 MCP 修改 site_settings / projects / aur_packages / pages | AI Writer policy 无此权限，会 403 |
| delete 任何数据（包括自己刚 create 的） | AI Writer policy 无 delete 权限 |
| 修改或删除已有 authors / categories / tags | 只能 create 新的，不能改已有语义 |
| 上传文件 / 修改 directus_files | AI Writer 无文件权限 |
| status 设为 `draft`（本场景） | 自动化调度场景要求 `published` |
| translations 只写一种语言 | 前端双语路由会 404 另一语言 |
| 跳过 Phase 0 直接开始 WebSearch | 会漏掉去重基线，重复报道 7 天内事件 |
| 跳过 Phase 5.3 回读确认 | 无法确保写入生效 |
| 在 translations.content / excerpt 写占位字符串（如 `placeholder-zh`、`placeholder-en`、`TBD`、`TODO` 等），打算"稍后再回填" | Phase 5.3 回读会命中 placeholder 子串或长度 < 100 校验，直接判定失败；且已观测到"稍后回填"经常不被执行，结果正文里就留着占位符上线 |

违反其中任意一条都视为失败。

---

## 信息源优先级

### 第一优先级（权威官方）

- GitHub 官方博客、Trending
- 各框架/语言官方博客（React、Vue、Rust、Go 等）
- 公司官方公告（Google、Microsoft、AWS、Anthropic、OpenAI 等）

### 第二优先级（专业媒体）

- Hacker News（社区风向标）
- TechCrunch、The Verge（科技深度报道）
- InfoQ、掘金（中文技术社区）

### 第三优先级（泛媒体）

- 一般科技新闻网站
- 社交媒体热点
- 个人博客

---

## 标题党识别规则（自动降权或排除）

```text
❌ 情绪化词汇: 震惊、重磅、曝光、惊天、颠覆、史上最强
❌ 过度夸张: 彻底改变、完全碾压、全面超越
❌ 模糊表述: 某公司、据说、可能、或将
❌ 无实质内容: AI 继续发展、技术在进步
❌ 标题与内容不符: 标题说重大突破,内容只是小更新
```

---

## 常见错误与兜底

| 场景 | 处理 |
|---|---|
| 某一天全球技术圈都很安静，凑不到 10 条 | 收录 6-8 条即可，不要硬凑。excerpt 里说明"今日资讯较少" |
| 某个分类（如前端）当天无重要动态 | 跳过该分类，不要硬造。只需 ≥ 3 个分类 |
| WebFetch 无法访问某来源 | 换另一个来源验证；两次失败则标记 `? 待验证` 并降权 |
| 不确定事件真假 | 宁可不收录，也不发未验证信息 |
| MCP create posts 返回 403 | 检查 status 是否传了 `published`（policy 允许）；若是 Phase 0 忘了调 system-prompt，先补调 |
| MCP create posts 返回 schema 错误 | 调 `mcp__directus__schema { "keys": ["posts"] }` 确认字段名，再重试 |
| Phase 0.3 查到同 slug 已存在且 status=published | 走 update 路径覆盖（不要 create 报唯一键冲突） |
| 需要的 tag 不存在 | 按 system prompt 权限新建（含 zh-CN + en-US name translations） |
| 已有 tag slug 拼写有歧义（如 "AI" vs "ai"） | 用小写版；如果已有大写版，复用已有 id，不新建 |

---

## 注意事项

1. **深度优于广度**：宁可 10 条高质量，也不要 30 条低质内容
2. **验证优于速度**：每条资讯经过多源验证
3. **解读优于转述**：提供技术解读和开发者行动建议
4. **去重优于重复**：Phase 0.2 的 EXCLUDE_LIST 必须严格应用
5. **英文搜索 + 双语输出**：搜索用英文关键词效果更好，最终中英双语
6. **保持客观中立**：避免主观评价和情绪化表达
7. **一步到位**：Phase 5 通过 MCP 直接发布，不经任何中转文件/脚本