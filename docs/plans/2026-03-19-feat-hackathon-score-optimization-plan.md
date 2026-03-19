---
title: 黑客松评分优化：A2A 深度 + OAuth 转化率
type: feat
date: 2026-03-19
deadline: 2026-03-20 24:00
---

# 黑客松评分优化

## 目标

截止 3/20 24:00，最大化两个评分维度：
1. **评委评分（50%）**：A2A 场景价值 40% + 创新度 30% + 完成度 30%
2. **用户数（50%）**：OAuth 授权登录数

## 问题诊断

通过 Playwright 调研 + API 文档分析，发现以下问题：

### P0：A2A 深度不足（影响评委评分 40%）

当前 Phase 2「岔路口对话」是纯 mock，用户分身的反应是硬编码文本，与用户本人毫无关系。评委看到的是"假的 A2A"——分身没有读取用户的真实记忆和兴趣标签。

**SecondMe API 提供了 `GET /api/secondme/user/shades`**，可以获取用户的兴趣标签（`shadeContent`、`sourceTopics`、`confidenceLevel`）。OAuth 连接后，可以把这些标签注入 Phase 2 的用户分身 prompt，让反应真正个性化。

### P1：没有写回 Agent Memory（影响 A2A 场景价值）

用户完成 Phase 2 后，产生了「岔路口画像」（共鸣路径、恐惧路径、情绪词）。这些数据没有写回 SecondMe。

**`POST /api/secondme/agent_memory/ingest`** 可以把这次决策体验写入用户的 AI 分身记忆，让分身"记住"用户曾经面对过这个岔路口。这是真正的 A2A 写回，评委会认可。

### P2：OAuth 转化文案是"产品内部视角"（影响用户数 50%）

`OAuthConversionPanel` 的 step1/2/3 文案：
- "先保留首屏体验，不把评委挡在登录墙前"
- "证据卡出来后再转 OAuth，价值感更强，掉线更少"
- "连接后立刻进入真人链路，不需要重新开始整个探索"

这是给评委解释产品设计逻辑的，不是给普通用户的转化文案。用户看了不知道"连接有什么好处"。

### P3：Phase 2 入口视觉权重不够

「开始岔路口对话」按钮样式普通，在证据卡下方，用户容易忽略。这是产品最核心的 A2A 功能，应该更显眼。

---

## 方案

### 任务 1：用 user/shades 个性化用户分身反应（P0）

**文件：** `src/app/api/crossroad/converse/route.ts`、`src/lib/secondme.ts`、`src/lib/crossroad-prompts.ts`

**逻辑：**
1. `converse/route.ts` 接收请求时，从 cookie 读取 session（已有 `getSecondMeSession` 工具）
2. 如果有 session，调用 `GET /api/secondme/user/shades` 获取用户兴趣标签
3. 把 shades 注入 `getUserAgentReflectionPrompt`，让用户分身反应包含真实的个人背景
4. 无 session 时 fallback 到现有 mock（不破坏现有行为）

**Prompt 注入示例：**
```
你的真实背景（来自你的 SecondMe 记忆）：
- 职业方向：{shade.shadeContent}（置信度：{shade.confidenceLevel}）
- 关注话题：{shade.sourceTopics.join('、')}

现在以第一人称说出你看完这三条路后的真实反应...
```

**关键约束：**
- 只在 `session.connected === true` 时调用 shades API
- shades 调用失败不影响主流程（try/catch fallback）
- 不改变 SSE 事件格式

### 任务 2：Phase 2 完成后写回 Agent Memory（P1）

**文件：** `src/app/api/crossroad/converse/route.ts`、`src/lib/secondme.ts`

**逻辑：**
在 `crossroad_profile` 事件发送后，异步调用 `POST /api/secondme/agent_memory/ingest`：

```typescript
// 不阻塞 SSE 流，fire-and-forget
void ingestCrossroadMemory(session.accessToken, profile);
```

**Memory 内容：**
```json
{
  "channel": { "kind": "decision", "id": "pathsplit-crossroad" },
  "action": "crossroad_completed",
  "actionLabel": "完成了人生岔路口对话",
  "displayText": "在 PathSplit 探索了「{topic}」，最共鸣「{resonatedPath}」，最担心「{fearedPath}」",
  "refs": [{
    "objectType": "crossroad_profile",
    "objectId": "{userId}",
    "contentPreview": "{userReflection 前100字}"
  }],
  "importance": 0.8
}
```

**关键约束：**
- fire-and-forget，不等待响应，不影响 SSE 流
- 只在 `session.connected === true` 时执行
- 失败静默（console.error 即可）

### 任务 3：改写 OAuthConversionPanel 文案（P2）

**文件：** `src/lib/i18n/zh.ts`、`src/lib/i18n/en.ts`

把 step1/2/3 从"产品设计解释"改成"用户价值承诺"：

| 当前（产品内部视角） | 改后（用户价值视角） |
|---------------------|---------------------|
| 先保留首屏体验，不把评委挡在登录墙前 | 你的 SecondMe 分身会读取你的真实记忆，生成专属于你的反应 |
| 证据卡出来后再转 OAuth，价值感更强，掉线更少 | 3 个 persona 会直接回应你的处境，不是泛泛而谈 |
| 连接后立刻进入真人链路，不需要重新开始整个探索 | 这次决策体验会写入你的 AI 分身记忆，下次它会记得你面对过这个岔路口 |

同时把 CTA 按钮文案从"连接 SecondMe，计入授权登录"改成更有吸引力的文案：
- 中文：`让我的分身参与这场对话`
- 英文：`Let my SecondMe join this conversation`

### 任务 4：Phase 2 入口视觉强化（P3）

**文件：** `src/components/CrossroadConversation.tsx`

把「开始岔路口对话」按钮区域升级：
- 加一个简短的价值说明（1行）：`你的 SecondMe 分身将读取三条路径，说出你的真实反应`
- 按钮改用更显眼的渐变样式（已有 `pathsplit-cta` class 可复用）
- 如果 session 已连接，显示用户名：`让 {userName} 的分身开始对话`

---

## 文件清单

| 文件 | 改动 |
|------|------|
| `src/app/api/crossroad/converse/route.ts` | 读 session → 调 shades → 注入 prompt；Phase 2 完成后写回 memory |
| `src/lib/secondme.ts` | 新增 `getUserShades(token)` 和 `ingestCrossroadMemory(token, profile)` |
| `src/lib/crossroad-prompts.ts` | `getUserAgentReflectionPrompt` 接受可选 `shades` 参数 |
| `src/lib/i18n/zh.ts` | 改写 `oauth.step1/2/3`、`oauth.ctaDisconnected` |
| `src/lib/i18n/en.ts` | 同上英文版 |
| `src/components/CrossroadConversation.tsx` | Phase 2 入口视觉强化 |

**不改文件：** SSE 事件格式、类型定义、匹配算法、OAuth 流程、所有测试

---

## 验收标准

- [ ] OAuth 连接后，Phase 2 用户分身反应包含用户真实兴趣标签（可在 Network 面板验证 shades API 调用）
- [ ] Phase 2 完成后，`agent_memory/ingest` 被调用（Network 面板可见，失败不影响流程）
- [ ] OAuthConversionPanel 文案改为用户价值视角，不再出现"评委"字样
- [ ] Phase 2 入口按钮更显眼，有价值说明文字
- [ ] `npm run build` 无错误
- [ ] `npm run lint` 无警告
- [ ] mock 模式（无 OAuth）全流程正常

---

## 优先级

**必做（今天完成）：** 任务 3（文案，30分钟）、任务 4（视觉，20分钟）
**应做（今天完成）：** 任务 2（memory 写回，1小时）
**尽力做：** 任务 1（shades 个性化，2小时，需要测试真实 OAuth 流程）
