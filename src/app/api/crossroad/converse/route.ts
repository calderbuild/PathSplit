import { NextRequest } from 'next/server';
import { extractNarrativeSummary } from '@/lib/evidence';
import { getMockUserReflection, getMockPersonaReply, getMockCrossroadProfile } from '@/lib/demo-data';
import { getUserAgentReflectionPrompt, getPersonaReplyPrompt, extractCrossroadProfilePrompt } from '@/lib/crossroad-prompts';
import { redactErrorMessage } from '@/lib/safety';
import { ensureFreshSecondMeSession, readSecondMeSession } from '@/lib/auth';
import { ingestSecondMeAgentMemory } from '@/lib/secondme';
import type { CrossroadSSEEvent, AgentMeta, CrossroadProfile } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 180;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readDelay(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function getStoryChunks(story: string) {
  return story
    .split(/(?<=。|！|？)\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

async function* streamMockText(text: string) {
  const chunks = getStoryChunks(text);
  for (const chunk of chunks) {
    yield `${chunk} `;
    await delay(readDelay('PATHSPLIT_STREAM_DELAY_MS', 220));
  }
}

export async function POST(request: NextRequest) {
  const { topic, agents, narratives, userId } = (await request.json()) as {
    topic: string;
    agents: AgentMeta[];
    narratives: Record<string, string>;
    userId?: string;
  };

  const resolved = await ensureFreshSecondMeSession(readSecondMeSession(request)).catch(() => null);
  const accessToken = resolved?.session?.accessToken ?? null;

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();
  let queue = Promise.resolve();

  const send = (event: CrossroadSSEEvent) => {
    queue = queue.then(() => writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`)));
    return queue;
  };

  (async () => {
    try {
      await send({ type: 'converse_start', data: { userAgentName: '你的 SecondMe' } });

      const userReflection = getMockUserReflection(topic);
      for await (const chunk of streamMockText(userReflection)) {
        await send({ type: 'user_agent_chunk', data: { content: chunk } });
      }
      await send({ type: 'user_agent_done', data: { reflection: userReflection } });

      for (const agent of agents) {
        await send({ type: 'persona_reply_start', data: { agentId: agent.id, label: agent.label } });

        const reply = getMockPersonaReply(agent.id, userReflection);
        for await (const chunk of streamMockText(reply)) {
          await send({ type: 'persona_reply_chunk', data: { agentId: agent.id, content: chunk } });
        }

        await send({ type: 'persona_reply_done', data: { agentId: agent.id } });
      }

      const profileData = getMockCrossroadProfile();
      const narrativeSummaries: Record<string, string> = {};
      agents.forEach((agent) => {
        narrativeSummaries[agent.id] = extractNarrativeSummary(narratives[agent.id] ?? '');
      });

      const profile: CrossroadProfile = {
        userId: userId ?? `anon-${Date.now()}`,
        topic,
        resonatedPath: profileData.resonatedPath,
        fearedPath: profileData.fearedPath,
        currentSide: profileData.currentSide,
        keyEmotions: profileData.keyEmotions,
        userReflection,
        narrativeSummaries,
        createdAt: Date.now(),
      };

      await send({ type: 'crossroad_profile', data: profile });
      await send({ type: 'done' });

      // fire-and-forget: 写回 Agent Memory，不阻塞 SSE 流
      if (accessToken) {
        void ingestSecondMeAgentMemory(accessToken, {
          channel: { kind: 'decision', id: 'pathsplit-crossroad' },
          action: 'crossroad_completed',
          actionLabel: '完成了人生岔路口对话',
          displayText: `在 PathSplit 探索了「${topic}」，最共鸣「${profile.resonatedPath}」，最担心「${profile.fearedPath}」`,
          refs: [{
            objectType: 'crossroad_profile',
            objectId: profile.userId,
            contentPreview: profile.userReflection.slice(0, 100),
          }],
          importance: 0.8,
          idempotencyKey: `pathsplit-crossroad-${profile.userId}-${profile.createdAt}`,
        }).catch((err) => console.error('[crossroad] memory ingest failed:', err));
      }
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
