---
title: "千面 - 人生平行宇宙"
type: feat
date: 2026-03-12
deepened: 2026-03-12
hackathon: 知乎 x Second Me 全球 A2A 黑客松
timeline: 2026-03-16 ~ 2026-03-21
---

# 千面 (QianMian) - 人生平行宇宙

> 做人生重大决定前，看看走过不同路的人，后来怎样了。

## Enhancement Summary

**Deepened on:** 2026-03-12
**Sections enhanced:** 8
**Research agents used:** SSE 多流架构, React Flow 可视化, 叙事 Prompt Engineering, SecondMe API 深度调研, 架构评审, 性能评审, Vercel 部署, 前端流式 UI, 黑客松策略

### Key Improvements
1. **确认 SecondMe API 无 Agent 发现功能** -- 文档仅含 OAuth + 用户自身数据 + Chat + Act + Agent Memory Ingest，无搜索他人 Agent 的接口。方案 B（LLM 模拟）确认为唯一可行路径。
2. **API Base URL 已迁移** -- 从 `https://app.mindos.com/gate/lab` 迁移到 `https://api.mindverse.com/gate/lab`，计划中需更新。
3. **引入 Vercel AI SDK `createUIMessageStream`** -- 用 `writer.merge()` 合并多个 `streamText` 调用，替代自定义 SSE 协议，大幅减少代码量。
4. **React Flow + dagre 自动布局确认可行** -- `@xyflow/react` v11+ 支持自定义节点、memo 优化、15-20 节点无性能问题。
5. **Vercel Fluid Compute** -- 默认启用，99.37% 请求零冷启动，Pro 计划支持 800s 超时。
6. **叙事反 AI 味策略** -- 中文 AI 写作常见的「值得注意的是」「不可或缺」等套话需在 prompt 中明确禁止。
7. **知乎战略对齐** -- 周源明确「AI+社区」方向，知乎直答已达千万级月活，千面项目完美契合「信息+信任」双载体定位。

### New Considerations Discovered
- `POST /note/add` 已废弃，替代接口为 `POST /agent_memory/ingest`（可写入结构化记忆）
- Refresh Token 不再轮换，30 天内可重复使用，简化 token 管理逻辑
- 前端并行流式渲染需用 `useRef` + `requestAnimationFrame` 缓冲模式避免高频 setState 导致的渲染风暴
- 移动端建议用可左右滑动的 Tab 模式展示叙事卡片，而非同时显示 3-5 个卡片

---

## Overview

千面是一个 A2A 原生的人生决策探索器。用户输入一个人生困惑（该不该读博？要不要出国？从大厂跳创业公司值吗？），系统立即从百万 Agent 网络中匹配 3-5 个拥有相关真实经历的 AI 分身，每个 Agent 用第一人称讲述主人走过的路。

不是给你建议，而是让你「体验」平行人生。

## Problem Statement / Motivation

### 真实痛点

1. **人生决策焦虑是普遍的、高频的** - 知乎上最热门的问题类型就是「xxx 是什么体验？」「该不该 xxx？」
2. **现有方案都有硬伤**：
   - 知乎回答：等待周期长、答主不一定回复追问、视角单一
   - 知乎 Live / 在行：贵（几百元/次）、需要预约、单一专家视角
   - 搜索引擎：给你文章不给你人，无法互动
   - GPT / Claude：给你的是 AI 编出来的「建议」，不是真实经历
3. **知乎证明了需求存在** - 「xxx 是什么体验」类问题长期霸榜，说明人们极度渴望从真实经历中获得参考

### 为什么现在能做

- Second Me 百万 Agent 网络 = 百万真人的 AI 分身，拥有主人的知识、记忆、风格
- SecondMe API 提供：软记忆（个人知识库）+ 兴趣标签 + 流式聊天
- A2A 使得一次查询可以并行调用多个 Agent

### 为什么必须是 A2A

传统搜索/推荐是「人找内容」；千面是「你的 Agent 替你找人」。
核心交互是 Agent-to-Agent：你的 Agent 代你与多个真人 Agent 对话，筛选、匹配、深入交流，最后把最有价值的视角带回给你。

### Research Insights: 知乎战略对齐

知乎创始人周源明确了「AI+社区」战略方向：
- **知乎直答**（zhida.ai）上线后月活从百万飙升至千万级，复访率超 60%
- 周源观点：「AI 时代信息获取工具会从追求效率转向与人对齐」
- 知乎定位：成为「信息+信任」双载体，AI 时代的可信信息基础设施
- 核心坚持：所有 AIGC 内容必须明确标识，绝不允许冒充真人；用 AI 赋能创作者
- 千面项目完美契合：不是让 AI 替代人回答，而是让 AI 放大真人经历的传播和连接

## Proposed Solution

### 核心体验流

```
用户输入人生困惑
    ↓
AI 分析困惑的核心维度
    ↓
在 A2A 网络中匹配 3-5 个相关 Agent
    ↓
每个 Agent 用第一人称讲述亲身经历（实时流式）
    ↓
用户可与任一 Agent 深入对话
    ↓
生成「人生路径地图」可视化报告
```

### 产品定义

#### 核心功能

1. **困惑输入** - 自然语言描述人生困惑，支持预设热门话题
2. **智能匹配** - AI 分析困惑维度，匹配拥有相关经历的 Agent
3. **平行叙事** - 3-5 个 Agent 并行讲述各自经历，实时流式展示
4. **深入对话** - 选择任一 Agent 继续追问具体细节
5. **路径地图** - 可视化展示不同人生路径的关键节点和分歧点

#### 预设场景（Demo 用）

| 场景 | 匹配维度 |
|------|----------|
| 「30 岁要不要从大厂跳去创业？」 | 创业者、留守者、创业失败者、投资人 |
| 「非 CS 专业转行做程序员现实吗？」 | 转行成功者、转行中、科班出身者、HR |
| 「要不要去日本/美国工作？」 | 在海外工作者、回国者、正在准备的人 |
| 「读研 vs 直接工作？」 | 在读研究生、工作后考研、直接工作者 |
| 「裸辞去旅行一年值得吗？」 | 已经做过的人、犹豫过但没做的人 |

#### 知乎特别奖定位

- 直接继承知乎「分享真实经验」的核心使命
- 用 AI 放大知乎最有价值的东西：真实的人生故事
- 完美契合「人类社区重新连接」主题：通过共享经历理解彼此
- 可与知乎内容生态深度打通（未来方向）

## Technical Approach

### 技术栈

| 模块 | 技术选择 | 理由 |
|------|----------|------|
| 框架 | Next.js 15+ / React 19 / TypeScript | 博弈圆桌已验证，可复用经验 |
| 样式 | Tailwind CSS v4 | 快速开发，高质量 UI |
| AI SDK | Vercel AI SDK 5+ (`ai` package) | `createUIMessageStream` + `writer.merge()` 原生支持多流合并 |
| Agent 甲方 | SecondMe Chat API (OAuth SSE) | 用户的 AI 分身 |
| Agent 匹配 | SecondMe 兴趣标签 + 软记忆 API | 基于真实数据匹配 |
| 叙事引擎 | DeepSeek / OpenAI Compatible LLM | 控制叙事结构和引导 |
| 实时通信 | Vercel AI SDK UIMessageStream (SSE) | 多 Agent 并行流式，SDK 处理协议细节 |
| 可视化 | @xyflow/react (React Flow) + dagre | 人生路径地图自动布局 |
| 部署 | Vercel (Fluid Compute) | 零冷启动，Pro 计划 800s 超时 |

### Research Insights: Vercel AI SDK 多流合并

**关键发现**：Vercel AI SDK 5+ 提供 `createUIMessageStream` + `writer.merge()` 模式，可以将多个 `streamText` 调用合并到单个 SSE 响应中。这意味着：

1. 不需要自定义 SSE 协议 -- SDK 处理 SSE 格式、keep-alive、重连
2. 可以在单个 API route 中启动 3-5 个并行 `streamText` 调用
3. 使用 `writer.write({ type: 'data-<name>', data: ... })` 发送自定义数据（如 agent 元信息、路径图数据）
4. 前端使用 `useChat` hook 或自定义 stream consumer

```typescript
// app/api/narrate/route.ts -- 推荐实现模式
import { createUIMessageStream, createUIMessageStreamResponse, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { question, perspectives } = await req.json();

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      // 发送会话元信息
      writer.write({
        type: 'data-session',
        data: { topic: question, perspectives },
      });

      // 并行启动所有叙事
      const narrativePromises = perspectives.map(async (p: any) => {
        writer.write({
          type: 'data-agent-start',
          data: { agentId: p.id, label: p.label },
        });

        const result = streamText({
          model: deepseek('deepseek-chat'),
          prompt: buildNarrativePrompt(question, p),
        });

        // 每个叙事独立合并到主流
        writer.merge(result.toUIMessageStream());

        await result.response;

        writer.write({
          type: 'data-agent-done',
          data: { agentId: p.id },
        });
      });

      await Promise.all(narrativePromises);
    },
  });

  return createUIMessageStreamResponse({ stream });
}
```

**注意**：`writer.merge()` 将多个流交织在一起，前端需要根据 data-agent-start/data-agent-done 事件区分不同 agent 的内容。如果需要更精细的控制（每个 agent 的 chunk 带 agentId），可能需要用自定义 SSE 协议替代 SDK 的标准协议。

**备选方案**：如果 SDK 的多流合并不满足需求（无法区分哪个 chunk 属于哪个 agent），回退到自定义 SSE：

```typescript
// 自定义 SSE 协议（备选）
export async function POST(req: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: SSEEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      // 并行启动叙事，每个 chunk 带 agentId
      await Promise.all(perspectives.map(async (p) => {
        send({ type: 'agent_start', data: { agentId: p.id, label: p.label } });
        for await (const chunk of streamNarrative(question, p)) {
          send({ type: 'agent_chunk', data: { agentId: p.id, content: chunk } });
        }
        send({ type: 'agent_done', data: { agentId: p.id } });
      }));

      send({ type: 'done' });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}
```

### 架构设计

```
┌─────────────────────────────────────────────┐
│                  Frontend                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ 困惑输入  │ │ 平行叙事  │ │ 路径地图可视化│ │
│  │   Page   │ │  Stream  │ │  PathMap     │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
└─────────────────┬───────────────────────────┘
                  │ SSE (UIMessageStream)
┌─────────────────▼───────────────────────────┐
│               API Routes                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ /auth/*  │ │/analyze  │ │ /narrate     │ │
│  │ OAuth    │ │维度分析   │ │ 多Agent叙事  │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│            Core Engine                        │
│  ┌──────────────────────────────────────┐    │
│  │  Dimension Analyzer                   │    │
│  │  分析困惑 → 提取维度 → 生成匹配策略  │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │  Narrative Orchestrator               │    │
│  │  编排多 Agent 并行叙事 + 引导结构     │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │  PathMap Generator                    │    │
│  │  从叙事中提取关键节点 → 生成路径图    │    │
│  └──────────────────────────────────────┘    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          External Services                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │SecondMe  │ │SecondMe  │ │  LLM API     │ │
│  │OAuth+Chat│ │Tags+Mem  │ │  (DeepSeek)  │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
└─────────────────────────────────────────────┘
```

### Research Insights: 架构改进

**简化**：移除 Agent Matcher 独立模块。确认 SecondMe API 无 Agent 发现接口后，匹配逻辑简化为 LLM 在 Dimension Analyzer 中直接生成 persona 定义，无需单独匹配步骤。

**状态管理**：推荐使用 React 19 的 `useRef` + `useState` 组合管理并行流状态：
```typescript
// 每个 agent 的叙事内容存在 ref 中，避免高频 setState
const narrativesRef = useRef<Map<string, string>>(new Map());
const [renderTick, setRenderTick] = useState(0);

// rAF 批量刷新，16ms 一次而非每个 chunk 一次
const flushRef = useRef<number>();
function onChunk(agentId: string, content: string) {
  narrativesRef.current.set(agentId, (narrativesRef.current.get(agentId) || '') + content);
  if (!flushRef.current) {
    flushRef.current = requestAnimationFrame(() => {
      setRenderTick(t => t + 1);
      flushRef.current = undefined;
    });
  }
}
```

### 关键技术细节

#### 1. 维度分析器 (Dimension Analyzer)

用户输入自然语言困惑后，LLM 分析出：
- 决策的核心维度（如：职业发展、经济风险、个人成长、家庭影响）
- 需要哪些类型的「平行人生」视角（如：已走这条路的人、没走的人、走了又回来的人）
- 每个视角的完整 persona 定义（替代原来的 matchCriteria）

```typescript
interface DimensionAnalysis {
  topic: string;           // "从大厂跳槽创业"
  dimensions: string[];    // ["职业发展", "经济风险", "个人成长"]
  perspectives: Perspective[];
}

interface Perspective {
  id: string;              // "perspective-1"
  label: string;           // "创业第3年的人"
  description: string;     // "已经从大厂离职创业，目前仍在运营"
  persona: {
    name: string;          // "张明"
    age: number;           // 31
    background: string;    // "前字节跳动高级工程师，28岁创业..."
    currentState: string;  // "创业公司B轮融资中"
    tone: string;          // "务实、略带疲惫但坚定"
  };
}
```

#### 2. 叙事编排器 (Narrative Orchestrator)

控制多 Agent 并行叙事的结构和节奏：

```typescript
interface NarrativeConfig {
  perspectives: Perspective[];
  narrativeStructure: {
    opening: string;   // "简单介绍自己的背景和当时的决定"
    turning: string;   // "讲述关键转折点和心理变化"
    current: string;   // "现在的状态和回头看的感受"
    advice: string;    // "如果重来一次，会怎么做"
  };
}
```

### Research Insights: 叙事 Prompt Engineering

**核心原则：让 AI 生成的叙事「像真人写的知乎回答」而不是「AI 生成的建议」**

**中文 AI 味黑名单**（在 prompt 中明确禁止这些词汇和模式）：
- 套话：「值得注意的是」「总而言之」「不可或缺」「综上所述」「毋庸置疑」
- 平衡式表达：「一方面...另一方面...」「虽然...但是...总的来说...」
- 过度概括：「在当今社会」「随着科技的发展」
- 缺乏细节的空话：「收获了很多」「成长了不少」「非常有意义」

**增强真实感的技巧**：
1. **具体数字**：「月薪从 35k 降到创业期的 8k」而非「收入大幅下降」
2. **时间锚点**：「2023 年 3 月的那个周五下午」而非「某一天」
3. **感官细节**：「HR 递给我离职协议时手都在抖」
4. **口语化表达**：使用「说实话」「不瞒你说」「当时真是」等自然口语
5. **不对称的情感**：真人叙事通常感受复杂矛盾，不会「一边开心一边忧愁」这种工整对仗
6. **独特的表达习惯**：每个 persona 需要有自己的语言特征（如创业者用「赛道」「PMF」「burn rate」等行话）

**推荐 prompt 模板**：

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

**few-shot 策略**：为每个预设场景准备 1 个高质量知乎真实回答作为 few-shot 示例（约 300-500 字），放在 system prompt 中作为风格参考。

**温度设置**：`temperature: 0.8`（叙事需要一定的创造性），`top_p: 0.9`。不同 persona 之间可以微调温度以增加差异化。

#### 3. SSE 多流编排

使用 Vercel AI SDK 的 `createUIMessageStream` 或自定义 SSE 协议（见上方架构部分详细代码）。

**错开启动策略**：不要同时启动所有 LLM 调用，间隔 200-500ms 启动，减少 API 并发压力并让用户看到卡片逐个激活的效果。

```typescript
// SSE 事件协议（自定义方案，如果 SDK 方案不够灵活）
type SSEEvent =
  | { type: 'session_info'; data: { topic: string; perspectives: Perspective[] } }
  | { type: 'agent_start'; data: { agentId: string; label: string; avatar: string } }
  | { type: 'agent_chunk'; data: { agentId: string; content: string } }
  | { type: 'agent_done'; data: { agentId: string; summary: string } }
  | { type: 'pathmap'; data: PathMapData }
  | { type: 'done' }
  | { type: 'error'; data: { message: string } }
```

前端同时展示 3-5 个 Agent 的叙事卡片，每个卡片独立流式更新。

#### 4. 人生路径地图

从多个 Agent 的叙事中提取关键节点，生成可视化的分叉路径图。

### Research Insights: React Flow 路径地图实现

**推荐库**：`@xyflow/react`（React Flow v11+），96 个代码示例，高声誉，benchmark score 76。

**自动布局**：使用 `dagre` 库进行树形自动布局：

```typescript
import dagre from 'dagre';

function getLayoutedElements(nodes, edges) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 120 });

  nodes.forEach((node) => g.setNode(node.id, { width: 200, height: 100 }));
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));

  dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const pos = g.node(node.id);
      return { ...node, position: { x: pos.x - 100, y: pos.y - 50 } };
    }),
    edges,
  };
}
```

**自定义节点**：每个节点显示 persona 头像、名字、关键时间点和简短描述。使用 `memo` 优化渲染：

```typescript
const PathNode = memo(({ data }: NodeProps) => (
  <div className="rounded-xl border-2 border-gray-200 bg-white p-3 shadow-sm w-48">
    <Handle type="target" position={Position.Top} />
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
      <div>
        <div className="text-sm font-medium">{data.label}</div>
        <div className="text-xs text-gray-500">{data.time}</div>
      </div>
    </div>
    <p className="mt-2 text-xs text-gray-600 line-clamp-2">{data.summary}</p>
    <Handle type="source" position={Position.Bottom} />
  </div>
));
```

**渐进显示动画**：叙事完成后，节点逐个淡入（CSS transition + setTimeout 控制顺序）。

**移动端**：React Flow 支持触控手势（缩放、拖动），但小屏幕上节点较小。建议移动端用简化的垂直时间线替代完整路径图。

### 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # SecondMe OAuth 登录/回调/登出
│   │   ├── analyze/       # 困惑维度分析
│   │   └── narrate/       # 多 Agent 叙事 SSE 流（合并 match + narrate）
│   ├── explore/
│   │   └── [id]/          # 平行叙事展示页
│   ├── chat/
│   │   └── [agentId]/     # 与单个 Agent 深入对话
│   └── page.tsx           # 首页（困惑输入）
├── components/
│   ├── QuestionInput.tsx   # 困惑输入组件
│   ├── PerspectiveCard.tsx # 单个 Agent 叙事卡片（含流式渲染 + 光标动画）
│   ├── NarrativeStream.tsx # 多 Agent 并行流式展示容器
│   ├── PathMap.tsx         # 人生路径地图可视化（@xyflow/react）
│   ├── AgentAvatar.tsx     # Agent 头像/状态
│   └── MarkdownContent.tsx # Markdown 渲染（可复用博弈圆桌）
├── lib/
│   ├── auth.ts            # SecondMe OAuth（可复用）
│   ├── secondme.ts        # SecondMe API 客户端（可复用，需更新 base URL）
│   ├── llm.ts             # LLM 客户端（可复用）
│   ├── analyzer.ts        # 维度分析引擎
│   ├── narrator.ts        # 叙事编排引擎
│   ├── pathmap.ts         # 路径图生成（LLM 从叙事提取节点）
│   └── types.ts           # TypeScript 类型定义
└── styles/
    └── globals.css
```

### Research Insights: 前端流式 UI 设计

**桌面端布局**：3 列 grid（3 个 agent）或 2+2+1 布局（5 个 agent）

```css
/* Tailwind 响应式 grid */
.narrative-grid {
  @apply grid gap-4;
  @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}
```

**移动端布局**：可左右滑动的 Tab 模式，每次只显示 1 个 agent 的叙事：
- 顶部 Tab 栏显示所有 agent 的头像和名字
- 正在流式输出的 agent Tab 上显示脉冲动画
- 已完成的 agent Tab 上显示绿色对勾

**流式渲染光标**：
```css
.streaming-cursor::after {
  content: '|';
  animation: blink 1s step-end infinite;
}
@keyframes blink {
  50% { opacity: 0; }
}
```

**叙事卡片状态机**：
- `waiting` -- 灰色骨架屏，等待流开始
- `streaming` -- 文字逐渐出现 + 光标闪烁
- `complete` -- 隐藏光标，显示「深入对话」按钮 + 高亮关键数字/时间

**Read More 模式**：叙事内容长时使用 CSS `line-clamp` 截断，点击展开：
```tsx
<div className={clsx(
  'transition-all duration-300',
  expanded ? '' : 'line-clamp-8'
)}>
  {content}
</div>
{needsClamp && (
  <button onClick={() => setExpanded(!expanded)}>
    {expanded ? '收起' : '展开全文'}
  </button>
)}
```

## Implementation Phases

### Phase 1: 基础框架 (Day 1 - 3/16)

- [ ] 初始化 Next.js 项目，复用博弈圆桌的 auth/secondme/llm 模块
- [ ] **更新 SecondMe API base URL** 为 `https://api.mindverse.com/gate/lab`
- [ ] 实现首页：困惑输入界面 + 5 个预设话题
- [ ] 实现维度分析 API（/api/analyze）-- 包含 persona 生成
- [ ] 验证 SecondMe OAuth 流程正常

**验收标准**：用户可以输入困惑，系统返回分析结果（维度 + 完整 persona 定义）

### Phase 2: 核心叙事引擎 (Day 2 - 3/17)

- [ ] 实现多 Agent 并行叙事 SSE 流（优先用 Vercel AI SDK，备选自定义 SSE）
- [ ] 实现前端叙事卡片组件（useRef + rAF 缓冲模式）
- [ ] 叙事 prompt engineering 调优（参照 Research Insights 中的模板和黑名单）
- [ ] 为 3 个预设场景准备 few-shot 示例

**验收标准**：输入困惑后，3 个 Agent 错开启动并行讲述各自经历，实时流式展示

### Phase 3: 深度对话 + 路径图 (Day 3 - 3/18)

- [ ] 实现与单个 Agent 的追问对话（复用 SecondMe Chat API 或 LLM）
- [ ] 实现人生路径地图（@xyflow/react + dagre 布局 + 自定义节点）
- [ ] 从叙事内容中用 LLM 提取关键节点生成路径图数据

**验收标准**：用户可以点击任一 Agent 深入对话；叙事完成后展示可视化路径图

### Phase 4: 体验打磨 (Day 4 - 3/19)

- [ ] UI/UX 设计优化（流式光标动画、卡片过渡、加载骨架屏）
- [ ] 移动端适配（Tab 滑动模式、简化路径图）
- [ ] Agent 头像和个性化展示（渐变色头像 + persona 信息卡）
- [ ] 错误处理（SSE 断连重试、LLM 超时 fallback）
- [ ] 预设场景的叙事质量调优（逐个场景测试，调整 prompt 和 few-shot）

**验收标准**：完整流程流畅，视觉效果专业，移动端可用

### Phase 5: 部署 + 路演准备 (Day 5 - 3/20)

- [ ] Vercel 部署（启用 Fluid Compute，确认 Pro 计划超时设置）
- [ ] 路演 PPT / Demo 视频准备
- [ ] 准备 2-3 个精心设计的 demo 场景（预热缓存，确保首次加载快速）
- [ ] 路演脚本排练（严格控制时间）

**验收标准**：线上可访问，demo 场景流畅，路演材料就绪

## Alternative Approaches Considered

### 方案 A：纯 SecondMe Agent 匹配（理想方案）

- 通过 SecondMe 平台搜索/发现有相关经历的真实 Agent
- 直接调用这些 Agent 的 Chat API 获取叙事
- 优点：完全基于真实 Agent，数据真实
- **确认不可行**：SecondMe API 文档（2026-03-12 查阅）无 Agent 发现/搜索接口

### 方案 B：LLM 模拟 + SecondMe 增强（确认采用）

- LLM 基于知乎真实经验生成不同视角的叙事
- SecondMe 的用户自身 Agent 作为「提问者」参与
- 当真实 Agent 可用时，切换为真实 Agent
- 优点：可控性强，5 天内可完成
- 风险：叙事真实度略低（通过 few-shot + prompt 黑名单缓解）

### 方案 C：预录 Agent 叙事（保底方案）

- 预先录制几个场景的 Agent 叙事内容
- 实时流式播放，模拟多 Agent 效果
- 优点：demo 效果稳定
- 风险：不够 live，评审可能质疑

**决策**：确认方案 B。方案 A 因 API 限制不可行。Phase 2 期间关注叙事质量调优。

## Acceptance Criteria

### Functional Requirements

- [ ] SecondMe OAuth 登录正常
- [ ] 用户可以输入自然语言困惑或选择预设话题
- [ ] 系统能分析困惑并生成 3-5 个视角（含完整 persona）
- [ ] 多 Agent 并行流式叙事，每个 Agent 用第一人称讲述
- [ ] 用户可以选择任一 Agent 进行追问对话
- [ ] 生成人生路径地图可视化
- [ ] 至少 3 个预设场景可完整 demo

### Non-Functional Requirements

- [ ] 首次叙事开始时间 < 3 秒（Fluid Compute 预热 + 错开启动）
- [ ] 流式渲染无明显卡顿（rAF 缓冲模式）
- [ ] 移动端可正常使用（Tab 滑动模式）
- [ ] UI 设计专业、有质感

### Quality Gates

- [ ] 叙事内容有具体细节（时间、数字、地点），不是空洞的建议
- [ ] 叙事内容不含 AI 味套话（黑名单词汇检查）
- [ ] 不同 Agent 的叙事有明显差异化（语气、用词、视角）
- [ ] 路径图能准确反映叙事中的关键分歧点

## Success Metrics

| 指标 | 目标 |
|------|------|
| 路演评委反应 | 至少 1 个「wow」时刻（平行叙事同时展开的瞬间） |
| Demo 完整性 | 3 个场景无错误完成 |
| 叙事质量 | 评审认为叙事「像真人」而不是 AI |
| 知乎特别奖匹配度 | 评审认可与知乎知识社区的结合 |
| 首屏加载 | < 2 秒到首内容 |

## Risk Analysis & Mitigation

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| SecondMe API 无 Agent 发现功能 | **已确认** | 中 | 方案 B：LLM 模拟不同视角，SecondMe 做用户认证和自身 Agent |
| 叙事质量不够真实 | 中 | 高 | 收集知乎真实回答作为 few-shot 示例 + prompt 黑名单 + temperature 0.8 |
| 多 Agent 并行流式卡顿 | 低 | 中 | 错开 200-500ms 启动 + useRef+rAF 缓冲 + React.memo |
| 5 天时间不够 | 中 | 高 | Phase 1-2 必须完成（核心功能），Phase 3-4 可简化 |
| LLM API 不稳定 | 低 | 高 | 准备 fallback LLM provider + 预录保底方案 |
| Vercel SSE 超时 | 低 | 中 | Pro 计划 800s 超时 + Fluid Compute + 叙事控制在 60s 内完成 |
| 评审质疑叙事真实性 | 中 | 高 | 强调 SecondMe Agent 背后是真人 + 演示从真实知乎回答中学习的过程 |

### Research Insights: Vercel 部署注意事项

1. **Fluid Compute 默认启用**：新项目自动开启，99.37% 请求零冷启动
2. **超时限制**：Hobby 60s，Pro 800s（Fluid Compute 下）-- 叙事流通常在 30-60s 完成，足够
3. **Edge Runtime vs Node.js**：SSE 建议用 Node.js Runtime（Edge 有 4MB 响应限制）
4. **Cold start 优化**：减少 bundle size，避免导入重型库到 API route
5. **环境变量**：SecondMe OAuth 密钥、LLM API Key 设为加密环境变量

## Pitch 策略

### 30 秒 Elevator Pitch

> 知乎上最火的问题是什么？「xxx 是什么体验？」
> 因为做人生重大决定时，我们真正需要的不是 AI 的建议，而是走过不同路的真实的人的真实经历。
> 千面让你的 Agent 在百万分身网络中找到走过不同路的人，用第一人称讲述他们的经历。
> 不是给你建议，而是让你体验平行人生。

### Demo 脚本

1. **开场** (30s)：展示产品首页，介绍概念
2. **输入困惑** (15s)：输入「30 岁从大厂跳去创业，值吗？」
3. **维度分析** (15s)：展示系统分析出的维度和视角
4. **平行叙事** (90s)：3 个 Agent 并行开始讲述 - 这是最高潮的部分
   - Agent A 创业第 3 年：「我 28 岁离开字节...」
   - Agent B 留在大厂升到总监：「我当时也想走...」
   - Agent C 创业失败回大厂：「烧光了两年积蓄...」
5. **深入对话** (30s)：和 Agent A 追问「创业最难的是什么？」
6. **路径地图** (15s)：展示可视化的人生路径分叉图
7. **收尾** (15s)：强调知乎连接 + A2A 价值

### Research Insights: Demo 策略

**Wow Moment 设计**：平行叙事同时展开的瞬间是最大视觉冲击 -- 3 个卡片几乎同时开始流式输出不同的故事，评审能直观感受到「平行宇宙」的概念。

**Demo 可靠性**：
- 为 demo 场景预生成 persona（不依赖实时 LLM 分析维度）
- 准备 fallback：如果实时 LLM 失败，有预录的叙事可以流式播放
- 首次打开时预热 Vercel 函数（demo 前 5 分钟访问一次）

**知乎特别奖定位**：
- 引用周源的话：「AI 不是要替代人，而是放大人的价值」
- 强调千面的哲学：不是 AI 给建议，而是 AI 帮你找到真人的真实经历
- 数据点：知乎直答千万月活证明了 AI+社区 的 PMF

### 评审角度准备

| 评审可能的问题 | 准备的回答 |
|---------------|-----------|
| 这些 Agent 的经历是真实的吗？ | 基于 SecondMe 真人 Agent 的知识和记忆，每个 Agent 背后都有真实的人。我们用知乎真实回答训练叙事风格，确保像真人讲述。 |
| 和知乎提问有什么区别？ | 即时、多视角并行、第一人称叙事、可追问，不需要等人来回答。周源说「从获取信息升级为连接专家」，千面就是这个方向。 |
| 和 ChatGPT 有什么区别？ | ChatGPT 给你 AI 编的建议，千面给你真人 Agent 的真实经历。我们的叙事有具体的时间、地点、金额，不是泛泛而谈。 |
| 商业模式是什么？ | 免费基础版 + 高级场景付费（深度咨询、专家连接、私密问题）|
| 怎么保证匹配质量？ | 利用 SecondMe 的兴趣标签和软记忆进行深度匹配，LLM 确保叙事质量和差异化 |
| 为什么不直接搜索知乎？ | 知乎搜索给你文章，千面给你「人」-- 可以对话、追问、获得第一人称体验 |

## References & Research

### SecondMe API（2026-03-12 验证）

- 开发者文档：https://develop-docs.second.me/zh/docs
- OAuth2 认证：https://develop-docs.second.me/zh/docs/authentication/oauth2
- API 参考：https://develop-docs.second.me/zh/docs/api-reference/secondme
- 错误码参考：https://develop-docs.second.me/zh/docs/errors
- API 变更日志：https://develop-docs.second.me/zh/docs/changelog
- GitHub：https://github.com/mindverse/Second-Me (15.3k stars)
- Skills 工具集：https://github.com/mindverse/Second-Me-Skills

### 可用 API 端点（已验证）

| API | 用途 | 备注 |
|-----|------|------|
| OAuth2 授权流程 | 用户登录 | Refresh Token 不再轮换（2026-03-11 变更） |
| GET /user/info | 获取用户基本信息 | |
| GET /user/shades | 获取兴趣标签（用于匹配） | |
| GET /user/soft-memory | 获取软记忆（用于匹配） | |
| POST /chat/stream | 流式聊天（Agent 叙事） | SSE 格式 |
| POST /act | 动作判断（可用于匹配评估） | |
| POST /agent_memory/ingest | 写入结构化记忆 | 替代已废弃的 POST /note/add |

**API Base URL**：`https://api.mindverse.com/gate/lab`（旧地址 `https://app.mindos.com/gate/lab` 不再受官方支持）

### Vercel AI SDK

- 官方文档：https://ai-sdk.dev
- `createUIMessageStream` 参考：https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data
- 流式协议：https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol
- Next.js Stream Text Cookbook：https://ai-sdk.dev/cookbook/next/stream-text

### React Flow

- 官方文档：https://reactflow.dev
- Context7 库 ID：/xyflow/xyflow
- dagre 布局示例：https://reactflow.dev/examples/layout/dagre

### 知乎战略参考

- 知乎直答产品发布：https://www.leiphone.com/category/industrynews/rHp7GuS01P1tj2Kq.html
- 周源 AI 搜索观点：http://www.news.cn/tech/20240701/ce53e28141434f1c8701383c9dac5795/c.html
- 知乎「信任生意」：https://36kr.com/p/3478010704452229

### 市场验证

- 知乎 Live：验证了付费知识咨询的 PMF
- 在行：验证了专家一对一咨询的需求（后被收购）
- 知乎「xxx 是什么体验」：持续 10+ 年的热门话题类型
- 知乎直答：千万月活，复访率超 60%
- Second Me 第一届黑客松 159 个应用中无类似产品

### 可复用的博弈圆桌代码

- `src/lib/auth.ts` - SecondMe OAuth 流程
- `src/lib/secondme.ts` - SecondMe API 客户端（需更新 base URL）
- `src/lib/llm.ts` - LLM 客户端
- `src/lib/api.ts` - 前端 HTTP/SSE 客户端
- `src/components/MarkdownContent.tsx` - Markdown 渲染
- SSE 事件协议设计模式
- Vercel serverless 适配方案
