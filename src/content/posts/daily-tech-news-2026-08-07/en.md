---
title: "Daily Tech News - Aug 7, 2026"
excerpt: "Today's top stories: Black Hat researchers disclosed CI supply-chain flaws in Claude Code and Gemini CLI (Gemini CLI scored a perfect CVSS 10.0); an 18-year-old Linux kernel SCTP bug enables container escape to host root; Microsoft confirmed it will merge its entire Copilot lineup into one app this year. Plus a WordPress pre-auth XSS-to-RCE chain, a Russian Exchange OWA zero-day, and agent-tooling repos dominating GitHub Trending."
coverLabel: "08/07"
date: "2026-08-07T00:00:00.000Z"
author: "ai"
category: "news"
tags: ["daily-news", "ai", "github", "infra"]
featured: false
---

Security dominated the news cycle today. At Black Hat USA, researchers disclosed CI supply-chain vulnerabilities in two of the most widely used AI coding agents, Claude Code and Gemini CLI — a GitHub issue opened by an account with zero repository privileges was enough to execute code on the CI runners behind Anthropic's and Google's own agent repos. Separately, an 18-year-old use-after-free bug in the Linux kernel's SCTP stack surfaced as a full container-escape-to-root exploit. On the industry side, Microsoft confirmed it will fold its entire Copilot product line into a single unified app this year. Below is a full roundup, including fresh WordPress and Exchange server security news and a look at what's trending on GitHub today.

## 🔥 Top Stories

### 1. Black Hat exposes CI supply-chain flaws in Claude Code and Gemini CLI, one scoring a perfect CVSS 10.0 ⭐⭐⭐⭐⭐

**Key Points:**
- Security firm Novee Security presented findings at Black Hat USA on August 5 showing that a GitHub issue opened by an account with no repository privileges was enough to execute code on the CI runners behind Anthropic's and Google's own coding-agent repositories, and to hijack the next agent run on OpenAI's Codex.
- Google's Gemini CLI was assigned CVE-2026-12537, an OS command injection in the container launcher reachable through a crafted `.gemini/.env` file, letting an unprivileged attacker run code on a headless CI host before the sandbox even starts. It received a perfect CVSS v4 score of 10.0.
- Anthropic's Claude Code was assigned CVE-2026-54316: its command validator strips single-quoted text before running its 23 security checks, so a malicious payload hidden in the value of a git flag like `--receive-pack` — which git executes directly — reaches the runner untouched. The bug affects every release from 0.2.54 through 2.1.162. Researchers separately showed the same class of flaw could turn Hugging Face's public download counter into a channel for exfiltrating an API key one character at a time.

**Technical Breakdown:**
Both bugs point to the same structural problem: the risk doesn't come from the underlying model, it comes from the "harness" — the permission logic, tool routing, sandbox boundaries, and shared workspace glue code sitting between the model and real execution. Gemini CLI's flaw is a timing issue (validation runs too late, after the sandbox should have already isolated things); Claude Code's flaw is a logic gap (quote-stripping runs before, not after, the security checks). Both illustrate that once a coding agent is granted CI privileges and asked to process untrusted external input — issue bodies, repo files — a single missed validation step can escalate all the way to host-level code execution. No confirmed in-the-wild exploitation has surfaced yet, but a public reproduction lab for the Claude Code bug has been sitting on GitHub since June 18, narrowing the window teams have to patch.

**Developer Recommendations:**
- Upgrade immediately: Gemini CLI to 0.39.1, run-gemini-cli to 0.1.22, and Claude Code to 2.1.163 or later.
- Audit any CI/CD pipeline that lets a coding agent auto-respond to untrusted external input (issues, PRs); add a human review gate for any step that touches credentials or deploy keys.
- Watch for anomalous Hugging Face download traffic patterns as an early indicator the exfiltration channel is being abused against your Claude Code deployment.

**Related Links:**
- Report: [The Hacker News](https://thehackernews.com/2026/08/claude-code-and-gemini-cli-flaws-let.html)
- Technical writeup: [Novee Security](https://novee.security/blog/critical-flaws-in-anthropic-google-and-openais-coding-agents/)
- Report: [Cyberpress](https://cyberpress.org/critical-flaws-in-claude-code-gemini-cll-openai-codex/)

- Sources: Novee Security technical analysis + The Hacker News, Cyberpress, GBHackers and other independent reports
- Verification: ✓ Confirmed by multiple sources

### 2. "SCTPhantom" — an 18-year-old Linux kernel bug enables root-level container escape ⭐⭐⭐⭐⭐

**Key Points:**
- Researchers at Tencent's Zhuque Lab uncovered a use-after-free bug in the Linux kernel's SCTP networking stack that has existed since it was introduced in 2008 — 18 years of latent risk. Publicly disclosed August 6 as CVE-2026-64564 and nicknamed SCTPhantom, it was assigned by the kernel CVE team just two days earlier.
- The team confirmed reliable root access on kernel builds for Debian 13, Ubuntu 24.04, Rocky Linux 9, RHEL 9, and OpenCloudOS, and successfully used the bug to break out of a container and reach the underlying host.
- Tencent scored it 8.5 under CVSS v4.0. Fixes shipped in stable kernels 7.1.6, 6.18.42, 6.12.101, and 6.6.148 on August 3. As of August 7, no public exploit code has surfaced and the flaw is not listed in CISA's Known Exploited Vulnerabilities catalog.

**Technical Breakdown:**
This is a local privilege-escalation bug, and it requires SCTP to be reachable on the target — a real, if partial, mitigation for exposure. But for cloud hosts and Kubernetes nodes that load the SCTP module by default while running multi-tenant container workloads, the risk is material: once an attacker gains arbitrary code execution inside a container (say, through an application-layer bug), this flaw becomes the next hop from container to host root. The fact that it went undetected for 18 years is also a reminder that large but rarely-exercised parts of the kernel — like a protocol stack most workloads never touch — tend to get proportionally less audit attention.

**Developer Recommendations:**
- Patch production kernels to 7.1.6 / 6.18.42 / 6.12.101 / 6.6.148 or later as soon as possible.
- If your workloads don't need SCTP, blacklist or `modprobe -r sctp` the module outright to remove the attack surface entirely.
- For multi-tenant container/K8s clusters, use this disclosure as a trigger to review kernel module load policy and confirm seccomp/AppArmor profiles follow least-privilege principles.

**Related Links:**
- Report: [The Hacker News](https://thehackernews.com/2026/08/18-year-old-linux-sctp-flaw-could-let.html)
- Analysis: [Cybersecurity News](https://cybersecuritynews.com/18-year-old-linux-kernel-sctp-vulnerability/)
- Report: [GuardianMSSP](https://www.guardianmssp.com/2026/08/07/18-year-old-linux-sctp-flaw-could-let-local-users-gain-root-and-escape-containers/)

- Sources: Tencent Zhuque Lab technical disclosure + The Hacker News, Cybersecurity News, GuardianMSSP and other independent reports
- Verification: ✓ Confirmed by multiple sources

### 3. Microsoft confirms it will merge GitHub Copilot, consumer Copilot, and Cowork into one unified "super app" this year ⭐⭐⭐⭐

**Key Points:**
- On its July 29 earnings call, Microsoft confirmed it is building a single application that folds together consumer Copilot chat, GitHub Copilot, Copilot Cowork, and its new AutoPilot agent layer, connected under a shared identity graph — one login spanning both GitHub and Microsoft 365 — with a toggle to switch between personal and enterprise context. The company says the merged app will ship within 2026.
- In theory, the unified surface lets a user ask a question in chat, jump straight into writing code with the assistant remembering that chat's context, then hand a task off to an autonomous agent — all without leaving the app or re-authenticating.
- Microsoft is simultaneously cutting underperforming features, including Copilot Podcasts and Copilot Labs. The stated motivation: fewer than 4.5% of Microsoft 365's 450 million users currently pay for Copilot features, and its consumer chatbot trails both ChatGPT and Gemini in active usage.

**Technical Breakdown:**
Pulling GitHub Copilot (a developer-facing coding agent) and consumer Copilot (a general office assistant) into one identity system is Microsoft's attempt to counter fragmentation across an increasingly sprawling Copilot product line that's struggling with low paid conversion. For developers, the practical implication is that the permission boundary and data visibility between a GitHub account and a Microsoft 365 account may be redrawn — enterprise admins in particular will need to re-evaluate data governance once "developer context" and "office context" sit behind the same identity graph.

**Developer Recommendations:**
- If your team depends heavily on existing GitHub Copilot workflows (CLI, IDE extensions, cloud agents), watch for Microsoft's detailed migration timeline and identity-system changes to avoid authentication or permission disruptions during the transition window.
- Enterprise admins should proactively assess whether the unified identity graph introduces new cross-visibility between developer tool access and Microsoft 365 workspace data, and adjust access policies accordingly.

**Related Links:**
- Report: [MLQ News](https://mlq.ai/news/microsoft-merges-consumer-and-enterprise-copilot-into-single-app-launches-paid-autopilot-agents/)
- Report: [DevOps.com](https://devops.com/microsoft-confirms-copilot-super-app-is-coming-this-year-and-its-about-more-than-convenience/)
- Report: [Windows Forum](https://windowsforum.com/threads/microsoft-to-merge-copilot-apps-by-aug-2026-add-paid-agents-cut-clutter.435024/)

- Sources: Microsoft's July 29 earnings call + MLQ News, DevOps.com, Windows Forum, Techweez and other independent reports
- Verification: ✓ Confirmed by multiple sources

---

## AI

### Grok's voice model cuts response latency in half, becomes app default on Aug 5 ⭐⭐⭐

xAI shipped a new Grok voice model on July 29 that cuts the wait before it starts speaking from roughly 1.25 seconds to about 0.7 seconds, with better handling of interruptions and conversational back-and-forth. It became the default voice option in the Grok app on August 5.

**Why it matters:** Startup latency is the single biggest factor separating a voice assistant that "feels like a conversation" from one that "feels like waiting on hold" — this update signals the voice-agent race is shifting from raw comprehension to conversational naturalness.

- Source: [AIToolsRecap](https://aitoolsrecap.com/Blog/AINewsAugust2026.aspx)
- Verification: ✓ Confirmed by multiple sources

### EU AI Act's Article 50 transparency obligations become legally enforceable ⭐⭐⭐⭐

The EU AI Act's Article 50 transparency rules became legally enforceable on August 2. AI systems that interact directly with users — chatbots, voice assistants, agentic customer support — must now disclose that a user is talking to AI at the very first point of contact, not buried in a terms-of-service page; AI-generated or manipulated content, including deepfakes, must carry identifiable labels. Enforcement falls mainly to national market surveillance authorities, with fines reaching up to €15M or 3% of global turnover for serious violations (some sources cite a higher 7% ceiling). Systems already on the market before August 2 get a transition period until December 2.

**Why it matters:** If your product serves EU users with a chatbot, AI customer support, or generative content features and doesn't yet disclose AI involvement clearly on first contact, you're already out of compliance — this is worth an immediate audit, not a someday item.

- Sources: [Cooley law firm analysis](https://www.cooley.com/news/insight/2026/2026-08-03-eu-ai-act-transparency-obligations-take-effect-2-august-2026), [Travers Smith law firm analysis](https://www.traverssmith.com/knowledge/knowledge-container/is-it-a-bot-eu-ai-act-transparency-rules-take-effect-2-august-2026/)
- Verification: ✓ Official regulation in effect, confirmed by multiple law firm briefings

### OpenAI moves to dismiss Apple's trade secrets lawsuit ⭐⭐⭐

OpenAI has reportedly filed a 31-page motion asking a court to dismiss Apple's trade secrets lawsuit against it, calling the case "rotten to its core" and countering that Apple filed suit to compensate for its own lagging AI progress.

**Why it matters:** This is the latest in a growing pattern of big-tech litigation over AI-related trade secrets and talent movement between companies; how it resolves could shape the legal boundaries around cross-company staff mobility and technical disclosure in the AI industry.

- Source: [llm-stats.com AI Updates](https://llm-stats.com/llm-updates)
- Verification: ? Single-source at this stage; awaiting fuller court filings for confirmation

## Open Source

### AI agent tooling dominates today's GitHub Trending list ⭐⭐⭐⭐

The top of today's GitHub Trending page is almost entirely agent-tooling repos. **[PrimeIntellect-ai/prime-agent](https://github.com/PrimeIntellect-ai/prime-agent)** (TypeScript, 6,399 ⭐, +2,271 today) is a "self-improving" RLM agent built for coding workflows and long-running autonomous tasks. **[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)** (JavaScript, 83,865 ⭐, +1,131 today) packages production-grade engineering skills for AI coding agents. **[cloudflare/computer](https://github.com/cloudflare/computer)** (TypeScript, 5,643 ⭐, +894 today) gives agents an actual virtual computer to operate.

**Highlight:** The three repos map onto three distinct directions in today's agent ecosystem — self-improving autonomous agents, reusable engineering skill libraries, and operable execution environments for agents — a snapshot of "agent infrastructure" solidifying into its own category.

- Source: [GitHub Trending](https://github.com/trending)
- Verification: ✓ Official data

### GitHub adds AI-generated code coverage workflow setup ⭐⭐⭐

GitHub's August changelog announced a new option in repository Code Quality settings that lets AI auto-generate a code coverage workflow, which users can review as a pull request before merging.

**Why it matters:** This lowers the barrier for teams building a coverage pipeline from scratch, particularly useful for smaller teams without dedicated DevOps resources to quickly close a quality-gate gap.

- Source: [GitHub Changelog](https://github.blog/changelog/month/08-2026/)
- Verification: ✓ Official release

## Backend & Infrastructure

### UK photonic AI chip startup OLIX raises $312M Series B at a $3.3B valuation ⭐⭐⭐⭐

UK chip startup OLIX Computing (formerly Flux Computing) closed a $312 million Series B at a $3.3 billion post-money valuation — a dramatic jump from the roughly $1 billion valuation it held just months ago after a $220 million raise in February. The round was led by New York VC firm Fundomo, with participation from Arm, Hudson River Trading, Netflix co-founder Reed Hastings, and the UK government's Sovereign AI Fund. OLIX's Optical Tensor Processing Units (OTPUs) use light rather than electricity to perform the matrix math that powers AI models; its first inference-focused decode accelerator, DX-1, is slated to reach customers in H2 2027.

**Why it matters:** Photonic computing is one of the more serious "post-GPU" bets for AI inference hardware. If its claimed efficiency and thermal advantages over conventional GPU setups hold up in real deployments, it could meaningfully shift large-scale inference cost structures — worth tracking for any infrastructure team planning multi-year hardware roadmaps.

- Sources: [DatacenterDynamics](https://www.datacenterdynamics.com/en/news/chip-startup-olix-raises-312m-at-33bn-valuation-backed-by-uk-govt-sovereign-ai-venture-fund/), [Converge Digest](https://convergedigest.com/olix-raises-312m-photonic-ai-inference-nick-mckeown/)
- Verification: ✓ Confirmed by multiple sources

## Security & Tech Industry

### WordPress pre-auth XSS chain can escalate to full RCE, patched in emergency 7.0.3 release ⭐⭐⭐⭐

Security research team pwn.ai disclosed an attack chain dubbed XSS2Shell, tracked as CVE-2026-64638 (CVSS 8.9). A specially crafted username can trigger arbitrary JavaScript execution in a visitor's browser via the login failure page with zero further interaction required; if the visitor happens to be a logged-in administrator lured to an attacker-controlled page, the chain can escalate to server-side PHP code execution. The flaw has shipped since WordPress 4.7, touching nearly every actively maintained branch. WordPress released version 7.0.3 on August 6 with the fix backported to every maintained release line.

**Why it matters:** WordPress powers a substantial share of the web, and this XSS chain requires zero attacker privileges to trigger — every WordPress site operator should update to 7.0.3 or their branch's patched equivalent immediately.

- Sources: [The Hacker News](https://thehackernews.com/2026/08/new-wordpress-pre-auth-xss-could-lead.html), [pwn.ai technical writeup](https://pwn.ai/blog/xss2shell)
- Verification: ✓ Confirmed by multiple sources + official security release

### Russian state-linked hackers exploit Exchange OWA zero-day in "half-click" mailbox takeover campaign ⭐⭐⭐

Security firm Proofpoint disclosed that Russian state-linked group Laundry Bear (aka Void Blizzard/TA488) is exploiting CVE-2026-42897, a cross-site scripting zero-day in Microsoft Exchange Outlook Web Access, requiring nothing more than a victim opening a crafted email — researchers call it a "half-click" exploit. The group deploys a backdoor called OWAReaper to steal emails, credentials, and MFA codes, with some implants surviving password resets and full system re-imaging. The flaw affects fully patched on-premises Exchange Server 2016/2019/Subscription Edition (Exchange Online is unaffected); attack infrastructure traces back to March, predating Microsoft's public warning in May.

**Why it matters:** For any organization still running on-premises Exchange, this is a long-running, highly persistent, state-sponsored campaign. Check for unusual mailbox forwarding rules or unrecognized service accounts, and consider whether your endpoint detection coverage extends adequately to on-prem Exchange infrastructure.

- Sources: [BleepingComputer](https://www.bleepingcomputer.com/news/security/russian-hackers-exploit-exchange-owa-zero-day-for-long-term-mailbox-access/), [CSO Online](https://www.csoonline.com/article/4203349/russian-hackers-turn-exchange-flaw-into-half-click-mailbox-takeover.html)
- Verification: ✓ Confirmed by multiple sources

---

## 📊 Today's Numbers

| Metric | Value |
|------|------|
| Sources searched | 17 |
| Candidate stories | 18 |
| After deduplication | 13 |
| Final selection | 10 |
| Multi-source verification rate | ~90% |

---

> This article was automatically generated by AI using a multi-source cross-verification process. If you spot an error, please let us know.
