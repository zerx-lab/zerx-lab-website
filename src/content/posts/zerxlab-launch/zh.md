---
title: "ZerxLab 正式上线"
excerpt: "一个属于实验室的公开橱窗,为什么它存在、用什么做的,以及接下来会有什么。"
coverLabel: "v0.1 上线"
date: "2026-04-17T00:00:00.000Z"
author: "zerx"
category: "meta"
tags: ["astro", "bun", "open-source"]
featured: true
---

# ZerxLab 正式上线

经过若干个周末的打磨,ZerxLab 终于有了一个属于自己的站点。

## 为什么要做这个站点?

我做过很多小项目,散落在 GitHub、AUR、NPM、个人博客、技术平台之间。它们没有一个**统一的收纳与叙事场所**。于是这个站点诞生了 —— 不只是博客,也不只是作品集,而是一间"实验室"的公开橱窗。

## 技术栈

- **Astro 6** —— 博客和官网的最佳形态,默认零 JS
- **Bun** —— 本地包管理与脚本执行
- **Tailwind CSS v4** —— CSS-first,设计 tokens 即变量
- **Astro Content Collections** —— 内容就是仓库里的 Markdown,版本可回滚
- **GitHub Actions + rsync** —— 全站静态预渲染,推一份 `dist/` 就是一次发布
- **MIT 许可** —— 一切开源,包括这个站点本身

## 约定

这里的文章不会追求"日更"或"热点",而是聚焦:

1. 真实做过的项目与遇到的问题
2. 可复现的性能优化与架构决策
3. 开源工具的发布与迭代记录

每一篇文章都应该能帮到"明年此时的自己"。如果恰好也对你有帮助,那最好不过。

---

欢迎通过 [GitHub](https://github.com/zerx-lab) 与我交流。Issues、PR、Discussions 都是我乐于阅读的。
