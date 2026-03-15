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
    return { allowed: false, reason: 'EMPTY_INPUT' };
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    return { allowed: false, reason: 'INPUT_TOO_LONG' };
  }

  const blocked = BLOCKED_PATTERNS.find((pattern) => pattern.test(trimmed));
  if (blocked) {
    return { allowed: false, reason: 'BLOCKED_TOPIC' };
  }

  return { allowed: true };
}

export function wrapUserInput(question: string) {
  return `<user_input>${question.trim()}</user_input>`;
}

export function redactErrorMessage(_: unknown) {
  return 'SERVICE_UNAVAILABLE';
}
