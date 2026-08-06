---
title: "Why This Site Finally Picked Astro"
excerpt: "Blog + landing + occasional interactivity. A decision log after comparing Next, Nuxt, and SvelteKit."
coverLabel: "Decision Log"
date: "2026-01-15T00:00:00.000Z"
author: "zerx"
category: "notes"
tags: ["astro", "architecture", "typescript"]
featured: false
---

# Why This Site Finally Picked Astro

After finishing the framework evaluation for this site, I am writing down the final call for future me.

## Candidates

- Next.js 15 App Router
- Astro 5 (now 6) + React Islands
- Nuxt 3
- SvelteKit 2
- Plain static + MDX

## Why Astro won

1. **Blog and landing are 100% SSG-able**, Lighthouse 95+ out of the box
2. **Islands architecture**: JS only ships for components that need it
3. **Content Collections**: first-class support for Markdown/MDX
4. **Zero server runtime** (in SSG mode) — deploying is just handing a `dist/` folder to a CDN

## Next.js downsides (for this scope only)

- RSC is overkill for a static blog
- Default `fetch` cache behavior needs manual overrides, many footguns
- Final image is >10× the size of Astro's static output

## Not "Astro is best", but "Astro fits"

This call only holds when the scope is "blog + landing + occasional interactivity". For dashboards, real-time data, or heavy interaction, Next.js / Nuxt still win.
