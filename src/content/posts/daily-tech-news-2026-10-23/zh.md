---
title: "每日技术资讯 - 2026年10月23日"
excerpt: "焦点：Calif 在 Hexacon 演示 iOS 27.0.1 的 iPhone 18 Pro 持久化越狱，细节尚未公开；Google 更新隐私政策，允许在用户授权后基于 Personal Intelligence 数据个性化广告；Moonshot 发布 Kimi K3.1 Pro，权重承诺 11 月 4 日前开放。今日资讯较少，部分条目为单一来源。"
coverLabel: "10/23"
date: "2026-10-23T00:00:00.000Z"
author: "ai"
category: "news"
tags: ["daily-news", "ai", "llm", "github", "backend"]
featured: false
---

今天的三条主线分别落在终端安全、隐私政策和大模型发布上：一支安全团队展示了新款 iPhone 上近十年来罕见的“重启后仍保持 root”的演示，Google 的隐私政策为个性化广告留出了新口子，Moonshot 则推出了 Kimi K3.1 Pro。今日可核实的信息偏少，各条目已逐条标注置信度。

## 🔥 今日焦点

### 1. Calif 在 Hexacon 演示 iPhone 18 Pro（iOS 27.0.1）持久化越狱 ⭐⭐⭐⭐⭐

**核心要点：**
- 安全公司 Calif 在巴黎 Hexacon 大会上演示：iPhone 18 Pro 运行 iOS 27.0.1，重启之后设备仍带 root 权限（“untethered”）。多家媒体称这是自 iOS 9 以来首次出现的同类演示。
- 其博客列出四个演示，其中包括一次 Signal 单击攻击和一次 iMessage 相关演示；文章只给出标题和说明，没有披露具体漏洞、受影响范围或工具。
- 作者写明“所有内容会在适当时候公开”。有媒体（Heise）称 AI 参与了漏洞挖掘；Apple 在 iOS 27 的安全说明中曾因两个漏洞致谢 Calif.io“与 Claude 和 Anthropic Research 合作”，但有报道指出没有证据表明这两个漏洞就是本次越狱所用。

**技术解读：**
持久化越狱意味着攻击链不仅拿到了代码执行，还绕过了启动时的代码签名与完整性校验，这通常需要多个漏洞串联。目前能确认的只是“演示发生了”，不能确认利用条件、是否需要物理接触、是否已被修补。社交媒体上“一分钟内越狱”的说法被其他报道纠正：两分钟指的是重启之后的时间，而不是越狱本身的耗时。在细节公开之前，不宜对普通用户的风险做定量判断。

**开发者行动建议：**
- 及时升级到 Apple 后续发布的 iOS 更新，并关注 Apple 安全公告与 Calif 的后续披露。
- 对于在 iOS 上做端到端加密或敏感业务的应用，复核链接预览、深度链接等“单击”入口的输入校验。
- 企业设备管理场景下，评估是否对未升级设备限制访问敏感数据。

**相关链接：**
- 原始博客：[Calif：Today, we hacked what we'd set out to hack: the iPhone](https://blog.calif.io/p/iphone)
- 报道：[iPhoneWired](https://iphonewired.com/news/1200148/)、[GlitchWire](https://glitchwire.com/news/calif-demonstrates-untethered-ios-2701-jailbreak-at-hexacon-hints-at-signal-and/)
- 社区讨论：[Hacker News](https://news.ycombinator.com/)（约 680 分）

置信度：✓（原始博客与多家媒体对演示本身一致；技术细节尚未公开）。

### 2. Google 更新隐私政策：授权后 Search 可用 Personal Intelligence 数据个性化广告 ⭐⭐⭐⭐

**核心要点：**
- 2026 年 10 月 16 日更新的隐私政策中，Google 仍写明不会基于 Drive、Gmail、Photos 的内容个性化广告，但新增例外：用户若选择把这些数据开放给支持个性化广告的其他 Google 服务（如连接到 Search 的 Personal Intelligence），Search 可处理这些数据“以个性化内容，包括广告”。
- Google 的说法是广告不会“直接”基于收件箱或相册，但 Search 仍可能引用从中得出的摘要、片段和推断；Photos 数据不会用于在 Photos 之外训练模型。
- 报道还指出，Google 对媒体的回应没有排除未来基于 Gmail 数据展示广告。Personal Intelligence 于 1 月推出，3 月向美国全部用户开放。

**技术解读：**
关键区别在“原始数据”和“派生信号”：政策承诺的是不直接用邮件内容投放广告，但经由模型生成的摘要或推断是否算同一类数据，取决于法律文本的措辞。对开发者而言，这是一个典型案例，说明在做“跨产品个性化”功能时，同意范围、数据流向和用途限定必须写进架构而不只是政策。我们没能读取 Verge 原文（访问受限），上述内容基于多家二手报道，政策原文请以 Google 官方页面为准。

**开发者行动建议：**
- 审查自家产品中类似“连接账户后跨服务使用数据”的功能：同意是否按用途拆分、能否单独撤回。
- 在 Google Workspace 或 Google 账号集成的应用中，复核用户在 Personal Intelligence 的授权状态说明。
- 为派生数据（摘要、嵌入、画像）单独定义保留期与用途。

**相关链接：**
- 报道：[Techlicious](https://www.techlicious.com/blog/google-gmail-photos-insights-ads/)、[Fast Company Middle East](https://fastcompanyme.com/technology/google-promised-not-to-show-ads-based-on-your-emails-ai-could-undo-that/)
- 社区讨论：[Hacker News](https://news.ycombinator.com/)（约 190 分，链接至 The Verge）

置信度：✓（多家报道一致；未直接核对 Google 政策原文）。

### 3. Moonshot 发布 Kimi K3.1 Pro 与 Highspeed 版本 ⭐⭐⭐⭐

**核心要点：**
- Moonshot 称 K3.1 Pro 是其“迄今最强的 3T 级开放权重模型”，由 Kimi K3 后训练而来；Highspeed 版本速度快 2–3 倍。上下文 1M token。
- 官方公布的基准（均为厂商自报）：Terminal-Bench 4.0 为 65.7%，高于 GPT-6 Astra 的 58.2%，略低于 Claude Opus 5.5 的 66.4%；内部幻觉基准上声明级幻觉率从 23.4% 降到 8.3%。
- 完整权重承诺在 2026 年 11 月 4 日前开放，并称开放版本已移除网络安全相关训练数据。目前可通过 Kimi 应用、Kimi Code 和 API（`kimi-k3.1-pro`、`kimi-k3.1-pro-highspeed`）使用。

**技术解读：**
前代 K3（约 2.8T 参数）在 7 月按承诺开放了权重，所以这次承诺有先例；但许可证与前代 Modified MIT 不同，使用前须读条款，且有分析指出它并不符合 OSI 对开源的定义。需要谨慎的是：基准多为厂商自报或内部基准，价格页面没有给出数字，我们也没有找到独立评测。至于“开放版移除网络安全数据”，意味着开放权重与 API 版本能力可能不完全一致。

**开发者行动建议：**
- 想接入的团队先在自己的任务集上做对比评测，不要只看官方表格。
- 计划自托管的团队：万亿参数规模意味着 TB 级权重，提前评估显存与互联需求。
- 关注 11 月 4 日的权重与许可证文本。

**相关链接：**
- 官方公告：[Kimi K3.1 Pro](https://www.kimi.ai/blog/kimi-k3-1-pro)
- 前代背景：[Kimi K3 开放权重报道（NYU Shanghai）](https://rits.shanghai.nyu.edu/ai/kimi-k3-open-weights-ship-2-8t-parameters-1-4-tb-to-run/)
- 社区讨论：[Hacker News](https://news.ycombinator.com/)（约 630 分）

置信度：?（K3.1 本身只有官方一手来源；前代 K3 的背景有多源佐证）。

---

## AI / 人工智能

### Block 发布 Dessa：仅用人类语音训练的全双工语音模型 ⭐⭐⭐

Block 的 AI 研究小组称 Dessa 是一个语音到语音的对话模型，从零开始只用人类语音训练，不使用文本数据和预训练模型；它能边听边说，并会给出“嗯”“好的”之类的附和。官方称其训练在单台 GB200 NVL72 上完成，推理快于实时，可在 M4 Max 及以上的 MacBook Pro 上本地运行。目前通过候补名单开放，优先面向 AI 安全研究者；页面未给出参数规模、延迟数字或许可证。

**为什么重要：** 如果“不经文本中转”的路线成立，语音助手的延迟和打断体验有望改善，但目前缺少可复现的指标。

- 来源：[Block](https://block.xyz/dessa)
- 验证：? 单一来源，指标均为厂商自述

## GitHub / 开源

### GitHub 趋势榜

当日趋势榜只列出 8 个项目，部分与近日已报道事件重合（cloudflare/security-audit-skill、php/php-src、NVIDIA/OpenShell、anthropics/knowledge-work-plugins 此前已收录，此处不再展开）。新面孔包括：

- **[OpenBMB/VoxCPM](https://github.com/OpenBMB/VoxCPM)**（Python，约 4.0 万 ⭐）⭐⭐⭐
  免分词器（tokenizer-free）的多语言语音合成与声音克隆项目。
  **亮点：** 与上面的 Dessa 同属语音方向，开源且可本地试用；具体质量未做评测。

- **[SnailSploit/Claude-Red](https://github.com/SnailSploit/Claude-Red)**（Python，约 8.4k ⭐）⭐⭐
  面向 Claude 的进攻性安全技能库。
  **亮点：** 属于双用途工具，仅应在获得授权的测试环境中使用。

- 来源：[GitHub Trending](https://github.com/trending)
- 验证：? 数据来自趋势页快照，功能为 README 自述

## 后端 / 基础设施

### UUIDv7 并不具备你以为的那些性质 ⭐⭐⭐

Alex 在博客中指出，人们常把 UUIDv7 的三项特性——单调有序、时间戳准确、不可猜测——当作保证，但 RFC 9562 只可靠保证唯一性与抗碰撞。实际问题包括：规范允许实现修改嵌入的时间戳（Postgres 文档也提醒提取的时间戳不一定等于生成时间）；作者测试发现 Python 的 `uuid.uuid7()` 在系统时钟被回拨一小时后，高负载下时间戳与真实时间的差距会持续扩大；多节点之间无法严格有序，单节点重启后若未持久化最后时间戳也可能乱序；时间戳还会泄露创建时间。

**为什么重要：** 把 UUIDv7 当主键能改善索引局部性，但不要依赖它做审计时间、严格排序或防枚举。

- 来源：[UUIDv7 doesn't have the properties you think it does](https://alexsci.com/blog/uuidv7-is-weird/)
- 验证：? 单一来源（博客作者的实测与分析）

---

## 📊 今日数据

| 指标 | 数值 |
|------|------|
| 搜索源数量 | 8 个 |
| 候选资讯 | 16 条 |
| 去重后 | 9 条 |
| 最终收录 | 6 条 |
| 多源验证率 | 约 33% |

---

> 本文由 AI 自动生成，采用多源交叉验证机制。今日资讯较少，部分条目仅有单一来源，已逐条标注置信度。如发现错误，欢迎反馈。
