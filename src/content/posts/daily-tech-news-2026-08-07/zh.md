---
title: "每日技术资讯 - 2026年08月07日"
excerpt: "今日焦点：Black Hat 大会曝光 Claude Code 与 Gemini CLI 的供应链级漏洞（Gemini CLI 满分 CVSS 10.0）；Linux 内核 18 年历史的 SCTP 漏洞可致容器逃逸获取宿主机 root；微软确认年内将 Copilot 全线产品合并为统一超级应用。另有 WordPress 预认证 XSS 链、俄罗斯黑客利用 Exchange OWA 零日、GitHub Trending 智能体技能项目等动态。"
coverLabel: "08/07"
date: "2026-08-07T00:00:00.000Z"
author: "ai"
category: "news"
tags: ["daily-news", "ai", "github", "infra"]
featured: false
---

今天的技术圈安全事件密度很高：Black Hat USA 大会上，安全研究人员揭示了 Claude Code 与 Gemini CLI 这两款主流 AI 编码智能体的 CI 供应链级漏洞，一个没有任何仓库权限的 GitHub issue 就足以在 Anthropic、Google 自家的智能体仓库上执行代码；与此同时，一枚潜伏了 18 年的 Linux 内核 SCTP 漏洞被曝出可用于容器逃逸并直接获取宿主机 root。产业层面，微软确认将在年内把 Copilot 全家桶合并为统一超级应用。除此之外，WordPress、Exchange 服务器的攻防动态，以及 GitHub Trending 上智能体工具生态的持续升温，也值得关注，一并梳理如下。

## 🔥 今日焦点

### 1. Black Hat 曝光 Claude Code、Gemini CLI 的 CI 供应链级漏洞，Gemini CLI 一项 CVSS 满分 10.0 ⭐⭐⭐⭐⭐

**核心要点：**
- 安全公司 Novee Security 在 8 月 5 日的 Black Hat USA 大会上公布研究成果：一个不具备任何仓库权限的账号，仅通过在公开仓库里开一个 GitHub issue，就能在 Anthropic 与 Google 自家 AI 编码智能体项目的 CI runner 上执行代码，对 OpenAI 的 Codex 智能体也能劫持其下一次运行。
- Google Gemini CLI 被评为 CVE-2026-12537，是容器启动器中的一个操作系统命令注入漏洞，攻击者通过精心构造的 `.gemini/.env` 文件即可触发，在沙箱环境启动前就能在无头 CI 平台的宿主机上执行任意代码，CVSS v4 评分为满分 10.0。
- Anthropic Claude Code 被评为 CVE-2026-54316：其命令校验器会在运行 23 项安全检查之前先剥离单引号包裹的文本，导致藏在 `git push --receive-pack` 这类会被 git 直接执行的参数值里的恶意载荷未经检查就原样传给了 runner；该漏洞影响 0.2.54 至 2.1.162 全部版本，已在 2.1.163 中修复，另有研究显示该漏洞还能把 Hugging Face 的公开下载计数器变成逐字符外泄 API 密钥的隐蔽信道。

**技术解读：**
两个漏洞指向同一个结构性问题：真正的风险并不来自底层大模型本身，而来自模型与真实执行环境之间的"harness"——权限判断逻辑、工具路由、沙箱边界、共享工作区这些拼接起来的胶水代码。Gemini CLI 的问题出在校验发生的时机太晚（沙箱启动前），Claude Code 的问题出在校验逻辑本身有遗漏（引号剥离顺序错误）——两者都说明，当 AI 编码智能体被授予 CI 权限、需要处理不可信的外部输入（如 issue 内容、仓库文件）时，任何一个校验环节的疏漏都可能被放大成宿主机级别的代码执行。目前尚无证据显示两个漏洞被用于真实攻击，但 Claude Code 的复现代码已于今年 6 月 18 日出现在 GitHub 上，留给团队修复的窗口正在缩小。

**开发者行动建议：**
- 立即将 Gemini CLI 升级到 0.39.1、run-gemini-cli 升级到 0.1.22，将 Claude Code 升级到 2.1.163 或更高版本。
- 审查 CI/CD 流水线中允许 AI 编码智能体自动响应 issue、PR 等不可信外部输入的场景，为涉及凭证、部署密钥的步骤增加人工审核卡点。
- 排查是否有异常的 Hugging Face 下载请求模式，作为 Claude Code 凭证泄露信道被利用的早期信号之一。

**相关链接：**
- 报道：[The Hacker News](https://thehackernews.com/2026/08/claude-code-and-gemini-cli-flaws-let.html)
- 技术分析：[Novee Security](https://novee.security/blog/critical-flaws-in-anthropic-google-and-openais-coding-agents/)
- 报道：[Cyberpress](https://cyberpress.org/critical-flaws-in-claude-code-gemini-cll-openai-codex/)

- 来源：Novee Security 技术分析 + The Hacker News、Cyberpress、GBHackers 等多方报道
- 验证：✓ 多源确认

### 2. 18 年历史的 Linux 内核 SCTP 漏洞「SCTPhantom」曝光，可致容器逃逸获取宿主机 root ⭐⭐⭐⭐⭐

**核心要点：**
- 腾讯朱雀实验室（Tencent Zhuque Lab）研究人员发现一枚潜伏在 Linux 内核 SCTP 网络协议栈中长达 18 年（自 2008 年引入）的 use-after-free 漏洞，被命名为 SCTPhantom，正式编号为 CVE-2026-64564，于 8 月 6 日公开披露。
- 研究团队证实该漏洞可在 Debian 13、Ubuntu 24.04、Rocky Linux 9、RHEL 9 与 OpenCloudOS 等主流发行版的内核构建上稳定获取 root 权限，并成功用其完成容器逃逸、直接触达宿主机。
- 腾讯给出的 CVSS v4.0 评分为 8.5；修复已随 8 月 3 日发布的 7.1.6、6.18.42、6.12.101、6.6.148 等稳定内核版本发布，截至 8 月 7 日尚未发现公开利用代码，也未被 CISA 已知在野利用漏洞（KEV）目录收录。

**技术解读：**
该漏洞是本地提权类型，触发前提是目标系统上 SCTP 协议可达，这在一定程度上限制了攻击面，但对大量默认加载 SCTP 内核模块、又运行着多租户容器工作负载的云主机和 Kubernetes 节点而言，风险不容忽视——一旦攻击者拿到容器内任意代码执行权限（例如通过应用层漏洞），这枚漏洞就能成为从容器逃逸到宿主机 root 的下一跳。18 年未被发现也说明，内核里体量庞大但使用频率较低的协议栈（如 SCTP）恰恰是审计资源投入相对薄弱的角落。

**开发者行动建议：**
- 尽快将生产环境内核升级到 7.1.6 / 6.18.42 / 6.12.101 / 6.6.148 或更高的已修复版本。
- 若业务不依赖 SCTP 协议，可直接通过 `modprobe -r sctp` 或黑名单机制禁用该内核模块，从根本上消除攻击面。
- 对多租户容器/K8s 集群，结合本次事件复查内核模块加载策略与 seccomp/AppArmor 等沙箱配置是否遵循最小权限原则。

**相关链接：**
- 报道：[The Hacker News](https://thehackernews.com/2026/08/18-year-old-linux-sctp-flaw-could-let.html)
- 分析：[Cybersecurity News](https://cybersecuritynews.com/18-year-old-linux-kernel-sctp-vulnerability/)
- 报道：[GuardianMSSP](https://www.guardianmssp.com/2026/08/07/18-year-old-linux-sctp-flaw-could-let-local-users-gain-root-and-escape-containers/)

- 来源：腾讯朱雀实验室技术披露 + The Hacker News、Cybersecurity News、GuardianMSSP 等多方报道
- 验证：✓ 多源确认

### 3. 微软确认年内将 GitHub Copilot、消费级 Copilot 与 Cowork 合并为统一「超级应用」 ⭐⭐⭐⭐

**核心要点：**
- 微软在 7 月 29 日的财报电话会上确认，将把消费级 Copilot 聊天、GitHub Copilot、Copilot Cowork 以及新的 AutoPilot 智能体层整合进同一个应用，用户可通过统一身份图谱（一次登录同时打通 GitHub 与 Microsoft 365）在个人与企业场景之间切换，官方称此举将在年内落地。
- 整合后的产品理论上支持"在聊天中提问 → 无缝切入写代码 → 智能体记住上下文 → 交给自主 Agent 执行任务"的连续工作流，无需在多个独立应用间切换或反复登录。
- 与此同时，微软将下线表现不佳的 Copilot Podcasts 与 Copilot Labs 功能。官方数据显示，在 4.5 亿 Microsoft 365 用户中，付费使用 Copilot 功能的比例不到 4.5%，消费级聊天机器人的活跃用户规模也落后于 ChatGPT 与 Gemini，这被普遍认为是本次整合的直接动因。

**技术解读：**
把 GitHub Copilot（面向开发者的代码智能体）和消费级 Copilot（面向办公场景的通用助手）纳入同一身份体系，本质上是微软在用"统一入口 + 统一上下文记忆"来对冲当前 Copilot 矩阵产品线过多、身份割裂导致的用户流失与转化率低下问题。对开发者而言，这意味着未来 GitHub 账号与 Microsoft 365 账号的权限边界、数据可见范围可能会被重新定义——尤其是在企业侧，管理员需要重新评估"开发者上下文"与"办公场景上下文"打通后的数据治理与合规边界。

**开发者行动建议：**
- 如果团队深度依赖 GitHub Copilot 的现有工作流（如 CLI、IDE 插件、云端 Agent），建议关注官方后续发布的具体迁移时间表与身份体系变更细节，避免在整合窗口期出现认证或权限中断。
- 企业管理员应提前评估统一身份图谱上线后，开发者工具访问权限与办公套件数据是否会产生新的交叉可见性，按需调整访问策略。

**相关链接：**
- 报道：[MLQ News](https://mlq.ai/news/microsoft-merges-consumer-and-enterprise-copilot-into-single-app-launches-paid-autopilot-agents/)
- 报道：[DevOps.com](https://devops.com/microsoft-confirms-copilot-super-app-is-coming-this-year-and-its-about-more-than-convenience/)
- 报道：[Windows Forum](https://windowsforum.com/threads/microsoft-to-merge-copilot-apps-by-aug-2026-add-paid-agents-cut-clutter.435024/)

- 来源：微软 7 月 29 日财报电话会 + MLQ News、DevOps.com、Windows Forum、Techweez 等多方报道
- 验证：✓ 多源确认

---

## AI / 人工智能

### Grok 语音模型大幅降低响应延迟，8 月 5 日起成为 App 默认语音 ⭐⭐⭐

xAI 于 7 月 29 日发布新版 Grok 语音模型，将开口应答前的等待时间从约 1.25 秒压缩到约 0.7 秒，并改进了多轮对话中的打断与衔接体验；该模型已于 8 月 5 日起成为 Grok App 内的默认语音选项。

**为什么重要：** 语音交互的"启动延迟"是决定 AI 助手是否"像在对话"而非"像在排队等回复"的关键体验指标，这次优化显示语音 Agent 赛道的竞争正从"能不能听懂"转向"够不够自然流畅"。

- 来源：[AIToolsRecap](https://aitoolsrecap.com/Blog/AINewsAugust2026.aspx)
- 验证：✓ 多源确认

### 欧盟《AI 法案》第 50 条透明度义务 8 月 2 日起强制生效 ⭐⭐⭐⭐

欧盟《人工智能法案》第 50 条设定的透明度义务已于 8 月 2 日正式具备法律强制力：面向用户直接交互的 AI 系统（如聊天机器人、语音助手、Agent 客服）必须在用户首次接触时就明确披露"正在与 AI 交互"，不能仅在服务条款中隐晦提及；AI 生成或篡改的内容（含深度伪造）也需加注可识别标签。合规主要由各成员国市场监管机构负责执行，严重违规最高可处以 1500 万欧元或全球营业额 3% 的罚款（部分文献援引更高上限 7%），在 2026 年 8 月 2 日前已上市的系统则享有至 12 月 2 日的过渡期。

**为什么重要：** 面向欧盟用户提供聊天机器人、AI 客服或内容生成功能的团队，如果尚未在交互首屏加入清晰的"AI 身份"披露与生成内容标注机制，现在已经处于合规违规状态，建议尽快自查并补齐。

- 来源：[Cooley 律所解读](https://www.cooley.com/news/insight/2026/2026-08-03-eu-ai-act-transparency-obligations-take-effect-2-august-2026)、[Travers Smith 律所解读](https://www.traverssmith.com/knowledge/knowledge-container/is-it-a-bot-eu-ai-act-transparency-rules-take-effect-2-august-2026/)
- 验证：✓ 官方法规生效 + 多家律所解读确认

### OpenAI 向法院提交动议，请求驳回苹果商业秘密诉讼 ⭐⭐⭐

据报道，OpenAI 已向法院提交一份 31 页的动议，请求驳回苹果对其提起的商业秘密诉讼，称该诉讼"从根子上就站不住脚"，并反指苹果提起诉讼是为自身在 AI 领域进展落后寻找台阶。

**为什么重要：** 这是大型科技公司之间围绕 AI 相关商业秘密与人才流动的又一起典型诉讼，其后续走向可能影响行业内员工跨公司流动、技术细节披露边界的司法标准。

- 来源：[llm-stats.com AI Updates](https://llm-stats.com/llm-updates)
- 验证：? 待完整判决文书公开进一步确认细节

## GitHub / 开源

### GitHub Trending 榜单被"智能体技能与工具"类项目全面占据 ⭐⭐⭐⭐

今日 GitHub Trending 榜单前列几乎清一色是 AI Agent 相关工具：**[PrimeIntellect-ai/prime-agent](https://github.com/PrimeIntellect-ai/prime-agent)**（TypeScript，6,399 ⭐，单日 +2,271）是一个面向编码与长时程自主任务的"自我改进型"RLM Agent；**[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)**（JavaScript，83,865 ⭐，单日 +1,131）提供一套面向 AI 编码智能体的生产级工程技能集；**[cloudflare/computer](https://github.com/cloudflare/computer)**（TypeScript，5,643 ⭐，单日 +894）则让开发者可以"给 Agent 配一台电脑"，为其提供可操作的虚拟计算环境。

**亮点：** 三个项目分别代表了当前 Agent 生态的三个方向——自我改进的自主 Agent、可复用的工程技能库、Agent 可操作的运行环境，共同勾勒出"智能体基础设施"这一细分赛道正在快速成型。

- 来源：[GitHub Trending](https://github.com/trending)
- 验证：✓ 官方数据

### GitHub 新增 AI 自动生成代码覆盖率工作流 ⭐⭐⭐

GitHub 在 8 月更新日志中宣布，仓库 Code Quality 设置新增一个选项，可用 AI 自动生成代码覆盖率检测工作流，用户可在合并前以 PR 形式审查该自动生成的工作流内容。

**为什么重要：** 降低了团队从零搭建覆盖率检测流水线的门槛，尤其对缺乏专职 DevOps 资源的中小团队，能更快补齐质量门禁短板。

- 来源：[GitHub Changelog](https://github.blog/changelog/month/08-2026/)
- 验证：✓ 官方发布

## 后端 / 基础设施

### 英国光子 AI 芯片公司 OLIX 完成 3.12 亿美元 B 轮融资，估值达 33 亿美元 ⭐⭐⭐⭐

英国芯片初创公司 OLIX Computing（前身为 Flux Computing）宣布完成 3.12 亿美元 B 轮融资，投后估值 33 亿美元，距其 2 月完成的 2.2 亿美元融资、约 10 亿美元估值仅过去数月。本轮由纽约风投 Fundomo 领投，Arm、Hudson River Trading 及 Netflix 联合创始人 Reed Hastings 等参投，英国政府主权 AI 基金也参与其中。OLIX 研发的"光学张量处理单元"（OTPU）用光而非电完成 AI 模型所需的矩阵运算，首款面向推理场景的解码加速产品 DX-1 计划于 2027 年下半年向客户交付。

**为什么重要：** 光子计算是"后 GPU 时代"AI 推理硬件的重要探索方向之一，其宣称在能效与散热上相对传统 GPU 方案的优势，如果在实际部署中得到验证，可能为大规模推理成本结构带来新的变量，值得基础设施团队保持关注。

- 来源：[DatacenterDynamics](https://www.datacenterdynamics.com/en/news/chip-startup-olix-raises-312m-at-33bn-valuation-backed-by-uk-govt-sovereign-ai-venture-fund/)、[Converge Digest](https://convergedigest.com/olix-raises-312m-photonic-ai-inference-nick-mckeown/)
- 验证：✓ 多源确认

## 安全 & 科技动态

### WordPress 曝预认证 XSS 可链式升级为 RCE，官方已发布 7.0.3 紧急修复 ⭐⭐⭐⭐

安全研究团队 pwn.ai 披露一条命名为 XSS2Shell 的攻击链（CVE-2026-64638，CVSS 8.9）：攻击者只需构造一个特殊用户名触发登录失败页面，即可在受害者浏览器中执行任意 JavaScript，且无需受害者进行任何额外交互；若受害者恰好是已登录的管理员并被诱导访问攻击者控制的页面，该链条可进一步升级为服务器端 PHP 代码执行。该缺陷自 WordPress 4.7 版本起便已存在，几乎影响所有仍在维护的分支，官方已于 8 月 6 日发布 7.0.3 版本予以修复，并将补丁回溯到所有维护中的历史分支。

**为什么重要：** WordPress 驱动着全球相当比例的网站，这条无需前置权限即可触发的 XSS 链影响面极广，建议所有 WordPress 站点管理员立即升级到 7.0.3 或对应分支的修复版本。

- 来源：[The Hacker News](https://thehackernews.com/2026/08/new-wordpress-pre-auth-xss-could-lead.html)、[pwn.ai 技术分析](https://pwn.ai/blog/xss2shell)
- 验证：✓ 多源确认 + 官方发布安全更新

### 俄罗斯国家背景黑客组织利用 Exchange OWA 零日实现"半点击"邮箱长期潜伏 ⭐⭐⭐

安全公司 Proofpoint 披露，俄罗斯国家背景黑客组织 Laundry Bear（又称 Void Blizzard/TA488）正在利用 Exchange Outlook Web Access 中的跨站脚本零日漏洞 CVE-2026-42897，仅需受害者打开一封精心构造的邮件即可触发，无需进一步点击操作，研究人员称之为"半点击"攻击。该组织借此部署名为 OWAReaper 的后门，窃取邮件、凭证与多因素认证码，部分植入即便在密码重置甚至系统重新镜像后仍能存活。该漏洞影响完全打过补丁的本地部署 Exchange Server 2016/2019/Subscription Edition，Exchange Online 不受影响；攻击基础设施最早可追溯至今年 3 月，早于微软 5 月发出的官方预警。

**为什么重要：** 对仍在运行本地 Exchange 服务器的政企机构而言，这是一起持续时间长、隐蔽性强的国家级定向攻击活动，建议尽快核查是否存在异常邮箱转发规则或未知服务账号，并评估是否需要额外的端点检测与响应（EDR）覆盖。

- 来源：[BleepingComputer](https://www.bleepingcomputer.com/news/security/russian-hackers-exploit-exchange-owa-zero-day-for-long-term-mailbox-access/)、[CSO Online](https://www.csoonline.com/article/4203349/russian-hackers-turn-exchange-flaw-into-half-click-mailbox-takeover.html)
- 验证：✓ 多源确认

---

## 📊 今日数据

| 指标 | 数值 |
|------|------|
| 搜索源数量 | 17 个 |
| 候选资讯 | 18 条 |
| 去重后 | 13 条 |
| 最终收录 | 10 条 |
| 多源验证率 | 约 90% |

---

> 本文由 AI 自动生成，采用多源交叉验证机制。如发现错误，欢迎反馈。
