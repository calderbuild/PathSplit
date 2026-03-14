import { analyzeDilemma } from '@/lib/analyzer';
import { getNarrativeForAgent, getStoryChunks } from '@/lib/demo-data';
import { generateEvidenceCard } from '@/lib/evidence';
import { hasConfiguredRealAgent, streamRealAgentNarrative } from '@/lib/real-agents';
import { redactErrorMessage, validateUserInput, wrapUserInput } from '@/lib/safety';
import type { SSEEvent } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 180;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readDelay(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function shouldFailAgent(agentId: string) {
  return process.env.PATHSPLIT_FAIL_AGENT_ID === agentId;
}

async function* streamAgentNarrative(
  question: string,
  dimensions: string[],
  agent: Awaited<ReturnType<typeof analyzeDilemma>>['agents'][number],
) {
  if (hasConfiguredRealAgent(agent.id)) {
    yield* await streamRealAgentNarrative(agent, question, dimensions);
    return;
  }

  const chunks = getStoryChunks(getNarrativeForAgent(agent));
  for (const chunk of chunks) {
    yield `${chunk} `;
    await delay(readDelay('PATHSPLIT_STREAM_DELAY_MS', 220));
  }
}

export async function POST(request: Request) {
  const { question } = (await request.json()) as { question?: string };
  const safety = validateUserInput(question ?? '');

  if (!safety.allowed) {
    return Response.json({ message: safety.reason }, { status: 400 });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();
  let queue = Promise.resolve();

  const send = (event: SSEEvent) => {
    queue = queue.then(() => writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`)));
    return queue;
  };

  (async () => {
    try {
      const wrappedQuestion = wrapUserInput(question ?? '');
      const analysis = await analyzeDilemma(wrappedQuestion.replace(/<\/?user_input>/g, ''));
      const narratives = new Map<string, string>();

      await send({
        type: 'session',
        data: {
          topic: analysis.topic,
          dimensions: analysis.dimensions,
          rationale: analysis.rationale,
          agents: analysis.agents,
        },
      });

      await Promise.allSettled(
        analysis.agents.map(async (agent, index) => {
          await delay(index * readDelay('PATHSPLIT_AGENT_STAGGER_MS', 260));
          try {
            await send({ type: 'agent_start', data: { agentId: agent.id, label: agent.label } });
            if (shouldFailAgent(agent.id)) {
              throw new Error('Injected agent failure');
            }

            let fullText = '';

            for await (const chunk of streamAgentNarrative(
              wrappedQuestion.replace(/<\/?user_input>/g, ''),
              analysis.dimensions,
              agent,
            )) {
              fullText += chunk;
              await send({ type: 'agent_chunk', data: { agentId: agent.id, content: chunk } });
            }

            narratives.set(agent.id, fullText.trim());
            await send({ type: 'agent_done', data: { agentId: agent.id } });
          } catch {
            await send({
              type: 'agent_error',
              data: { agentId: agent.id, message: '该视角暂时无法加载。' },
            });
          }
        }),
      );

      const evidenceCard = generateEvidenceCard(analysis.topic, analysis.agents, narratives);
      await send({ type: 'evidence_card', data: evidenceCard });
      await send({ type: 'done' });
    } catch (error) {
      await send({ type: 'error', data: { message: redactErrorMessage(error) } });
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
