/**
 * ============================================================================
 * ZerxLab Website - i18n UI 字典
 * ----------------------------------------------------------------------------
 * 用途: 承载站点框架层的 UI 文案(导航、按钮、元信息 label 等)。
 *       内容层(博客/项目/AUR 等)通过 Directus translations 关联表管理,
 *       不写在此文件。
 *
 * 新增字符串规范:
 *   - 命名使用点分层级: `nav.home` / `meta.label.posts` / `blog.readMore`
 *   - 默认语言 zh 必须有值,其他语言若缺失会 fallback 回 zh
 *   - 专有名词(品牌名/技术名词)不翻译
 * ============================================================================
 */

export const languages = {
	zh: "中文",
	en: "English",
} as const;

export const defaultLang = "zh" as const;
export const showDefaultLang = false as const;

export type Lang = keyof typeof languages;

/**
 * 语言标签 (用于 <html lang> 属性 / OG locale / sitemap 等 W3C 场景)
 * 与 languages 的 key 一一对应
 */
export const languageTags: Record<Lang, string> = {
	zh: "zh-CN",
	en: "en-US",
};

export const ui = {
	zh: {
		// ---------- 品牌 ----------
		"brand.name": "ZERX-LAB",
		"brand.tagline": "全栈实验室",
		"brand.description":
			"聚焦高性能应用、现代技术架构与开源工具,探索代码与工程的边界。",

		// ---------- 顶部导航 ----------
		"nav.home": "首页",
		"nav.projects": "项目",
		"nav.aur": "AUR",
		"nav.blog": "博客",
		"nav.about": "关于",
		"nav.github": "GitHub",
		"nav.openMenu": "打开菜单",
		"nav.closeMenu": "关闭菜单",
		"nav.menu": "菜单",

		// ---------- 通用操作 ----------
		"action.readMore": "阅读全文",
		"action.viewAll": "查看全部",
		"action.getStarted": "开始探索",
		"action.viewOnGithub": "在 GitHub 查看",
		"action.backToTop": "回到顶部",
		"action.copyLink": "复制链接",
		"action.copied": "已复制",
		"action.toggleTheme": "切换主题",
		"action.toggleLanguage": "切换语言",

		// ---------- 元信息 / 统计栏 ----------
		"meta.status": "状态",
		"meta.status.active": "活跃",
		"meta.established": "建立于",
		"meta.focus": "方向",
		"meta.projects": "项目",
		"meta.aurPackages": "AUR 包",
		"meta.location": "所在地",
		"meta.posts": "文章",
		"meta.categories": "分类",
		"meta.lastUpdate": "最后更新",
		"meta.rss": "RSS",
		"meta.repositories": "仓库",
		"meta.totalStars": "总 Stars",
		"meta.languages": "语言",
		"meta.license": "许可证",
		"meta.framework": "性质",
		"meta.frameworkValue": "开源",
		"meta.contributors": "贡献者",

		// ---------- 分区标题 ----------
		"section.readme": "README",
		"section.features": "核心能力",
		"section.projects": "开源项目",
		"section.aur": "AUR 软件包",
		"section.blog": "博客",
		"section.about": "关于",
		"section.community": "社区",
		"section.stack": "技术栈",

		// ---------- 博客 ----------
		"blog.title": "文章、发布与洞见",
		"blog.description": "记录构建过程、技术决策与开源探索。",
		"blog.empty": "还没有文章,敬请期待。",
		"blog.readingTime": "阅读时长",
		"blog.minutes": "分钟",
		"blog.publishedAt": "发布于",
		"blog.updatedAt": "更新于",
		"blog.author": "作者",
		"blog.tableOfContents": "目录",
		"blog.previousPost": "上一篇",
		"blog.nextPost": "下一篇",
		"blog.relatedPosts": "相关文章",

		// ---------- 项目 ----------
		"projects.title": "开源项目",
		"projects.description": "正在维护或贡献的开源项目列表。",
		"projects.viewSource": "查看源码",
		"projects.viewDemo": "在线体验",
		"projects.viewDocs": "查看文档",
		"projects.stars": "Stars",
		"projects.forks": "Forks",
		"projects.empty": "暂无项目。",

		// ---------- AUR ----------
		"aur.title": "AUR 软件包",
		"aur.description": "为 Arch Linux 用户维护的 AUR 软件包。",
		"aur.install": "安装",
		"aur.viewOnAur": "在 AUR 查看",
		"aur.upstream": "上游项目",
		"aur.version": "版本",
		"aur.maintained": "维护中",
		"aur.empty": "暂无包。",

		// ---------- 关于 ----------
		"about.title": "加入社区,共同构建",
		"about.description": "与使用 ZerxLab 开源项目的开发者们连接交流。",
		"about.joinDiscord": "加入 Discord",
		"about.followGithub": "关注 GitHub",
		"about.followX": "关注 X",
		"about.contact": "联系方式",

		// ---------- 页脚 ----------
		"footer.rights": "保留所有权利",
		"footer.builtWith": "构建于",

		// ---------- 错误页 ----------
		"error.404.title": "页面未找到",
		"error.404.description": "你访问的页面不存在或已被移除。",
		"error.404.home": "返回首页",
		"error.500.title": "服务器错误",
		"error.500.description": "我们遇到了一些问题,请稍后再试。",

		// ---------- 搜索 / 无内容占位 ----------
		"common.loading": "加载中...",
		"common.error": "加载失败",
		"common.retry": "重试",
		"common.empty": "暂无内容",
	},

	en: {
		// ---------- Brand ----------
		"brand.name": "ZERX-LAB",
		"brand.tagline": "Full-Stack Laboratory",
		"brand.description":
			"Building high-performance apps, exploring modern architecture, and shipping open-source tools.",

		// ---------- Top nav ----------
		"nav.home": "Home",
		"nav.projects": "Projects",
		"nav.aur": "AUR",
		"nav.blog": "Blog",
		"nav.about": "About",
		"nav.github": "GitHub",
		"nav.openMenu": "Open menu",
		"nav.closeMenu": "Close menu",
		"nav.menu": "Menu",

		// ---------- Common actions ----------
		"action.readMore": "Read more",
		"action.viewAll": "View all",
		"action.getStarted": "Get started",
		"action.viewOnGithub": "View on GitHub",
		"action.backToTop": "Back to top",
		"action.copyLink": "Copy link",
		"action.copied": "Copied",
		"action.toggleTheme": "Toggle theme",
		"action.toggleLanguage": "Toggle language",

		// ---------- Meta / Stats ----------
		"meta.status": "Status",
		"meta.status.active": "Active",
		"meta.established": "Established",
		"meta.focus": "Focus",
		"meta.projects": "Projects",
		"meta.aurPackages": "AUR Packages",
		"meta.location": "Location",
		"meta.posts": "Posts",
		"meta.categories": "Categories",
		"meta.lastUpdate": "Last update",
		"meta.rss": "RSS",
		"meta.repositories": "Repositories",
		"meta.totalStars": "Total Stars",
		"meta.languages": "Languages",
		"meta.license": "License",
		"meta.framework": "Type",
		"meta.frameworkValue": "Open source",
		"meta.contributors": "Contributors",

		// ---------- Section titles ----------
		"section.readme": "README",
		"section.features": "Features",
		"section.projects": "Projects",
		"section.aur": "AUR Packages",
		"section.blog": "Blog",
		"section.about": "About",
		"section.community": "Community",
		"section.stack": "Stack",

		// ---------- Blog ----------
		"blog.title": "Articles, releases, and insights",
		"blog.description":
			"Notes on what I build, the decisions behind them, and open-source explorations.",
		"blog.empty": "No posts yet. Stay tuned.",
		"blog.readingTime": "Reading time",
		"blog.minutes": "min",
		"blog.publishedAt": "Published",
		"blog.updatedAt": "Updated",
		"blog.author": "Author",
		"blog.tableOfContents": "On this page",
		"blog.previousPost": "Previous",
		"blog.nextPost": "Next",
		"blog.relatedPosts": "Related",

		// ---------- Projects ----------
		"projects.title": "Open-source projects",
		"projects.description":
			"Projects I currently maintain or actively contribute to.",
		"projects.viewSource": "View source",
		"projects.viewDemo": "Live demo",
		"projects.viewDocs": "Docs",
		"projects.stars": "Stars",
		"projects.forks": "Forks",
		"projects.empty": "No projects yet.",

		// ---------- AUR ----------
		"aur.title": "AUR Packages",
		"aur.description": "AUR packages maintained for Arch Linux users.",
		"aur.install": "Install",
		"aur.viewOnAur": "View on AUR",
		"aur.upstream": "Upstream",
		"aur.version": "Version",
		"aur.maintained": "Maintained",
		"aur.empty": "No packages yet.",

		// ---------- About ----------
		"about.title": "Join the community, build together",
		"about.description":
			"Connect with developers using the ZerxLab open-source projects.",
		"about.joinDiscord": "Join Discord",
		"about.followGithub": "Follow on GitHub",
		"about.followX": "Follow on X",
		"about.contact": "Contact",

		// ---------- Footer ----------
		"footer.rights": "All rights reserved",
		"footer.builtWith": "Built with",

		// ---------- Error pages ----------
		"error.404.title": "Page not found",
		"error.404.description":
			"The page you are looking for does not exist or has been moved.",
		"error.404.home": "Back to home",
		"error.500.title": "Server error",
		"error.500.description": "Something went wrong. Please try again later.",

		// ---------- Common ----------
		"common.loading": "Loading...",
		"common.error": "Failed to load",
		"common.retry": "Retry",
		"common.empty": "Nothing here yet",
	},
} as const;

/**
 * UI key 类型: 以默认语言为真值来源,确保类型安全
 * 若某 key 在 en 中缺失,t() 会 fallback 到 zh
 */
export type UIKey = keyof (typeof ui)[typeof defaultLang];
