import { NextRequest, NextResponse } from 'next/server';
import {
  buildSecondMeAuthorizationUrl,
  createOAuthState,
  hasOAuthConfig,
  normalizeOAuthSource,
  writeOAuthContext,
  writeOAuthState,
} from '@/lib/auth';

export function GET(request: NextRequest) {
  const home = new URL('/', request.url);
  const source = normalizeOAuthSource(request.nextUrl.searchParams.get('source'));

  if (!hasOAuthConfig()) {
    console.warn(
      JSON.stringify({
        event: 'pathsplit_oauth_login_blocked',
        source,
        hostname: request.nextUrl.hostname,
        reason: 'missing_oauth_config',
        at: new Date().toISOString(),
      }),
    );
    home.searchParams.set('auth', 'misconfigured');
    return NextResponse.redirect(home);
  }

  const state = createOAuthState();
  const response = NextResponse.redirect(buildSecondMeAuthorizationUrl(state));
  writeOAuthState(response, state);
  writeOAuthContext(response, {
    source,
    startedAt: Date.now(),
  });
  console.info(
    JSON.stringify({
      event: 'pathsplit_oauth_login_started',
      source,
      hostname: request.nextUrl.hostname,
      at: new Date().toISOString(),
    }),
  );
  return response;
}
