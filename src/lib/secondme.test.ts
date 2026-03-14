import { describe, expect, it } from 'vitest';
import { extractSecondMeContent } from './secondme';

describe('extractSecondMeContent', () => {
  it('reads content deltas from SSE frames', () => {
    const frame = 'event: message\ndata: {"choices":[{"delta":{"content":"你好"}}]}\n\n';
    expect(extractSecondMeContent(frame)).toBe('你好');
  });

  it('ignores non-content frames', () => {
    expect(extractSecondMeContent('data: {"sessionId":"abc"}\n\n')).toBeNull();
    expect(extractSecondMeContent('data: [DONE]\n\n')).toBeNull();
  });
});
