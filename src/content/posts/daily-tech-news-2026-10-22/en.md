---
title: "Daily Tech News - Oct 22, 2026"
excerpt: "Top stories: Quad9 will stop serving France on Nov 24 rather than comply with a DNS blocking order; eMudhra exits the global TLS certificate business after its weak-key incident; NVIDIA open-sources OpenShell, a kernel-level sandbox for autonomous agents. Also: Arc's shutdown timeline. A quiet day, with mostly single-source items."
coverLabel: "10/22"
date: "2026-10-22T00:00:00.000Z"
author: "ai"
category: "news"
tags: ["daily-news", "ai", "github", "infra", "devtools"]
featured: false
---

Today's theme is infrastructure and trust. A public DNS resolver is pulling out of a country instead of obeying a blocking order, a certificate authority is quitting its TLS business after a key-generation failure, and NVIDIA has released a sandbox runtime for autonomous agents. It was a quiet news day: most items rest on a first-party announcement without an independent second source, and each is labeled with its confidence level.

## 🔥 Top Stories

### 1. Quad9 will stop serving France on November 24 ⭐⭐⭐⭐⭐

**Key points:**
- Quad9, the Swiss nonprofit resolver at 9.9.9.9 that blocks malware and phishing domains, says a French court ordered it to block domains tied to pirated sports streams (the case was brought by beIN). Quad9 refuses and will withdraw service for French users on November 24, 2026.
- Its argument: it keeps no user location data, so compliance would mean either applying French law worldwide or compromising privacy. It also cites a 2021–2023 German case in which geoIP-based blocking still ended in a contempt fine.
- The court cut the daily penalty from €580,000 to €1,000, but Quad9 says the principle is unchanged. It has appealed and says about 20 similar suits are pending in France.
- The impact reaches beyond consumers: Quad9 says French ISPs, mobile carriers, government bodies, hospitals and energy firms use it, and it has published a partial list of networks.

**Analysis:**
Earlier coverage (TorrentFreak and French outlets) described Quad9 as *weighing* an exit, and traced the original order to a May 2026 Paris ruling covering 6 domains, later expanded to 58. Quad9's own post turns that threat into a dated withdrawal. The practical risk for engineers is hidden dependency: plenty of networks list Quad9 as an upstream forwarder or fallback, and 30 days is short. Quad9 also argues DNS blocking is trivially bypassed by switching resolvers; whether courts accept that is what the appeal will decide.

**What to do:**
- Grep French-hosted servers, office networks and CI runners for 9.9.9.9 / 149.112.112.112 in resolv.conf, DHCP options and forwarder configs.
- If you rely on its malicious-domain filtering, line up a replacement (self-hosted Unbound plus a threat feed, or another filtering public resolver) and roll it out gradually.
- Watch the appeal before the deadline.

**Links:**
- Official: [Au revoir, France (Quad9)](https://quad9.net/news/blog/au-revoir-france/)
- Earlier coverage: [TorrentFreak](https://torrentfreak.com/dns-resolver-quad9-rejects-french-piracy-blocks-weighs-exit-as-bein-seeks-up-to-e580k-a-day/)
- Discussion: [Hacker News](https://news.ycombinator.com/) (top of the front page, 900+ points)

Confidence: ✓ (Quad9's announcement matches earlier independent reporting; the exit date and penalty figures come from Quad9 itself).

### 2. eMudhra exits the global SSL/TLS certificate business ⭐⭐⭐⭐

**Key points:**
- This follows yesterday's weak-key story (eight intermediate CAs whose private keys could be recovered instantly). eMudhra's board has decided to withdraw voluntarily from global SSL/TLS issuance, announced October 22.
- The company says it revoked the affected CAs within 14 hours, issued no end-entity certificates from them, and suffered no infrastructure compromise or data breach.
- Its stated reasons: TLS is about 1% of revenue, data-sovereignty and compliance costs are rising, free issuance by large players squeezes returns, and social-media attention was "disproportionate."
- Transition: G1 RSA roots keep serving until migration finishes, affected customers get free replacement certificates through partners, revocation services continue until every issued certificate expires or is replaced, and a full root-cause report is still owed to browser programs. Signing, eSign and other products are unaffected.

**Analysis:**
Separate the company's narrative from verified fact. The weak-key details come from researcher Scott Helme's write-up; "no end-entity certificates issued" is eMudhra's own claim and awaits the root-cause report and external checks against Certificate Transparency logs. For the ecosystem it is another small CA leaving after a trust failure. Removal from trust stores typically blocks new issuance rather than instantly breaking existing certificates, but customers should still replace them proactively.

**What to do:**
- Audit your chains for eMudhra roots or cross-signed paths, especially for code signing.
- Update the CA bundles in your OS and base container images.
- Assess clients that skip revocation and CT checks (scripts, IoT, frozen firmware) for exposure to forged chains.

**Links:**
- Official: [eMudhra press release](https://emudhra.com/en/press-release/emudhra-to-exit-global-ssl-tls-certificate-business)
- Analysis: [Scott Helme](https://scotthelme.co.uk/eight-bits-of-trust-emudhras-ca-keys-cracked-in-milliseconds/)

Confidence: ✓ for the core event (company and researcher agree); the company's self-reported claims are single-source.

### 3. NVIDIA open-sources OpenShell, a secure runtime for agent fleets ⭐⭐⭐⭐

**Key points:**
- OpenShell is an Apache-2.0 runtime on GitHub (about 17.7k stars) described as "the safe, private runtime for fleets of autonomous AI agents."
- Each agent runs in an isolated sandbox; kernel controls restrict file access and system calls, and every network connection is checked against policy.
- Credential isolation: the agent never sees real secrets. OpenShell attaches them only to requests bound for approved endpoints.
- Policy changes are formally verified to flag risky additions (such as a new host that would receive credentials) and then held for human review. The gateway deploys to Kubernetes via Helm, provided your CNI enforces NetworkPolicy.
- SDKs for Python, TypeScript, Go and Rust. The README calls 0.1.x a stable cadence. Anonymous telemetry is on by default; set `OPENSHELL_TELEMETRY_ENABLED=false` to disable it.

**Analysis:**
Agents now carry real keys, install packages and write files, and the usual safeguards are "trust the model" or click-to-approve. OpenShell pushes the boundary down to the process and network layer and keeps credentials out of the model's context, so a successful prompt injection has less to steal. Caveats: this summary comes from the README only. We have not run it, benchmarked it or tested escape paths. How far the "formal verification" reaches, what the telemetry contains and how the sandbox holds up all need your own audit, and Windows via WSL 2 is still labeled experimental.

**What to do:**
- Run the "Run Your First Agent" tutorial on a disposable machine and write a policy for the files, domains and secrets your own agent needs.
- Disable telemetry and review gateway audit logs before production; confirm NetworkPolicy behavior in your cluster.
- Adopt "credentials never enter model context" as a design rule, with or without OpenShell.

**Links:**
- Repo: [NVIDIA/OpenShell](https://github.com/NVIDIA/OpenShell)
- Docs: [NVIDIA OpenShell docs](https://docs.nvidia.com/openshell/latest)
- Discussion: [Hacker News](https://news.ycombinator.com/) (250+ points)

Confidence: ? (official repo only; no independent review or audit yet).

---

## AI

### GitHub Trending: agent skills and plugins keep climbing ⭐⭐⭐

Today's trending page features anthropics/knowledge-work-plugins (Python, about 31.6k stars), open-source plugins for Claude Cowork; cloudflare/security-audit-skill (JavaScript, about 39.5k stars, nearly 3,000 gained today), a skill that has a coding agent run multi-phase security audits and emit verified, machine-readable findings; Graphify-Labs/graphify (Python, about 132.9k stars), which turns code, docs, configs and PDFs into a queryable knowledge graph using local AST parsing; and DietrichGebert/ponytail (JavaScript, about 173.4k stars), which pushes agents toward writing as little code as possible.

**Why it matters:** The energy in the agent ecosystem is shifting from models to the skills, plugins and constraints around them. Fast-growing repos vary widely in quality, so read the source and permission claims before installing.

- Source: [GitHub Trending](https://github.com/trending)
- Verification: ? Star counts are from a trending-page snapshot; project descriptions are README claims we did not test.

## Open Source

### php-src tops GitHub Trending ⭐⭐

php/php-src sits first on trending with about 41.1k stars and 400+ gained today. That tracks the attention around the recent PHP security release and a Hacker News post (300+ points) from someone who says they unintentionally broke the PHP RCE embargo. We did not read that post's details and draw no conclusions from it. See yesterday's issue for the vulnerabilities; unpatched sites should upgrade now.

**Why it matters:** A broken embargo shortens the window between patch publication and working exploits, so upgrading deserves priority over routine work.

- Sources: [GitHub Trending](https://github.com/trending), [Hacker News](https://news.ycombinator.com/)
- Verification: ? Interest signals come from rankings; the post body was not checked.

## Tech Industry

### Arc browser shutdown dates published; users move to Dia ⭐⭐⭐

Arc's farewell page says The Browser Company is moving users to its newer browser, Dia, to concentrate on security. Timeline: from October 22, no new Arc accounts and a data export option appears; on November 23, mobile AI features are disabled and sign-in and tab sync stop; on December 22, Arc stops working on macOS and Windows and accounts are deactivated, with personal data deleted within 30 days. Spaces become Profiles and Folders become Tab Groups; passwords, bookmarks, extensions and history can be imported. Feature development on Arc already ended in May 2025, so this is the hard end date.

**Why it matters:** If your workflow lives in Arc, export tabs and settings before December 22. After that the company says it cannot retrieve your data.

- Sources: [Arc](https://arc.net/), [Engadget on the 2025 development halt](https://engadget.com/ai/the-browser-company-stops-active-development-of-arc-in-favor-of-new-ai-focused-product-153045276.html)
- Verification: ? The dates come from a single official page; the background is independently reported.

### Xbox floats per-hour fees to stream games you own ⭐⭐

Per its headline, Ars Technica reports Xbox wants players to pay 24 to 40 cents per hour to stream games they already bought (about 160 points on HN). We could not read the article body and do not know the regions or launch date, so this is recorded as industry context only.

**Why it matters:** If accurate, it signals cloud gaming shifting from subscriptions toward metered billing, which matters to teams working on game distribution or cloud rendering.

- Source: [Ars Technica](https://arstechnica.com/gaming/2026/10/xbox-wants-you-to-pay-24-to-40-cents-per-hour-to-stream-games-you-already-bought/)
- Verification: ? Headline-level information only.

---

## 📊 Today's Numbers

| Metric | Value |
|------|------|
| Sources searched | 8 |
| Candidate items | 20 |
| After dedup | 10 |
| Included | 7 |
| Multi-source verified | about 30% |

---

> This post was generated by AI using multi-source cross-checking. It was a quiet day, and some items rest on a single source or a headline only; each is labeled with its confidence level. Please report any errors.
