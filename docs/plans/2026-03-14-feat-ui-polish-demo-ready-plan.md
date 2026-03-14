---
title: "UI 全面打磨 - Demo Ready"
type: feat
date: 2026-03-14
---

# UI 全面打磨 - Demo Ready

> 2026-03-14 更新：该计划已被 `docs/plans/2026-03-14-feat-final-sprint-launch-growth-zhihu-plan.md` 重排优先级。当前仅执行直接影响公开 Demo、OAuth 转化和评委叙事的高 ROI 项目。

## Overview

将 PathSplit 从功能完备的原型提升为视觉专业的 demo 产品。聚焦动效编排、排版修正、视觉层级、交互反馈四个维度，让评委在 2 分钟 demo 内被产品质感打动。

## Problem Statement

当前 UI 功能齐全但视觉粗糙：border-radius 有 7+ 种任意值、letter-spacing 有 9 种变体、中文行高偏窄（1.5 vs 推荐 1.8）、卡片出场无动效、流式渲染与完成态无过渡、加载按钮到首张卡片出现之间无视觉反馈、中英文加载状态语言不统一。这些细节叠加起来让产品看起来像原型而非成品。

## Scope

### In

- 设计令牌统一（border-radius、letter-spacing、shadow）
- 页面级动效编排（卡片入场、证据卡出现）
- 流式渲染体验优化（暖色骨架屏 -> 文字过渡、完成态信号）
- 中文排版修正（行高、字间距）
- 交互微反馈（卡片 hover、输入框 focus、按钮状态）
- 证据卡视觉升级
- 信息层级调整（LiveModePanel 位置）
- 自动滚动到结果区
- 中英文 UI 文案统一

### Out

- 暗色模式
- 移动端适配优化
- 新功能开发
- 字体文件引入（保持系统字体栈）
- 响应式断点补充

## Risk

| 风险 | 影响 | 缓解 |
|------|------|------|
| CSS 动效改动导致流式渲染性能回退 | 中 | 主要动画 transform/opacity；完成脉冲用 border-color（paint-only，单元素可接受） |
| Tailwind v4 arbitrary value 清理引入样式回归 | 中 | 每个组件改完后浏览器验证 |
| LiveModePanel 位置移动影响现有 OAuth 流程 | 低 | 仅移动 DOM 顺序，不改功能逻辑 |

## Compatibility

- 所有改动仅涉及 CSS/组件 JSX，不触碰 API 路由和业务逻辑
- 保持现有 Tailwind v4 + PostCSS 配置不变
- 证据卡 Agent 主题色通过 `agentId` 查找 `STARTUP_AGENTS` 常量获取（无需改数据模型）

---

## Task List

### Phase 1: 设计令牌统一

**目标**：消除视觉噪音，建立一致性基础

#### Task 1.1: 统一 border-radius 为 3 级

**描述**：当前有 7+ 种 `rounded-[Xrem]` 值，收敛为 3 级令牌。

**文件**：`src/app/globals.css`, 所有 `src/components/*.tsx`

**方案**：
```css
/* globals.css 新增 */
:root {
  --radius-sm: 1rem;    /* 内嵌元素：textarea、slot item */
  --radius-md: 1.5rem;  /* 卡片内容区、follow-up 区 */
  --radius-lg: 2rem;    /* 顶层 panel、card 外壳 */
  --radius-full: 9999px; /* pill 按钮、badge */
}
```

替换映射：
| 原值 | 新令牌 | 对应组件 |
|------|--------|----------|
| `rounded-[1rem]`, `rounded-[1.2rem]`, `rounded-[1.4rem]` | `rounded-[var(--radius-sm)]` | follow-up textarea, slot items, LiveModePanel textarea |
| `rounded-[1.5rem]`, `rounded-[1.6rem]`, `rounded-[1.8rem]` | `rounded-[var(--radius-md)]` | evidence paths, inner containers, hero stats, QuestionInput textarea |
| `rounded-[2rem]` | 保持（已在 CSS class `.pathsplit-panel/.pathsplit-card` 中定义） | 外层卡片 |
| `rounded-full` | 保持 | pill 按钮、badge |

**验收**：全站只剩 4 种 radius 值

#### Task 1.2: 收敛 letter-spacing 为 3 级

**描述**：当前 9 种 tracking 值（0.18em ~ 0.34em），收敛为 3 级。

**文件**：所有 `src/components/*.tsx`

**方案**：
```
tracking-wide   = tracking-[0.2em]   -- 小标签、metadata
tracking-wider  = tracking-[0.28em]  -- section header
tracking-widest = tracking-[0.34em]  -- hero badge
```

替换映射：
| 原值 | 新值 |
|------|------|
| `tracking-[0.18em]`, `tracking-[0.2em]`, `tracking-[0.22em]` | `tracking-[0.2em]` |
| `tracking-[0.24em]`, `tracking-[0.26em]`, `tracking-[0.28em]` | `tracking-[0.28em]` |
| `tracking-[0.3em]`, `tracking-[0.32em]`, `tracking-[0.34em]` | `tracking-[0.34em]` |

**验收**：全站 tracking 值只剩 3 种

#### Task 1.3: 统一 shadow 体系

**描述**：当前 shadow 值不一致（AgentAvatar 用深影、card 用浅影、stats 无影）。

**文件**：`src/app/globals.css`, 相关组件

**方案**：
```css
:root {
  --shadow-card: 0 25px 60px rgba(15, 23, 42, 0.08);
  --shadow-card-hover: 0 30px 70px rgba(15, 23, 42, 0.12);
  --shadow-avatar: 0 8px 24px rgba(15, 23, 42, 0.18);
}
```

**验收**：shadow 值只从 CSS 变量引用

#### Task 1.4: 清理未使用 CSS 变量

**描述**：`--paper-strong`、`--muted`、`--accent-soft` 声明但未使用。

**文件**：`src/app/globals.css`

**方案**：
- `--paper-strong` 保留，骨架屏会用到
- `--muted` 删除（组件用 Tailwind `text-stone-500`）
- `--accent-soft` 保留，输入框 focus glow 和完成脉冲会用到

**验收**：无 dead CSS 变量

---

### Phase 2: 中文排版修正

**目标**：让叙事文本读起来舒服

#### Task 2.1: 中文正文行高调至 1.8

**描述**：当前叙事卡片 `leading-8`（2rem / 16px base = 约 2.0）还行，但 `text-base leading-8` 对于 16px 字号来说是 2.0。follow-up 回复用 `text-sm leading-7`（14px / 28px = 2.0）。主要问题在 hero description `text-lg leading-8`（18px / 32px = 1.78）这个偏窄；以及 LiveModePanel 的 `text-base leading-7`（16px / 28px = 1.75）偏窄。

**文件**：`PathSplitExperience.tsx`, `QuestionInput.tsx`, `LiveModePanel.tsx`

**方案**：
- `text-lg leading-8` -> `text-lg leading-9`（18px / 36px = 2.0）
- `text-base leading-7` -> `text-base leading-8`（16px / 32px = 2.0）
- 保持叙事正文 `text-base leading-8` 不变

**验收**：中文正文行高 >= 1.8

#### Task 2.2: 中文标题字间距

**描述**：中文标题用宋体，方块字排列偏紧。

**文件**：`src/app/globals.css`

**方案**：
```css
h1, h2, h3, h4 {
  font-family: var(--font-display), serif;
  letter-spacing: 0.04em;
}
```

**验收**：中文标题字间距视觉舒适

---

### Phase 3: 动效编排

**目标**：让页面有节奏感，流式内容有生命感

#### Task 3.1: 卡片入场动画（staggered fade-in）

**描述**：NarrativeGrid 的 3 张卡片当前瞬间出现，改为错开入场。

**文件**：`src/app/globals.css`, `NarrativeGrid.tsx`, `PerspectiveCard.tsx`

**方案**：
```css
@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-enter {
  animation: cardEnter 400ms cubic-bezier(0.25, 1, 0.5, 1) both;
}
```

在 NarrativeGrid 中通过 `style={{ animationDelay: '${index * 100}ms' }}` 错开。

**注意**：`card-enter` class 应加在 PerspectiveCard 外层的包裹 div 上（NarrativeGrid 内），而非 PerspectiveCard 的 `article` 元素上。这样 PerspectiveCard 内部因 SSE 状态变化的 re-render 不会重置入场动画。

**验收**：3 张卡片依次入场，间隔 100ms，总时长 600ms；streaming 状态变化不会导致动画重播

#### Task 3.2: 证据卡入场动画

**描述**：EvidenceCard 在叙事完成后出现，当前无过渡。

**文件**：`EvidenceCard.tsx`, `src/app/globals.css`

**方案**：复用 `cardEnter` 动画，delay 200ms。

**验收**：证据卡从下方淡入

#### Task 3.3: Rationale 区入场动画

**描述**：NarrativeGrid 顶部的 rationale 区也应该有入场动效。

**文件**：`NarrativeGrid.tsx`

**方案**：复用 `cardEnter` 动画，无 delay。

**验收**：rationale 区先入场，然后卡片依次跟进

#### Task 3.4: 暖色骨架屏优化

**描述**：当前骨架屏用冷灰 `bg-stone-200`，与暖色主题不协调。改为暖色 shimmer。

**文件**：`src/app/globals.css`, `PerspectiveCard.tsx`

**方案**：
```css
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-line {
  height: 1em;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    var(--paper-strong) 25%,
    rgba(255, 252, 247, 0.6) 50%,
    var(--paper-strong) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

替换 PerspectiveCard 中 waiting 状态的 `animate-pulse rounded-full bg-stone-200` 为 `skeleton-line`。

**验收**：骨架屏为暖色调 shimmer 动画，与页面背景协调

#### Task 3.5: 流式完成态信号

**描述**：卡片从 streaming 切到 done 时无视觉反馈。

**文件**：`PerspectiveCard.tsx`, `src/app/globals.css`

**方案**：
- 移除 streaming cursor 时加 200ms fade-out
- 完成时卡片 border 做一次 400ms 脉冲：`border-color` 从 `var(--line)` -> `var(--accent-soft)` -> `var(--line)`

```css
@keyframes completePulse {
  0%, 100% { border-color: var(--line); }
  50% { border-color: var(--accent-soft); }
}

.card-complete {
  animation: completePulse 600ms ease-in-out;
}
```

**注意**：多张卡片可能在短时间内同时完成。同时触发 3 个脉冲是可接受的（600ms 脉冲自然就是 subtle）。不需要错开。

**验收**：流式结束有明确的视觉收尾

#### Task 3.6: 骨架屏到流式文本的过渡

**描述**：当前骨架屏和流式文本之间是硬切换（条件渲染）。改造骨架屏后 shimmer 更醒目，硬切更违和。

**文件**：`PerspectiveCard.tsx`

**方案**：在 waiting -> streaming 切换时，给整个内容区（`rounded-[1.6rem]` 的 div）加 `transition-opacity duration-200`。骨架屏消失时 opacity 0 -> 文本出现 opacity 1。用一个 200ms 的 CSS transition 即可，不需要复杂的 crossfade。

实现方式：不改条件渲染逻辑，在内容区外层 div 加 `animate-[fadeIn_200ms_ease-out]`，由 React key 变化触发。

**验收**：骨架屏到文本不再硬切

#### Task 3.7: `prefers-reduced-motion` 支持

**描述**：新增的 5+ 动画应尊重用户系统设置。

**文件**：`src/app/globals.css`

**方案**：
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**验收**：系统开启减弱动效后，所有动画跳过

---

### Phase 4: 交互微反馈

**目标**：让产品感觉可交互、有响应

#### Task 4.1: 卡片 hover 浮起

**描述**：卡片静态，hover 无反馈。

**文件**：`src/app/globals.css`

**方案**：
```css
.pathsplit-card {
  transition: transform 200ms cubic-bezier(0.25, 1, 0.5, 1),
              box-shadow 200ms cubic-bezier(0.25, 1, 0.5, 1);
}

.pathsplit-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}
```

**验收**：hover 时卡片上浮 2px + 阴影加深

#### Task 4.2: 输入框 focus 发光

**描述**：当前 focus 只有 `border-stone-900`，加 accent 光晕。

**文件**：`QuestionInput.tsx`

**方案**：
```
focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]
```

**验收**：focus 时输入框有温暖的 accent 色光晕

#### Task 4.3: 按钮 hover/active 反馈

**描述**：主按钮已有 `hover:translate-y-[-1px]`，补充 active 状态。

**文件**：`QuestionInput.tsx`

**方案**：加 `active:translate-y-[1px] active:shadow-none` 做按下反馈。

**验收**：按钮按下有物理反馈感

#### Task 4.4: 自动滚动到结果区

**描述**：提交后结果在视口外，用户需手动滚动。

**文件**：`PathSplitExperience.tsx`, `NarrativeGrid.tsx`

**方案**：在 NarrativeGrid 外层 section 加 `ref`，当 `cards.length` 从 0 变为 > 0 时调用 `ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })`。

**注意**：
- 重复提交时 `cards` 会短暂变为 `[]` 再变为新值。`scrollIntoView` 应在 `cards.length > 0` 的 `useEffect` 中触发，不会在 `[]` 时触发。
- 用 `block: 'nearest'` 而非 `block: 'start'`，避免在小视口完全推走 hero。

**验收**：提交后页面平滑滚动到叙事区域

#### Task 4.5: 证据卡出现时自动滚动

**描述**：证据卡是"demo 高潮"，出现在视口外用户可能看不到。

**文件**：`PathSplitExperience.tsx`

**方案**：在 `evidenceCard` 从 null 变为非 null 时，`scrollIntoView({ behavior: 'smooth', block: 'nearest' })` 到证据卡 section。

**验收**：证据卡出现时自动滚入视口

#### Task 4.6: 流式中禁用卡片 hover 浮起

**描述**：streaming 状态下内容在增长，hover 的 translateY 可能造成视觉抖动。

**文件**：`PerspectiveCard.tsx`

**方案**：streaming 状态时不添加 hover 效果。给 `article` 加条件 class：`card.status !== 'streaming' ? 'hover-enabled' : ''`。CSS 中 `.pathsplit-card.hover-enabled:hover` 才触发浮起。

**验收**：streaming 中 hover 无浮起；done 状态 hover 正常浮起

---

### Phase 5: 证据卡视觉升级

**目标**：让证据卡成为页面焦点、demo 高潮

#### Task 5.0: 证据卡 Agent 主题色查找

**描述**：`EvidenceCard` 组件只接收 `NarrativePath`（含 `agentId`），没有 Agent 的 `theme` 色。需要一个查找机制。

**文件**：`EvidenceCard.tsx`, `src/lib/constants.ts`

**方案**：在 `EvidenceCard.tsx` 中 import `STARTUP_AGENTS`，用 `agentId` 查找对应 Agent 的 theme。创建一个简单的颜色映射：

```typescript
import { STARTUP_AGENTS } from '@/lib/constants';

// 从 gradient class 提取主色调，映射为 border/bg 色
const AGENT_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  'founder-still-running': { border: 'border-amber-500', bg: 'bg-amber-50', text: 'text-amber-900' },
  'stayed-in-big-tech': { border: 'border-sky-500', bg: 'bg-sky-50', text: 'text-sky-900' },
  'failed-and-returned': { border: 'border-rose-500', bg: 'bg-rose-50', text: 'text-rose-900' },
};
```

**验收**：`EvidenceCard` 可按 `agentId` 获取主题色

#### Task 5.1: 证据卡左边框强调

**描述**：当前证据卡与叙事卡视觉权重相同，需要差异化。

**文件**：`EvidenceCard.tsx`

**方案**：
- 外层加 `border-l-4 border-l-[var(--accent)]`
- 内部路径对比卡加 Agent 主题色的上边框：`border-t-2` + 对应 Agent 的颜色（从 Task 5.0 的 `AGENT_COLORS` 获取）

**验收**：证据卡一眼可辨，与叙事卡有明确的视觉层级差异

#### Task 5.2: 对比数据高亮

**描述**：当前 keyNumbers 用 `bg-stone-900` pill，所有 Agent 一样。

**文件**：`EvidenceCard.tsx`

**方案**：每个 Agent 的 pill 用 `AGENT_COLORS[path.agentId]` 的淡色背景 + 深色文字，而非统一黑底白字。

**验收**：不同 Agent 的数据 pill 颜色区分明显

#### Task 5.3: "If Again" 区块样式强化

**描述**：当前 "If Again" 与普通文本差异不大，这是最有冲击力的内容。

**文件**：`EvidenceCard.tsx`

**方案**：
- 改为引用样式：左边框 + 斜体 + 略大字号
- 类似 blockquote 的处理：`border-l-2 border-[var(--accent)] pl-4 italic text-base`

**验收**："如果重来"部分视觉突出

---

### Phase 6: 信息层级调整

**目标**：确保 demo 流程中信息出现顺序合理

#### Task 6.1: 保持 LiveModePanel 位置，依赖自动滚动跳过

**描述**：LiveModePanel 在叙事卡片之前是当前布局。用户要求完整保留。demo 流程通过 Task 4.4 的自动滚动跳过 LiveModePanel 直达叙事区，解决信息层级问题。

**文件**：无需改动

**方案**：保持当前 DOM 顺序不变。自动滚动（Task 4.4）到 NarrativeGrid 时会跳过 LiveModePanel，demo 流程不受影响。初始页面 LiveModePanel 完整展示，评委可以看到真实 A2A 连接能力。

**验收**：DOM 顺序保持：Hero -> 输入 -> LiveModePanel -> 叙事 -> 证据卡；提交后自动滚动跳过 LiveModePanel

#### Task 6.2: Hero Stats 微调

**描述**：当前 stats 值是静态文字（"大厂跳创业"、"3 条人生线"、"证据卡"），信息密度低。

**文件**：`src/lib/constants.ts`

**方案**：更新为更有冲击力的数据：
```typescript
export const HERO_STATS = [
  { label: 'Agent 实例', value: '3 个真实分身' },
  { label: '叙事维度', value: '现金流 / 身份 / 代价 / 后撤' },
  { label: '输出物', value: '平行人生证据卡' },
];
```

**验收**：Stats 传达更多产品信息

---

### Phase 7: 文案统一

**目标**：消除中英文混杂的违和感

#### Task 7.1: 加载态文案统一为中文

**描述**：按钮和状态标签中英文混杂不一致。

**文件**：`QuestionInput.tsx`, `PerspectiveCard.tsx`, `LiveModePanel.tsx`

**方案**：

| 当前 | 改为 | 文件 |
|------|------|------|
| "Start PathSplit" | "开始探索" | QuestionInput.tsx |
| "Tracing Paths..." | "正在追踪人生线..." | QuestionInput.tsx |
| "Streaming..." (追问按钮) | "正在追问..." | PerspectiveCard.tsx |
| "Asking Live..." | "正在对话..." | LiveModePanel.tsx |

保留英文的部分（刻意的双语设计标签）：
- Section 小标签保留英文（Decision Input, Connection, Live Prompt 等）-- 这是有意为之的设计语言
- Status 状态词保留英文（Waiting, Streaming, Captured）-- 技术感标签

**验收**：用户可读的操作文案用中文，设计语言标签用英文，不再有同一个按钮两种语言的情况

---

## Acceptance Criteria

### Functional

- [ ] 所有现有功能保持正常（SSE 流式、追问、证据卡、Live 模式）
- [ ] `npm run build` 无报错
- [ ] `npm run lint` 无报错
- [ ] `npm test` 全通过

### Visual

- [ ] Border-radius 收敛为 4 级（sm/md/lg/full）
- [ ] Letter-spacing 收敛为 3 级
- [ ] 卡片入场有 staggered 动效
- [ ] 骨架屏为暖色 shimmer
- [ ] 流式完成有视觉信号
- [ ] 证据卡视觉权重高于叙事卡
- [ ] 中文正文行高 >= 1.8
- [ ] 提交后自动滚动到结果区

### Demo Ready

- [ ] LiveModePanel 在叙事卡片和证据卡之后
- [ ] 按钮/加载态中文文案统一
- [ ] 卡片 hover 有浮起反馈
- [ ] 整体流程（输入 -> 叙事 -> 证据卡 -> 追问）视觉流畅无断裂

---

## References

### Internal

- 现有计划：`docs/plans/2026-03-12-feat-qianmian-parallel-lives-plan.md`
- 设计基础：`src/app/globals.css`（CSS 变量、背景纹理、卡片原型）
- 核心组件：`src/components/PathSplitExperience.tsx`（页面编排）

### Research Findings

- 中文排版：行高 1.8-2.0 为 CJK 最佳实践，标题加 0.04em 字间距
- 动效：只动画 transform/opacity，用 `cubic-bezier(0.25, 1, 0.5, 1)` 缓动，错开间隔 80-100ms
- Hackathon demo：评委只看前端，一个编排好的页面入场 > 十个分散的微交互
- 骨架屏 > spinner，暖色调骨架屏与产品调性一致
