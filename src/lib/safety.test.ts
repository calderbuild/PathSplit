import { describe, expect, it } from 'vitest';
import { redactErrorMessage, validateUserInput, wrapUserInput } from './safety';

describe('validateUserInput', () => {
  it('accepts a normal career decision question', () => {
    expect(validateUserInput('30 岁要不要从大厂跳去创业？')).toEqual({ allowed: true });
  });

  it('rejects blocked high-risk domains', () => {
    expect(validateUserInput('我该买什么股票，现在要不要加杠杆？')).toEqual({
      allowed: false,
      reason: '当前产品不处理医疗、法律、自伤或投资等高风险决策。请换成职业和人生路径类问题。',
    });
  });

  it('wraps user input in explicit tags', () => {
    expect(wrapUserInput('test')).toBe('<user_input>test</user_input>');
  });

  it('redacts internal errors', () => {
    expect(redactErrorMessage(new Error('secret'))).toBe('服务暂时不可用，请稍后重试。');
  });
});
