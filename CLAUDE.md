# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Next.js dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint (--max-warnings=0)
npm test             # Vitest (run all)
npx vitest run src/lib/safety.test.ts   # Single test file
npm run seed:agents  # Inject memories into real SecondMe agents (requires .env.local)
```

## Architecture

PathSplit 是 A2A 人生决策探索器，用户输入困惑后 3 个 SecondMe Agent 并行流式讲述各自经历，最后生成平行人生证据卡。

### Data Flow

```
POST /api/explore (SSE)
  1. validateUserInput()     — 拦截高风险话题
  2. analyzeDilemma()        — 检测场景 + 选 3 个 agent
  3. Promise.allSettled()    — 并行流式叙事（per-agent try/catch）
  4. generateEvidenceCard()  — 从叙事提取数字/时间/「如果重来」
  5. type: 'done'            — 关闭流
```

### SSE Protocol

自定义 JSON SSE，不用 Vercel AI SDK。每个 chunk 带 `agentId`：

```typescript
type SSEEvent =
  | { type: 'session'; data: { topic, dimensions, rationale, agents } }
  | { type: 'agent_start'; data: { agentId, label } }
  | { type: 'agent_chunk'; data: { agentId, content } }
  | { type: 'agent_done'; data: { agentId } }
  | { type: 'agent_error'; data: { agentId, message } }  // 单个失败不影响其他
  | { type: 'evidence_card'; data: EvidenceCard }
  | { type: 'done' }
  | { type: 'error'; data: { message } }
```

### Mock vs Real Agent

`AgentMeta.memoryMode` 决定数据来源：

- `mock`：`demo-data.ts` 的硬编码叙事，按句子分 chunk + 人工延迟
- `secondme`：真实 SecondMe Chat/Stream API，经 `agent_memory/ingest` 注入记忆

Real agent token 来源（优先级）：
1. 环境变量 `SECONDME_AGENT_*_REFRESH_TOKEN`
2. `.pathsplit-agent-slots.local.json`（通过 `/api/auth/agent-slots` POST 创建）

### Key Modules

| 模块 | 职责 |
|------|------|
| `lib/analyzer.ts` | 困惑分析 + agent 选择（当前硬编码创业场景） |
| `lib/narrative-prompts.ts` | 叙事 system prompt（persona + AI 味黑名单 + few-shot） |
| `lib/safety.ts` | 输入校验 + XML 包裹 + 错误 redaction |
| `lib/evidence.ts` | 证据卡生成（正则提取数字/时间/「如果重来」） |
| `lib/real-agents.ts` | SecondMe agent slot 管理 + token 刷新 + 流式调用 |
| `lib/secondme.ts` | SecondMe OAuth + Chat/Stream + memory ingest 底层客户端 |
| `lib/auth.ts` | Session cookie 序列化 + token 自动刷新 |
| `lib/demo-data.ts` | Mock 叙事内容 + follow-up 模式匹配回复 |

### 3 Core Personas

- `founder-still-running`（张明 31）-- 创业第三年，月收入 90 万但现金流紧张
- `stayed-in-big-tech`（李岚 33）-- 留在阿里升总监，考虑过走但没走
- `failed-and-returned`（周舟 32）-- 创业失败回大厂，现负责内部孵化

## Conventions

- PMF 聚焦「大厂跳创业」单一场景，其他预设话题标记 `stage: 'later'`
- 叙事 prompt 禁止 AI 味套话（「值得注意的是」「总而言之」「一方面...另一方面」）
- 所有面向用户的错误经过 `redactErrorMessage()` 处理
- 所有 AI 生成内容展示 `SafetyLabel` 标识
- SSE headers 必须包含 `X-Accel-Buffering: no`
- SecondMe API Base: `https://api.mindverse.com/gate/lab`
- Refresh Token 30 天内不轮换；Access Token 2 小时过期，距过期 1 分钟自动刷新

## Environment

复制 `.env.local.example` 为 `.env.local`。最小可运行配置只需 mock 模式（无需任何 key）。接真实 SecondMe 需要 `SECONDME_CLIENT_ID` + `SECONDME_CLIENT_SECRET`。
