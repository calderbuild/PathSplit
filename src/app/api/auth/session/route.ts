import { NextRequest, NextResponse } from 'next/server';
import {
  clearSecondMeSession,
  ensureFreshSecondMeSession,
  hasOAuthConfig,
  readSecondMeSession,
  writeSecondMeSession,
} from '@/lib/auth';
import type { SecondMeSessionStatus } from '@/lib/types';

function disconnectedStatus(available: boolean): SecondMeSessionStatus {
  return {
    available,
    connected: false,
    scope: [],
  };
}

export async function GET(request: NextRequest) {
  if (!hasOAuthConfig()) {
    return NextResponse.json(disconnectedStatus(false));
  }

  try {
    const resolved = await ensureFreshSecondMeSession(readSecondMeSession(request));
    if (!resolved.session) {
      const response = NextResponse.json(disconnectedStatus(true));
      clearSecondMeSession(response);
      return response;
    }

    const payload: SecondMeSessionStatus = {
      available: true,
      connected: true,
      expiresAt: resolved.session.expiresAt,
      scope: resolved.session.scope,
      user: resolved.session.user,
    };

    const response = NextResponse.json(payload);
    if (resolved.refreshed) {
      writeSecondMeSession(response, resolved.session);
    }

    return response;
  } catch {
    const response = NextResponse.json(disconnectedStatus(true));
    clearSecondMeSession(response);
    return response;
  }
}
