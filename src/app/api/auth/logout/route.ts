import { NextRequest, NextResponse } from 'next/server';
import { clearOAuthContext, clearOAuthState, clearSecondMeSession } from '@/lib/auth';

export function GET(request: NextRequest) {
  const home = new URL('/', request.url);
  home.searchParams.set('auth', 'disconnected');

  const response = NextResponse.redirect(home);
  clearOAuthState(response);
  clearOAuthContext(response);
  clearSecondMeSession(response);
  return response;
}
