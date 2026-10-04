---
title: "Daily Tech News - Oct 04, 2026"
excerpt: "A quiet weekend. Top 3: Strata runs the 125B Qwen3.8-Flash-Next on 12GB gaming GPUs at a claimed 53-94 tokens/s; Xray-core is accused of silently patching a certificate-pinning bypass that left users exposed for about six months; Ousterhout pushes Homa again, but adoption barriers remain."
coverLabel: "10/04"
date: "2026-10-04T00:00:00.000Z"
author: "ai"
category: "news"
tags: ["daily-news", "ai", "llm", "github", "infra"]
featured: false
---

It's a quiet Sunday, so this issue carries seven items. Three threads stand out: an open-source project that squeezes a 125B-parameter MoE model onto consumer GPUs, a disclosure fight around the Xray-core proxy, and Stanford's John Ousterhout making the case for Homa in AI datacenters. Yesterday's stories (the OpenAI safety resignation, the Flock ruling, Aleph Alpha's Kolibri) are not repeated here.

## 🔥 Top Stories

### 1. Strata runs the 125B Qwen3.8-Flash-Next on a 12GB gaming GPU ⭐⭐⭐⭐

**Key points:**
- Strata is an MIT-licensed project for running Alibaba's Qwen3.8-Flash-Next locally. That model is an open-weight, 125B-parameter mixture-of-experts release from August 26, positioned as a preview of the Qwen4 architecture. Requirements: an RTX 20–50 or Radeon RX 7900/9000 card with at least 12GB of VRAM, 32GB of RAM (64GB recommended), and about 80GB of disk.
- The README's own numbers on an RTX 5070: 94 tokens/s generation and 2,650 tokens/s prompt processing with Q2_0 quantization; 53 and 1,620 tokens/s with IQ3_S. An RX 9070 XT manages roughly 60 tokens/s on Q2_0. The repo hit 545 points on Hacker News.
- The trick: the model has 24,576 small experts and uses 10 per token. The GPU caches hot experts, system RAM holds all of them, and the CPU handles the rest. A small draft model adds speculative decoding for a claimed 1.6–1.8x speedup.

**Analysis:**
In an MoE model the bottleneck isn't compute (Qwen's materials say only a few billion parameters are active per token), it's where the expert weights live. Strata tiers experts across VRAM, RAM and CPU by access frequency, trading scheduling work for capacity. Caveats: every speed figure is self-reported, with no independent reproduction. We found no verifiable quality numbers for the aggressive Q2 quantization. And the model itself ships under the Qwen Community License 1.0; Strata's MIT license covers only the project code, with each component keeping its own terms. "It runs" is not the same as "it's fit for production."

**What to do:**
- Run your own code or document tasks at Q2 and IQ3 and compare output quality before accepting the speed trade.
- Check the Qwen Community License 1.0 and each component's license before any commercial use.
- Plan hardware around memory: 64GB of RAM and a fast SSD matter more than the last bit of GPU speed.

**Links:**
- Project: [Niko1221/Strata](https://github.com/Niko1221/Strata)
- Model: [Qwen/Qwen3.8-Flash-Next on Hugging Face](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- Coverage: [The Decoder](https://the-decoder.com/alibaba-releases-qwen3-8-flash-next-targeting-ultimate-cost-efficiency/)
- Discussion: [Hacker News](https://news.ycombinator.com/) (top of the front page, 545 points)

- Verification: ✓ the repo and model-release coverage agree on specs and dates (performance figures are the project's own, unreproduced)

### 2. Xray-core accused of silently patching a certificate-verification bypass ⭐⭐⭐⭐

**Key points:**
- Two net4people/bbs issues (#670 and #672) describe the problem. On January 9, 2026, Xray-core removed the `pinnedPeerCertificateChainSha256` option and introduced `pinnedPeerCertSha256`. The first release with it was v26.1.13 (January 13), and the flaw persisted through at least v26.2.6.
- The bug let an attacker insert a leaf certificate anywhere in the chain and still pass pinning, so pinning of self-signed certificates offered no real protection against man-in-the-middle attacks.
- Researcher dyhkwong reported it on February 6. Maintainers reportedly patched it the same day under a commit message about "simplifying code" and shipped v26.2.6 without a security notice. The first fix is said to have been incomplete, and the researcher went public through a GitHub security advisory on July 3. These claims come from the reporter; we did not find a response from the maintainers.

**Analysis:**
Xray-core is a widely used anti-censorship proxy core, and many of its users sit on hostile networks. Certificate pinning exists for exactly that threat model. The bug is a classic case of hand-rolled verification: to support self-signed certificates the project bypassed standard chain validation with custom pinning logic, and got it wrong. The larger controversy is disclosure. A silent fix gives downstream clients no signal to upgrade, which is especially costly for a tool serving high-risk users. We saw no CVE identifier and did not read an official maintainer statement, so the exact affected range and current fix status should be confirmed against the project's advisories.

**What to do:**
- If you run Xray-core or a client built on it (such as Hiddify), confirm you are on a fully fixed release and check whether your config uses `pinnedPeerCertSha256`.
- Prefer standard CA validation or chain pinning over custom leaf-pinning logic.
- If you maintain security-sensitive open source, publish an advisory with an affected version range when you fix a vulnerability.

**Links:**
- Disclosure: [net4people/bbs #672](https://github.com/net4people/bbs/issues/672)
- Related issue: [net4people/bbs #670](https://github.com/net4people/bbs/issues/670)
- Discussion: [Hacker News](https://news.ycombinator.com/item?id=49956003)

- Verification: ✓ two separate issues and the HN thread agree on the timeline (all rest on the reporter's account; no maintainer response seen)

### 3. Ousterhout makes the Homa case again: datacenters may not need TCP alone ⭐⭐⭐

**Key points:**
- In his AI Engineer talk "Homa: The End of TCP for AI Clusters," Stanford's John Ousterhout argues TCP is a poor fit for the many small, latency-sensitive messages that inference and agent workloads create. The video drew 42 points on Hacker News.
- Homa is a message-oriented protocol with receiver-driven congestion control. It uses switch priority queues to favor short messages, aiming at lower tail latency.
- Coverage and discussion at The Register note that Homa has existed since 2018 and remains largely undeployed. Commenters stress it isn't meant to replace TCP across the internet, only to sit beside it inside controlled datacenters.

**Analysis:**
Homa swaps connections for messages. TCP's byte stream knows nothing about message boundaries, so a large transfer can queue ahead of small ones. Homa lets the receiver allocate bandwidth and schedule by remaining size, which suits short RPCs. Be careful with search summaries claiming production use at Meta and NVIDIA or a "13x" tail-latency cut: we found no reliable primary source for them, so we don't treat them as fact. Middlebox support and the need to leave standard socket programming are the usual reasons for the slow uptake. Read this as a research direction worth tracking, not an imminent migration.

**What to do:**
- If you build datacenter networking or RPC frameworks, read the paper (arXiv 2210.00714) and test in a lab cluster, not in production.
- If tail latency is your problem, check TCP tuning, queueing and application-level batching first. They're usually cheaper.
- Watch whether mainstream RPC frameworks add Homa as an optional transport.

**Links:**
- Talk: [Homa: The End of TCP for AI Clusters](https://ai.engineer/talks/eZ8WWZzoaR0-homa-end-tcp-ai-clusters)
- Paper: [It's Time to Replace TCP in the Datacenter](https://arxiv.org/pdf/2210.00714)
- Discussion: [The Register Forums](https://forums.theregister.com/forum/all/2026/10/01/202618/)

- Verification: ? unconfirmed in part (the protocol design and talk are confirmed; deployment and performance claims lack primary sources, hence the lower rating)

---

## AI

### RemoveMacAI turns off Apple Intelligence on macOS 27 and reclaims disk space ⭐⭐⭐

This open-source tool targets Apple silicon Macs on macOS 27 (tested on 27.0 and 27.0.1). It applies a configuration profile with Apple's restriction keys, deletes downloaded models through the system asset service, and redirects model downloads to a closed local port so they don't return. It disables Siri, Writing Tools, Genmoji, Mail and Messages summaries, Photos Clean Up and Xcode code completion while leaving dictation alone. It doesn't touch `/System`, keeps SIP on, claims no network requests or data collection, is reversible, and survives system updates. It scored 260 points on Hacker News.

**Why it matters:** On a tight dev-machine disk it's a ready way to win space back, but you lose Xcode completion too.

- Source: [omlahore/RemoveMacAI](https://github.com/omlahore/RemoveMacAI)
- Verification: ? unconfirmed (we read the README only and didn't test it on a Mac)

### Agent security: hidden-instruction hijacking remains the main risk ⭐⭐

Today's AI roundups note that once agents get access to email, calendars and bank accounts, a hidden instruction in a single email can hijack their actions. One source also says OpenAI spends more than $500,000 a day investigating unauthorized agent activity. We found no second source for that figure, so treat it as unconfirmed.

**Why it matters:** Prompt injection is still the first threat to model before an agent ships.

- Sources: [AI Weekly](https://aiweekly.co/ai-news-today), [Aidapted](https://aidapted.ro/en/articles/ai-news-october-4-2026-investment-security-warfare/)
- Verification: ? unconfirmed (aggregator reports, no primary source)

## Open Source

### GitHub Trending

Agent tooling still dominates the trending list, with a few general-purpose projects mixed in:

- **[DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail)** (JavaScript, 154.8k ⭐, +1,894 today) ⭐⭐⭐
  A rules and prompt set that makes your agent "think like the laziest senior dev in the room."
  **Why it stands out:** the biggest daily gain on the list, a sign of interest in rules that make agents write less code.

- **[tester-army/e2e](https://github.com/tester-army/e2e)** (TypeScript, 3,039 ⭐, +344 today) ⭐⭐⭐
  A next-generation end-to-end testing framework for web and mobile apps. Very new, worth watching.

- **[caddyserver/caddy](https://github.com/caddyserver/caddy)** (Go, 76.5k ⭐, +226 today) ⭐⭐⭐
  An extensible web server with HTTP/1-2-3 and automatic HTTPS.

- **[getsentry/sentry](https://github.com/getsentry/sentry)** (Python, 45.4k ⭐, +152 today) ⭐⭐
  Developer-first error tracking and performance monitoring.

- Source: [GitHub Trending](https://github.com/trending)
- Verification: ✓ same-day trending data; descriptions come from the list's blurbs

## Backend & Infra

### Page Table Memory Consumption ⭐⭐

A Hacker News post titled "Page Table Memory Consumption" (35 points) looks at how much memory Linux page tables use. We only saw the title and score and did not read the article, so we include it cautiously.

**Why it matters:** For teams running many processes or large-memory services, page-table overhead is an easily missed capacity-planning item.

- Source: [frn.sh](https://frn.sh/pagetables/)
- Verification: ? unconfirmed (front-page title only)

---

## 📊 Today's Numbers

| Metric | Value |
|------|------|
| Sources checked | 9 |
| Candidate items | 14 |
| After de-duplication | 9 |
| Included | 7 |
| Multi-source verification rate | ~45% |

It's a quiet weekend, and some entries rest on a front-page listing or a single source. Each one is labeled with its verification status.

---

> This post was generated by AI using multi-source cross-checking. If you spot an error, please let us know.
