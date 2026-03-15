import { describe, expect, it } from 'vitest';
import { redactErrorMessage, validateUserInput, wrapUserInput } from './safety';

describe('validateUserInput', () => {
  it('accepts a normal career decision question', () => {
    expect(validateUserInput('30 岁要不要从大厂跳去创业？')).toEqual({ allowed: true });
  });

  it('rejects blocked high-risk domains', () => {
    expect(validateUserInput('我该买什么股票，现在要不要加杠杆？')).toEqual({
      allowed: false,
      reason: 'BLOCKED_TOPIC',
    });
  });

  it('wraps user input in explicit tags', () => {
    expect(wrapUserInput('test')).toBe('<user_input>test</user_input>');
  });

  it('redacts internal errors', () => {
    expect(redactErrorMessage(new Error('secret'))).toBe('SERVICE_UNAVAILABLE');
  });
});
