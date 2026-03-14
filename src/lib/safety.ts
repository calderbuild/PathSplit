import type { SafetyResult } from './types';

const BLOCKED_PATTERNS = [
  /(自杀|轻生|不想活|结束生命)/i,
  /(诊断|处方|手术|癌症|抑郁症|精神病)/i,
  /(起诉|坐牢|判刑|合同纠纷|离婚官司)/i,
  /(买什么股票|股票|基金|基金推荐|投资|期货|杠杆|币圈|暴富|加仓|做多|做空)/i,
];

const MAX_INPUT_LENGTH = 500;

export function validateUserInput(question: string): SafetyResult {
  const trimmed = question.trim();

  if (!trimmed) {
    return { allowed: false, reason: '先把问题说清楚。一个具体困惑，比一个宏大主题更有价值。' };
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    return { allowed: false, reason: '先收窄一下问题。当前产品单次最多支持 500 字输入。' };
  }

  const blocked = BLOCKED_PATTERNS.find((pattern) => pattern.test(trimmed));
  if (blocked) {
    return {
      allowed: false,
      reason: '当前产品不处理医疗、法律、自伤或投资等高风险决策。请换成职业和人生路径类问题。',
    };
  }

  return { allowed: true };
}

export function wrapUserInput(question: string) {
  return `<user_input>${question.trim()}</user_input>`;
}

export function redactErrorMessage(_: unknown) {
  return '服务暂时不可用，请稍后重试。';
}
