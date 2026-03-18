---
title: "PathSplit - 人生平行宇宙"
type: feat
date: 2026-03-12
hackathon: 知乎 x Second Me 全球 A2A 黑客松
timeline: 2026-03-16 ~ 2026-03-21
brand: PathSplit
---

# PathSplit - 人生平行宇宙

> 做人生重大决定前，看看走过不同路的人，后来怎样了。

---

## Overview

PathSplit 是一个 A2A 原生的人生决策探索器。用户输入一个人生困惑，系统调用预先创建的 SecondMe Agent 实例（每个 Agent 已通过 `agent_memory/ingest` 注入特定人生经历），用第一人称实时流式讲述各自走过的路。

不是给你建议，而是让你「体验」平行人生。

**核心 PMF 假设**：聚焦「大厂跳创业」这一个决策场景，验证用户是否愿意反复使用并为深度咨询付费。

---

## Problem Statement

### 真实痛点

1. **人生决策焦虑是普遍的、高频的** -- 知乎上最热门的问题类型就是「xxx 是什么体验？」「该不该 xxx？」
2. **现有方案都有硬伤**：
   - 知乎回答：等待周期长、答主不一定回复追问、视角单一
   - 知乎 Live / 在行：贵（几百元/次）、需要预约、单一专家视角
   - GPT / Claude：给你的是 AI 编出来的「建议」，不是真实经历
3. **知乎证明了需求存在** -- 「xxx 是什么体验」类问题长期霸榜

### PMF Wedge：大厂跳创业

PathSplit 不做「所有人生决策」。MVP 聚焦一个场景：

| 维度 | 定义 |
|------|------|
| **ICP** | 25-35 岁大厂员工，认真考虑离职创业 |
| **核心场景** | 「30 岁要不要从大厂跳去创业？」 |
| **重复使用假设** | 用户在决策前期、中期、最终决定前各访问一次，每次深入不同视角 |
| **付费假设** | 免费版看 3 个视角概要；付费版解锁完整叙事 + 深入追问 + 平行人生证据卡 |

其他场景（转行、出国、读研、裸辞旅行）标记为 **非 MVP**，仅作为预设话题入口展示产品广度，不做深度叙事质量保证。

### 为什么必须是 A2A

传统搜索/推荐是「人找内容」；PathSplit 是「Agent 替你找人」。

核心交互是 Agent-to-Agent：预创建的 SecondMe Agent 实例拥有注入的真实经历记忆，用户的 Agent 代用户与这些 Agent 对话，筛选、匹配、深入交流。

---

## Differentiation

### 竞品对比矩阵

| 维度 | AI 投票圈 | MedCrowd | SecondMe Boss | **PathSplit** |
|------|----------|----------|---------------|---------------|
| **输入** | 任意投票问题 | 医疗问题 | 招聘/求职需求 | 人生决策困惑 |
| **Agent 机制** | 网络 Agent 投票 | 分布式医疗 Agent | A2A 匹配 | 预创建 Agent + 注入记忆 |
| **输出** | 投票摘要 | 医疗建议 | 职位匹配 | **平行人生证据卡** |
| **信任信号** | 投票数量 | 医学资质 | 企业认证 | 具体时间/数字/细节 |
| **目标用户** | 通用 | 患者 | 招聘/求职者 | 大厂员工考虑创业 |

### 独特输出：平行人生证据卡

PathSplit 的差异化不在「多 Agent」（大家都有），而在一个只有 PathSplit 产出的 artifact：

**平行人生证据卡** = 一张可分享的卡片，包含：
- 3 个 Agent 的关键决策节点和后果对比
- 具体数字（收入变化、时间线、关键事件）
- 用户困惑的核心维度在每条路径上的走向
- 「如果重来」-- 每个 Agent 最真实的一句话

这张卡片是用户决策的「证据」，不是「建议」。可以保存、分享、反复查看。

---

## Technical Approach

### 技术栈

| 模块 | 技术选择 | 理由 |
|------|----------|------|
| 框架 | Next.js 15+ / React 19 / TypeScript | 博弈圆桌已验证 |
| 样式 | Tailwind CSS v4 | 快速开发 |
| Agent 后端 | SecondMe Chat/Stream API (SSE) | 真实 A2A |
| Agent 记忆 | SecondMe `agent_memory/ingest` | 注入人生经历 |
| 叙事引擎 | DeepSeek / OpenAI Compatible LLM | 控制叙事结构 |
| 实时通信 | 自定义 SSE 协议（`TransformStream`） | 每个 chunk 带 `agentId`，per-agent 错误隔离 |
| 部署 | Vercel (Node.js Runtime, Fluid Compute) | `maxDuration = 180`，`X-Accel-Buffering: no` |

**砍掉的技术**：
- ~~React Flow 路径地图~~ -- 砍掉。用静态的证据卡替代
- ~~移动端适配~~ -- 砍掉。桌面优先，demo 用桌面
- ~~rAF 缓冲渲染~~ -- 砍掉。直接 `setState`，3-5 个流不需要 rAF 优化
- ~~Vercel AI SDK `writer.merge()`~~ -- 砍掉。merged streams 无法区分 agent chunk 归属

### A2A 架构：真实 SecondMe Agent

**关键决策**：不用 LLM 模拟 Agent，而是预创建真实的 SecondMe Agent 实例。

```
准备阶段（开发时）：
1. 创建 3-5 个 SecondMe Agent 实例
2. 通过 agent_memory/ingest 注入经历记忆
3. 每个 Agent 有独立的 persona、语气、记忆

运行时：
用户输入困惑
    ↓
LLM 分析困惑维度，选择匹配的 Agent 组合
    ↓
并行调用 SecondMe Chat/Stream API（每个 Agent）
    ↓
自定义 SSE 协议，每个 chunk 带 agentId
    ↓
前端按 agentId 分发到对应叙事卡片
    ↓
叙事完成后，LLM 生成平行人生证据卡
```

**agent_memory/ingest 用法**：

```typescript
// 为 Agent 注入经历记忆
await fetch(`${SECONDME_BASE}/agent_memory/ingest`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    memories: [
      {
        content: "我叫张明，28岁从字节跳动离职创业...",
        metadata: { type: "life_story", topic: "startup" }
      },
      {
        content: "创业第一年烧了80万，月薪从35k降到8k...",
        metadata: { type: "life_detail", topic: "finance" }
      }
    ]
  })
});
```

### SSE 协议（已锁定：自定义 SSE）

**决策**：使用自定义 SSE 协议，不用 Vercel AI SDK `writer.merge()`。

**原因**：`writer.merge()` 将多个流交织在一起，无法区分 chunk 属于哪个 Agent。PathSplit 的核心 UX 是多个 Agent 同时讲述不同故事，前端必须知道每个 chunk 的归属。

```typescript
// app/api/explore/route.ts -- 单一 SSE 端点
export async function POST(req: Request) {
  const { question } = await req.json();

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const send = (event: SSEEvent) => {
    writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
  };

  // 异步启动叙事流程
  (async () => {
    try {
      // 1. 分析困惑，选择 Agent 组合
      const analysis = await analyzeDilemma(question);
      send({ type: 'session', data: { topic: question, agents: analysis.agents } });

      // 2. 并行启动所有 Agent 叙事，per-agent 错误隔离
      const results = await Promise.allSettled(
        analysis.agents.map(async (agent) => {
          try {
            send({ type: 'agent_start', data: { agentId: agent.id, label: agent.label } });

            for await (const chunk of streamFromSecondMe(agent)) {
              send({ type: 'agent_chunk', data: { agentId: agent.id, content: chunk } });
            }

            send({ type: 'agent_done', data: { agentId: agent.id } });
          } catch (err) {
            // 单个 Agent 失败不影响其他 Agent
            send({
              type: 'agent_error',
              data: { agentId: agent.id, message: '该视角暂时无法加载' } // 用户安全的错误信息
            });
          }
        })
      );

      // 3. 生成证据卡
      const evidenceCard = await generateEvidenceCard(analysis, results);
      send({ type: 'evidence_card', data: evidenceCard });

      send({ type: 'done' });
    } catch (err) {
      send({ type: 'error', data: { message: '服务暂时不可用，请稍后重试' } });
    } finally {
      writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
```

**SSE 事件类型**：

```typescript
type SSEEvent =
  | { type: 'session'; data: { topic: string; agents: AgentMeta[] } }
  | { type: 'agent_start'; data: { agentId: string; label: string } }
  | { type: 'agent_chunk'; data: { agentId: string; content: string } }
  | { type: 'agent_done'; data: { agentId: string } }
  | { type: 'agent_error'; data: { agentId: string; message: string } }
  | { type: 'evidence_card'; data: EvidenceCard }
  | { type: 'done' }
  | { type: 'error'; data: { message: string } };
```

**错误隔离要点**：
- `Promise.allSettled` 而非 `Promise.all` -- 单个 Agent 失败不影响整体
- 每个 Agent 有独立的 try/catch
- 错误信息经过 redaction：不暴露内部错误细节，只展示用户安全的提示

### 前端状态管理

```typescript
// 简单直接的 useState，不需要 rAF 优化
const [narratives, setNarratives] = useState<Map<string, string>>(new Map());

function onChunk(agentId: string, content: string) {
  setNarratives(prev => {
    const next = new Map(prev);
    next.set(agentId, (next.get(agentId) || '') + content);
    return next;
  });
}
```

### 叙事 Prompt Engineering

**核心原则：让 AI 生成的叙事「像真人写的知乎回答」而不是「AI 生成的建议」**

**中文 AI 味黑名单**（prompt 中明确禁止）：
- 套话：「值得注意的是」「总而言之」「不可或缺」「综上所述」「毋庸置疑」
- 平衡式：「一方面...另一方面...」「虽然...但是...总的来说...」
- 空话：「在当今社会」「随着科技的发展」「收获了很多」「成长了不少」

**增强真实感**：
1. 具体数字：「月薪从 35k 降到创业期的 8k」
2. 时间锚点：「2023 年 3 月的那个周五下午」
3. 感官细节：「HR 递给我离职协议时手都在抖」
4. 口语化：「说实话」「不瞒你说」「当时真是」
5. 矛盾情感：真人叙事通常复杂矛盾，不会工整对仗
6. 行话特征：创业者用「赛道」「PMF」「burn rate」等

**Prompt 模板**：

```
你是{persona.name}，{persona.age}岁，{persona.background}。

你正在一个类似知乎的平台上，回答这个问题：「{用户的困惑}」

请用第一人称「我」讲述你的真实经历。你不是在给建议，你只是在讲自己的故事。

要求：
- 像在跟朋友聊天一样讲，不要用书面语
- 具体到时间、地点、金额、人名（可以用化名）
- 讲你当时的真实心理活动，包括纠结、后悔、侥幸等复杂情绪
- 不要总结，不要升华，不要给建议
- 你的语气是{persona.tone}

绝对禁止使用：
- 「值得注意的是」「总而言之」「不可或缺」「综上所述」
- 「一方面...另一方面...」这种平衡式表达
- 「在当今社会」「随着...的发展」这种空话
- 任何「首先...其次...最后...」这种列举结构

按这个顺序讲：
1. 我当时的处境（2-3句话，直接进入情境）
2. 我做了什么选择（1句话）
3. 后来发生了什么（具体事件，占叙事的60%）
4. 现在我在哪里（2句话结尾，不做总结）
```

**温度**：`temperature: 0.8`，`top_p: 0.9`。不同 persona 微调温度增加差异化。

**few-shot**：为「大厂跳创业」场景准备 1 个高质量知乎真实回答作为风格参考（300-500 字）。

### 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # SecondMe OAuth
│   │   └── explore/       # 单一 SSE 端点（分析 + 叙事 + 证据卡）
│   ├── explore/
│   │   └── [id]/          # 平行叙事展示页
│   ├── chat/
│   │   └── [agentId]/     # 与单个 Agent 深入对话
│   └── page.tsx           # 首页（困惑输入）
├── components/
│   ├── QuestionInput.tsx   # 困惑输入
│   ├── PerspectiveCard.tsx # 单个 Agent 叙事卡片（流式渲染 + 光标）
│   ├── NarrativeGrid.tsx   # 多 Agent 并行展示容器
│   ├── EvidenceCard.tsx    # 平行人生证据卡
│   ├── AgentAvatar.tsx     # Agent 头像/状态
│   ├── SafetyLabel.tsx     # AI 生成内容标识
│   └── MarkdownContent.tsx # Markdown 渲染
├── lib/
│   ├── auth.ts            # SecondMe OAuth
│   ├── secondme.ts        # SecondMe API 客户端
│   ├── llm.ts             # LLM 客户端
│   ├── analyzer.ts        # 困惑分析 + Agent 选择
│   ├── narrator.ts        # 叙事编排
│   ├── evidence.ts        # 证据卡生成
│   ├── safety.ts          # 输入检测 + 错误 redaction
│   └── types.ts           # TypeScript 类型
└── styles/
    └── globals.css
```

---

## Trust & Safety

### 产品层

1. **AI 生成内容标识** -- 所有叙事卡片顶部显示「AI 模拟推演 | 基于真实经历生成」标签
2. **证据卡标注** -- 底部标注「本内容由 AI 根据真实经历记忆生成，仅供参考，不构成专业建议」
3. **场景边界** -- 明确告知用户：「PathSplit 帮你看到不同人生路径的可能性，但最终决定由你自己做」

### 输入安全

1. **XML 结构化分隔** -- 用户输入用 `<user_input>` 标签包裹，与系统 prompt 隔离
2. **禁止域** -- 拒绝处理医疗诊断、法律咨询、自杀/自伤、金融投资建议等高风险话题
3. **长度限制** -- 用户输入 max 500 字

### 错误安全

1. **错误 Redaction** -- 所有面向用户的错误信息经过 redaction，不暴露 API key、内部 URL、stack trace
2. **Graceful Degradation** -- 单个 Agent 失败显示「该视角暂时无法加载」，不影响其他 Agent

### Demo 范围限制

MVP demo 仅展示以下安全场景：
- 大厂跳创业（主场景）
- 非 CS 转行做程序员
- 读研 vs 直接工作
- 要不要去海外工作
- 裸辞去旅行一年

明确排除：医疗、法律、金融投资、情感关系、心理危机。

---

## Implementation Phases

### Phase 1: 基础框架 + A2A 验证 (Day 1 - 3/16)

**目标**：跑通一个 Agent 的完整流程

- [x] 初始化 Next.js 项目，复用博弈圆桌的 auth/secondme/llm 模块
- [x] SecondMe API base URL 更新为 `https://api.mindverse.com/gate/lab`
- [x] 创建 1 个 SecondMe Agent 实例，通过 `agent_memory/ingest` 注入创业者经历
- [x] 验证 SecondMe Chat/Stream API 能返回基于注入记忆的叙事
- [x] 实现首页：困惑输入 + 5 个预设话题

**验收**：用户输入「大厂跳创业」，1 个真实 SecondMe Agent 用第一人称讲述注入的经历

### Phase 2: 多 Agent 并行叙事 + UI (Day 2 - 3/17)

**目标**：核心 wow moment -- 3 个 Agent 同时讲故事

- [ ] 创建剩余 2-4 个 Agent 实例，注入不同经历（留守者、创业失败者等）
- [x] 实现自定义 SSE 协议（`/api/explore` 端点）
- [x] 实现前端 NarrativeGrid + PerspectiveCard（流式渲染 + 光标动画）
- [x] 叙事 prompt 调优（AI 味黑名单 + few-shot）
- [x] 错开启动策略（200-500ms 间隔）

**验收**：输入困惑后，3 个 Agent 错开启动并行讲述，实时流式展示，单个 Agent 失败不影响其他

### Phase 3: 证据卡 + 深入对话 + 安全 (Day 3 - 3/18)

**目标**：产品完整度

- [x] 实现平行人生证据卡生成（LLM 从叙事中提取关键对比数据）
- [x] 实现 EvidenceCard 组件（可分享的卡片 UI）
- [x] 实现与单个 Agent 的追问对话
- [x] 实现 SafetyLabel 组件 + 输入安全检测 + 错误 redaction
- [x] 添加 AI 生成内容标识

**验收**：完整流程（输入 → 并行叙事 → 证据卡 → 追问），所有 AI 内容有标识

### Phase 4: UI 打磨 + 部署 (Day 4 - 3/19)

**目标**：demo-ready

- [x] UI/UX 设计优化（前端 `frontend-design` skill）
- [x] 流式光标动画、卡片过渡、骨架屏
- [x] Agent 头像和个性化展示
- [ ] 预设场景叙事质量逐个调优
- [ ] Vercel 部署（Fluid Compute，确认 Pro 计划超时）

**验收**：线上可访问，demo 场景流畅，视觉专业

### Phase 5: 路演准备 (Day 5 - 3/20)

- [ ] 路演 PPT / Demo 视频
- [ ] 2-3 个精心设计的 demo 场景（预热缓存）
- [ ] 路演脚本排练
- [ ] 准备评审 Q&A

**验收**：路演材料就绪，脚本流畅

---

## Pitch 策略

### 30 秒 Elevator Pitch

> 知乎上最火的问题是什么？「xxx 是什么体验？」
> 因为做人生重大决定时，我们需要的不是 AI 的建议，而是走过不同路的人的真实经历。
> PathSplit 让预创建的 SecondMe Agent -- 每个注入了不同人生经历记忆 -- 用第一人称讲述他们的故事。
> 不是给你建议，而是让你体验平行人生。

### Demo 脚本

1. **开场** (30s)：展示首页，介绍概念
2. **输入困惑** (15s)：输入「30 岁从大厂跳去创业，值吗？」
3. **并行叙事** (90s)：3 个 Agent 同时讲述 -- **最高潮**
   - Agent A 创业第 3 年：「我 28 岁离开字节...」
   - Agent B 留在大厂升到总监：「我当时也想走...」
   - Agent C 创业失败回大厂：「烧光了两年积蓄...」
4. **证据卡** (15s)：展示平行人生证据卡 -- 三条路径的关键数据对比
5. **深入对话** (30s)：和 Agent A 追问「创业最难的是什么？」
6. **收尾** (15s)：强调真实 A2A + 知乎社区连接价值

### 评审 Q&A

| 问题 | 回答 |
|------|------|
| 这些 Agent 的经历是真实的吗？ | 每个 Agent 是预创建的 SecondMe 实例，通过 `agent_memory/ingest` 注入了基于真实知乎回答整理的经历记忆。这是真实的 A2A 通信，不是 LLM 模拟。所有 AI 生成内容明确标注。 |
| 和知乎提问有什么区别？ | 即时、多视角并行、第一人称叙事、可追问。不需要等人来回答。 |
| 和 ChatGPT 有什么区别？ | ChatGPT 给你 AI 编的建议。PathSplit 的 Agent 拥有注入的真实经历记忆，讲的是具体的时间、地点、金额，不是泛泛而谈。而且每张证据卡是可保存的决策参考。 |
| 商业模式？ | 免费版：3 个视角概要。付费版：完整叙事 + 深入追问 + 平行人生证据卡。聚焦「大厂跳创业」验证付费意愿后扩展场景。 |
| 为什么是 A2A 而不是单纯 LLM？ | 因为每个 Agent 是 SecondMe 平台上的独立实例，有自己的记忆和 persona。这不是一个 LLM 扮演多个角色，而是多个 Agent 各自基于自己的记忆在讲述。 |

---

## Success Metrics

| 指标 | 目标 | 类型 |
|------|------|------|
| 路演评委反应 | 至少 1 个「wow」时刻 | Demo |
| Demo 完整性 | 主场景无错误完成 | Demo |
| 叙事质量 | 评审认为「像真人」 | Quality |
| A2A 真实性 | 评审认可真实 Agent 通信 | Architecture |
| **用户决策清晰度** | 证据卡帮助用户理解不同路径的代价和收获 | User Value |
| **追问率** | >50% 用户在叙事后点击追问 | User Value |

---

## Risk Analysis

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| SecondMe agent_memory/ingest 写入失败 | 中 | 高 | Day 1 第一件事验证；失败则降级为 LLM 模拟 + 在叙述中说明 |
| 叙事质量不够真实 | 中 | 高 | 知乎真实回答 few-shot + AI 味黑名单 + temperature 0.8 |
| 多 Agent 并行流式卡顿 | 低 | 中 | 错开 200-500ms 启动 + React.memo |
| 5 天时间不够 | 中 | 高 | Phase 1-2 必须完成，Phase 3-4 可简化 |
| LLM API 不稳定 | 低 | 高 | 备选 LLM provider + 预录保底 |
| Vercel SSE 超时 | 低 | 中 | `maxDuration = 180` + 叙事控制在 60s 内 |
| 评审质疑叙事真实性 | 中 | 高 | 展示 agent_memory/ingest 流程 + AI 生成内容标识 |
| 用户输入高风险话题 | 低 | 高 | 禁止域检测 + 输入长度限制 |

---

## Acceptance Criteria

### Functional

- [x] SecondMe OAuth 登录正常
- [ ] 至少 3 个 SecondMe Agent 实例通过 `agent_memory/ingest` 注入经历
- [x] 用户可以输入困惑或选择预设话题
- [x] 3 个 Agent 并行流式叙事，每个 chunk 带 `agentId`
- [x] 单个 Agent 失败不影响其他 Agent
- [x] 叙事完成后生成平行人生证据卡
- [x] 用户可以选择任一 Agent 追问
- [x] 所有 AI 生成内容有标识

### Non-Functional

- [x] 首个 Agent 开始输出 < 3 秒
- [ ] 流式渲染无明显卡顿
- [ ] UI 设计专业

### Quality Gates

- [x] 叙事含具体数字、时间、地点
- [x] 叙事不含 AI 味套话
- [ ] 不同 Agent 语气/用词/视角有明显差异
- [x] 证据卡数据准确反映叙事内容
- [x] 高风险话题被拒绝处理
- [x] 错误信息经过 redaction

---

## References

### SecondMe API（2026-03-12 验证）

- 开发者文档：https://develop-docs.second.me/zh/docs
- OAuth2：https://develop-docs.second.me/zh/docs/authentication/oauth2
- API 参考：https://develop-docs.second.me/zh/docs/api-reference/secondme
- GitHub：https://github.com/mindverse/Second-Me (15.3k stars)

**API Base URL**：`https://api.mindverse.com/gate/lab`

| API | 用途 |
|-----|------|
| OAuth2 | 用户登录（Refresh Token 30 天内不轮换） |
| GET /user/info | 用户基本信息 |
| GET /user/shades | 兴趣标签 |
| POST /chat/stream | 流式聊天 (SSE) |
| POST /agent_memory/ingest | 写入结构化记忆 |

### Vercel

- Fluid Compute 默认启用，99.37% 请求零冷启动
- Node.js Runtime（非 Edge，Edge 有 4MB 响应限制）
- Pro 计划支持 800s 超时

### 市场参考

- 知乎「xxx 是什么体验」：持续 10+ 年的热门话题类型，证明经验分享需求长期存在
- 知乎直答（zhida.ai）：知乎 AI 搜索产品，已有显著用户增长（具体数据待知乎官方确认）
- 知乎 Live / 在行：验证了付费知识咨询的需求存在

### 可复用代码

- `src/lib/auth.ts` -- SecondMe OAuth
- `src/lib/secondme.ts` -- SecondMe API 客户端（需更新 base URL）
- `src/lib/llm.ts` -- LLM 客户端
- `src/components/MarkdownContent.tsx` -- Markdown 渲染
