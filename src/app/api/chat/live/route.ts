import { NextRequest, NextResponse } from 'next/server';
import {
  clearSecondMeSession,
  ensureFreshSecondMeSession,
  readSecondMeSession,
  writeSecondMeSession,
} from '@/lib/auth';
import { collectSecondMeChatReply, getSecondMeFollowupModel } from '@/lib/secondme';
import { redactErrorMessage, validateUserInput, wrapUserInput } from '@/lib/safety';
import type { FollowupResponse } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { question } = (await request.json()) as { question?: string };
    const safety = validateUserInput(question ?? '');

    if (!safety.allowed) {
      return NextResponse.json({ message: safety.reason }, { status: 400 });
    }

    const resolved = await ensureFreshSecondMeSession(readSecondMeSession(request));
    if (!resolved.session) {
      const unauthorized = NextResponse.json(
        { message: '请先连接 SecondMe，再发起真人分身追问。' },
        { status: 401 },
      );
      clearSecondMeSession(unauthorized);
      return unauthorized;
    }

    const prompt = [
      '请以第一人称回答这个问题。',
      '避免空泛建议，尽量给出具体场景、代价和时间感。',
      wrapUserInput(question ?? ''),
    ].join('\n\n');

    const payload: FollowupResponse = {
      answer: await collectSecondMeChatReply(resolved.session.accessToken, {
        message: prompt,
        model: getSecondMeFollowupModel(),
      }),
      mode: 'secondme',
    };

    const json = NextResponse.json(payload);
    if (resolved.refreshed) {
      writeSecondMeSession(json, resolved.session);
    }

    return json;
  } catch (error) {
    return NextResponse.json({ message: redactErrorMessage(error) }, { status: 500 });
  }
}
