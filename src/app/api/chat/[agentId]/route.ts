import { getFollowupReply } from '@/lib/demo-data';
import {
  askRealAgentFollowup,
  hasConfiguredRealAgent,
  streamRealAgentFollowup,
} from '@/lib/real-agents';
import { redactErrorMessage, validateUserInput } from '@/lib/safety';
import { STARTUP_AGENTS } from '@/lib/constants';
import type { FollowupResponse, FollowupStreamEvent } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

function createStreamResponse(
  run: (send: (event: FollowupStreamEvent) => Promise<void>) => Promise<void>,
) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();
  let queue = Promise.resolve();

  const send = (event: FollowupStreamEvent) => {
    queue = queue.then(() => writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`)));
    return queue;
  };

  void (async () => {
    try {
      await run(send);
    } catch (error) {
      await send({
        type: 'error',
        data: { message: redactErrorMessage(error) },
      });
    } finally {
      await queue;
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ agentId: string }> },
) {
  try {
    const { agentId } = await context.params;
    const { question } = (await request.json()) as { question?: string };
    const safety = validateUserInput(question ?? '');
    const agent = STARTUP_AGENTS.find((item) => item.id === agentId);
    const wantsStream = new URL(request.url).searchParams.get('stream') === '1';
    const isRealAgent = hasConfiguredRealAgent(agentId);

    if (!safety.allowed) {
      return Response.json({ message: safety.reason }, { status: 400 });
    }

    if (!agent) {
      return Response.json({ message: '未找到这个视角。' }, { status: 404 });
    }

    if (wantsStream) {
      return createStreamResponse(async (send) => {
        await send({
          type: 'meta',
          data: { mode: isRealAgent ? 'secondme' : 'mock' },
        });

        if (isRealAgent) {
          const iterator = await streamRealAgentFollowup(agent, question ?? '');
          for await (const chunk of iterator) {
            await send({
              type: 'chunk',
              data: { content: chunk },
            });
          }
        } else {
          await send({
            type: 'chunk',
            data: { content: getFollowupReply(agentId, question ?? '') },
          });
        }

        await send({ type: 'done' });
      });
    }

    const payload: FollowupResponse = {
      answer: isRealAgent
        ? await askRealAgentFollowup(agent, question ?? '')
        : getFollowupReply(agentId, question ?? ''),
      mode: isRealAgent ? 'secondme' : 'mock',
    };

    return Response.json(payload);
  } catch (error) {
    return Response.json({ message: redactErrorMessage(error) }, { status: 500 });
  }
}
