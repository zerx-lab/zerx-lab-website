# zerx-lab 前端技术选型调研报告

> 调研时间: 2025 年末 / 2026 年初
> 后端: 已部署的 Directus 实例 (https://directus.zerx.dev/)
> 场景: 个人 Lab / 工作室官网 + 博客
> 所有结论均基于对官方文档与 GitHub 仓库的实测抓取,不含训练数据猜测。

## 关键事实基线 (调研依据)

| 事实 | 来源 |
|---|---|
| `@directus/sdk` 最新版本 **21.2.2**, 要求 `node >= 22`, 纯 ESM, 零依赖, "Composable Client" 架构 | https://registry.npmjs.org/@directus/sdk/latest |
| Directus 官方提供针对 **Next.js / Nuxt / Astro / SvelteKit** 四框架的集成教程,步骤几乎一致(建 helper → `readItems/readSingleton` → dynamic route) | https://directus.io/docs/tutorials/getting-started/fetch-data-from-directus-with-{nextjs,nuxt,astro,sveltekit} |
| **Directus Labs 官方维护的 starters 仓库**(`directus-labs/starters`,MIT)同时提供 **Next.js / Nuxt / Astro / SvelteKit** 四套 "CMS 模板",内建 Pages、Blog、动态表单、Live Preview、Visual Editing;另有 i18n 版本(仅 Next.js / Nuxt) | https://github.com/directus-labs/starters |
| Next.js 集成注意:Next 扩展了原生 `fetch` 默认 `force-cache`,SDK 需要注入 `onRequest: (o) => ({...o, cache: 'no-store'})` 避免读到陈旧数据 | 官方 Next.js 教程 |
| SvelteKit 集成注意:必须把 SvelteKit 的 `fetch` 注入 SDK 的 `globals.fetch` 才能让 SSR 正常工作 | 官方 SvelteKit 教程 |
| Astro 集成注意:静态路由必须 `getStaticPaths()`,天然走 SSG;需 `set:html` 渲染 WYSIWYG | 官方 Astro 教程 |
| Directus Assets API 内建图片转换:`?width=&height=&quality=&fit=&format=auto` 支持 webp/avif 自动协商;并支持预设 preset key | https://directus.io/docs/guides/files/transform |
| 旧仓库 `directus-labs/examples`(267★)已于 2024-01 **归档只读**,不应再作为参考 | https://github.com/directus-labs/examples |

---

## 一、前端框架候选对比

> 说明:以下打分为相对比较(★ = 1 ~ ★★★★★ = 5),基于上方调研事实,不含主观偏好。

| 维度 | Next.js 15 (App Router / RSC) | Nuxt 3 / 4 | Astro 5 (+ Islands) | SvelteKit 2 |
|---|---|---|---|---|
| **默认渲染模型** | RSC 为主,混合 SSR / SSG / ISR / PPR | SSR + Nitro,支持 SSG / ISR / 混合 | **SSG 优先**,Islands 按需 hydrate | SSR + Adapter,可 SSG/SSR/edge |
| **SEO 友好度** | ★★★★★ (RSC 零客户端 JS + metadata API) | ★★★★★ (SSR + `useSeoMeta`) | ★★★★★ (SSG 裸 HTML,最极致) | ★★★★☆ |
| **首屏性能/包体** | ★★★★ (RSC 裁剪不少,但运行时仍最重) | ★★★★ | ★★★★★ (默认零 JS,Islands 按需) | ★★★★★ (Svelte 编译产物最小) |
| **DX / HMR** | ★★★★ (Turbopack 15 后已稳) | ★★★★★ (Nuxt DevTools + 自动导入 杀手锏) | ★★★★ (配置轻,但编辑器支持略弱) | ★★★★★ (最简洁直观) |
| **生态广度** | ★★★★★ (最大,shadcn/ui 等几乎默认) | ★★★★ (Vue 生态 + Nuxt Modules) | ★★★★ (可嵌入 React/Vue/Svelte,灵活) | ★★★☆ (组件库选择较少) |
| **与 Directus 集成难度** | ★★★★ (官方教程 + `directus-labs/starters/cms/nextjs` 官方模板,但要处理 fetch cache) | ★★★★★ (官方 Plugin 模式 + `cms/nuxt` 官方模板) | ★★★★ (SDK 直用,SSG 契合度最高) | ★★★★ (需要 hooks.server.js 注入 fetch) |
| **学习曲线** | ★★☆ (RSC/Server Actions/Cache 概念多) | ★★★ (Vue 基础即可) | ★★★★ (上手最快) | ★★★★ (Svelte 语法直观) |
| **"博客 + 官网" 契合度** | ★★★★ (功能全,略重) | ★★★★ (均衡) | **★★★★★ (天生为内容站设计)** | ★★★★ |
| **i18n 官方模板** | ✅ `cms-i18n/nextjs` | ✅ `cms-i18n/nuxt` | ❌ (需自行接 `@astrojs/i18n`) | ❌ (需自行接 `paraglide` 等) |
| **Visual Editor / Live Preview 官方支持** | ✅ | ✅ | ✅ | ✅ |

---

## 二、对"博客 + Lab 官网"场景的推荐排序

### 🥇 推荐 1: Astro 5 + React Islands

**推荐理由**

1. **场景最契合**:博客 + 作品集 + 静态页面本质是"内容型 + 少量交互",Astro 的 SSG + Islands 正是为这种场景设计。默认零 JS 交付 → Lighthouse 几乎不费力 95+。
2. **SEO 最强**:构建时生成纯 HTML,无水合开销,爬虫和社交卡片抓取最稳定。
3. **Directus 契合度高**:教程里用的就是 `getStaticPaths()` + `readItems()`,内容在构建时一次性拉取。
4. **交互岛不妥协**:头部主题切换、作品集滤镜、联系表单这类少量交互可以用 React/Vue/Svelte 组件 `client:load` / `client:visible`,想用哪个 UI 生态都行(shadcn/ui 照样可以用)。
5. **有官方模板兜底**:`directus-labs/starters/cms/astro` 可直接参考或 fork。

**权衡**

- ❌ 官方模板默认只配 Vercel adapter,换 Netlify / Node 要手动改 `astro.config`。
- ❌ **纯 SSG 的短板**:博客发文后要重新构建/部署才能上线。解决方案二选一:
  - (a) 在 Directus 设 Webhook → 触发 Vercel/Cloudflare Pages 的 Deploy Hook(简单,延迟约 30~90s);
  - (b) 对 `/blog/[slug]` 用 Astro 的 `export const prerender = false`(切 SSR 模式,配合 Node/Edge adapter)按需渲染 + 边缘缓存。
- ❌ i18n 官方 Directus 模板没做 Astro,只有 Next/Nuxt。若后期需要多语言,要自己搭 `@astrojs/i18n` + Directus `translations` 字段。
- ❌ React 生态的 Server Actions / RSC 用不了(但这个场景也不需要)。

**Directus 拉取策略**

- 构建时: `posts` 列表、`pages`、`site_settings`、`projects` 全部走 `getStaticPaths()` SSG。
- 运行时(可选): 仅评论/点赞/订阅等动态交互走客户端 `fetch`。
- 图片: 统一走 `{DIRECTUS_URL}/assets/{id}?width=...&format=auto`,由 Astro 的 `<Image>` 包一层 `<picture>` + `srcset`。

**Markdown/MDX**

- 博客正文建议在 Directus 用 **Markdown 字段**(非 WYSIWYG),前端用 `astro-remark` + `rehype-shiki` 渲染,可享受 Astro 官方内容流水线,代码块高亮、锚点、目录全自动。
- 不建议用 Directus 的 WYSIWYG,因为产物是 HTML,会丢失 Astro 的内容管线能力。

---

### 🥈 推荐 2: Next.js 15 (App Router)

**推荐理由**

1. **生态最大**:shadcn/ui、Vercel AI SDK、MDX 工具链最成熟,Lab 站将来要加"作品 Demo / 在线小工具"时,React 生态弹药最充足。
2. **RSC 天然适合 Directus**:Server Component 里直接 `await directus.request(readItems(...))`,不需要 `useEffect` 或 Loader,代码最直白。
3. **ISR 最强**:博客文章用 `revalidate: 60` 或 tag revalidation(`revalidateTag('posts')`) + Directus Webhook 触发,既有 SSG 的速度又有准实时更新,不用重新部署。
4. **官方 starter 最全**: `directus-labs/starters/cms/nextjs` 和 `cms-i18n/nextjs` 都齐,未来要多语言时零迁移成本。
5. **Visual Editing / Live Preview 官方支持**:Directus 的 Visual Editor 对 Next.js App Router 的 `draft mode` 契合最好。

**权衡**

- ❌ RSC / Server Actions / cache / revalidate / dynamic 这一套心智负担比 Astro 重,小项目有 overkill 风险。
- ❌ **坑点**:Next 的 `fetch` 默认 `force-cache`,必须像官方教程那样在 SDK 里注入 `cache: 'no-store'`,否则在本地开发就会看到陈旧数据;生产再按需用 `next: { revalidate: N, tags: [...] }`。
- ❌ 产物首屏 JS 比 Astro 大(即便 RSC 也至少带 React runtime)。
- ❌ 强绑 Vercel 体验最佳,自部署(Docker / Node)要自己解决 ISR 存储和图片优化。

**Directus 拉取策略**

- 列表页 (`/blog`): Server Component + `fetch` tags `['posts']` + `revalidate: 3600`。
- 详情页 (`/blog/[slug]`): `generateStaticParams()` 预渲染高频文章,其余 ISR 兜底。
- `site_settings`(单例)用 `unstable_cache` 包一层,全站复用。
- Webhook: Directus 发文/改文时,调 Next 的 `/api/revalidate?tag=posts` 触发精细失效。

**Markdown/MDX**

- 首选 `next-mdx-remote` 或 `@content-collections/mdx`,可以在 Directus 存 Markdown 字符串 → 服务端编译 MDX → RSC 渲染(保持零客户端成本)。
- 代码高亮用 `shiki` (与 Astro 同一套,可共享 theme)。

---

### 为什么不是 Nuxt / SvelteKit?

- **Nuxt**: 技术上完全够用,官方 starter 也齐。但本项目没有明确的"Vue 生态加分项"(例如你不在 Vue 团队),选它只是平替 Next.js,而 React 的组件库/UI 生态(尤其 shadcn/ui)明显更丰厚。
- **SvelteKit**: 产物最轻、DX 最爽,但 Directus 集成需要手写 `hooks.server.js` 注入 fetch(见官方教程),且 shadcn-svelte 之类的生态仍在追赶。适合追求极致性能且愿意自己造轮子的场景。

---

### 图片优化方案(两种推荐共通)

Directus Assets 自带 Sharp 驱动的运行时转换。前端这边:

1. 用 Directus 的查询参数获得多尺寸源:`?width=480&format=auto`、`?width=960&format=auto`、`?width=1920&format=auto`。
2. 在 Directus 后台建 **Storage Asset Presets** (Settings → Files):
   - `thumbnail` = 400w, quality 70, format auto, fit cover
   - `card` = 800w, quality 75
   - `hero` = 1920w, quality 80
   然后前端用 `?key=hero` 即可,避免前端散落 magic number。
3. Astro 侧: 自定义一个 `<DirectusImage>` 组件,输出 `<picture>` + `srcset` + `loading="lazy"` + 占位(Directus 可返回 `?width=16&quality=10` 的 blurhash 替身)。
4. Next.js 侧: 配置 `next.config.ts` 的 `images.remotePatterns` 允许 `directus.zerx.dev`,然后用 `<Image>` 组件;或者直接走 Directus 的转换(跳过 Next 的优化器),两种都可以,推荐前者因为带自动懒加载和布局占位。

---

## 三、推荐技术栈(完整)

以下以 🥇 **Astro 5 方案** 为主,括号内备注 🥈 **Next.js 15 方案** 的替代选择。

| 层 | 选型 | 理由 |
|---|---|---|
| **前端框架** | Astro 5 (或 Next.js 15 App Router) | 见第二节 |
| **UI 交互岛** | React 19 (Astro 项目内 `@astrojs/react`) | 便于直接复用 shadcn/ui 组件 |
| **样式方案** | **Tailwind CSS v4** | v4 已稳,零配置 PostCSS,原生 CSS vars,是目前 2025 末社区新项目首选 |
| **UI 组件库** | **shadcn/ui** (copy & own 模式,非 NPM 包) | 不锁定、可改、风格中性,契合"设计师式 Lab 站" |
| **动画** | **Motion** (ex-Framer Motion, 独立后改名) + CSS `view-transition-name` | Motion 适合 React 岛内复杂交互;Astro 页面切换用原生 View Transitions API(Astro 5 内建 `<ClientRouter />`) |
| **字体方案** | `@fontsource-variable` 本地化 + 可变字体(如 Inter Variable / 思源宋体) | 避免 Google Fonts 跨境阻塞;中文站推荐 1 个可变拉丁 + 1 个中文衬线/非衬线 |
| **图标** | `lucide-astro` / `lucide-react` | 与 shadcn/ui 配套,轻量 |
| **Markdown 渲染** | `@astrojs/mdx` + `rehype-shiki` + `rehype-autolink-headings` + `remark-gfm`(Next 方案: `next-mdx-remote` + `shiki`) | 代码高亮与 Directus 解耦,保留前端可控 |
| **数据获取** | `@directus/sdk` 21.x + 自建 `lib/directus.ts` helper | 官方教程路径;给 SDK 传泛型 `Schema` 拿类型补全 |
| **TypeScript 类型生成** | **`directus-labs/starters` 仓库里的 `generate:types` 脚本**(基于 `openapi-typescript` 拉 Directus OpenAPI schema → 生成 `Schema` 类型),搭配一个只用于本地生成的 `DIRECTUS_ADMIN_TOKEN` | 官方 starter 就是这么做的,避免手写类型与后台 drift |
| **部署平台** | **Cloudflare Pages** 或 **Vercel** | Cloudflare Pages 免费额度大 + 国内访问速度好于 Vercel;Vercel 对 Next.js ISR 最顺滑。建议前端按项目复杂度二选一 |
| **CDN / 图片** | Directus 自带 Assets API + presets(见上) | 不需要再套一层 Cloudinary |
| **状态管理** | **不需要** | 博客 + 官网几乎没有客户端状态;少量需要的用 `nanostores`(Astro 官方推荐,7KB,跨 Island 共享) 或 React `useState` 即可。禁用 Redux / Zustand 等全局方案,属于 over-engineering |
| **表单 / 订阅** | Directus `forms` collection(官方 starter 自带) + `zod` 校验 + `react-hook-form`(Next/React 岛内) | 后端已解决,前端无需自建 API |
| **搜索** | 1.0:Directus `filter` + `search` 参数直搜 `posts.title/content`;2.0:上 `Pagefind`(零后端全文索引,适合 SSG) | 分阶段,不要一上来就上 Algolia |
| **环境变量约定** | `PUBLIC_DIRECTUS_URL` + `DIRECTUS_SERVER_TOKEN`(服务端,Webmaster token)+ `DIRECTUS_ADMIN_TOKEN`(仅本地,用于 `generate:types`) | 与 `directus-labs/starters` 官方约定对齐,未来换模板零成本 |
| **包管理器** | `pnpm` | 磁盘/锁文件/monorepo 友好 |
| **Linter/Formatter** | `biome` (单工具同时做 lint + format) 或 eslint + prettier 传统组合 | 新项目推荐 biome,快且零配置冲突 |

---

## 四、Directus 侧数据模型设计

以下每条都附"Directus 特性建议",具体名字与 `directus-labs/starters/cms` 官方模板对齐,方便未来拿官方模板当参考而不冲突。

### 4.1 `site_settings` (单例,全局配置)

| 字段 | 类型 | 说明 |
|---|---|---|
| `site_name` | string | 站点名 / 左上 Logo 文本 |
| `site_description` | text | 默认 meta description |
| `site_url` | string | 规范 URL,生成 sitemap/OG 用 |
| `logo` | file (image) | 主 logo |
| `logo_dark` | file (image) | 深色模式 logo |
| `favicon` | file | |
| `og_image` | file (image) | 默认 OG 社交卡图 |
| `primary_navigation` | JSON 或 m2m → `navigation_items` | 顶部导航 |
| `footer_navigation` | JSON 或 m2m → `navigation_items` | 页脚 |
| `social_links` | JSON `[{platform, url}]` | |
| `analytics_id` | string | (可选) |

**Directus 特性**: ✅ Singleton; ✅ Public read。

### 4.2 `pages` (静态页面,如 About / Uses / Colophon)

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | uuid | |
| `status` | dropdown: draft / published / archived | |
| `slug` | string, unique | |
| `title` | string | |
| `excerpt` | text | |
| `blocks` | **M2A (many-to-any)** → `block_hero` / `block_richtext` / `block_gallery` / `block_projects` / `block_cta` | 页面构建器模式 |
| `seo` | group 或 o2o → `seo` | 见下 4.7 |
| `date_updated` | datetime | 自动 |

**Directus 特性**:
- ✅ **Slug 自动生成**:`slug` 字段设 Special → "Slug"/"Auto Slug" interface, related field = `title`;
- ✅ **Draft / Published 工作流**:`status` 字段 + Access Policy 只允许 Public 读 `status = published`;
- ✅ **M2A blocks**:与官方 CMS starter 完全一致,支持任意拼页;
- ✅ **Live Preview URL**:`{FRONTEND}/preview?slug={{slug}}&token=...`。

### 4.3 `posts` (博客文章)

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | uuid | |
| `status` | dropdown | draft / published / archived |
| `slug` | string, unique | |
| `title` | string | |
| `excerpt` | text (markdown) | 卡片/列表摘要 |
| `cover_image` | file (image) | |
| `content` | **Markdown** interface(非 WYSIWYG) | 由前端 MDX/Shiki 渲染 |
| `published_at` | datetime | 实际上线时间(与 `date_created` 分离,允许未来定时) |
| `reading_time` | integer | 可用 Flow 自动算 |
| `author` | M2O → `authors` | |
| `category` | M2O → `categories` | 一文一主分类 |
| `tags` | M2M → `tags` | |
| `related_posts` | M2M self → `posts` | 可选 |
| `seo` | group / o2o → `seo` | |

**Directus 特性**:
- ✅ Slug 自动生成(基于 title);
- ✅ 多语言: 如需双语, 加 Translations interface, 生成 `posts_translations` 子集合,字段 `title / excerpt / content` 进 translations;
- ✅ Flow: `posts.create / update` 时自动计算 `reading_time`(content 字数 / 200);
- ✅ Webhook: 触发前端 revalidate / 重新构建。

### 4.4 `authors`

| 字段 | 类型 |
|---|---|
| `id` | uuid |
| `name` | string |
| `slug` | string unique |
| `avatar` | file |
| `bio` | markdown |
| `social_links` | JSON `[{platform,url}]` |

`posts.author` → M2O 指向这里。单人 Lab 通常只有一个 author,但建独立集合为将来接稿/合著留余地。

### 4.5 `categories` / `tags`

两者结构类似,分开是为了语义清晰:

| 字段 | 类型 |
|---|---|
| `id` | uuid |
| `slug` | string unique |
| `name` | string |
| `description` | text (仅 category 需要) |
| `color` | string (hex, 仅 tag, 方便前端染色) |

### 4.6 `projects` (Lab 作品集)

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | uuid | |
| `status` | dropdown | |
| `slug` | string unique | |
| `title` | string | |
| `subtitle` | string | 一句话简介 |
| `cover_image` | file | |
| `gallery` | **files (M2M → directus_files)** | 多图 |
| `year` | integer | 年份 |
| `role` | string | 你在项目中的角色 |
| `tech_stack` | JSON `string[]` 或 M2M → `tags` | |
| `summary` | markdown | 卡片用 |
| `content` | markdown | 案例研究正文 |
| `links` | JSON `[{label, url, type: 'demo'/'repo'/'post'}]` | |
| `featured` | boolean | 首页是否置顶 |
| `sort` | integer | 手动排序 |

**Directus 特性**:
- ✅ 手动排序: 开启 Sort interface + `sort` 字段,后台可拖拽;
- ✅ Featured 字段驱动首页 Hero 作品位。

### 4.7 `seo` (复用字段组,建议做成独立 Collection 并被 o2o 引用)

| 字段 | 类型 |
|---|---|
| `meta_title` | string |
| `meta_description` | text |
| `og_image` | file |
| `no_index` | boolean |
| `canonical_url` | string |

---

### 多语言(可选,二期)

- 用 Directus 的 **Translations interface**,系统自动生成 `{collection}_translations` 子集合。
- Schema: `posts` 主表存 `slug / status / cover_image / author`;`posts_translations` 存 `language + title + excerpt + content + seo`。
- 前端:走 `directus-labs/starters/cms-i18n` 官方模板路线(仅 Next.js/Nuxt 有官方模板,Astro 需自研)。

---

## 五、开发里程碑建议

> 按"每步都有可验证产出"组织,每步 1~3 天,共约 2~3 周到 MVP 上线。

### Step 1 — Directus 数据建模(后端)
- **做什么**: 在 https://directus.zerx.dev/ 后台按第四节建 collections(先建 `site_settings` / `pages` / `posts` / `authors` / `categories` / `tags` / `projects` / `seo`)。
- **验证**: 用 Directus App 手动录 1 条 post、1 个 project、填 `site_settings`;在 `/items/posts?fields=*,author.name` REST 请求里能拿到关联数据。
- **产出**: Directus schema snapshot 文件(`npx directus schema snapshot ./snapshot.yaml` 或在后台导出),存入仓库 `backend/snapshot.yaml`,未来换环境可一键 apply。

### Step 2 — 前端脚手架 & 连通性
- **做什么**: `pnpm create astro@latest` 选 minimal + strict TS,加 `@astrojs/react`、`@astrojs/mdx`、`@astrojs/tailwind`(或 Tailwind v4 独立集成)、`@directus/sdk`。建 `src/lib/directus.ts`(按官方 Astro 教程)。配置 `PUBLIC_DIRECTUS_URL=https://directus.zerx.dev`。
- **验证**: 在 `src/pages/index.astro` 里 `await directus.request(readSingleton('site_settings'))` 能打印出站点名;`npm run build` 能产出静态 HTML。
- **产出**: 能跑的 hello world,CI 绿。

### Step 3 — 类型生成 & 数据层收敛
- **做什么**: 从 `directus-labs/starters/cms/astro` 抄 `scripts/generate-types.ts`(`openapi-typescript` + Directus `/server/specs/oas` 接口),写入 `src/types/directus-schema.ts`,在 SDK 初始化时注入泛型 `createDirectus<Schema>(...)`.
- **验证**: IDE 里 `readItems('posts', { fields: [...] })` 有 intellisense 补全字段名;改错字段名 TS 报错。
- **产出**: 一个 `pnpm generate:types` 脚本;`.env.example` 里写明 `DIRECTUS_ADMIN_TOKEN` 只用于本地。

### Step 4 — 博客核心路由
- **做什么**: 建 `/blog/index.astro`(列表,`status=published` + `sort: ['-published_at']` + 分页)、`/blog/[slug].astro`(`getStaticPaths()` 取所有 published posts + MDX/markdown 渲染 + Shiki 代码高亮 + TOC)、`/tag/[slug].astro` + `/category/[slug].astro`。建立 `<DirectusImage>` 组件用 `?width&format=auto` 出 srcset。
- **验证**: Lighthouse SEO + Performance 均 ≥ 95;文章页 OG 图正确;代码块高亮正常;Directus 里把一篇文章改回 draft,重新构建后前台消失。
- **产出**: 博客 MVP 可用。

### Step 5 — 官网页面与作品集
- **做什么**: `/index.astro`(Hero + 精选 projects `featured=true` + 最新 3 篇 posts)、`/projects/index.astro` 网格、`/projects/[slug].astro` 案例详情、`/[slug].astro`(动态 pages,M2A blocks 渲染器:给每种 block 写一个 Astro 组件,父组件按 `collection` 字段 switch)。
- **验证**: 在 Directus 里新增一个 About page 的 blocks,前端构建后自动显示,不需要改代码。
- **产出**: 完整官网骨架 + 可视化积木式 Page Builder 对接完成。

### Step 6 — SEO / RSS / Sitemap / 分析
- **做什么**: 集成 `@astrojs/sitemap`、手写 `/rss.xml.ts`(用 `@astrojs/rss` + 从 Directus 拉 posts)、每页注入 OG / Twitter card 从 `seo` 字段读;加 View Transitions (`<ClientRouter />`);Plausible / Umami 分析(可选)。
- **验证**: `curl https://.../sitemap-index.xml` 正常;RSS 在 NetNewsWire 订阅可读;社交分享卡在 https://www.opengraph.xyz/ 预览正确。
- **产出**: SEO/分发层完整。

### Step 7 — 上线 & 自动重建
- **做什么**: 部署到 Cloudflare Pages 或 Vercel;在 Directus 后台给 `posts` / `pages` / `projects` 的 Create/Update 事件配 **Webhook → Deploy Hook URL**,实现"发文即重建"(约 60~90s 上线);配置自定义域名 + HTTPS。
- **验证**: 在 Directus 后台发一篇新博客 → 1~2 分钟后线上自动出现;关站点 404 / 500 错误日志。
- **产出**: **MVP 上线** 🎉。

### (可选) Step 8+ — 增强
- i18n(中英双语,走 Astro i18n + Directus translations)
- Pagefind 静态全文搜索
- Directus Visual Editor / Live Preview 对接(让后台编辑时右侧实时看到前端效果)
- 评论系统(Giscus / 自建 comments collection)
- Newsletter 订阅(Directus `subscribers` collection + Buttondown/Resend Flow)

---

## 附:关键链接汇总(均已实测可访问)

- Directus SDK 官方文档: https://directus.io/docs/guides/connect/sdk
- Next.js 教程: https://directus.io/docs/tutorials/getting-started/fetch-data-from-directus-with-nextjs
- Nuxt 教程: https://directus.io/docs/tutorials/getting-started/fetch-data-from-directus-with-nuxt
- Astro 教程: https://directus.io/docs/tutorials/getting-started/fetch-data-from-directus-with-astro
- SvelteKit 教程: https://directus.io/docs/tutorials/getting-started/fetch-data-from-directus-with-sveltekit
- 图片转换: https://directus.io/docs/guides/files/transform
- **官方 Starter 仓库(四框架 CMS 模板)**: https://github.com/directus-labs/starters
- SDK npm: https://www.npmjs.com/package/@directus/sdk (当前 21.2.2)
- 已归档的旧 examples 仓库(仅作历史参考): https://github.com/directus-labs/examples