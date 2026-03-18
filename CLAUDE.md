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

## Tech Stack

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + TypeScript strict mode + Vitest。路径别名 `@/*` 映射到 `./src/*`。无 ORM、无数据库 -- 所有状态存 cookie 或环境变量。

## Architecture

PathSplit 是 A2A 人生决策探索器，用户输入困惑后 3 个 SecondMe Agent 并行流式讲述各自经历，最后生成平行人生证据卡。

单页应用：`page.tsx` 渲染 `PathSplitExperience`（客户端组件），管理整个用户旅程的状态。

### Data Flow

```
POST /api/explore (SSE)
  1. validateUserInput()     — 拦截高风险话题
  2. analyzeDilemma()        — 检测场景 + 选 3 个 agent
  3. Promise.allSettled()    — 并行流式叙事（per-agent try/catch）
  4. generateEvidenceCard()  — 从叙事提取数字/时间/「如果重来」
  5. type: 'done'            — 关闭流
```

### API Routes

| 路由 | 方法 | 作用 |
|------|------|------|
| `/api/explore` | POST | 主流程 SSE 流：分析 -> 并行叙事 -> 证据卡 |
| `/api/chat/[agentId]` | POST | 对某个 persona 追问（mock 或 real），`?stream=1` 走 SSE |
| `/api/chat/live` | POST | 用户自己的 SecondMe 分身追问（需 OAuth session） |
| `/api/auth/login` | GET | 发起 SecondMe OAuth，写 state + context cookie |
| `/api/auth/callback` | GET | OAuth 回调，code 换 token，写 session cookie |
| `/api/auth/session` | GET | 返回当前 session 状态（available/connected/scope） |
| `/api/auth/logout` | GET/POST | 清除 session cookie |
| `/api/auth/agent-slots` | GET/POST | 查看/绑定 real agent slot（仅本地开发） |

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

追问流 (`/api/chat/[agentId]?stream=1`) 用独立的 `FollowupStreamEvent` 类型（meta -> chunk* -> done）。

### OAuth Flow

```
用户点击「连接 SecondMe」
  -> GET /api/auth/login?source=evidence-card
  -> 302 到 SecondMe 授权页（带 state + context cookie）
  -> 用户同意
  -> GET /api/auth/callback?code=...&state=...
  -> exchangeSecondMeCode() 换 token
  -> 写 session cookie，302 回首页 ?auth=connected&auth_source=...
  -> 前端读 URL param 显示 authNotice，然后 replaceState 清理 URL
```

Session 存在 `pathsplit_secondme_session` httpOnly cookie 里。`ensureFreshSecondMeSession()` 在每次 API 调用前检查过期，距过期 1 分钟自动用 refresh token 刷新。

### Mock vs Real Agent

`AgentMeta.memoryMode` 决定数据来源：

- `mock`：`demo-data.ts` 的硬编码叙事，按句子分 chunk + 人工延迟
- `secondme`：真实 SecondMe Chat/Stream API，经 `agent_memory/ingest` 注入记忆

Real agent token 来源（优先级）：
1. 环境变量 `SECONDME_AGENT_*_REFRESH_TOKEN`
2. `.pathsplit-agent-slots.local.json`（通过 `/api/auth/agent-slots` POST 创建）

运行时通过 `hasConfiguredRealAgent(agentId)` 判断走 mock 还是 real 路径，两条路径最终都产出同样的 SSE chunk 序列。

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
| `lib/constants.ts` | 全局文案、预设话题、agent 定义、维度列表 |
| `lib/types.ts` | 所有共享 TypeScript 类型（SSEEvent、AgentMeta、EvidenceCard 等） |

### 3 Core Personas

- `founder-still-running`（张明 31）-- 创业第三年，月收入 90 万但现金流紧张
- `stayed-in-big-tech`（李岚 33）-- 留在阿里升总监，考虑过走但没走
- `failed-and-returned`（周舟 32）-- 创业失败回大厂，现负责内部孵化

### Client-Side State Machine

`PathSplitExperience` 是唯一的顶层客户端组件，管理整个页面生命周期：

```
[首页/输入] -> onSubmit() -> [SSE 消费] -> [叙事卡片流式渲染]
  -> [证据卡生成] -> [OAuthConversionPanel: 引导连接 SecondMe]
  -> [OAuth 回调后] -> [LiveModePanel: 用户自己的分身追问]
```

SSE 事件通过 `startTransition()` 批量更新 `cards: AgentCardState[]` 数组，每张卡独立追踪 `waiting | streaming | done | error` 状态。

## Conventions

- PMF 聚焦「大厂跳创业」单一场景，其他预设话题标记 `stage: 'later'`
- 叙事 prompt 禁止 AI 味套话（「值得注意的是」「总而言之」「一方面...另一方面」）
- 所有面向用户的错误经过 `redactErrorMessage()` 处理
- 所有 AI 生成内容展示 `SafetyLabel` 标识
- SSE headers 必须包含 `X-Accel-Buffering: no`
- SSE 写入使用 `queue = queue.then(...)` 串行化，避免 chunk 乱序
- SecondMe API Base: `https://api.mindverse.com/gate/lab`
- Refresh Token 30 天内不轮换；Access Token 2 小时过期，距过期 1 分钟自动刷新
- Tailwind v4：不用 `tailwind.config.js`，配置写在 `globals.css` 的 `@theme` 块里
- 所有 API route 设置 `export const runtime = 'nodejs'`，explore 路由额外设置 `maxDuration = 180`

## Environment

复制 `.env.local.example` 为 `.env.local`。最小可运行配置只需 mock 模式（无需任何 key）。接真实 SecondMe 需要 `SECONDME_CLIENT_ID` + `SECONDME_CLIENT_SECRET`。

调试用环境变量：
- `PATHSPLIT_STREAM_DELAY_MS` -- mock 流式延迟（默认 220ms）
- `PATHSPLIT_AGENT_STAGGER_MS` -- agent 间启动间隔（默认 260ms）
- `PATHSPLIT_FAIL_AGENT_ID` -- 注入某个 agent 的故障（测试错误隔离）
- `SECONDME_FOLLOWUP_MODEL` -- 追问用的 LLM model（默认 `google_ai_studio/gemini-2.0-flash`）
