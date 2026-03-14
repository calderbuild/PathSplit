import { afterEach, describe, expect, it } from 'vitest';
import { POST } from './route';
import type { SSEEvent } from '@/lib/types';

async function readEvents(response: Response) {
  if (!response.body) {
    throw new Error('Expected SSE body.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const events: SSEEvent[] = [];

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

      events.push(JSON.parse(line.slice(6)) as SSEEvent);
    }
  }

  return events;
}

function createExploreRequest(question: string) {
  return new Request('http://localhost/api/explore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });
}

describe('POST /api/explore', () => {
  afterEach(() => {
    delete process.env.PATHSPLIT_AGENT_STAGGER_MS;
    delete process.env.PATHSPLIT_STREAM_DELAY_MS;
    delete process.env.PATHSPLIT_FAIL_AGENT_ID;
  });

  it('streams session, narratives, evidence card, and completion', async () => {
    process.env.PATHSPLIT_AGENT_STAGGER_MS = '0';
    process.env.PATHSPLIT_STREAM_DELAY_MS = '0';

    const response = await POST(createExploreRequest('30 岁要不要从大厂跳去创业？'));
    const events = await readEvents(response);

    expect(response.headers.get('Content-Type')).toContain('text/event-stream');
    expect(events.find((event) => event.type === 'session')).toBeTruthy();
    expect(events.filter((event) => event.type === 'agent_start')).toHaveLength(3);
    expect(events.filter((event) => event.type === 'agent_done')).toHaveLength(3);
    expect(events.find((event) => event.type === 'evidence_card')).toBeTruthy();
    expect(events.at(-1)?.type).toBe('done');
  });

  it('keeps the session alive when one agent fails', async () => {
    process.env.PATHSPLIT_AGENT_STAGGER_MS = '0';
    process.env.PATHSPLIT_STREAM_DELAY_MS = '0';
    process.env.PATHSPLIT_FAIL_AGENT_ID = 'failed-and-returned';

    const response = await POST(createExploreRequest('30 岁要不要从大厂跳去创业？'));
    const events = await readEvents(response);

    expect(events.find((event) => event.type === 'agent_error')).toMatchObject({
      type: 'agent_error',
      data: { agentId: 'failed-and-returned', message: '该视角暂时无法加载。' },
    });
    expect(events.filter((event) => event.type === 'agent_done')).toHaveLength(2);
    expect(events.find((event) => event.type === 'evidence_card')).toBeTruthy();
    expect(events.at(-1)?.type).toBe('done');
  });

  it('rejects blocked high-risk inputs', async () => {
    const response = await POST(createExploreRequest('我该买什么股票，现在要不要加杠杆？'));
    const payload = (await response.json()) as { message?: string };

    expect(response.status).toBe(400);
    expect(payload.message).toContain('高风险');
  });
});
