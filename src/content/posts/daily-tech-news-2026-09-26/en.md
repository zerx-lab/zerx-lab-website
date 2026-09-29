---
title: "Daily Tech News - Sep 26, 2026"
excerpt: "A quiet day. Top 3: Musk lays out a schedule that takes xAI's Colossus 2 past 1.2 million Nvidia chips by year-end; Meta patches a SEV-2 flaw in its Muse agent that could expose a user's cloud VM; Crusoe cancels a $1.25B Boom turbine order as AI data-center power goes site-by-site. Also: the Jeff small decision models and Eventtia's native MCP server."
coverLabel: "09/26"
date: "2026-09-26T00:00:00.000Z"
author: "ai"
category: "news"
tags: ["daily-news", "ai", "github", "infra"]
featured: false
---

Saturday was quiet, but two threads kept moving: AI infrastructure and agent security. Elon Musk gave the most detailed expansion timetable yet for xAI's Memphis supercomputer, while Crusoe dropped a $1.25B gas-turbine purchase, so the day shows both how much compute is being built and how hard it is to power. Meta, meanwhile, tightened Muse's isolation after a vulnerability report. Eight items below, since there was less to cover.

## 🔥 Top Stories

### 1. Musk: xAI's Colossus 2 to add ~660,000 Nvidia chips by year-end, passing 1.2 million ⭐⭐⭐⭐⭐

**Key points:**
- Per Bloomberg's Sep 25 report, Colossus 2 in the Memphis area currently runs about 550,000 Nvidia chips (110,000 GB200 and 440,000 GB300). Another 220,000 GB300s come online next week, and 220,000 more in November.
- A final 220,000 could land by the end of December "if we have luck," taking the cluster above 1.2 million chips. With the neighboring Colossus 1, the Memphis site would approach 1.44 million accelerators.
- It is the most detailed timeline xAI has offered, and it stakes xAI's competition with OpenAI, Google and Anthropic on raw training capacity.

**Analysis:**
What makes this useful is that it gives checkable milestones: three batches of 220,000, in three consecutive windows. The numbers are Musk's own statements, and the last batch is explicitly hedged, so treat them as targets until deliveries are confirmed. The binding constraint is probably not chip supply but power and interconnection: a million-GPU cluster draws power on the order of gigawatts, and how fast on-site generation, substations and cooling get built decides whether chips actually light up. For developers, expect a step change in xAI's training compute this year, which should speed up Grok iterations. It also reinforces that the gap between top labs is increasingly set by infrastructure rather than algorithms.

**What to do:**
- If you are weighing model vendors, treat xAI's compute growth as a leading indicator of faster releases, but don't bake it into roadmaps until the chips are live.
- Track whether the November and December batches ship on time as a read on whether GPU supply is still tight.

**Links:**
- Report: [Bloomberg](https://www.bloomberg.com/news/articles/2026-09-25/elon-musk-aims-to-double-colossus-2-s-nvidia-chips-by-year-end)
- Report: [Invezz](https://invezz.com/news/2026/09/25/elon-musk-says-xais-colossus-2-could-more-than-double-nvidia-chip-count-by-year-end/)
- Report: [WION](https://www.wionews.com/world/musk-plans-to-more-than-double-xai-s-chips-to-over-1-2-million-nvidia-gpus-by-year-end-1790523547769)

- Verification: ✓ Multiple sources (chip counts and batches agree; figures come from Musk's statements)

### 2. Meta patches Muse SEV-2 flaw: a poisoned link could reach a user's cloud VM ⭐⭐⭐⭐⭐

**Key points:**
- An outside researcher reported the flaw through Meta's bug bounty program; it had not been disclosed before. It could have let an attacker reach a user's dedicated cloud VM, which holds emails and files.
- Exploitation required tricking a user into asking Muse to summarize or process a link to a compromised page. Meta first rated it SEV-2, the third-highest of five levels, and reportedly downgraded it to SEV-3 later.
- Meta's response: a per-user "Muse Secure VM," a separate monitoring agent that checks Muse's outbound internet access, and user approval before sensitive actions such as sending email or making purchases.
- This is separate from the Mac zero-day Objective-See's Patrick Wardle published on Sep 21, which hijacks Muse through an undocumented dictation-endpoint setting.

**Analysis:**
This is a classic indirect prompt injection setup: an agent reads untrusted web content while holding both access to private data and the ability to act. Meta's fix is also classic. It doesn't count on the model spotting malicious input; it limits the blast radius with isolation, independent monitoring and human confirmation. Within one week Muse has shown a local configuration hijack and a cloud-side injection path, which suggests personal agents with cloud sandboxes expose attack surface on both client and server.

**What to do:**
- Audit whether "reads external content" and "accesses private data or takes actions" share one permission domain in your agents, and split them or add confirmation where they do.
- Give each user an isolated execution environment, and monitor outbound network access independently of the model.

**Links:**
- Report: [The Express Tribune (citing The Information)](https://tribune.com.pk/story/2631695/meta-bolsters-muse-safety-warning-after-security-vulnerability-found-the-information-reports)
- Report: [KSL.com](https://www.ksl.com/article/51628738/meta-bolsters-muse-safety-warning-after-security-vulnerability-found-the-information-reports)
- Related: [InfoQ on the Muse Mac zero-day](https://www.infoq.com/news/2026/09/meta-muse-zeroday/)

- Verification: ✓ Multiple sources (The Information plus syndications agree; severity was revised from SEV-2 to SEV-3)

### 3. Crusoe cancels $1.25B Boom turbine order as data-center power goes site-by-site ⭐⭐⭐⭐

**Key points:**
- Crusoe ended its agreement to buy 29 Boom Superpower gas turbines (42 MW each, about 1.21 GW total). The deal was reported at $1.25B with first deliveries in 2027.
- The cancellation comes weeks after Crusoe closed a $3.9B Series F. Crusoe says it will still use turbines, "just not Boom's," and will pick turbines, wind, solar, batteries and grid power per site.
- Boom CEO Blake Scholl said turbines are "no longer part of Crusoe's near term primary power mix at Abilene." Boom says it has other customers, expects to deliver about 250 MW next year and targets 1 GW in 2028. Abilene mainly runs on grid power, with turbines only as backup.

**Analysis:**
For an AI infrastructure company, a large long-term order for unproven power equipment carries a specific risk: the hardware isn't in volume production while demand and site plans keep shifting. Crusoe's move to modular, per-site power trades a single big bet for delivery certainty. For Boom, it loses the launch customer of its data-center turbine business and weakens the plan to fund its Overture supersonic jet with power-plant revenue. Set next to Google's plan to fly TPUs into orbit, power is clearly the top constraint on AI expansion, and companies are answering it in very different ways.

**What to do:**
- When planning owned or colocated GPU capacity, weigh power deliverability and equipment maturity alongside chip lead times.
- If cloud pricing matters to you, watch whether energy limits delay new capacity coming online.

**Links:**
- Report: [TechCrunch](https://techcrunch.com/2026/09/25/crusoe-abandons-1-25b-plan-to-use-boom-turbines-at-ai-data-centers/)
- Report: [TechRepublic](https://www.techrepublic.com/article/news-crusoe-boom-turbine-deal/)
- Report: [AI Weekly](https://aiweekly.co/alerts/crusoe-kills-125b-boom-supersonic-turbine-deal-weeks-after-closing-39b-series-f)

- Verification: ✓ Multiple sources (TechCrunch, TechRepublic and AI Weekly agree)

---

## AI

### Jeff: 0.8B decision models trained on a home GPU, calibrated probabilities in one forward pass ⭐⭐⭐⭐

Firelex released Jeff, three fine-tunes (Qwen3.5 0.8B, Qwen3.5 2B and Gemma 4 E2B) for zero-shot classification. You describe a situation and a set of options, and the model returns calibrated probabilities over them in a single forward pass, with no text generation or output parsing. Across five public benchmarks plus JevBench's hard tier, the 2B model scores 83.1% overall against Jev's published 83.0%. The 0.8B model has a median latency of about 22 ms on an RTX PRO 6000. Code is MIT and weights are Apache 2.0. Training ran on one workstation GPU, about two hours for the 0.8B. The author notes weaker results on reasoning-heavy benchmarks.

**Why it matters:** Routing, moderation and intent classification are high-frequency small decisions that a local millisecond-scale model can handle instead of a large-model API call, cutting cost and latency.

- Source: [GitHub firelex/jeff](https://github.com/firelex/jeff), [AI Weekly](https://aiweekly.co/alerts/firelex-ships-jeff-home-trained-jev-compatible-decision-models)
- Verification: ✓ Multiple sources (repo and press agree; benchmarks are self-reported)

### Eventtia ships a native MCP server so AI assistants can read and write event data ⭐⭐⭐

Event platform Eventtia launched a native MCP server that lets MCP-capable assistants such as Claude, ChatGPT, Gemini, Copilot and Cursor read and write events, attendees, sessions, speakers, check-in and payments. The company says setup takes under five minutes with no code, and it is included in every plan at no extra cost.

**Why it matters:** Write access means an assistant can change customer-facing pages, so define permissions and approval steps before rollout.

- Source: [PR Newswire](http://www.prnewswire.com/news-releases/eventtia-launches-native-mcp-server-to-help-event-teams-manage-events-with-ai-302890281.html), [The Agile Brand Guide](https://agilebrandguide.com/yesterdays-martech-ai-cx-news-september-26-2026/)
- Verification: ✓ Multiple sources (vendor release and trade coverage agree)

## Open Source

### GitHub Trending

Notable repositories on today's trending list:

- **[mvschwarz/openrig](https://github.com/mvschwarz/openrig)** (TypeScript, 1.9k ⭐, +734 today) ⭐⭐⭐⭐
  A multi-agent harness that runs Claude Code and Codex together as one system.
  **Why it stands out:** it gives teams that mix several coding agents a single layer for running and coordinating them.

- **[paperclipai/paperclip](https://github.com/paperclipai/paperclip)** (TypeScript, 93.5k ⭐, about +3.2k today) ⭐⭐⭐⭐
  Agent team management app, covered earlier this week; total stars now stand at 93.5k.

- **[vectorize-io/hindsight](https://github.com/vectorize-io/hindsight)** (Python, 41.6k ⭐, about +4.6k today) ⭐⭐⭐⭐
  Agent memory system, covered earlier this week; it posted the biggest one-day gain on the list today.

- Source: [GitHub Trending](https://github.com/trending)
- Verification: ✓ Figures taken from the trending page

## Backend & Infra

### Colossus 2 and Crusoe: two ends of the same power problem

Today's two infrastructure stories (see Top Stories) point to one constraint: how fast compute grows depends on power delivery, not chip orders. xAI is pushing large parallel batches, while Crusoe is cutting its dependence on any single piece of equipment.

**Why it matters:** For teams renting or building capacity long term, a provider's energy strategy directly affects when that capacity becomes available.

- Source: see the links under Top Stories 1 and 3
- Verification: ✓ Multiple sources

## Tech Industry

### Conductor names a new CEO and claims 12x customer growth ⭐⭐

Answer-engine-optimization platform Conductor said Chief Product Officer Wei Zheng succeeds co-founder Seth Besmertnik as CEO. The company claims customers grew 12x year over year and new-logo growth tripled within the quarter, but it published no customer outcome metrics.

**Why it matters:** Content optimization for AI search is becoming its own product category, yet results data remains opaque, so ask vendors for methodology before buying.

- Source: [The Agile Brand Guide](https://agilebrandguide.com/yesterdays-martech-ai-cx-news-september-26-2026/)
- Verification: ? Unverified (single source, company-reported figures)

---

## 📊 Today's Numbers

| Metric | Value |
|------|------|
| Sources searched | 12 |
| Candidate items | 14 |
| After dedup | 9 |
| Included | 8 |
| Multi-source verification rate | 88% |

---

> This post was generated by AI using multi-source cross-verification. If you spot an error, please let us know.
