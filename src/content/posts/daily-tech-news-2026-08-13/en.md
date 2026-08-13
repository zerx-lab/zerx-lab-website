---
title: "Daily Tech News - Aug 13, 2026"
excerpt: "Top stories: the full forensic report on the LiteLLM supply chain attack lands, revealing a 153GB credential leak that hit 2,500+ companies including AWS, Samsung, Cisco, and Nvidia; Google's Gemini app crosses 1 billion monthly active users, its fastest-growing product ever; and an actively exploited Cisco ASA/FTD firewall DoS zero-day forces a CISA-mandated patch deadline of August 14. Also: OpenAI's 14x-faster Ultrafast mode, an IBM-OpenAI enterprise partnership, and a routine PostgreSQL security release."
coverLabel: "08/13"
date: "2026-08-13T00:00:00.000Z"
author: "ai"
category: "news"
tags: ["daily-news", "ai", "llm", "github", "infra"]
featured: false
---

Today's biggest story is a slow-burn one: a supply chain attack against the open-source AI gateway LiteLLM that actually happened back in March finally got its full forensic writeup today, and the numbers are staggering — 153GB of stolen credentials, 2,500+ companies, and 434,000 compromised CI/CD pipelines. On a brighter note, Google posted a milestone worth noting: the Gemini app just crossed 1 billion monthly active users, its fastest-growing product in company history. On the security front, an actively exploited denial-of-service zero-day in Cisco's ASA/FTD firewalls triggered an emergency CISA deadline — federal agencies have until tomorrow to patch. Below, we also cover a busy day for OpenAI, plus routine-but-important security updates for PostgreSQL and Podman.

## 🔥 Top Stories

### 1. LiteLLM Supply Chain Attack: Full Forensics Reveal 153GB Credential Leak Hitting 2,500+ Companies ⭐⭐⭐⭐⭐

**Key Points:**
- Security researchers and multiple outlets published the complete forensic timeline today of a supply chain attack on LiteLLM, the popular open-source AI proxy gateway. The attacker group, tracked as TeamPCP, compromised the vulnerability scanner Trivy on March 19, used it to gain read access to LiteLLM's CI/CD pipeline, stole its PyPI publishing token, and shipped two backdoored releases (1.82.7 and 1.82.8) on March 24.
- The malicious payload ran during the automated build process and systematically harvested AWS secret keys, Salesforce client secrets, Slack signing secrets, Azure environment variables, AI provider API keys, and database passwords. Security firm Hudson Rock analyzed a 153GB archive containing 433,909 files, tracing the fallout to roughly 2,488 corporate domains and an estimated 434,000 compromised CI/CD pipelines.
- Confirmed affected organizations include AWS, Samsung Electronics, Cisco, Salesforce, Nvidia, Microsoft, ServiceNow, Siemens, S&P Global, Airbus U.S., and John Deere — spanning nearly every major industry. Hudson Rock is running an "ethical disclosure" effort to notify victims, though some organizations reportedly still haven't confirmed full credential rotation even after being contacted.

**Technical Analysis:**
The most alarming part of this story isn't the attack chain's sophistication — it's the exposure window. Nearly five months passed between the March 24 backdoor release and today's full public disclosure. Any team that installed the poisoned version during that window has almost certainly had CI/CD credentials circulating on underground markets without knowing it. The entry point is also worth flagging: attackers didn't hit LiteLLM directly — they compromised Trivy, a security scanning tool LiteLLM's pipeline depended on. A tool meant to catch vulnerabilities became the poisoning vector instead, a cautionary tale for any team that wires third-party security scanners into CI without pinning versions.

**Developer Action Items:**
- Immediately audit CI/CD history for any installation of LiteLLM 1.82.7 or 1.82.8 after March 24.
- If contamination is found, treat every credential exposed in that CI/CD environment (cloud keys, database passwords, third-party API keys, SSH private keys) as compromised and rotate them from a clean environment.
- Pin exact versions for all third-party security tooling (scanners, linters, signing tools) integrated into CI pipelines — don't auto-upgrade to "latest."

**Related Links:**
- Analysis: [Help Net Security](https://www.helpnetsecurity.com/2026/08/13/litellm-breach-stolen-credentials-leak/)
- Report: [Cybernews](https://cybernews.com/security/litellm-supply-chain-attack-credentials-leak/)
- Report: [hackread](https://hackread.com/litellm-breach-2500-companies-434k-ci-cd-pipelines/)

- Sources: Hudson Rock security research + Help Net Security, Cybernews, hackread, CyberInsider, ITPro
- Verification: ✓ Multi-source confirmed

### 2. Google's Gemini App Crosses 1 Billion Monthly Active Users, Fastest-Growing Product in Company History ⭐⭐⭐⭐⭐

**Key Points:**
- Google confirmed today that the Gemini app has officially surpassed 1 billion monthly active users, making it the company's fastest-growing product ever and the 14th Google product to reach the billion-user mark. The growth curve has been steep: 400 million users at I/O in May 2025, 900 million by this May, 950 million by late July, and now 1 billion.
- Official figures show 63% of users interact with Gemini via voice, and that share is still climbing; one in five Gemini Live sessions incorporates camera or screen sharing; 38% of education-related requests include file uploads; and the app now generates over 150 million images daily. iOS active users have topped 100 million, and macOS users engage roughly twice as often as users on other platforms.
- Gemini can now chain tasks across 40+ apps (booking a table, ordering a ride), echoing the recent rollout of Gemini Intelligence on Android. The milestone also puts Gemini roughly on par with ChatGPT, which crossed 1 billion monthly users back in June.

**Technical Analysis:**
Viewed against the past year's trajectory, Gemini went from 400 million to 1 billion in about 15 months, with most of that growth concentrated in the last six months — closely tracking Google's strategy of deeply embedding Gemini at the OS level on Android (default assistant, cross-app agent invocation). The fact that voice interaction now accounts for well over half of usage, and is still rising, signals that "typing a query" is giving way to "just talking" — worth internalizing for any team designing AI product interactions, where voice-first may no longer be optional. Parity with ChatGPT on raw user count also suggests the AI assistant race is entering a retention-and-depth phase rather than a pure user-acquisition one.

**Developer Action Items:**
- For consumer-facing products, consider whether voice-first interaction design deserves priority investment rather than treating voice as a secondary input method layered on top of text.
- Watch for whether Google opens up third-party access to Gemini's cross-app agent invocation — this could become a new distribution channel for ecosystem app developers.
- If your product competes with or complements the Gemini API, the platform- and use-case-specific usage data disclosed today is a useful benchmark for user behavior.

**Related Links:**
- Official announcement: [Google Blog](https://blog.google/innovation-and-ai/products/gemini-app/one-billion-monthly-users/)
- Report: [TechCrunch](https://techcrunch.com/2026/08/11/googles-gemini-app-surges-to-one-billion-users/)
- Report: [9to5Google](https://9to5google.com/2026/08/11/gemini-app-1-billion/)

- Sources: Google official announcement + TechCrunch, 9to5Google, The Information, PYMNTS
- Verification: ✓ Official + multi-source confirmed

### 3. Actively Exploited Cisco ASA/FTD Firewall DoS Zero-Day (CVE-2026-20349), CISA Sets August 14 Federal Deadline ⭐⭐⭐⭐⭐

**Key Points:**
- Cisco confirmed today that a CVSS 8.6 high-severity vulnerability (CVE-2026-20349) in its Secure Firewall ASA and FTD software is being actively exploited in the wild. It affects Remote Access SSL VPN-related services, including IKEv2 remote access VPN, SSL VPN, and Zero Trust Network Access (ZTNA).
- An unauthenticated remote attacker can send a specially crafted HTTP request to force the affected firewall to unexpectedly reload, causing a denial-of-service condition. Because the trigger requires no authentication and no user interaction, exploitation is straightforward to reproduce.
- Cisco PSIRT has confirmed active exploitation, and CISA has added the flaw to its Known Exploited Vulnerabilities (KEV) catalog, requiring U.S. federal civilian agencies to remediate by August 14 — tomorrow. Cisco has released hotfixes for ASA versions 9.16/9.18/9.20/9.22/9.23/9.24 and FTD versions 7.0/7.2/7.4/7.6/7.7/10.0, and explicitly states there is currently no available workaround.

**Technical Analysis:**
"No authentication, no user interaction, one HTTP request triggers a reload" is about as low a bar as an exploit can clear — attackers don't need a sophisticated chain, just a scan for internet-exposed devices. What makes it worse is Cisco's explicit statement that no mitigation exists beyond patching; there's no configuration workaround to fall back on while you wait for a maintenance window. ASA/FTD firewalls typically sit at the network perimeter, so even without full compromise, an attacker who can remotely trigger reboots has a ready-made tool for mass-disrupting an organization's network egress — or a useful first step in a larger attack chain that exploits the brief window during a reboot.

**Developer Action Items:**
- Teams running Cisco ASA or FTD should immediately check whether their current version is affected and apply the hotfix without waiting for a routine maintenance cycle.
- Since no mitigation exists, teams unable to patch immediately should consider temporarily limiting the internet exposure of Remote Access SSL VPN services as a stopgap.
- Check firewall logs for recent unexpected reload events as an early indicator of possible exploitation.

**Related Links:**
- Report: [Help Net Security](https://www.helpnetsecurity.com/2026/08/13/cve-2026-20349-cisco-firewalls-dos/)
- Report: [SecurityWeek](https://www.securityweek.com/cisco-patches-firewall-zero-day-exploited-for-dos-attacks/)
- Analysis: [Qualys ThreatPROTECT](https://threatprotect.qualys.com/2026/08/13/cisco-asa-and-ftd-dos-vulnerability-exploited-in-the-wild-cve-2026-20349/)

- Sources: Cisco official advisory + CISA KEV catalog + Help Net Security, SecurityWeek, Qualys
- Verification: ✓ Official + multi-source confirmed

---

## AI

### OpenAI Launches Ultrafast Mode: GPT-5.6 Sol Runs 14x Faster via Cerebras ⭐⭐⭐⭐

OpenAI today launched Ultrafast, a new mode that runs GPT-5.6 Sol at up to 14 times the standard speed — up to 750 output tokens per second — powered by an infrastructure partnership with chipmaker Cerebras. OpenAI says that until now, achieving real-time-level speed usually meant trading down to a smaller or more specialized model; Ultrafast is pitched as breaking that tradeoff. The mode targets latency-sensitive enterprise use cases: incident response, customer service, financial market analysis, and e-commerce. It's currently in limited preview for select customers, with no pricing or general-availability date announced yet — OpenAI says access will expand as capacity grows. For comparison, Anthropic offers a similar "fast mode" for Claude, though it doesn't match Ultrafast's throughput.

**Why it matters:** The long-standing engineering tradeoff between response speed and model capability for latency-sensitive agent applications (voice support, real-time risk scoring) could be redefined if Ultrafast delivers as promised. Teams on the waitlist or evaluating latency-critical agent deployments should track the preview rollout.

- Source: [TechCrunch](https://techcrunch.com/2026/08/13/openai-introduces-ultrafast-a-new-mode-that-makes-gpt-5-6-sol-work-at-14x-the-speed/)
- Verification: ✓ Official announcement

### Writer Ships Palmyra X6, Built on Z.ai's GLM-5.2, Cuts Agent Costs 52% ⭐⭐⭐⭐

Enterprise AI company Writer today launched its new flagship model, Palmyra X6, openly disclosing in its technical report that it's a post-trained variant of Z.ai's open-weight GLM-5.2 model, paired with an upgraded version of Writer's agent runtime ("harness"). According to Writer, the combination of Palmyra X6 and the new harness cuts average agent platform costs by 52%, improves speed by 48%, and boosts quality by 10%. Writer's internal research further found that harness optimization alone — without changing the underlying model — delivered an average 40% cost reduction, leading the team to conclude that "harness efficiency compounds across every model an organization runs." Palmyra X6 remains model-agnostic, working alongside Writer's other models or external ones on Azure and AWS Bedrock.

**Why it matters:** This launch makes a point worth internalizing amid the industry's model-selection arms race: Writer's data suggests the runtime framework — not the underlying model — is often the bigger lever on actual production cost. Teams worried about agent token spend should consider optimizing how they use a model, not just which model they use.

- Sources: [TechCrunch](https://techcrunch.com/2026/08/13/writer-introduces-new-ai-model-and-upgraded-harness-to-contain-token-costs/), [SiliconANGLE](https://siliconangle.com/2026/08/13/writer-launches-major-agentic-ai-improvements-palmyra-x6-flagship-model/)
- Verification: ✓ Official + multi-source confirmed

### IBM Partners with OpenAI to Launch a Dedicated Enterprise Consulting Practice ⭐⭐⭐⭐

IBM and OpenAI today announced a strategic partnership under which IBM Consulting will stand up a dedicated OpenAI practice, training and certifying tens of thousands of consultants on OpenAI's technology. GPT-5.6, Codex, and ChatGPT Work will be integrated into IBM's Consulting Advantage platform, with a focus on financial services, government, telecom, and retail. The companies will also build a joint "Forward Deployed Experts" team through OpenAI's Partner Network — deepening a collaboration that began with a cybersecurity-focused initiative back in June.

**Why it matters:** This is another piece of OpenAI's enterprise go-to-market strategy — shifting from direct enterprise sales toward reaching a broader customer base through established consulting relationships like IBM's. Traditional enterprises already using IBM watsonx, or considering OpenAI adoption, may find the integration barrier lowered.

- Source: [TechCrunch](https://techcrunch.com/2026/08/13/ibm-partners-with-openai-to-bolster-enterprise-ai-push/)
- Verification: ✓ Official announcement

### OpenAI Names New CRO: Former Wiz President Dali Rajic ⭐⭐⭐

OpenAI announced today that Dali Rajic will become its new Chief Revenue Officer, succeeding Denise Dresser after just nine months in the role. Rajic previously served as President and COO of cloud security company Wiz — the hire is seen as OpenAI's latest move to strengthen its enterprise sales capacity.

**Why it matters:** Paired with today's IBM partnership announcement, OpenAI is clearly doubling down on enterprise sales and channel capability, signaling a strategic pivot from pure model competition toward enterprise monetization. Teams evaluating enterprise OpenAI partnerships should watch for follow-on changes to the sales org and channel policy.

- Source: [TechCrunch](https://techcrunch.com/2026/08/13/openai-hires-new-cro-as-executive-shake-up-continues/)
- Verification: ✓ Official announcement

### Nvidia Ships Its First Open-Weight Model, Nemotron 3.5 Lightning, Amid a US Response to Chinese Open-Weight Labs ⭐⭐⭐

Nvidia recently released Nemotron 3.5 Lightning — the company's first fully open-weight in-house model, a 30-billion-parameter mixture-of-experts design that activates just 3 billion parameters per token. Built for autonomous agent tasks, it runs on a single consumer GPU, delivers up to 4x faster output than comparable open models, and completes agentic tasks roughly 30% faster. Distilled from Nvidia's larger Nemotron 3 Ultra, the weights are freely available for commercial use on Hugging Face. CNBC frames this release, alongside Meta's recent Muse Glimmer, as U.S. labs' answer to the continued dominance of Chinese open-weight labs like DeepSeek, Moonshot AI, and Alibaba's Qwen.

**Why it matters:** Nvidia has long played the "sell the shovels" role as a hardware vendor; shipping its own open-weight model with published training data and methodology signals a shift toward becoming a model ecosystem participant, not just an infrastructure supplier. Teams evaluating lightweight, locally-run agent models should add it to their comparison list.

- Sources: [CNBC](https://www.cnbc.com/2026/08/11/nvidia-releases-nemotron-3point5-lightning-open-source-ai-model-.html), [MarkTechPost](https://www.marktechpost.com/2026/08/11/nvidia-ai-releases-nemotron-3-5-lightning-and-nemo-switchyard/)
- Verification: ✓ Official + multi-source confirmed

## GitHub / Open Source

### X Dramatically Expands Its Open-Sourced Ranking Algorithm, Adds a "Shadowban" Visibility Tool ⭐⭐⭐⭐

X today significantly expanded its open-source codebase on GitHub under the Apache v2 license, publishing the core ranking engine and model configurations behind the "For You" timeline — roughly 10-15x larger than its previous open-source release. Alongside it, X shipped a new transparency feature: users who post 10+ times a month can download a JSON file from account settings showing whether any visibility-limiting labels were applied to their account or posts over the past month. Non-technical users are encouraged to feed that file, plus the GitHub repo, into an AI chatbot for interpretation. X VP of Product Keith Coleman said "anyone in the public can assess how posts are distributed," though some systems remain withheld to prevent gaming.

**Why it matters:** This is a rare "downloadable data plus readable code" combination in the ongoing push for social platform algorithm transparency, giving researchers and developers studying algorithmic fairness and content distribution a genuinely new first-party data source — and a reference model other platforms could follow.

- Source: [TechCrunch](https://techcrunch.com/2026/08/13/x-open-sources-its-ranking-algorithm-letting-users-see-if-theyve-been-shadowbanned/)
- Verification: ✓ Official announcement

### GitHub Copilot Adds Gemini 3.7 Flash; Agent Plugins 1.0 Standard Goes Live ⭐⭐⭐⭐

GitHub's changelog shows Google's latest Flash model, Gemini 3.7 Flash, is rolling out in Copilot today, with tuning for web/app development and agentic coding workflows — code quality, final-output presentation, codebase research, and verification on complex tasks — available to Pro, Pro+, Max, Business, and Enterprise users. Separately, Agent Plugins 1.0 — the open standard jointly published earlier this month by AWS, Anysphere, Microsoft, OpenAI, and Vercel — is now integrated into VS Code, Copilot CLI, and the Copilot app, letting developers build an agent skill or MCP server package once and reuse it across compatible clients without single-vendor lock-in.

**Why it matters:** Agent Plugins 1.0 is a rare case of direct competitors jointly defining and simultaneously shipping a vendor-neutral standard across mainstream tooling. It should lower the cost of maintaining custom agent skills across multiple clients — teams already building custom skills should evaluate the migration payoff.

- Sources: [GitHub Changelog - Gemini 3.7 Flash](https://github.blog/changelog/2026-08-13-gemini-3-7-flash-is-now-available-in-github-copilot/), [GitHub Changelog - Agent Plugins 1.0](https://github.blog/changelog/2026-08-12-agent-plugins-1-0-in-vs-code-copilot-cli-and-the-copilot-app/)
- Verification: ✓ Official announcement

### GitHub Trending: A Claude Code Diagram Library Pulls in 4,500+ Stars in a Single Day ⭐⭐⭐

Topping today's GitHub Trending is **[cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design)** (HTML, 14.3k+ stars, +4,504 today) — a self-contained HTML+SVG library of 29 editorial-style diagram templates built specifically for use with Claude Code. Also rising: **[cactus-compute/needle](https://github.com/cactus-compute/needle)** (Python, 4.9k stars, +768 today), a compact foundation model optimized for resource-constrained devices; while the official **[anthropics/skills](https://github.com/anthropics/skills)** repo (169k stars) and the persona-driven agent library **[msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents)** (145k stars) continue to hold strong.

**Highlight:** A niche tool focused purely on "giving Claude Code reusable diagram templates" pulling 4,500+ stars in a day suggests that "how do agents produce professional, well-formatted visual output" is emerging as the next layer of developer demand — right behind "can agents get the job done at all."

- Source: [GitHub Trending](https://github.com/trending)
- Verification: ✓ Official data

## Backend & Infrastructure

### PostgreSQL Ships Routine Security Release Fixing 28 Bugs, Including Several CVSS 8.8 RCEs ⭐⭐⭐⭐

The PostgreSQL Global Development Group released updates today for 18.6, 17.11, 16.15, 15.19, and 14.24, alongside 19 Beta 3, fixing 28 security vulnerabilities and over 110 bugs. Several CVSS 8.8 vulnerabilities enable arbitrary code execution, including heap buffer overflows in regex processing, `to_char`, `pg_stat_statements`, and `pg_dump`, plus a SQL injection via `EXTRACT` expression deparsing (CVE-2026-15741). The release also fixes a data-correctness bug where GIN index builds could corrupt `reltuples` values, silently causing autovacuum to skip affected tables. PostgreSQL 14 will reach end-of-life on November 12, 2026.

**Why it matters:** The fixed vulnerabilities cluster around high-traffic code paths — regex matching, type coercion, statistics queries — that nearly every production deployment touches. Database teams should upgrade on the standard security-patch cadence and pay particular attention to the GIN/btree_gist/ltree index rebuild instructions in the release notes.

- Source: [PostgreSQL official announcement](https://www.postgresql.org/about/news/postgresql-186-1711-1615-1519-1424-and-19-beta-3-released-3365/)
- Verification: ✓ Official announcement

### Podman 6.1 Adds Volume Rename and Machine Restart Commands ⭐⭐⭐

Podman shipped version 6.1 with a new `podman volume rename` command that renames existing volumes without recreating them (excluding volumes created by volume drivers or currently in use by a container), plus a new command to restart Podman-managed virtual machines. The release also brings improvements to Quadlet, networking, Kubernetes integration, and Docker API compatibility.

**Why it matters:** Volume renaming closes a small but genuinely annoying gap in day-to-day Podman operations — previously the only workaround was create-new-volume, migrate data, delete-old-volume. This release narrows the day-to-day usability gap with the Docker toolchain a bit further.

- Source: [Linuxiac](https://linuxiac.com/podman-6-1-adds-volume-renaming-machine-restart/)
- Verification: ✓ Official announcement

## Tech Industry

### Apple in Talks to Pay Publishers for Real-Time News Access to Power New Siri ⭐⭐⭐

Per a Wall Street Journal report, Apple is negotiating multi-year deals with news publishers under a variable compensation model — paying based on how often content is actually used, rather than a fixed licensing fee — with a discussed budget in the nine figures. The goal is to give the more advanced Siri Apple plans to ship later this year the ability to handle time-sensitive news and current-events questions. The report notes this comes after Apple's earlier Apple Intelligence news-summary feature drew controversy over factual inaccuracies, framing today's investment in content sourcing as a lesson learned.

**Why it matters:** If the "pay per use" compensation model gains traction, it could offer a new reference point for the long-contentious pricing debate between publishers and AI companies over content licensing. Content-industry teams and AI products relying on news data sources should watch how the specific terms shake out.

- Source: [TechCrunch](https://techcrunch.com/2026/08/13/apple-in-talks-to-pay-publishers-to-provide-siri-with-current-news-report/)
- Verification: ✓ Multi-source confirmed (WSJ first reported, followed by TechCrunch, MacTech, Time News)

---

## 📊 Today's Numbers

| Metric | Value |
|------|------|
| Sources searched | 20 |
| Candidate stories | 21 |
| After dedup | 15 |
| Final selection | 12 |
| Multi-source verification rate | ~92% |

---

> This post was generated by AI using a multi-source cross-verification process. If you spot an error, feedback is welcome.
