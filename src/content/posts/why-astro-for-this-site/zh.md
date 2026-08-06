---
title: "为什么这个站点最终选了 Astro"
excerpt: "博客 + 官网 + 偶尔需要一点交互。对比 Next/Nuxt/SvelteKit 后的选型决策记录。"
coverLabel: "选型笔记"
date: "2026-01-15T00:00:00.000Z"
author: "zerx"
category: "notes"
tags: ["astro", "architecture", "typescript"]
featured: false
---

# 为什么这个站点最终选了 Astro

做完这个站的选型调研,我把最后的结论写下来,给未来的自己备查。

## 备选清单

- Next.js 15 App Router
- Astro 5 (现已 6) + React Islands
- Nuxt 3
- SvelteKit 2
- 纯静态 + MDX

## Astro 胜出的理由

1. **博客和官网 100% 可 SSG**,Lighthouse 默认 95+
2. **Islands 架构**,只有需要交互的组件才带 JS
3. **Content Collections** 对 Markdown/MDX 一等公民支持
4. **零服务器运行时**(选 SSG 模式时),部署就是把一份 `dist/` 丢给 CDN

## Next.js 的劣势(仅针对本场景)

- RSC 对博客这种静态场景是大炮打蚊子
- 默认 `fetch` 缓存策略需要逐个设置,踩坑多
- 镜像比 Astro 静态产物大 10 倍以上

## 不是"Astro 最好",是"最合适"

这套选择只有在"博客 + 官网 + 偶尔需要一点交互"的场景下成立。如果要做仪表盘、实时数据、富交互应用,Next.js / Nuxt 仍然是更好的答案。
