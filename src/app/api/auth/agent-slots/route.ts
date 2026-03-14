import { NextRequest, NextResponse } from 'next/server';
import { readSecondMeSession } from '@/lib/auth';
import {
  canConfigureLocalAgentSlots,
  isSupportedRealAgentId,
  listRealAgentStatuses,
  saveRealAgentSlot,
  seedRealAgentMemories,
} from '@/lib/real-agents';
import { redactErrorMessage } from '@/lib/safety';

export const runtime = 'nodejs';

function buildPayload() {
  return {
    enabled: canConfigureLocalAgentSlots(),
    slots: listRealAgentStatuses(),
  };
}

export async function GET() {
  return NextResponse.json(buildPayload());
}

export async function POST(request: NextRequest) {
  if (!canConfigureLocalAgentSlots()) {
    return NextResponse.json({ message: 'Agent slot capture is disabled outside local development.' }, { status: 403 });
  }

  try {
    const session = readSecondMeSession(request);
    if (!session?.refreshToken) {
      return NextResponse.json({ message: '请先连接 SecondMe，再绑定这个视角。' }, { status: 401 });
    }

    const { agentId, seed = true } = (await request.json()) as { agentId?: string; seed?: boolean };
    if (!agentId || !isSupportedRealAgentId(agentId)) {
      return NextResponse.json({ message: '未知的人生线槽位。' }, { status: 400 });
    }

    saveRealAgentSlot(agentId, session.refreshToken, session.user?.name);
    const result = seed ? await seedRealAgentMemories(agentId) : null;

    return NextResponse.json({
      ...buildPayload(),
      seeded: result,
    });
  } catch (error) {
    return NextResponse.json({ message: redactErrorMessage(error) }, { status: 500 });
  }
}
