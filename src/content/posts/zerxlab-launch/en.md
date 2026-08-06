---
title: "Introducing ZerxLab"
excerpt: "A public shopfront for the lab — why it exists, what it runs on, and what comes next."
coverLabel: "v0.1 Launch"
date: "2026-04-17T00:00:00.000Z"
author: "zerx"
category: "meta"
tags: ["astro", "bun", "open-source"]
featured: true
---

# Introducing ZerxLab

After a few weekends of polish, ZerxLab finally has a home of its own.

## Why a new site?

I have shipped many small projects scattered across GitHub, AUR, NPM, personal blogs, and various tech platforms. None of them had a **single place to live and tell their story**. Hence this site — not a blog, not a portfolio, but a public shopfront for a "lab".

## Stack

- **Astro 6** — the best shape for blog + landing, zero JS by default
- **Bun** — local package management and script runner
- **Tailwind CSS v4** — CSS-first, design tokens as variables
- **Astro Content Collections** — content is Markdown in the repo, versioned and reviewable
- **GitHub Actions + rsync** — fully prerendered; shipping means pushing one `dist/`
- **MIT licensed** — everything open, including this site

## Editorial rules

Posts here will not chase "daily updates" or "hot news". The focus is:

1. Real projects and problems I ran into
2. Reproducible performance work and architecture decisions
3. Release notes and iteration logs of open-source tools

Every post should be helpful to "future me a year from now". If it happens to help you too, that is a bonus.

---

Reach out via [GitHub](https://github.com/zerx-lab). Issues, PRs, and Discussions — all welcome.
