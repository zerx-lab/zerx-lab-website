---
title: "Daily Tech News - Sep 18, 2026"
excerpt: "Top stories: a three-person security startup used Claude Opus 5 to chain a libheif memory bug with an SSO flaw and reach OpenAI staff accounts and an internal repo; Anthropic confirmed a wet lab and opened a verification program with looser biology safeguards; Meta's Muse agent landed on Mac. Also: Google's family agent CC, an AI hallucination that nearly triggered a US military operation, and Manus fundraising."
coverLabel: "09/18"
date: "2026-09-18T00:00:00.000Z"
author: "ai"
category: "news"
tags: ["daily-news", "ai", "llm", "devtools"]
featured: false
---

Two themes ran through September 18: what frontier models can now do, and who gets to decide where they stop. A three-person security team used the freshly released Claude Opus 5 to break into OpenAI's staff account system. Anthropic acknowledged it runs a Bay Area wet lab where models drive real experiments, and opened a vetted-access program with relaxed biology safeguards. On the consumer side, Meta's Muse agent reached the Mac and can now act on local files, mail and calendars. Meanwhile, CNN reported that an AI-fabricated intelligence claim almost led to a US strike on a Chinese vessel.

## 🔥 Top Stories

### 1. Hacktron chains bugs with Claude Opus 5 to reach OpenAI staff accounts and an internal repo ⭐⭐⭐⭐⭐

**Key points:**
- The entry point was OpenAI's community forum, which runs on Discourse. The forum decodes uploaded HEIC/HEIF images with ImageMagick and libheif, and a heap buffer overflow in libheif let a crafted image corrupt server memory.
- A second flaw tied to single sign-on let the researchers take over staff accounts linked to GitHub, reaching ChatGPT and Codex accounts and an internal repository. Hacktron says the whole path took under 72 hours and cost less than $3,000 in tokens.
- The telling detail: Claude Opus 4.8 failed to build a working exploit across several sessions. When Opus 5 shipped, the team gave it the same problem and it succeeded within hours. OpenAI confirmed the fixes and paid a $6,500 bounty. The work is part of a broader Hacktron project, "HEIF Heist", tracing the libheif bug through Slack, Meta, GitHub Enterprise and frameworks like Next.js.

**Technical take:**
The interesting part isn't the headline; it's the step change. Same team, same bug chain, and a model upgrade turned "can't do it" into "done in hours". Multi-stage exploitation (memory corruption, then auth chain, then lateral movement) is now within reach of a small team on a modest budget. The attack surface is also ordinary: a third-party forum's image-decoding dependency, not OpenAI's own code. Any service that runs libheif or ImageMagick on user uploads sits in the same risk class. Defenders should assume working exploit code can be produced in hours, not weeks.

**What to do:**
- Inventory your image pipeline (libheif, ImageMagick, libvips), patch to fixed versions, and disable HEIC/HEIF decoding where you don't need it.
- Decode uploads in a sandbox or low-privilege process so a memory bug can't reach sessions or credentials.
- Audit how third-party systems (forums, wikis) tie into your SSO, so a low-value app can't become a stepping stone to employee accounts.

**Links:**
- [The Hacker News](https://thehackernews.com/2026/09/claude-opus-5-helped-researchers-take.html)
- [VentureBeat](https://venturebeat.com/security/openai-hacked-by-small-team-of-white-hat-security-researchers-using-anthropics-claude-opus-5)
- [TechCrunch](https://techcrunch.com/2026/09/18/researchers-used-anthropics-claude-to-hack-into-openai/)
- Verified: ✓ multiple sources (outlets differ slightly on bounty timing and duration; we kept what they agree on)

### 2. Anthropic confirms a biology lab and launches a verification program with looser safeguards ⭐⭐⭐⭐⭐

**Key points:**
- TechCrunch reports Anthropic operates a wet lab in the Bay Area where AI models can run physical experiments. The focus is fundamental biology rather than drug discovery, with in-house and partner work. Head of life sciences Eric Kauderer-Abrams confirmed: "We absolutely are doing that today." The lab is tied to the April acquisition of Coefficient Bio (about $400M), covering protein design and biomolecular modeling.
- On September 17 Anthropic launched the Life Sciences Verification Program (LSVP), in beta for Claude Enterprise, Team and API organizations. Standard grants cover whole teams, renew yearly, and unlock Mythos 5.1, Opus 5 and Sonnet 5 with classifiers that are more permissive for science tasks. High-risk grants apply to a single project, renew every six months, and remove all safeguards that block life-sciences requests. Cyber and other classifiers stay on.
- Individual plans and BAA-enabled healthcare organizations are excluded.

**Technical take:**
Read the two together. Models are moving from answering biology questions to sitting inside a loop that can act in a physical lab, and safeguards are moving from one-size-fits-all to identity- and project-based access. That shifts part of the safety burden from the model to access control: you verify who is asking and why, not just what the prompt says. It also creates tension, since biology misuse is one of the risks Anthropic's own leadership stresses most. Whether tiered access holds up depends on how rigorous and transparent the vetting is, which outsiders can't yet assess.

**What to do:**
- Life-science teams should check LSVP eligibility; it's organization-level, not individual.
- If you build tiered capability access yourself, note the pattern: identity verification, project-scoped grants, periodic renewal.
- Existing Claude users doing bio work should confirm their plan type is covered rather than assuming safeguards relax automatically.

**Links:**
- Official: [Introducing the Life Sciences Verification Program](https://www.anthropic.com/news/life-sciences-verification-program)
- [TechCrunch](https://techcrunch.com/2026/09/18/anthropic-is-operating-a-lab-that-conducts-biology-experiments/)
- [AIwire](https://www.hpcwire.com/aiwire/2026/09/21/anthropic-eases-ai-safeguards-for-verified-life-science-teams/)
- Verified: ✓ official post plus multiple sources

### 3. Meta's Muse agent arrives on Mac and can act on files, mail, calendar and notes ⭐⭐⭐⭐

**Key points:**
- Meta shipped the Mac version of Muse on September 17, after mobile and web launches earlier this month. It works inside native apps, reading and acting on files, messages, calendar, notes and mail.
- Access is opt-in per data source, and Meta says it "always asks before doing anything sensitive."
- TechCrunch notes Muse quickly climbed the US App Store charts at launch, and that Meta and a rival both added voice calling the same week. Zuckerberg: "The team is shipping fast."

**Technical take:**
The desktop is where agents get useful, because the data and workflows are local. It's also where the attack surface grows: anything that can influence model input, such as an email or a shared document, can become a prompt-injection carrier that drives local actions. The "ask before sensitive actions" prompt therefore carries the whole safety model, and Meta hasn't published in detail what counts as sensitive. Given today's first story on how quickly offensive capability is improving, permission design for desktop agents deserves close attention.

**What to do:**
- If you build desktop agents, separate "reads untrusted content" from "performs local actions" by permission, and force confirmation on writes and sends.
- IT teams should assess what consumer agents employees install can reach in mail and files, and cover it in endpoint policy.
- Add prompt-injection tests that treat email bodies and document contents as hostile input.

**Links:**
- [TechCrunch](https://techcrunch.com/2026/09/18/metas-muse-hits-mac-letting-the-ai-take-actions-on-your-computer/)
- Verified: ✓ consistent reporting; defer to Meta's own docs for specifics

---

## AI

### An AI hallucination nearly triggered a US military operation ⭐⭐⭐⭐

CNN reported on September 18 that this spring, a Special Operations Command analyst used a chatbot to combine open-source data with classified signals intelligence. The tool misread a ship's cargo manifest and claimed it held nuclear-weapons-program components. The analyst then used the same tool to format the finding into an official-looking summary that moved through command channels. Aircraft were already airborne when officials found the claim was fabricated, and the operation was called off at the last minute. GovAI's Jake Steckler, a former Army officer, said service members must understand LLM uncertainty, especially for targeting and intelligence.

**Why it matters:** The same tool produced the error and then dressed it up as authoritative. Any pipeline that feeds LLM output into high-stakes decisions needs enforced source tracing and human review.

- Source: [TechCrunch](https://techcrunch.com/2026/09/18/ai-hallucination-nearly-triggers-us-military-operation/)
- Verified: ? relies on CNN's original reporting via TechCrunch; awaiting official confirmation

### Google Labs turns CC into a shared family agent for up to six adults ⭐⭐⭐

Google announced on September 17 that CC, previously a personal experimental agent, now serves families and households. It connects to Gmail, Chat, Docs and Calendar, can pre-fill class-registration PDFs, check live drive times, create shared Docs and Sheets, and sends a morning "Your Day Ahead" brief. Each member chooses what to share instead of handing over a whole account. It's an early Labs experiment for US users 18 and older with personal Google accounts.

**Why it matters:** Shared agents raise permission questions single-user agents avoid: who sees whose data, and how conflicting instructions get resolved. Those design choices will be reference points for collaborative agents.

- Sources: [Google blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/cc-expanding-to-groups/), [TechRepublic](https://www.techrepublic.com/article/news-google-cc-ai-agent-families/)
- Verified: ✓ official post plus other sources

### Claude Code Projects tests parallel threads; OpenAI launches Astra for Law ⭐⭐⭐

Per AI Weekly's roundup, Anthropic is testing parallel threads in Claude Code Projects: scoped work in separate cloud sessions with shared memory, rolling out to some Pro and Max users, with a warning that parallel sessions burn quota faster. The same source says OpenAI's Astra for Law pairs GPT-6 Astra with 230M+ legal URLs, reporting 54% correctness against 38.7% for standard web search on 200 research questions, starting with select law firms (vendor-reported).

**Why it matters:** Agentic coding is moving from single sessions to multi-session orchestration, so quota and context consistency become design concerns. The legal result is self-reported, so run your own evals before relying on it.

- Sources: [AI Weekly, Sep 18 edition](https://aiweekly.co/ai-news-today/edition/2026-09-18), [OpenAI](https://openai.com/index/astra-for-law/)
- Verified: ? mostly from an aggregator; official details pending

## Tech Industry

### Manus in talks to raise $500M at a $4B valuation after the Meta deal collapsed ⭐⭐⭐

TechCrunch reports the Chinese agent startup is in talks to raise $500M at a $4B valuation after resuming independent operations. Its $2B acquisition by Meta fell through when Beijing blocked it over export-control and foreign-investment concerns. Possible investors include IDG Capital, Boyu Capital and CATL, with Tencent, HSG and ZhenFund among existing backers; a restructuring ahead of a Hong Kong IPO is also under consideration. ARR exceeded $100M at the time of the Meta deal.

**Why it matters:** Cross-border regulatory risk for AI deals is now concrete. Acquisition by a US giant is off the table for China-linked teams, leaving independent funding and Hong Kong listings.

- Sources: [TechCrunch](https://techcrunch.com/2026/09/18/manus-seeks-4b-valuation-in-new-500m-fundraise-as-it-resumes-independent-ops/), [The AI Insider](https://theaiinsider.tech/2026/09/21/manus-reportedly-in-talks-to-raise-500m-at-4b-valuation-after-meta-deal-collapse/)
- Verified: ✓ multiple sources (still talks; figures may change)

### US House passes data-center ratepayer bill 417–3 ⭐⭐⭐

Per AI Weekly citing GovInfo, H.R. 9340 passed the House on September 16, directing state utility regulators to consider charging data-center sites of 100 MW or more for full grid-upgrade costs. It now awaits the Senate. Separately, Amazon received a warrant for up to 1.69M Generac shares tied to generator purchases, with an expected $2.4B in initial data-center deliveries across 2027–28 and an $8B cumulative cap.

**Why it matters:** Power costs for AI buildout are becoming a legislative issue, so siting, on-site generation and long-term power contracts will weigh more heavily in data-center plans.

- Sources: [AI Weekly](https://aiweekly.co/alerts/house-passes-ratepayer-protection-act-417-3-on-data-center-costs), [Generac filing coverage](https://aiweekly.co/alerts/amazon-wins-warrant-for-3-generac-stake-in-8b-generator-pact)
- Verified: ? single aggregator; primary documents not independently checked

---

## 📊 Today's Numbers

| Metric | Value |
|------|------|
| Sources searched | 9 |
| Candidate items | 24 |
| After dedup | 14 |
| Included | 8 |
| Multi-source verified | ~63% |

---

> This post was generated by AI using multi-source cross-verification. Please report any errors.
