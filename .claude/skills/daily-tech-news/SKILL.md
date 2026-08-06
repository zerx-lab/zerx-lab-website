---
name: daily-tech-news
description: "每日技术资讯搜集。多源搜索 AI、GitHub、前端、后端、开源等领域的最新技术动态，直接把中英双语正文写成仓库内的 Markdown 文件发布到 ZerxLab 博客（多源交叉验证 + 重要性评分）。关键词：资讯、新闻、daily news、tech news、AI news、GitHub trending、Markdown 发布。"
---

# Daily Tech News - 每日技术资讯（Markdown 直写版）

自动搜索并汇总当日技术资讯，采用**多源交叉验证 + 深度调研 + 重要性评分**机制，**用 Write 工具直接把成稿写成仓库内的两个 Markdown 文件**，一步到位发布到 ZerxLab 博客。

---

## ⚠️ 本 Skill 的核心架构

运行在 **zerx-lab-website** 仓库，内容源是**仓库内 `src/content/posts/` 下的 Markdown 文件**（Astro Content Layer）。发布走**文件写入 + git commit**（不是数据库，不是任何 MCP）：

```text
┌──────────────────┐     ┌──────────────────────────────────────┐
│ Claude Code      │     │ src/content/posts/                    │
│ (GitHub Actions) │────▶│   daily-tech-news-{DATE}/              │
│ WebSearch        │     │     zh.md  (中文正文 + frontmatter)    │
│ WebFetch         │     │     en.md  (英文正文 + frontmatter)    │
│ Glob / Read      │     │                                        │
│ Write            │     │ workflow 校验通过后 git commit + push  │
└──────────────────┘     └──────────────────────────────────────┘
```

Claude 全程**只用文件系统工具**（Glob / Read / Write）读写这两个 Markdown 文件，本 skill 结束时文件已经在工作区磁盘上，**不负责 git commit / push / 发信** —— 那些由 workflow 的后续 step 负责（校验通过才提交，提交成功才发信）。

---

## ⚠️ 必需参数

调用此 skill 时必须在 prompt 中指定目标日期：

```text
TARGET_DATE: YYYY-MM-DD 格式的日期
示例: 2026-04-17
```

执行过程中的所有日期（文件路径、date、标题、搜索关键词）都必须使用此 TARGET_DATE。**禁止**使用"今天 / 昨天"等相对日期。

日期派生规则：
- 目录 / slug：`daily-tech-news-{TARGET_DATE}`（例：`daily-tech-news-2026-04-17`）
- 文件路径：`src/content/posts/daily-tech-news-{TARGET_DATE}/zh.md` 与 `en.md`
- frontmatter `date`：`{TARGET_DATE}T00:00:00.000Z`
- 中文标题日期：转中文格式（例：`2026年04月17日`）
- 英文标题日期：`Apr 17, 2026` 格式
- `coverLabel`：日期缩写（例：`04/17`）

---

## ⚠️ 正文必须一次写全（禁止占位符）

workflow 在 Claude 结束后有一个**纯 shell 校验 step**：检查两个文件是否存在、frontmatter 字段是否齐全、正文字符数是否 ≥ 100、全文是否含 `placeholder` / `TBD` / `TODO`（大小写不敏感）子串。**任一项不过，整个 run 直接失败** —— 不会 git commit，也就不会触发部署，更不会发送通知邮件。

所以：
- **唯一正确路径** = Phase 4 把中英双语正文**真正撰写完整**（多段结构、每篇 ≥ 100 字符）之后，Phase 5 才用 Write 把两个文件一次性写完整。
- **严禁**先写一个"提纲 / 占位版" content 打算"回头再补" —— 这个 skill 单次运行内没有"下一轮"，写不完整就是这次直接失败。
- 担心 context 或 token 不够 → 缩减候选资讯数量（Phase 6 兜底规则允许 6-8 条），也不要用占位符凑数。

---

## 核心理念

> **准确性第一** → 多源交叉验证 + 深度阅读原文
> **质量优于数量** → 重要性评分筛选 + 去重降噪
> **深度优于广度** → Top 3 资讯深度分析 + 技术解读
> **双语对等** → 中英两版独立撰写，拒绝机翻

---

## Phase 0：建立工作基线（必须最先执行）

在任何 WebSearch 之前，**必须**先建立以下上下文：

### Step 0.1：查近 7 天已发文章（去重基线）

```text
Glob("src/content/posts/daily-tech-news-*/zh.md")
```

对匹配到的路径按目录名里的日期倒序排列，取最近 7 天内的几篇，逐个 `Read` 其 frontmatter（`title` / `excerpt`）与正文标题结构。

**用途**：从 title + excerpt + 正文小标题中提取已报道的项目名 / 公司名 / 事件关键词，形成 `EXCLUDE_LIST`。Phase 2/3 搜索与评分时主动剔除已覆盖事件。同一产品的"增量进展"可以报，但必须写明与已有报道的差异。

### Step 0.2：确认目标文件尚不存在

```text
Glob("src/content/posts/daily-tech-news-{TARGET_DATE}/*.md")
```

- 返回空 → 正常路径，Phase 5 直接 Write 新文件
- 已存在同名目录（罕见,例如同日手动重跑）→ 视为覆盖重写，Phase 5 仍用 Write 整体重写两个文件（Write 工具本身就是整文件覆盖写入,不需要额外的"更新"步骤）

### Step 0.3：确认可用的 author / category / tags

不再需要查任何数据库 id —— 现在所有关联都是**纯字符串 slug**，直接写进 frontmatter 即可：

- 作者固定用 `author: "ai"`（需要该 slug 在 `src/content/data/authors.json` 中已存在；正常情况下已由项目预置，无需确认）
- 分类固定用 `category: "news"`（同样需要在 `src/content/data/categories.json` 中已存在）
- 标签从 `src/content/data/tags.json` 里选：

```text
Read("src/content/data/tags.json")
```

建立本次要用的 `tag_slug` 列表（按内容动态选,**不要**逐个去查 id,直接用 slug 字符串）：

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

**如果内容明显需要一个不在表里的新 tag**（如 `edge-runtime`）：这不属于本 skill 的写入范围 —— **不要**擅自编辑 `tags.json`。退而求其次，从上表中选最接近的已有 tag，或者只挂 `daily-news`。标签体系的扩充属于站点维护范畴，交由人工评估。

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

选择评分最高的 3 条，按模板撰写（中英双语各一份，嵌入最终正文）：

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

## Phase 4：正文结构

### 中文版正文骨架

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

### 英文版正文骨架

用英文分类标题（**AI** / **Open Source** / **Frontend** / **Backend & Infra** / **Tech Industry**），**独立撰写**，不是中文版的直译。

### Markdown 规范（frontmatter 之后的正文）

1. **开篇**：一段导引，交代"今日技术圈发生了什么"，不要直接进 `## 标题`
2. **标题层级**：`##` 和 `###` 为主结构（H2 / H3 自动进 TOC，H4+ 不进）
3. **代码块**：必须标注受支持的语言（Shiki 双主题高亮），常见语言均可，如
   `bash, shell, powershell, javascript, typescript, tsx, jsx, json, yaml, toml, markdown, html, css, astro, go, rust, python, java, c, cpp, sql, dockerfile`
4. **外链**：`[文字](https://...)`，前端自动加 `target="_blank"`
5. **图片**：用公开外链 `![alt](https://...)`。不引用需登录的图床
6. **引用块**：`>` 开头，用于"备注/提示/警告"
7. **GFM**：表格、任务列表（`[ ]`/`[x]`）、删除线（`~~~~`）全支持
8. **frontmatter 之后**：正文顶部不要再出现第二段 `---`（会被误认成又一个 frontmatter 块的边界）

---

## Phase 5：写入 Markdown 文件

### Step 5.1：写入两个文件

用 Write 工具**一次性写完整**两个文件（frontmatter 字段全部为最终值，YAML 字符串一律双引号包裹）：

**`src/content/posts/daily-tech-news-{TARGET_DATE}/zh.md`**：

```markdown
---
title: "每日技术资讯 - 2026年04月17日"
excerpt: "50-150 字中文摘要,突出 Top 3"
coverLabel: "04/17"
date: "{TARGET_DATE}T00:00:00.000Z"
author: "ai"
category: "news"
tags: ["daily-news", "ai", "github"]
featured: false
---

{Phase 4 撰写好的中文版完整 Markdown 正文}
```

**`src/content/posts/daily-tech-news-{TARGET_DATE}/en.md`**：

```markdown
---
title: "Daily Tech News - Apr 17, 2026"
excerpt: "50-150 word English excerpt, highlighting Top 3"
coverLabel: "04/17"
date: "{TARGET_DATE}T00:00:00.000Z"
author: "ai"
category: "news"
tags: ["daily-news", "ai", "github"]
featured: false
---

{Phase 4 撰写好的英文版完整 Markdown 正文}
```

**关键点**：
- `title` / `excerpt` / `coverLabel` 是语言相关字段，两个文件各写各的
- `date` / `author` / `category` / `tags` / `featured` 是语言无关字段，两个文件必须**完全一致**
- `tags` 是字符串数组，直接写 slug，不需要任何 id 映射
- 不写 `cover`（无图片可用，前端会回落到 `coverLabel` 大字卡片）
- 不写 `updatedDate` / `seoTitle` / `seoDescription`（可选字段，本场景不需要）
- 不写 `draft`（默认 `false`，即正常发布）

### Step 5.2：回读确认

写入完成后，**必须用 Read 回读**两个文件各一次，确认：
- frontmatter 完整，字段值不含未替换的占位符（如字面量 `{TARGET_DATE}`、`XX月XX日`）
- 正文长度充分（每篇明显 ≥ 100 字符，实际应有多段结构、数百字以上）
- 正文中不含 `placeholder` / `TBD` / `TODO` 字样

> ⚠️ workflow 后续有一个独立的 shell 校验 step 会做同样的检查，**过不了会导致整个 run 失败、不提交不发信**。这里的自检是为了在 Claude 结束运行前就发现问题并修正，而不是把问题留给 workflow 去拦截。

---

## Phase 6：自检清单（写入前必过）

```text
Phase 0（工作基线）
[ ] 已 Glob + Read 近 7 天文章形成 EXCLUDE_LIST
[ ] 已确认目标文件路径(daily-tech-news-{TARGET_DATE}/{zh,en}.md)
[ ] 已读 tags.json 确认本次要用的 tag slug

内容质量
[ ] Top 3 资讯都经过多源验证(✓)
[ ] 每条资讯都有来源链接
[ ] 重要性评分星级标记完整
[ ] 无标题党
[ ] 已应用 EXCLUDE_LIST 去重
[ ] 中英双语独立撰写,不是机翻
[ ] Top 3 深度分析 200-400 字/词每条
[ ] 总资讯数 10-20 条(质量优先,安静日允许 6-8 条)
[ ] 至少覆盖 3 个分类

字段完整性
[ ] 目录名 = daily-tech-news-{TARGET_DATE}
[ ] date = {TARGET_DATE}T00:00:00.000Z(两个文件一致)
[ ] author = "ai"
[ ] category = "news"
[ ] tags 至少含 "daily-news"(数组,slug 字符串)
[ ] featured = false
[ ] 每个文件的 title / excerpt / coverLabel 已按各自语言填好,无占位符
[ ] 正文长度 ≥ 100 字符,且不含 placeholder / TBD / TODO 子串(大小写不敏感)

Markdown
[ ] 代码块都标注了受支持的语言
[ ] 正文里没有出现第二段顶格 ---
[ ] 外链格式正确
```

**任一项未过，不要调用 Write 完成最终版本**，回头补齐。

---

## Phase 7：输出总结

写入成功后，向 workflow 输出简短总结（不需要 JSON，人类可读即可）：

```text
✅ 写入成功

- slug: daily-tech-news-{TARGET_DATE}
- 文件: src/content/posts/daily-tech-news-{TARGET_DATE}/{zh,en}.md
- 收录资讯: {N} 条（Top 3 深度分析 + {N} 条分类资讯）
- 多源验证率: {N}%
- 前端 URL(部署后可访问):
  · 中文: https://zerx.dev/blog/daily-tech-news-{TARGET_DATE}/
  · 英文: https://zerx.dev/en/blog/daily-tech-news-{TARGET_DATE}/

PUBLISHED: daily-tech-news-{TARGET_DATE}
```

以 `PUBLISHED: <slug>` 作为结束标志，workflow 可据此判断成功。**注意**：这只代表文件已写入工作区磁盘，真正的"发布"（git commit + push + 部署 + 发信）由 workflow 后续 step 完成，本 skill 不负责，也没有权限去做。

---

## 严格禁止清单

| 操作 | 为什么禁止 |
|---|---|
| 编辑 `src/content/data/*.json`(authors / categories / tags 等元数据) | 元数据体系由站点维护者管理，本 skill 只读不写 |
| 在正文里写占位字符串（`placeholder-*`、`TBD`、`TODO`、空字符串），打算"稍后再回填" | 本 skill 单次运行没有"下一轮"；workflow 的校验 step 会拦截并直接失败，此时既不会提交也不会发信,等同于本次 run 彻底作废 |
| 只写一种语言的文件 | 前端双语路由会 404 另一语言 |
| 跳过 Phase 0 直接开始 WebSearch | 会漏掉去重基线，重复报道 7 天内事件 |
| 跳过 Phase 5.2 回读确认 | 无法确保写入内容与预期一致 |
| 自行执行 `git add` / `git commit` / `git push` | 提交由 workflow 的独立 step 负责，且必须先过校验；skill 内提交会绕过校验直接把问题内容推上去 |

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
| 需要的 tag 不在 `tags.json` 里 | 从已有 tag 里选最接近的，或只挂 `daily-news`；不要自行编辑 `tags.json` |
| Phase 0.2 发现同日目录已存在(重复运行) | 视为覆盖重写，Phase 5 仍整体重写两个文件的完整内容 |

---

## 注意事项

1. **深度优于广度**：宁可 10 条高质量，也不要 30 条低质内容
2. **验证优于速度**：每条资讯经过多源验证
3. **解读优于转述**：提供技术解读和开发者行动建议
4. **去重优于重复**：Phase 0.1 的 EXCLUDE_LIST 必须严格应用
5. **英文搜索 + 双语输出**：搜索用英文关键词效果更好，最终中英双语
6. **保持客观中立**：避免主观评价和情绪化表达
7. **一步到位**：Phase 5 通过 Write 直接写入最终文件，不经任何中转脚本/数据库
