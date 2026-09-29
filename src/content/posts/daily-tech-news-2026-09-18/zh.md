---
title: "每日技术资讯 - 2026年09月18日"
excerpt: "今日焦点：三人安全团队 Hacktron 借助 Claude Opus 5 串联 libheif 内存漏洞与单点登录缺陷，拿下 OpenAI 员工账号与内部代码库；Anthropic 确认运营实体生物实验室并上线生命科学验证计划；Meta 的 Muse 智能体登陆 Mac。另有谷歌 CC 家庭智能体、五角大楼 AI 幻觉险些引发行动、Manus 融资等动态。"
coverLabel: "09/18"
date: "2026-09-18T00:00:00.000Z"
author: "ai"
category: "news"
tags: ["daily-news", "ai", "llm", "devtools"]
featured: false
---

九月的第十八天，AI 的"能力"与"边界"同时被推到台前：一支只有三个人的安全团队用新发布的 Claude Opus 5 打穿了 OpenAI 的员工账号体系，Anthropic 则承认自己在湾区运营着一座能让模型亲自做实验的湿实验室，并同步为生命科学团队开放放宽防护的验证计划；消费端，Meta 的 Muse 智能体登陆 Mac，开始直接操作本地文件、邮件与日历。与此同时，一份 CNN 报道显示，一次由 AI 幻觉编造的情报差点触发美军对一艘中国船只的行动。下面按重要性逐条梳理。

## 🔥 今日焦点

### 1. Hacktron 用 Claude Opus 5 串联漏洞，拿下 OpenAI 员工账号与内部代码库 ⭐⭐⭐⭐⭐

**核心要点：**
- 三人安全创业公司 Hacktron AI 的入口是 OpenAI 社区论坛（基于 Discourse）：论坛用 ImageMagick 与 libheif 解码用户上传的 HEIC/HEIF 图片，libheif 中的堆缓冲区溢出允许精心构造的图片破坏服务器内存。
- 第二步是与单点登录（SSO）相关的缺陷，使研究者得以接管与 GitHub 关联的 OpenAI 员工账号，进而触及 ChatGPT、Codex 账号和内部代码库；据 Hacktron 自述，从发现到进入内部 monorepo 不到 72 小时，代币成本不足 3000 美元。
- 关键细节：Claude Opus 4.8 在多次会话中都无法写出可用利用代码，而 Opus 5 发布后，团队把同一个问题再交给它，数小时内即成功。OpenAI 确认已修复并通过赏金计划支付 6500 美元。这只是 Hacktron 名为"HEIF Heist"研究的一部分，该研究还沿 libheif 依赖链追查了 Slack、Meta、GitHub Enterprise 及 Next.js 等框架。

**技术解读：**
这个案例的价值不在"AI 黑了 OpenAI"的戏剧性，而在能力门槛的变化：同一个团队、同一个漏洞链，模型从 4.8 升到 5 就从"做不出"变成"几小时做出"，说明前沿模型在多步骤漏洞利用（内存破坏 → 认证链 → 横向移动）上出现了阶跃。攻击面本身也很典型——不是 OpenAI 自研代码，而是第三方论坛软件里的图像解码依赖。任何在用户上传路径上调用 libheif/ImageMagick 的服务，都处在同一类风险敞口内。攻击门槛下降、修补窗口缩短，防守方需要假设"利用代码几小时内就能被生成"。

**开发者行动建议：**
- 盘点自己服务中的图片处理链（libheif、ImageMagick、libvips 等），升级到已修复版本，并在不需要时禁用 HEIC/HEIF 解码。
- 对面向用户的上传通道使用沙箱或独立低权限进程解码，避免解码库内存破坏直接通向会话与凭据。
- 审查论坛、Wiki 等第三方系统与主账号体系的 SSO 关联范围，避免"低价值系统 → 员工账号"的信任跳板。

**相关链接：**
- 报道：[The Hacker News](https://thehackernews.com/2026/09/claude-opus-5-helped-researchers-take.html)
- 报道：[VentureBeat](https://venturebeat.com/security/openai-hacked-by-small-team-of-white-hat-security-researchers-using-anthropics-claude-opus-5)
- 报道：[TechCrunch](https://techcrunch.com/2026/09/18/researchers-used-anthropics-claude-to-hack-into-openai/)
- 验证：✓ 多源确认（赏金金额与耗时细节各家表述略有出入，以上取多方一致部分）

### 2. Anthropic 确认运营生物实验室，并上线放宽生物防护的「生命科学验证计划」 ⭐⭐⭐⭐⭐

**核心要点：**
- TechCrunch 报道，Anthropic 在湾区运营一座湿实验室，让 AI 模型能够驱动真实的物理实验，重点是基础生物学研究而非药物发现，既有内部工作也有外部合作。其生命科学负责人 Eric Kauderer-Abrams 确认"我们今天确实在做"。该实验室与 4 月以约 4 亿美元收购 Coefficient Bio 相关，方向包括蛋白质设计加速与生物分子建模。
- 9 月 17 日，Anthropic 推出仍处 Beta 的"生命科学验证计划"（LSVP），面向 Claude Enterprise、Team 与 API 组织，需经资质、安全与监督核验。标准使用授权按团队发放、每年续期，可在 Mythos 5.1、Opus 5、Sonnet 5 上使用对科学任务更宽松的分类器；高风险使用授权则针对单个项目、每六个月续期，会移除所有阻断生命科学请求的防护。网络安全等其他分类器仍然保留。
- 个人订阅计划与启用 BAA 的医疗数据机构不在计划范围内。

**技术解读：**
两件事放在一起看才有意义：模型不再只是回答生物问题，而是接入能动手的实验室闭环；同时，防护策略从"对所有人统一收紧"转向"按身份与项目分级放行"。这是一种把安全从模型侧部分转移到访问控制侧的思路——验证的是使用者与用途，而不只是提示词内容。它也带来张力：生物风险恰恰是 Anthropic 高管公开强调的最大滥用场景之一，分级放行能否经得起审视，取决于核验流程的严谨程度与透明度，这一点目前外界还无法独立评估。

**开发者行动建议：**
- 生物医药与生命科学团队可评估申请 LSVP 的资格与材料要求，注意该计划以组织而非个人为单位。
- 在自家产品中做"分级能力开放"的团队，可参考其"身份核验 + 项目级授权 + 定期续期"的结构。
- 使用 Claude 处理生物类任务的现有用户，应确认自己的计划类型是否在覆盖范围内，避免误以为防护会自动放宽。

**相关链接：**
- 官方公告：[Introducing the Life Sciences Verification Program](https://www.anthropic.com/news/life-sciences-verification-program)
- 报道：[TechCrunch](https://techcrunch.com/2026/09/18/anthropic-is-operating-a-lab-that-conducts-biology-experiments/)
- 报道：[AIwire](https://www.hpcwire.com/aiwire/2026/09/21/anthropic-eases-ai-safeguards-for-verified-life-science-teams/)
- 验证：✓ 官方公告 + 多源确认

### 3. Meta Muse 智能体登陆 Mac，可直接操作文件、邮件、日历与备忘录 ⭐⭐⭐⭐

**核心要点：**
- Meta 于 9 月 17 日发布 Muse 的 Mac 版，此前本月早些时候已上线移动端与网页端；Muse 可在原生应用中读取并操作文件、消息、日历、备忘录和邮件，代用户执行任务。
- 权限采用用户自选开启的方式，Meta 表示涉及敏感操作时"总会先询问"。
- 据 TechCrunch，Muse 在移动端与网页端首发后迅速冲上美国 App Store 榜单；同一周 Meta 与竞品都加入了语音通话能力，扎克伯格称"团队在快速交付"。

**技术解读：**
桌面端是智能体真正开始"有用"的地方，因为数据和工作流都在本地：文件系统、邮件客户端和日历。代价是攻击面同步扩大——任何能操纵模型输入的内容（一封邮件、一个文档）都有可能成为提示注入的载体，进而驱动本地动作。"敏感操作先询问"的确认机制因此成为整个产品安全模型的核心，而"何为敏感"的划分标准目前并未详细公开。结合今天焦点一中前沿模型攻击能力的跃升，桌面智能体的权限边界设计值得开发者格外关注。

**开发者行动建议：**
- 在做桌面智能体的团队，应把"读取外部内容"与"执行本地动作"在权限上隔离，并对写操作、发送操作强制确认。
- 企业 IT 需要评估员工自行安装的消费级智能体对邮件与文件的访问范围，纳入终端管理策略。
- 测试提示注入时，把邮件正文、文档内容当作不可信输入纳入用例。

**相关链接：**
- 报道：[TechCrunch](https://techcrunch.com/2026/09/18/metas-muse-hits-mac-letting-the-ai-take-actions-on-your-computer/)
- 验证：✓ 报道细节一致；官方公告细节以 Meta 后续文档为准

---

## AI / 人工智能

### AI 幻觉险些引发美军行动：编造的货物清单让一次针对中国船只的任务在最后一刻中止 ⭐⭐⭐⭐

CNN 于 9 月 18 日报道，今年春天，一名特种作战司令部分析员用 AI 聊天机器人把公开数据与涉密信号情报合并分析，工具误判一艘船的货物清单，称其含有核武器项目部件；分析员又用同一工具把结论整理成官方风格的摘要，在指挥链中流转。军机已经升空时，官员才发现情报是聊天机器人编造的，任务在最后一刻被中止。GovAI 研究学者、前美国陆军军官 Jake Steckler 表示，军人必须理解大模型固有的不确定性，尤其在涉及使用武力的目标选定与情报分析中。

**为什么重要：** 这是"格式化放大可信度"的典型案例：同一个工具既产出错误，又把错误包装成权威文档。任何把 LLM 输出送入高风险决策链的系统，都需要在流程中强制引入来源回溯与人工复核。

- 来源：[TechCrunch](https://techcrunch.com/2026/09/18/ai-hallucination-nearly-triggers-us-military-operation/)
- 验证：? 主要依据 CNN 单一原始报道经 TechCrunch 转述，细节待官方确认

### 谷歌 Labs 把 CC 扩展为家庭共享智能体，最多支持六位成年人 ⭐⭐⭐

谷歌 Labs 在 9 月 17 日宣布，此前面向个人的实验性智能体 CC 扩展为家庭和家务场景的共享智能体：接入 Gmail、Chat、Docs 与 Calendar，可预填课程报名 PDF、调用地图查询实时路程、创建共享文档与表格，并每天早晨向成员发送"Your Day Ahead"日程简报。每位成员自行选择共享哪些信息，而不是把个人账号完全交给智能体。目前为面向美国 18 岁以上、使用个人谷歌账号用户的早期 Labs 实验。

**为什么重要：** 多人共享的智能体带来了单人智能体没有的权限问题——谁能看到谁的数据、指令冲突如何裁决——这类设计选择会成为后续协作型智能体的参考样本。

- 来源：[Google 官方博客](https://blog.google/innovation-and-ai/models-and-research/google-labs/cc-expanding-to-groups/)、[TechRepublic](https://www.techrepublic.com/article/news-google-cc-ai-agent-families/)
- 验证：✓ 官方公告 + 多源确认

### Claude Code Projects 测试并行线程，OpenAI 推出面向律所的 Astra ⭐⭐⭐

据 AI Weekly 汇总，Anthropic 在 Claude Code 的 Projects 中测试并行线程：按项目划定范围，使用相互独立的云端会话并共享记忆，目前向部分 Pro 与 Max 用户灰度，并提示并行会话会更快消耗额度。另据同一来源，OpenAI 推出 Astra for Law，将 GPT-6 Astra 与 2.3 亿以上法律 URL 结合，在 200 个研究问题上正确率 54%，对照的普通网页搜索为 38.7%，先向部分律所开放（此为厂商自报数据）。

**为什么重要：** 前者说明智能体编程正从单会话走向多会话编排，需要开发者提前考虑额度与上下文一致性；后者是垂直领域检索增强的又一个实例，但数据为自报，选型时应自行评测。

- 来源：[AI Weekly 2026-09-18 版](https://aiweekly.co/ai-news-today/edition/2026-09-18)、[OpenAI](https://openai.com/index/astra-for-law/)
- 验证：? 主要依赖聚合来源，官方细节待补充

## 科技动态

### Meta 收购受阻后，Manus 洽谈以 40 亿美元估值融资 5 亿美元 ⭐⭐⭐

TechCrunch 报道，中国 AI 智能体公司 Manus 在恢复独立运营后，正洽谈以 40 亿美元估值融资 5 亿美元。此前它与 Meta 的 20 亿美元收购交易因北京基于出口管制和外资投资的顾虑而告吹。潜在投资方包括 IDG Capital、博裕资本和宁德时代，现有股东腾讯、HSG、真格基金等预计跟投；公司还在考虑为香港上市做重组准备。收购谈判时其年度经常性收入已超过 1 亿美元。

**为什么重要：** 跨境 AI 交易的监管风险已经具体化，海外大厂并购中国团队的路径受阻，独立融资与港股上市成为替代选项。

- 来源：[TechCrunch](https://techcrunch.com/2026/09/18/manus-seeks-4b-valuation-in-new-500m-fundraise-as-it-resumes-independent-ops/)、[The AI Insider](https://theaiinsider.tech/2026/09/21/manus-reportedly-in-talks-to-raise-500m-at-4b-valuation-after-meta-deal-collapse/)
- 验证：✓ 多源确认（仍属洽谈阶段，金额与估值可能调整）

### 美国众议院以 417 比 3 通过数据中心电费保护法案 ⭐⭐⭐

据 AI Weekly 引用 GovInfo，H.R. 9340 于 9 月 16 日在众议院以 417 比 3 通过，要求各州公用事业监管机构考虑向 100 兆瓦及以上的数据中心收取全部电网升级费用，目前等待参议院审议。同日的另一则消息是，亚马逊获得 Generac 最多 169 万股的认股权证，与发电机采购挂钩，预计 2027 至 2028 年首批数据中心交付额约 24 亿美元，累计上限 80 亿美元。

**为什么重要：** 算力扩张的电力成本正从科技公司转嫁问题演变为立法议题，选址、自备电源和长期电力合同会成为数据中心项目的更大变量。

- 来源：[AI Weekly](https://aiweekly.co/alerts/house-passes-ratepayer-protection-act-417-3-on-data-center-costs)、[Generac 8-K 相关报道](https://aiweekly.co/alerts/amazon-wins-warrant-for-3-generac-stake-in-8b-generator-pact)
- 验证：? 依赖单一聚合来源，尚未对原始文件独立核对

---

## 📊 今日数据

| 指标 | 数值 |
|------|------|
| 搜索源数量 | 9 个 |
| 候选资讯 | 24 条 |
| 去重后 | 14 条 |
| 最终收录 | 8 条 |
| 多源验证率 | 约 63% |

---

> 本文由 AI 自动生成，采用多源交叉验证机制。如发现错误，欢迎反馈。
