---
title: "PathSplit A2A 合规性评估与赛道选择"
type: analysis
date: 2026-03-16
hackathon: 知乎 x Second Me 全球 A2A 黑客松
deadline: 2026-03-20 24:00
---

# PathSplit A2A 合规性评估与赛道选择

## 核心结论

PathSplit 当前 **不满足** A2A 黑客松的核心评审要求。产品是一个单人决策工具，3 个 Agent 独立并行运行、互不交互，不构成"Agent 间自主交互"的 A2A 场景。需要在 3/20 截止前补齐关键缺口。

---

## 一、现状 vs. 要求：逐条评估

### 硬性参赛门槛（info.md 第 115 行）

| 要求 | 状态 | 说明 |
|------|------|------|
| Second Me OAuth 授权登录 | 已满足 | 完整 OAuth flow + session cookie + token refresh |
| A2A 应用或面向 Agent 的应用 | 勉强满足 | 3 个 SecondMe Agent 参与叙事，但无 agent-to-agent 交互 |
| 可访问的线上 Demo | 未满足 | 尚未部署到线上 |

### 评委评分维度（占总分 50%）

| 维度 | 权重 | 当前得分预估 | 原因 |
|------|------|------------|------|
| A2A 场景价值 | 40% | 低 | 3 个 Agent 完全独立运行，无任何 agent-to-agent 交互。评审标准原文："Agent 间自主交互而非单 Agent 工具" |
| 创新度 | 30% | 中 | "平行人生"概念有想象力，证据卡是独特产出物 |
| 完成度 | 30% | 中高 | 产品可用、UI 完整、流式体验流畅，但默认 100% mock 数据 |

### 用户选择（占总分 50%）

OAuth 授权登录数 = 用户数。当前为 0，需要部署上线后获取真实用户。

### 知乎特别奖资格

| 知乎能力 | 状态 |
|---------|------|
| 圈子 API | 未接入 |
| 热榜 API | 未接入 |
| 可信搜 API | 未接入 |
| 刘看山 IP | 未使用 |

当前 **不满足** 知乎特别奖参选条件。

---

## 二、关键缺口分析

### 致命缺口：无 A2A 交互

当前架构：
```
用户输入 -> [Agent A] ──┐
                        ├── 独立并行 -> 证据卡（后处理合并）
用户输入 -> [Agent B] ──┤
                        │
用户输入 -> [Agent C] ──┘
```

3 个 Agent 收到相同输入、独立输出、互不感知。`Promise.allSettled` 只是并发执行，不是 A2A。证据卡由 `generateEvidenceCard()` 正则提取生成，不涉及 Agent 交互。

**评审会直接判定这是"单 Agent 工具的 3 份拷贝"，不是 A2A 场景。**

### 致命缺口：无人与人的重新连接

黑客松核心命题："如果 Agent 成为人和人的媒介，人与人之间的连接会如何被重新设计？"

PathSplit 当前是单人闭环：
- 用户输入 -> 看 3 个 AI 叙事 -> 看证据卡 -> 问自己的 SecondMe
- 全程没有连接到另一个真人
- 没有 Agent 替用户发现、匹配、引荐同频的人

### 重要缺口：全 mock 数据

默认无 `.env.local` 配置时，3 个 Agent 全部走 `demo-data.ts` 硬编码叙事。评委跑 Demo 时如果发现内容完全一样（不管输入什么），印象会大打折扣。

---

## 三、赛道选择建议

### 推荐：赛道一（把互联网重做一遍）

| 赛道 | 适配度 | 理由 |
|------|--------|------|
| 赛道一：把互联网重做一遍 | 最高 | PathSplit 本质是"Agent 版知乎经验分享"——从搜索结果升级成可追问的 Agent 网络。参考方向完全匹配："Agent 版知乎（分身代你深入知识社区，在真实讨论里找到同频的人）" |
| 赛道二：Agent 的第三空间 | 中等 | 如果补上 Agent 圆桌讨论环节，可以往"咖啡馆"方向靠，但 PathSplit 的核心体验是决策而非社交 |
| 赛道三：无人区 | 低 | "平行人生"概念有创意但不够"从未出现过" |

**赛道一的叙事线：**
> "知乎上最热门的问题类型是'xxx 是什么体验'。PathSplit 把这个场景用 A2A 重做了一遍——不再等待答主回复，而是让 3 个带着真实经历记忆的 SecondMe Agent 即时展开平行人生线，彼此讨论碰撞后，引导用户找到真正走过这条路的人。"

---

## 四、补齐方案（按优先级排序）

### P0：加入 Agent-to-Agent 交互环节（A2A 场景价值 40%）

**方案：3 个 Agent 完成各自叙事后，进入一轮"圆桌讨论"**

```
用户输入 -> [3 Agent 并行叙事] -> [Agent 圆桌：A 读 B/C 叙事后回应] -> 证据卡
```

实现思路：
- 在 `evidence_card` 生成前，插入一个新的 SSE 阶段 `type: 'roundtable_start'`
- 依次让每个 Agent 读取其他两个 Agent 的叙事，生成一段"我看了你们的经历后想说..."的回应
- 这构成真实的 agent-to-agent 信息交换，不是独立并行
- 证据卡从圆桌讨论内容中提取，而不是从独立叙事中提取

涉及文件：
- `src/app/api/explore/route.ts` — 新增圆桌阶段
- `src/lib/narrative-prompts.ts` — 新增圆桌 prompt
- `src/lib/types.ts` — 新增 SSE 事件类型
- `src/components/PathSplitExperience.tsx` — 渲染圆桌讨论
- 新增 `src/components/RoundtablePanel.tsx`

### P0：部署线上 Demo

必须有可访问的线上 URL，否则不参与评审。

- [ ] Vercel 部署
- [ ] 配置 `.env` 中的 `SECONDME_CLIENT_ID` / `SECONDME_CLIENT_SECRET`
- [ ] 配置 OAuth 回调地址为线上域名

### P1：接入知乎可信搜 API（解锁知乎特别奖）

**方案：Agent 叙事前，先用可信搜检索知乎上关于该决策的真实讨论，注入 Agent 的 context**

```
用户输入 -> 可信搜(关键词) -> 搜索结果注入 Agent system prompt -> 叙事
```

- 用 `GET /openapi/search/global` 搜索用户问题的关键词
- 把高 `authority_level` 的回答摘要注入叙事 prompt
- Agent 叙事时可以引用"知乎上有人说过..."
- 限制：总调用量上限 1000 次，需要做缓存

涉及文件：
- 新增 `src/lib/zhihu.ts` — 可信搜 API 客户端
- `src/app/api/explore/route.ts` — 在 analyzeDilemma 后插入搜索
- `src/lib/narrative-prompts.ts` — prompt 中加入知乎参考内容

### P1：配置真实 SecondMe Agent

确保 Demo 跑的是真实 SecondMe Chat API，而非 mock 数据：

- [ ] 为 3 个 persona 分别注册 SecondMe 账号
- [ ] 通过 `npm run seed:agents` 注入记忆
- [ ] 配置 `SECONDME_AGENT_*_REFRESH_TOKEN` 环境变量

### P2：加入"找到同路人"环节（Reconnect 核心命题）

在证据卡之后，加入一个"找到走过这条路的真人"环节：

- 用知乎可信搜找到写过相关经历的知乎回答
- 展示"这些知乎用户走过类似的路"（链接到知乎回答）
- 或者引导用户在知乎圈子中发帖讨论

这补齐了"人与人重新连接"的闭环。

### P2：知乎圈子集成

- 在证据卡生成后，自动在「A2A for Reconnect」圈子发布一条讨论
- 用户可以看到其他人的平行人生探索
- Agent 可以对圈子内的帖子进行评论

---

## 五、时间线

| 日期 | 事项 |
|------|------|
| 3/16（今天） | 确定赛道 + 开始 P0 Agent 圆桌功能 |
| 3/17 | 完成圆桌 + 部署 Vercel + 配置真实 Agent |
| 3/18 | 接入知乎可信搜 + 开始获取用户 |
| 3/19 | P2 功能 + 知乎圈子 + 打磨 Demo |
| 3/20 12:00 | 最后报名截止 |
| 3/20 24:00 | 项目提交截止 |

---

## 六、风险

| 风险 | 影响 | 缓解 |
|------|------|------|
| 知乎 API 密钥申请需要加群联系人 | 阻塞知乎特别奖 | 尽快申请 |
| 真实 SecondMe Agent 配置复杂 | Demo 质量 | 优先保证 mock 流程完整，真实 Agent 作为加分项 |
| 用户数不足 | 总分 50% 来自用户数 | 尽早部署、在知乎发想法引流 |
| 圆桌讨论增加 API 调用时间 | 用户等待体验 | 控制圆桌每人回应 100 字以内，做成流式 |
