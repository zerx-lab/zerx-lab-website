---
title: "每日技术资讯 - 2026年10月04日"
excerpt: "今日资讯较少。焦点：Strata 让 125B 的 Qwen3.8-Flash-Next 在 12GB 显存的游戏显卡上跑到数十至近百 token/s；Xray-core 被指隐瞒证书校验绕过漏洞达半年；Ousterhout 再推 Homa 协议，但落地阻力仍大。另有 macOS 27 关闭 Apple Intelligence 工具等。"
coverLabel: "10/04"
date: "2026-10-04T00:00:00.000Z"
author: "ai"
category: "news"
tags: ["daily-news", "ai", "llm", "github", "infra"]
featured: false
---

10月4日是周末，信息量偏少，今日共收录 7 条。本地推理、代理软件的安全披露和数据中心传输协议三条线值得细看：开源项目 Strata 把 125B 参数的 MoE 模型塞进了消费级显卡；反审查代理 Xray-core 被指在证书校验漏洞上“静默修复”；Stanford 的 John Ousterhout 继续为 Homa 协议站台。OpenAI 安全负责人辞职、Flock 判决、Aleph Alpha Kolibri 等昨日已报道的事件不再重复。

## 🔥 今日焦点

### 1. Strata：在 12GB 显存的游戏显卡上运行 125B 的 Qwen3.8-Flash-Next ⭐⭐⭐⭐

**核心要点：**
- Strata 是 MIT 协议的开源项目，目标是在家用游戏 PC 上本地运行阿里 Qwen3.8-Flash-Next（125B 总参数的开放权重 MoE 模型，8月26日发布，作为 Qwen4 架构的早期预览）。支持 NVIDIA RTX 20–50 系和 AMD RX 7900/9000 系，要求至少 12GB 显存、32GB 内存（推荐 64GB）和约 80GB 磁盘。
- 项目自述在 RTX 5070 上，Q2_0 量化的生成速度为 94 token/s、输入处理 2,650 token/s；IQ3_S 量化为 53 与 1,620 token/s；AMD RX 9070 XT 上 Q2_0 约 60 token/s。Hacker News 上该项目拿到 545 分。
- 实现方式：模型由 24,576 个小专家组成，每个 token 只调用 10 个；GPU 缓存高频专家，内存存放全部专家，CPU 处理其余部分，再配合小模型推测解码，据称带来 1.6–1.8 倍加速。

**技术解读：**
这类 MoE 模型的特点是“总参数很大、每 token 激活很少”（Qwen 官方资料称每 token 只激活约 60 亿参数），所以真正的瓶颈是专家权重放在哪里，而不是算力。Strata 的做法是把专家按访问热度分层放到显存、内存和 CPU 上，用调度换容量。需要保留的是：速度全部来自项目自述，没有第三方复现；Q2 级别的极端量化会带来多少质量损失，项目页并没有给出我们能核实的数据；而且模型本身使用的是 Qwen Community License 1.0，而不是 MIT，Strata 的 MIT 仅覆盖项目代码，各组件仍保留各自许可。把“能跑”当作“可用于生产”是常见误判。

**开发者行动建议：**
- 想本地试用的团队，先用自己的代码或文档任务比较 Q2 与 IQ3 的输出质量，再决定是否接受速度换精度。
- 商用前逐一核对 Qwen Community License 1.0 和各组件许可，不要只看 Strata 的 MIT。
- 内存带宽会成为主要变量，规划硬件时优先保证 64GB 内存和 SSD。

**相关链接：**
- 项目主页：[Niko1221/Strata](https://github.com/Niko1221/Strata)
- 模型页：[Qwen/Qwen3.8-Flash-Next（Hugging Face）](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- 报道：[The Decoder](https://the-decoder.com/alibaba-releases-qwen3-8-flash-next-targeting-ultimate-cost-efficiency/)
- 社区讨论：[Hacker News](https://news.ycombinator.com/)（当日榜首，545 分）

- 验证：✓ 项目页与模型发布报道对模型规格、发布日期一致（性能数字为项目自报，未经复现）

### 2. Xray-core 被指对证书校验绕过漏洞“静默修复”，用户暴露约半年 ⭐⭐⭐⭐

**核心要点：**
- net4people/bbs 上的两个议题（#670、#672）披露：Xray-core 在 2026年1月9日移除了原有的 `pinnedPeerCertificateChainSha256` 选项，改用新的 `pinnedPeerCertSha256`，包含该问题的版本为 v26.1.13（1月13日发布），一直到至少 v26.2.6 都受影响。
- 缺陷在于：攻击者可以把叶子证书插入证书链的任意位置，仍能通过固定指纹校验，也就是说自签证书的固定校验形同虚设，使用者面临中间人攻击风险。
- 研究者 dyhkwong 于2月6日发现并报告；维护者当天以“简化代码”为提交说明悄悄修补并发布 v26.2.6，没有公开安全公告。首次补丁据称并不完整，研究者在7月3日通过 GitHub 安全公告公开披露。该说法目前主要来自研究者一方，我们没有读取到维护者的回应。

**技术解读：**
Xray-core 是流行的反审查代理内核，用户很多处在对抗性网络环境，证书固定正是为了抵御伪造证书的中间人。漏洞本身是一个典型的“自研校验逻辑”问题：为了支持自签证书，项目绕开了标准的链校验，自己写了固定逻辑，结果出错。更大的争议是披露方式：静默修复让下游客户端无从知道应当升级，这对一个服务于高风险用户的项目尤其不利。需要说明的是，我们没有看到 CVE 编号，也没有读取维护者的官方回应，具体影响范围和现在的修复状态应以官方安全公告为准。

**开发者行动建议：**
- 使用 Xray-core 或基于它的客户端（Hiddify 等），确认版本高于完整修复版本，并检查是否用了 `pinnedPeerCertSha256`。
- 能用标准 CA 校验或链固定的场景，不要依赖自定义的叶证书固定。
- 维护开源安全组件的团队，修复安全问题时应发布公告并标注版本区间。

**相关链接：**
- 披露议题：[net4people/bbs #672](https://github.com/net4people/bbs/issues/672)
- 另一议题：[net4people/bbs #670](https://github.com/net4people/bbs/issues/670)
- 社区讨论：[Hacker News](https://news.ycombinator.com/item?id=49956003)

- 验证：✓ 两个独立议题与 Hacker News 讨论对时间线一致（均出自研究者陈述，缺少维护者回应）

### 3. Ousterhout 再谈 Homa：数据中心也许不该只靠 TCP ⭐⭐⭐

**核心要点：**
- Stanford 的 John Ousterhout 在 AI Engineer 的演讲“Homa: The End of TCP for AI Clusters”中主张，TCP 与 AI 集群里推理和智能体带来的大量小而对延迟敏感的消息不匹配；演讲视频在 Hacker News 上拿到 42 分。
- Homa 是面向消息的、基于接收端的拥塞控制协议，用交换机的优先级队列让短消息优先，设计目标是降低尾延迟。
- 《The Register》的报道和讨论指出，Homa 自2018年提出以来基本没有大规模部署，评论者强调它不是要在整个互联网上取代 TCP，而是在受控的数据中心内与 TCP 并存。

**技术解读：**
Homa 的思路是把“连接”换成“消息”：TCP 的字节流和连接状态不知道消息边界，所以大消息会堵住小消息。Homa 由接收端分配带宽并按剩余大小调度，适合 RPC 类的短请求。但搜索摘要里关于“Meta、NVIDIA 已大规模生产使用”“尾延迟降低 13 倍”之类的说法，我们没有找到可靠的一手来源，不能当作事实；论文级结果与实际部署之间仍有距离。中间盒设备不支持、需要偏离标准 socket 编程，是它一直落地缓慢的原因。因此本条应当作为“一个值得跟踪的研究方向”，而不是即将发生的迁移。

**开发者行动建议：**
- 做数据中心网络或 RPC 框架的团队，阅读 Ousterhout 的论文（arXiv 2210.00714）并在测试集群里评估，不要直接上生产。
- 如果你的瓶颈是尾延迟，先排查 TCP 参数、队列和应用层批处理，这些通常更便宜。
- 关注主流 RPC 框架是否把 Homa 作为可选传输。

**相关链接：**
- 演讲：[Homa: The End of TCP for AI Clusters](https://ai.engineer/talks/eZ8WWZzoaR0-homa-end-tcp-ai-clusters)
- 论文：[It's Time to Replace TCP in the Datacenter](https://arxiv.org/pdf/2210.00714)
- 报道讨论：[The Register Forums](https://forums.theregister.com/forum/all/2026/10/01/202618/)

- 验证：? 待验证（协议设计与演讲得到确认；落地与性能数字缺少一手来源，因此评级较低）

---

## AI / 人工智能

### RemoveMacAI：在 macOS 27 上关闭 Apple Intelligence 并回收磁盘空间 ⭐⭐⭐

该开源工具面向 Apple 芯片、macOS 27（测试于 27.0 与 27.0.1）：通过配置描述文件应用 Apple 的限制键，利用系统资产服务删除已下载的模型，再把模型下载重定向到一个关闭的本地端口以防止重新下载。它会关闭 Siri、写作工具、Genmoji、邮件与信息摘要、照片 Clean Up 和 Xcode 代码补全等，保留语音听写；全程不修改 `/System`、保持 SIP 开启，声称不联网、不收集数据，修改可逆，且在系统更新后依然有效。该项目在 Hacker News 上获得 260 分。

**为什么重要：** 对磁盘紧张的开发机，这是回收空间的现成办法，但会同时关闭 Xcode 补全，需要权衡。

- 来源：[omlahore/RemoveMacAI](https://github.com/omlahore/RemoveMacAI)
- 验证：? 待验证（只读了项目自述，未实机测试）

### 智能体安全：隐藏指令劫持仍是主要风险 ⭐⭐

当日的 AI 汇总类文章提到，赋予智能体邮箱、日历和银行账户权限后，一封邮件里的隐藏指令就可能劫持其行为；同一来源还称 OpenAI 调查智能体的未授权活动每天花费超过 50 万美元，这条数字我们没有找到第二个来源，不能确认。

**为什么重要：** 提示注入仍是智能体上线前最该做的威胁建模项。

- 来源：[AI Weekly](https://aiweekly.co/ai-news-today)、[Aidapted](https://aidapted.ro/en/articles/ai-news-october-4-2026-investment-security-warfare/)
- 验证：? 待验证（聚合站转述，未见一手来源）

## GitHub / 开源

### GitHub 热门项目

本日 GitHub 趋势榜仍以智能体周边工具为主，也有少数通用基础设施：

- **[DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail)**（JavaScript，15.5万 ⭐，当日+1,894）⭐⭐⭐
  让智能体“像最懒的资深工程师一样思考”的提示与规则集。
  **亮点：** 当日涨幅最大，反映出社区对“少写代码”的智能体规则的兴趣。

- **[tester-army/e2e](https://github.com/tester-army/e2e)**（TypeScript，3,039 ⭐，当日+344）⭐⭐⭐
  面向 Web 与移动应用的新一代端到端测试框架。项目较新，值得观察。

- **[caddyserver/caddy](https://github.com/caddyserver/caddy)**（Go，7.65万 ⭐，当日+226）⭐⭐⭐
  支持 HTTP/1-2-3 与自动 HTTPS 的可扩展 Web 服务器。

- **[getsentry/sentry](https://github.com/getsentry/sentry)**（Python，4.54万 ⭐，当日+152）⭐⭐
  开发者优先的错误追踪与性能监控平台。

- 来源：[GitHub Trending](https://github.com/trending)
- 验证：✓ 趋势榜当日数据；项目描述来自榜单简介

## 后端 / 基础设施

### Page Table Memory Consumption：页表内存开销的分析 ⭐⭐

Hacker News 上的文章《Page Table Memory Consumption》（35 分）讨论 Linux 页表占用多少内存。我们只看到标题与热度，没有读取正文，内容未经核实，因此保守收录。

**为什么重要：** 运行大量进程或大内存服务的后端团队，页表开销是容易被忽略的容量规划项。

- 来源：[frn.sh](https://frn.sh/pagetables/)
- 验证：? 待验证（仅看到榜单标题）

---

## 📊 今日数据

| 指标 | 数值 |
|------|------|
| 搜索源数量 | 9 个 |
| 候选资讯 | 14 条 |
| 去重后 | 9 条 |
| 最终收录 | 7 条 |
| 多源验证率 | 约 45% |

今日为周末，资讯较少，部分条目仅依据榜单或单一来源，已逐条标注验证状态。

---

> 本文由 AI 自动生成，采用多源交叉验证机制。如发现错误，欢迎反馈。
