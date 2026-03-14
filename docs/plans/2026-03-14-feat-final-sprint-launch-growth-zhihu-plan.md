---
title: "Hackathon Final Sprint - Launch, Growth, and Zhihu Special Readiness"
type: feat
status: active
date: 2026-03-14
hackathon: 知乎 x Second Me 全球 A2A 黑客松
brand: PathSplit
---

# Hackathon Final Sprint - Launch, Growth, and Zhihu Special Readiness

## Overview

PathSplit 当前已经具备核心体验：混合真实/模拟 Agent、SSE 并行叙事、证据卡、真人 SecondMe OAuth 链路。但 2026 年 3 月 14 日更新后的官方手册改变了冲刺优先级:

- 决赛入围与总评分都强依赖 `OAuth 授权登录数`
- 参评项目必须提供可访问的线上 Demo
- 知乎特别奖是独立奖池，可与主赛道累加
- Portal 项目页需要正确填写 `Client ID` 才能被统计

因此，现阶段的目标不再是单纯“把 UI 做漂亮”，而是把项目升级为一个能公开访问、能转化登录、能稳定演示、能清晰讲述知乎特别奖价值的参赛产品。

## Research Summary

### Official Rules That Change Priorities

- 主赛道总分由 `评委评分 50% + OAuth 用户数 50%` 构成；评委内部权重为 `A2A 场景价值 40% / 创新度 30% / 完成度 30%`
- 决赛 15 支队伍组成方式为:
  - 前 10 名按 OAuth 授权登录数排名
  - 知乎特别奖申报项目中再取前 5，若重复则顺延
- 知乎特别奖采用独立规则: `评委 70% / 用户数 30%`
- 参与评奖必须有可访问的线上 Demo，仅代码仓库不参与评审
- 官方项目页说明补充了一个关键实现约束: 需在项目中填写 `Client ID` 才能统计用户数

### External Platform Constraints

- SecondMe 官方文档当前未发现 OAuth 或 Chat API 弃用提示；OAuth2 仍以标准 `client_id + redirect_uri + state + code` 流程工作
- Next.js 官方环境变量文档强调:
  - 服务器侧 secret 不应暴露到 `NEXT_PUBLIC_*`
  - 环境变量变更后需要重新部署才能在构建产物中生效
- Vercel 官方文档确认:
  - Route Handlers 可以通过 `export const maxDuration = ...` 配置函数时长
  - 流式响应是推荐模式
  - 自定义域名和生产域适合稳定公开演示
  - 预览部署可能受到 Deployment Protection 影响，不适合作为“评委一定可访问”的最终链接

### Local Repo Findings

- 当前产品主链路已经具备冲刺基础:
  - 探索流: `src/app/api/explore/route.ts:41`
  - OAuth 回调: `src/app/api/auth/callback/route.ts:10`
  - Redirect URI 解析: `src/lib/auth.ts:68`
  - 首页体验编排: `src/components/PathSplitExperience.tsx:156`
  - 真人链路与 slot 面板: `src/components/LiveModePanel.tsx:41`
- `CLAUDE.md:77` 已明确 PMF 聚焦「大厂跳创业」，这与需要更强 A2A 场景价值的评审方向一致
- 仓库中无 `docs/brainstorms/` 和 `docs/solutions/` 可复用历史资料，因此本计划直接以现有实现与最新赛制为输入

## Problem Statement

当前的 UI polish 计划对“视觉完成度”投入过多，对“公开上线与真实用户转化”投入过少。按最新赛制，这会带来四个直接风险:

1. 页面再精致，如果没有公开可访问的稳定链接，就无法参评
2. 如果 OAuth 登录不在公网域名上稳定工作，就无法积累用户数
3. 如果项目页未配置 `Client ID`，用户数可能无法被统计
4. 如果 PathSplit 没有清晰包装成“知乎式真实经验连接”，知乎特别奖竞争力会弱

## Proposed Solution

将冲刺目标改为四条并行但有先后关系的主线:

1. **Public Launch**: 用生产域名交付一个公开可访问的 Demo，而不是依赖受保护的 preview URL
2. **OAuth Growth Loop**: 设计一条不破坏首次体验、但明确推动 SecondMe 登录的软转化链路
3. **Judge Narrative**: 把 “1 真实 Agent + 2 mock Agent + 证据卡 + 真人自问” 编排成清晰的 2 分钟评审叙事
4. **Zhihu Special Packaging**: 明确项目与知乎主题“人类社区重新定义连接”的关系，并补齐提交物与传播素材

## User Flow Overview

```mermaid
flowchart TD
  A[访客打开公开 Demo URL] --> B[看到大厂跳创业价值主张]
  B --> C[直接输入问题并开始探索]
  C --> D[/api/explore SSE 返回 3 条人生线]
  D --> E[生成证据卡]
  E --> F{是否已连接 SecondMe}
  F -- 否 --> G[展示软转化 CTA: 连接 SecondMe 解锁真人追问]
  F -- 是 --> H[展示 LiveModePanel 与真人链路]
  G --> I[/api/auth/login -> /api/auth/callback]
  I --> J[OAuth 会话写入 cookie]
  J --> H
  H --> K[体验真人自问或真实 slot 追问]
  K --> L[用户分享项目 / 团队引导登录 / Portal 统计用户]
```

## Flow Permutations Matrix

| Flow | 用户状态 | 目标 | 风险 | 默认策略 |
|------|----------|------|------|----------|
| Judge demo | 未登录 | 2 分钟内看到价值与真实能力 | 卡在登录前、加载慢、UI 不聚焦 | 允许先 explore，OAuth 作为第二段高潮 |
| Public visitor growth | 未登录 | 完成一次探索后被引导登录 | 只看 demo 不登录 | 结果后插入明确 CTA 和价值说明 |
| Real user repeat visit | 已登录 | 继续体验真人分身 / 追问 | token 过期、回调失效 | `ensureFreshSecondMeSession()` 自动刷新 |
| Mixed-mode runtime | 1 个真实 slot + 2 个 mock | 诚实展示系统能力 | 被误解为全是真人 | 清晰标注 `SecondMe Live` / `demo` |
| Submission review | Portal / judges | 用户数被正确统计 | 忘记填 `Client ID` 或填错域名 | 提交前做显式 checklist |

## Technical Approach

### Architecture

保持当前技术主干不变:

- 自定义 SSE 协议继续保留，避免 `writer.merge()` 类归属问题
- 真实/模拟混合模式继续保留，确保只有 1 个真实账号也可完整演示
- OAuth 会话继续存储在 httpOnly cookie 中

新增的不是复杂架构，而是“产品化闭环”:

- 稳定公网 URL
- 登录转化设计
- 评委路径编排
- 提交物与传播物打包

### Implementation Phases

#### Phase 1: Public Launch Foundation

**Goal**: 让评委和外部用户能稳定访问 PathSplit，并让 OAuth 计数路径成立。

**Tasks**

- [ ] 创建 Vercel 项目并以生产域名部署，不把最终演示建立在 preview URL 上
  - 文件影响: `next.config.ts`, Vercel 项目设置, 域名设置
- [ ] 配置生产环境变量，并确认环境变量更新后重新部署
  - 文件影响: `.env.local.example`, Vercel Environment Variables
- [ ] 在 SecondMe 开发者后台新增/更新生产 `Redirect URI`
  - 目标值: `https://<public-domain>/api/auth/callback`
- [ ] 验证生产环境 cookie、OAuth state、回调流程不依赖 localhost 例外逻辑
  - 重点文件: `src/app/api/auth/callback/route.ts:16`, `src/lib/auth.ts:25`, `src/lib/auth.ts:68`
- [ ] 在官方项目页 / Portal 填写正确的 `Client ID` 和公开 Demo URL，确保用户数可被统计

**Success Criteria**

- 公开 URL 在无登录、无 Vercel 账号前提下可访问
- `GET /api/auth/session` 在生产域可正常返回状态
- 用户从 `/api/auth/login` 到 `/api/auth/callback` 完整成功一次
- Portal 已填入 `Client ID`，并由团队二次核验

#### Phase 2: OAuth Growth Loop

**Goal**: 不牺牲首屏体验的前提下，提升 OAuth 登录转化。

**Key Decision**

不做“未登录就不能 explore”的硬门槛。理由:

- 这会伤害评委首次体验
- 当前产品的 wow moment 在并行叙事与证据卡，不在登录页
- 手册强调“真实连接”，但没有要求先登录后体验

**Tasks**

- [x] 在首屏 Hero 和输入区明确加入“连接 SecondMe 计入真人网络 / 解锁真人追问”的价值提示
  - 文件候选: `src/components/PathSplitExperience.tsx:319`, `src/components/QuestionInput.tsx`
- [x] 在首次证据卡出现后插入二次转化 CTA
  - 文件候选: `src/components/PathSplitExperience.tsx`, `src/components/EvidenceCard.tsx`
- [x] 把 `LiveModePanel` 从“技术说明区”压缩成“真实能力区”
  - 文件候选: `src/components/LiveModePanel.tsx:147`
- [x] 明确标注 mixed mode:
  - 至少 1 张卡显示 `SecondMe Live`
  - 其余 2 张卡显示 `demo` / `记忆样本`
- [ ] 给团队准备固定传播文案与分享动作:
  - 发给朋友/同事的 1 句话介绍
  - 社群/朋友圈短链或二维码

**Success Criteria**

- 首屏 5 秒内能理解产品是什么
- 未登录用户可完成一次 explore
- 结果页至少出现一次明确登录 CTA
- 已登录用户能看到真人链路与 slot 状态

#### Phase 3: Demo-Ready UI Polish

**Goal**: 只做会直接影响评委感知的高 ROI polish，不继续打磨低收益视觉细节。

**Keep**

- [x] 自动滚动到结果区与证据卡
  - 参考现有 UI 计划: `docs/plans/2026-03-14-feat-ui-polish-demo-ready-plan.md:367`
- [ ] 证据卡视觉高潮与 Agent 主题色区分
  - 参考现有 UI 计划: `docs/plans/2026-03-14-feat-ui-polish-demo-ready-plan.md:403`
- [x] 加载态、按钮态、追问态文案统一为中文
  - 参考现有 UI 计划: `docs/plans/2026-03-14-feat-ui-polish-demo-ready-plan.md:497`
- [ ] 卡片入场与完成态动效
  - 参考现有 UI 计划: `docs/plans/2026-03-14-feat-ui-polish-demo-ready-plan.md:188`

**Cut or Defer**

- [ ] `radius / tracking / shadow` 的全面规范化降级为“有时间再做”
- [ ] 不再把 DOM 顺序改造当作核心工作
- [ ] 不再为纯审美一致性引入大范围 CSS 重构

**Success Criteria**

- 评委路径 `输入 -> 叙事 -> 证据卡 -> 追问` 连续顺滑
- 无视觉断裂、无明显 console error
- Mixed mode 的真实能力被一眼看见

#### Phase 4: Zhihu Special Packaging and Submission

**Goal**: 把项目包装成一个“知乎语境下真实经验连接”的参赛作品，而不只是一个多 Agent demo。

**Tasks**

- [ ] 明确 PathSplit 的知乎特别奖定位文案:
  - “把‘xxx 是什么体验’从被动搜索，升级为 Agent 代你向走过不同路的人提问”
- [ ] 准备项目提交页素材:
  - 一句话简介
  - 三张截图
  - 30-60 秒演示视频或 GIF
  - Demo URL
  - Client ID
- [ ] 准备知乎特别奖申报口径:
  - 为什么它符合“人类社区重新定义连接”
  - 为什么它体现知乎式真实经验语境
- [ ] 准备知乎传播动作:
  - 带话题 `#A2AforReconnect`
  - 发布想法 / demo 截图
  - 争取点赞与自然扩散

**Success Criteria**

- 提交文案与评委口径一致
- Portal 信息完整，无遗漏字段
- 至少有一条公开传播素材上线

## Alternative Approaches Considered

### 1. Continue the UI-only polish plan

Rejected because updated rules make “公开上线 + OAuth 计数”比“再抠一轮设计令牌”更重要。

### 2. Hard-gate exploration behind OAuth login

Rejected because it increases early drop-off, harms first demo impression, and hides the core wow moment behind an auth wall。

### 3. Use preview deployment as the final demo link

Rejected because Vercel preview protection can block public access or create friction. Final judge link should be a public production URL.

## System-Wide Impact

### Interaction Graph

- 首页渲染触发 `loadSession()`，读取 `/api/auth/session`
- 用户提交问题后进入 `/api/explore`，走 `validateUserInput()` -> `analyzeDilemma()` -> `Promise.allSettled()` -> `generateEvidenceCard()`
- 用户点击 OAuth CTA 进入 `/api/auth/login`，再回到 `/api/auth/callback`
- 回调成功后通过 `writeSecondMeSession()` 写 cookie，随后 `LiveModePanel` 刷新 slot 状态并开放真人交互

### Error & Failure Propagation

- OAuth:
  - `redirect_uri` 不匹配 -> `/api/auth/callback` 失败 -> 页面回到 `auth=failed-exchange`
  - production 上不允许依赖 localhost state bypass
- SSE:
  - 单个 agent 失败 -> `agent_error`，不应打断全局结果
- 真人链路:
  - token 过期 -> `ensureFreshSecondMeSession()` 尝试 refresh
  - refresh 失败 -> session 清空，UI 回退为未连接

### State Lifecycle Risks

- 生产环境变量变更但未 redeploy，会导致 OAuth 或 API base 仍使用旧值
- Portal 没填 `Client ID`，即使有真实登录也可能不被统计
- preview URL / protected URL 被传播出去，会让外部用户无法进入
- 如果对 mixed mode 标注不清，评委可能误解真实能力边界

### API Surface Parity

以下接口与组件必须统一考虑:

- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/callback/route.ts`
- `src/app/api/auth/session/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/explore/route.ts`
- `src/app/api/chat/live/route.ts`
- `src/app/api/chat/[agentId]/route.ts`
- `src/components/PathSplitExperience.tsx`
- `src/components/LiveModePanel.tsx`

### Integration Test Scenarios

1. **Anonymous judge flow**
   - 打开公开 URL
   - 不登录
   - 完成一次 explore
   - 看见 1 张真实标识卡或明确的真实能力区
2. **Production OAuth flow**
   - 点击连接
   - 在生产域完成授权
   - 回跳后 session 正常
3. **Mixed-mode narrative**
   - 1 个真实 slot + 2 个 mock
   - `/api/explore` 返回完整叙事与证据卡
4. **Expired token refresh**
   - 先有 session，再触发真人追问
   - token 自动刷新，用户无感
5. **Deployment accessibility**
   - 新用户在无 Vercel 账号、无内部权限前提下访问成功

## Acceptance Criteria

### Functional Requirements

- [ ] PathSplit 有一个公开 HTTPS URL，可直接给评委和外部用户访问
- [ ] 生产域名上的 SecondMe OAuth 完整可用
- [ ] Portal 项目页已填完整的 Demo URL 与 `Client ID`
- [x] 首页允许用户先 explore，再通过 CTA 转化为 OAuth 登录
- [x] Mixed mode 被诚实展示: 至少 1 条真实 Agent 路径 + 明确 demo 标识
- [ ] Demo 路径可在 2 分钟内完整演示

### Non-Functional Requirements

- [x] `npm run build` 通过
- [x] `npm run lint` 通过
- [x] `npm test` 通过
- [x] 核心 demo 路径浏览器 console error = 0
- [x] 探索流保持 `maxDuration = 180` 与 `X-Accel-Buffering: no`
- [x] 追问链路有明确 loading / streaming 反馈，即使首 token 慢于 5 秒也不显得卡死

### Quality Gates

- [ ] 在本地和公网各完成一次完整浏览器 smoke test
- [ ] 团队内部至少 1 人从外部网络验证 URL、OAuth、证据卡
- [ ] 提交前完成“Demo URL / Client ID / Zhihu特别奖口径 / 截图素材”四项 checklist

## Success Metrics

- **Baseline**: 2026 年 3 月 16 日前拿到稳定公开链接并完成生产 OAuth
- **Baseline**: 提交截止前至少积累 30 个真实 OAuth 登录
- **Stretch**: 冲击首个 `100 用户` 里程碑奖励
- **Demo**: 评委能在单次演示中同时看到 A2A 叙事、证据卡、真人链路
- **Packaging**: 完成知乎特别奖申报，并至少发布 1 条带 `#A2AforReconnect` 的公开内容

## Dependencies & Risks

### Dependencies

- Vercel 项目与域名配置权限
- SecondMe Developer Console 权限
- 官方 Portal 提交权限
- 至少 1 个真实可演示 SecondMe 账号

### Risks

- **Preview protection / domain mismatch**
  - 影响: 外部无法访问，或 OAuth redirect 失效
  - 缓解: 用生产域名，不用受保护 preview 作为最终入口
- **SecondMe 上游延迟**
  - 影响: 真人追问首 token 慢
  - 缓解: 保持流式反馈，把真人链路放在 demo 第二高潮，不作为开场第一击
- **用户数增长不足**
  - 影响: 决赛入围概率下降
  - 缓解: 先部署再传播，明确 CTA，准备社群扩散素材
- **评委误解 mixed mode**
  - 影响: 质疑真实性
  - 缓解: 明确标识哪些是 `SecondMe Live`，哪些是 demo 记忆样本

## Documentation Plan

- [x] 保留当前 `docs/plans/2026-03-14-feat-ui-polish-demo-ready-plan.md` 作为子计划
- [x] 在该 UI 计划顶部补一行“已被 final sprint plan 重排优先级”
- [ ] 在 README 或提交素材中补充生产域名、Client ID、OAuth 配置说明

## Recommended Execution Order

1. 先完成生产部署和 OAuth 回调
2. 再完成 Portal 填报与 `Client ID` 统计确认
3. 然后补转化链路和 demo 编排
4. 最后做高 ROI UI polish 与提报素材

## Sources & References

### Internal References

- `CLAUDE.md:18` - 当前架构与数据流
- `CLAUDE.md:77` - PMF 聚焦与安全/流式约束
- `src/app/api/explore/route.ts:41` - 探索流主入口与 SSE 约束
- `src/app/api/auth/callback/route.ts:10` - OAuth 回调实现
- `src/lib/auth.ts:68` - Redirect URI 与 session/cookie 逻辑
- `src/components/PathSplitExperience.tsx:156` - 首页编排与提交流程
- `src/components/LiveModePanel.tsx:147` - 真人链路与 slot 配置 UI
- `docs/plans/2026-03-14-feat-ui-polish-demo-ready-plan.md` - 可复用的高 ROI UI polish 子任务

### External References

- 飞书手册: https://mindverse.feishu.cn/wiki/MNt9wFCVCiSCkTk5NsPciabHnph
- Hackathon Portal / 项目页说明: https://hackathon.second.me/
- SecondMe Quickstart: https://develop-docs.second.me/en/docs
- SecondMe OAuth2 Guide: https://develop-docs.second.me/zh/docs/authentication/oauth2
- Vercel Functions Duration: https://vercel.com/docs/functions/configuring-functions/duration
- Vercel Streaming: https://vercel.com/docs/functions/streaming-functions
- Vercel Domains: https://vercel.com/docs/domains/working-with-domains
- Vercel Deployment Protection: https://vercel.com/changelog/enhanced-security-controls-with-deployment-protection
- Next.js Environment Variables: https://nextjs.org/docs/app/guides/environment-variables
- Community reference project: https://hackathon.second.me/zh/projects/medcrowd

### Research Notes

- 本次规划未找到可复用的 `docs/brainstorms/` 或 `docs/solutions/`
- 在官方文档范围内，本次未发现 SecondMe OAuth / Chat API 的弃用公告
