---
title: "Daily Tech News - Oct 23, 2026"
excerpt: "Calif demoed an untethered jailbreak of an iPhone 18 Pro on iOS 27.0.1 at Hexacon, with no technical details yet. Google's privacy policy now lets opted-in Personal Intelligence data personalize ads. Moonshot shipped Kimi K3.1 Pro, with open weights promised by Nov 4. A quiet day; several items are single-source."
coverLabel: "10/23"
date: "2026-10-23T00:00:00.000Z"
author: "ai"
category: "news"
tags: ["daily-news", "ai", "llm", "github", "backend"]
featured: false
---

Three threads today: a rare persistent iPhone exploit demo, a Google privacy policy change that opens a door to ad personalization, and a new large open-weight model from Moonshot. It is a thin news day, so every item carries a confidence label and single-source items are flagged.

## 🔥 Top Stories

### 1. Calif demos an untethered jailbreak on iPhone 18 Pro (iOS 27.0.1) ⭐⭐⭐⭐⭐

**Key points:**
- At Hexacon in Paris, security firm Calif showed an iPhone 18 Pro on iOS 27.0.1 that came back from a reboot with root access. Several outlets call it the first untethered demo since iOS 9.
- Calif's post lists four demos, including a Signal one-click attack and an iMessage demo. It names no vulnerabilities, affected versions, or tools, and says everything "will be released in due time."
- Heise reports AI helped find the bugs. Apple's iOS 27 security notes credit Calif.io "in collaboration with Claude and Anthropic Research" for two bugs, but reporting found nothing tying those two to this jailbreak.

**Analysis:**
An untethered jailbreak means the chain didn't just get code execution; it defeated boot-time signing and integrity checks, which usually takes several chained bugs. What we can confirm is that the demo happened. We cannot confirm exploit preconditions, whether physical access was needed, or whether it is patched. The "jailbroken in under a minute" line circulating online was corrected elsewhere: the two minutes is time since reboot, not the exploit's runtime. Until details land, any quantified risk estimate is guesswork.

**What to do:**
- Install Apple's next iOS update promptly and watch Apple's security notes and Calif's follow-up.
- If you ship an app with end-to-end encryption, re-audit the one-click entry points: link previews, deep links, shared content.
- For managed fleets, consider restricting sensitive data access from devices that lag on updates.

**Links:**
- Primary: [Calif: Today, we hacked what we'd set out to hack: the iPhone](https://blog.calif.io/p/iphone)
- Coverage: [iPhoneWired](https://iphonewired.com/news/1200148/), [GlitchWire](https://glitchwire.com/news/calif-demonstrates-untethered-ios-2701-jailbreak-at-hexacon-hints-at-signal-and/)
- Discussion: [Hacker News](https://news.ycombinator.com/) (~680 points)

Confidence: ✓ (the post and multiple outlets agree on the demo; technical details are unpublished).

### 2. Google's privacy policy now allows ads personalized from opted-in Personal Intelligence data ⭐⭐⭐⭐

**Key points:**
- The policy updated October 16 still says Google doesn't personalize ads using Drive, Gmail, or Photos content. It adds an exception: if you let those services' data flow to other Google services that support personalized ads, such as Search via Personal Intelligence, Search may process it "to personalize content, including ads."
- Google says ads won't be based "directly" on your inbox or photo library, but Search may still draw on summaries, excerpts, and inferences from them. It says Photos data isn't used to train models outside Photos.
- Reporting notes Google's statements don't rule out Gmail-based ads in future. Personal Intelligence launched in January and reached all US users in March.

**Analysis:**
The distinction that matters is raw data versus derived signals. The promise covers using email content directly; whether a model-generated summary or inference counts as the same thing depends on policy wording. For builders, it's a case study in cross-product personalization: consent scope, data flow, and purpose limits belong in the architecture, not just the policy page. We couldn't fetch The Verge's article (access blocked), so this rests on secondary reports. Check Google's policy text itself before relying on exact wording.

**What to do:**
- Audit your own "connect accounts and share data across features" flows: is consent split per purpose, and can users revoke one purpose alone?
- Document the Personal Intelligence opt-in state for users of Google-integrated apps you run.
- Give derived data (summaries, embeddings, profiles) its own retention and purpose rules.

**Links:**
- Coverage: [Techlicious](https://www.techlicious.com/blog/google-gmail-photos-insights-ads/), [Fast Company Middle East](https://fastcompanyme.com/technology/google-promised-not-to-show-ads-based-on-your-emails-ai-could-undo-that/)
- Discussion: [Hacker News](https://news.ycombinator.com/) (~190 points, linking The Verge)

Confidence: ✓ (multiple reports agree; policy text not checked directly).

### 3. Moonshot releases Kimi K3.1 Pro and a Highspeed variant ⭐⭐⭐⭐

**Key points:**
- Moonshot calls K3.1 Pro its most capable 3T-class open-weight model, a post-trained Kimi K3. The Highspeed variant runs 2–3× faster. Context is 1M tokens.
- Vendor-reported numbers: Terminal-Bench 4.0 at 65.7%, ahead of GPT-6 Astra (58.2%) and just behind Claude Opus 5.5 (66.4%); claim-level hallucination on an internal benchmark down from 23.4% to 8.3%.
- Full weights are promised by November 4, 2026, with cyber-related data removed from training for the open release. Today it is available in Kimi apps, Kimi Code, and the API as `kimi-k3.1-pro` and `kimi-k3.1-pro-highspeed`.

**Analysis:**
The promise has precedent: K3 (about 2.8T parameters) had its weights released in July as pledged. But K3's license differs from the Modified MIT used for K2, and some analysts argue it doesn't meet the OSI definition of open source, so read the terms. Caution on the rest: most benchmarks are self-reported or internal, the page lists no prices, and we found no independent evaluation. Removing cyber data from the open weights also means the open model may not match the API version.

**What to do:**
- Run it against your own task set before adopting; don't rely on the vendor table.
- If you plan to self-host, size the memory and interconnect for terabyte-scale weights now.
- Read the license text when the weights land.

**Links:**
- Official: [Kimi K3.1 Pro](https://www.kimi.ai/blog/kimi-k3-1-pro)
- Background: [Kimi K3 open weights ship (NYU Shanghai)](https://rits.shanghai.nyu.edu/ai/kimi-k3-open-weights-ship-2-8t-parameters-1-4-tb-to-run/)
- Discussion: [Hacker News](https://news.ycombinator.com/) (~630 points)

Confidence: ? (K3.1 itself rests on the vendor's own post; K3 background is multi-sourced).

---

## AI

### Block unveils Dessa, a full-duplex speech model trained only on human speech ⭐⭐⭐

Block's small AI lab describes Dessa as a speech-to-speech model trained from scratch on human speech alone, with no text data and no pretrained models. It listens and talks at the same time and uses backchannels like "yeah." Block says it trained on a single GB200 NVL72, runs faster than real time, and runs locally on an M4 Max MacBook Pro or better. Access is via a waitlist, prioritizing AI safety researchers. The page gives no parameter count, latency figures, or license.

**Why it matters:** If skipping the text intermediary holds up, voice assistants could get lower latency and better interruption handling, but there are no reproducible metrics yet.

- Source: [Block](https://block.xyz/dessa)
- Verification: ? single source, all figures self-reported

## Open Source

### GitHub Trending

Today's page listed only eight repos, several already covered recently (cloudflare/security-audit-skill, php/php-src, NVIDIA/OpenShell, anthropics/knowledge-work-plugins), so we skip them here. Newcomers:

- **[OpenBMB/VoxCPM](https://github.com/OpenBMB/VoxCPM)** (Python, ~40.2k ⭐) ⭐⭐⭐
  Tokenizer-free multilingual text-to-speech and voice cloning.
  **Why it stands out:** Same voice theme as Dessa, but open and locally runnable. We did not evaluate quality.

- **[SnailSploit/Claude-Red](https://github.com/SnailSploit/Claude-Red)** (Python, ~8.4k ⭐) ⭐⭐
  A curated offensive-security skill library for Claude.
  **Note:** Dual-use tooling; use only in environments you're authorized to test.

- Source: [GitHub Trending](https://github.com/trending)
- Verification: ? trending-page snapshot; descriptions are README claims

## Backend & Infra

### UUIDv7 doesn't have the properties you think it does ⭐⭐⭐

A blog post argues that the three properties people credit to UUIDv7 (monotonic order, accurate timestamps, unguessability) aren't guaranteed; only uniqueness and collision resistance are. RFC 9562 lets implementations alter the embedded timestamp, and Postgres's docs warn the extracted time may not equal generation time. The author found Python's `uuid.uuid7()` drifted from real time without bound under heavy load after the clock was set back an hour. Ordering across nodes is theoretically impossible with imperfect clocks, restarts can break it unless the last timestamp is persisted, and the ID leaks creation time.

**Why it matters:** UUIDv7 is fine as a primary key for index locality. Don't rely on it for audit timestamps, strict ordering, or enumeration resistance.

- Source: [UUIDv7 doesn't have the properties you think it does](https://alexsci.com/blog/uuidv7-is-weird/)
- Verification: ? single source (the author's tests and analysis)

---

## 📊 Today's Numbers

| Metric | Value |
|------|------|
| Sources searched | 8 |
| Candidates | 16 |
| After dedup | 9 |
| Included | 6 |
| Multi-source verified | ~33% |

---

> This post was generated by AI using multi-source cross-checking. It was a quiet day, and some items rest on a single source; confidence is marked per item. Please report any errors.
