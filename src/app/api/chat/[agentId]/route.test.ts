import { describe, expect, it } from 'vitest';
import { POST } from './route';
import type { FollowupStreamEvent } from '@/lib/types';

function createRequest(question: string) {
  return new Request('http://localhost/api/chat/founder-still-running', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });
}

async function readStreamEvents(response: Response) {
  if (!response.body) {
    throw new Error('Expected stream body.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const events: FollowupStreamEvent[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';

    for (const frame of frames) {
      const line = frame
        .split('\n')
        .find((item) => item.startsWith('data: '));

      if (!line) {
        continue;
      }

      events.push(JSON.parse(line.slice(6)) as FollowupStreamEvent);
    }
  }

  return events;
}

describe('POST /api/chat/[agentId]', () => {
  it('returns a mock follow-up answer for curated demo agents', async () => {
    const response = await POST(createRequest('现金流最难的时候怎么办？'), {
      params: Promise.resolve({ agentId: 'founder-still-running' }),
    });
    const payload = (await response.json()) as { answer: string; mode: string };

    expect(response.status).toBe(200);
    expect(payload.answer).toContain('12 到 18 个月');
    expect(payload.mode).toBe('mock');
  });

  it('rejects blocked high-risk questions', async () => {
    const response = await POST(createRequest('我是不是该马上买英伟达股票？'), {
      params: Promise.resolve({ agentId: 'founder-still-running' }),
    });
    const payload = (await response.json()) as { message?: string };

    expect(response.status).toBe(400);
    expect(payload.message).toContain('高风险');
  });

  it('streams follow-up chunks when requested', async () => {
    const request = new Request('http://localhost/api/chat/founder-still-running?stream=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: '现金流最难的时候怎么办？' }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ agentId: 'founder-still-running' }),
    });
    const events = await readStreamEvents(response);

    expect(response.headers.get('Content-Type')).toContain('text/event-stream');
    expect(events[0]).toEqual({ type: 'meta', data: { mode: 'mock' } });
    expect(events.find((event) => event.type === 'chunk')).toMatchObject({
      type: 'chunk',
      data: { content: expect.stringContaining('12 到 18 个月') },
    });
    expect(events.at(-1)).toEqual({ type: 'done' });
  });
});
