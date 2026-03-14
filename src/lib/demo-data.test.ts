import { describe, expect, it } from 'vitest';
import { getFollowupReply, getStoryChunks } from './demo-data';

describe('getStoryChunks', () => {
  it('splits narrative text into sentence-like chunks', () => {
    expect(getStoryChunks('第一句。第二句。')).toEqual(['第一句。', '第二句。']);
  });
});

describe('getFollowupReply', () => {
  it('returns a founder-specific reply for cashflow questions', () => {
    const answer = getFollowupReply('founder-still-running', '现金流最难的时候怎么办？');
    expect(answer).toContain('12 到 18 个月');
  });

  it('returns a fallback reply for unknown agents', () => {
    expect(getFollowupReply('unknown', 'test')).toContain('暂时');
  });
});
