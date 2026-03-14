import { NextRequest, NextResponse } from 'next/server';
import {
  clearOAuthContext,
  clearOAuthState,
  clearSecondMeSession,
  createSecondMeSessionFromCode,
  readOAuthContext,
  readOAuthState,
  writeSecondMeSession,
} from '@/lib/auth';

function logOAuthEvent(
  request: NextRequest,
  event: string,
  details: Record<string, unknown>,
) {
  console.info(
    JSON.stringify({
      event,
      hostname: request.nextUrl.hostname,
      at: new Date().toISOString(),
      ...details,
    }),
  );
}

export async function GET(request: NextRequest) {
  const home = new URL('/', request.url);
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');
  const storedState = readOAuthState(request);
  const context = readOAuthContext(request);
  const source = context?.source ?? 'direct';
  const latencyMs = typeof context?.startedAt === 'number' ? Date.now() - context.startedAt : undefined;
  const isLocalDev =
    process.env.NODE_ENV !== 'production' &&
    ['localhost', '127.0.0.1'].includes(request.nextUrl.hostname);
  const hasValidState = Boolean(code && state && storedState && state === storedState);

  if (error) {
    logOAuthEvent(request, 'pathsplit_oauth_login_denied', {
      source,
      error,
      latencyMs,
    });
    home.searchParams.set('auth', 'denied');
    home.searchParams.set('auth_source', source);
    const response = NextResponse.redirect(home);
    clearOAuthState(response);
    clearOAuthContext(response);
    return response;
  }

  if (!code || !state || (!hasValidState && !isLocalDev)) {
    logOAuthEvent(request, 'pathsplit_oauth_login_failed', {
      source,
      reason: 'invalid_state_or_missing_code',
      hasCode: Boolean(code),
      hasState: Boolean(state),
      storedStatePresent: Boolean(storedState),
      latencyMs,
    });
    home.searchParams.set('auth', 'failed-state');
    home.searchParams.set('auth_source', source);
    const response = NextResponse.redirect(home);
    clearOAuthState(response);
    clearOAuthContext(response);
    clearSecondMeSession(response);
    return response;
  }

  try {
    if (!hasValidState && isLocalDev) {
      console.warn('Bypassing OAuth state validation for localhost development callback.');
    }

    const session = await createSecondMeSessionFromCode(code);
    home.searchParams.set('auth', 'connected');
    home.searchParams.set('auth_source', source);

    const response = NextResponse.redirect(home);
    clearOAuthState(response);
    clearOAuthContext(response);
    writeSecondMeSession(response, session);
    logOAuthEvent(request, 'pathsplit_oauth_login_completed', {
      source,
      latencyMs,
      scopeCount: session.scope.length,
      hasUserProfile: Boolean(session.user),
    });
    return response;
  } catch (error) {
    console.error('SecondMe OAuth callback exchange failed.', error);
    logOAuthEvent(request, 'pathsplit_oauth_login_failed', {
      source,
      reason: 'exchange_failed',
      latencyMs,
    });
    home.searchParams.set('auth', 'failed-exchange');
    home.searchParams.set('auth_source', source);
    const response = NextResponse.redirect(home);
    clearOAuthState(response);
    clearOAuthContext(response);
    clearSecondMeSession(response);
    return response;
  }
}
