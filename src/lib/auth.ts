import type { NextRequest, NextResponse } from 'next/server';
import {
  exchangeSecondMeCode,
  getSecondMeAuthorizationBase,
  getSecondMeUserInfo,
  hasSecondMeCredentials,
  refreshSecondMeToken,
  type SecondMeTokenPayload,
  type SecondMeUserProfile,
} from './secondme';

const SESSION_COOKIE = 'pathsplit_secondme_session';
const STATE_COOKIE = 'pathsplit_secondme_state';
const CONTEXT_COOKIE = 'pathsplit_secondme_oauth_context';
const REFRESH_MARGIN_MS = 60_000;

export interface SecondMeSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  scope: string[];
  expiresAt: number;
  user?: SecondMeUserProfile;
}

export interface OAuthContext {
  source: string;
  startedAt: number;
}

function shouldUseSecureCookies() {
  return process.env.NODE_ENV === 'production';
}

function createSession(payload: SecondMeTokenPayload, user?: SecondMeUserProfile): SecondMeSession {
  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    tokenType: payload.tokenType,
    scope: payload.scope,
    expiresAt: Date.now() + payload.expiresIn * 1000,
    user,
  };
}

function serializeSession(session: SecondMeSession) {
  return encodeURIComponent(JSON.stringify(session));
}

function deserializeSession(value?: string) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<SecondMeSession>;
    if (typeof parsed.accessToken !== 'string' || typeof parsed.expiresAt !== 'number') {
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      refreshToken: typeof parsed.refreshToken === 'string' ? parsed.refreshToken : '',
      tokenType: typeof parsed.tokenType === 'string' ? parsed.tokenType : 'Bearer',
      scope: Array.isArray(parsed.scope) ? parsed.scope.filter((item): item is string => typeof item === 'string') : [],
      expiresAt: parsed.expiresAt,
      user: parsed.user,
    } satisfies SecondMeSession;
  } catch {
    return null;
  }
}

function serializeOAuthContext(context: OAuthContext) {
  return encodeURIComponent(JSON.stringify(context));
}

function deserializeOAuthContext(value?: string) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<OAuthContext>;
    if (typeof parsed.source !== 'string' || typeof parsed.startedAt !== 'number') {
      return null;
    }

    return {
      source: normalizeOAuthSource(parsed.source),
      startedAt: parsed.startedAt,
    } satisfies OAuthContext;
  } catch {
    return null;
  }
}

export function getSecondMeRedirectUri() {
  return process.env.SECONDME_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`;
}

export function hasOAuthConfig() {
  return hasSecondMeCredentials() && Boolean(getSecondMeRedirectUri());
}

export function getRequestedScopes() {
  return (process.env.SECONDME_OAUTH_SCOPES || '')
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildSecondMeAuthorizationUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.SECONDME_CLIENT_ID ?? '',
    redirect_uri: getSecondMeRedirectUri(),
    response_type: 'code',
    state,
  });

  const scopes = getRequestedScopes();
  if (scopes.length > 0) {
    params.set('scope', scopes.join(' '));
  }

  return `${getSecondMeAuthorizationBase()}?${params.toString()}`;
}

export function createOAuthState() {
  return crypto.randomUUID().replace(/-/g, '');
}

export function normalizeOAuthSource(value?: string | null) {
  const normalized = (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  return normalized || 'direct';
}

export function readSecondMeSession(request: NextRequest) {
  return deserializeSession(request.cookies.get(SESSION_COOKIE)?.value);
}

export function readOAuthState(request: NextRequest) {
  return request.cookies.get(STATE_COOKIE)?.value;
}

export function readOAuthContext(request: NextRequest) {
  return deserializeOAuthContext(request.cookies.get(CONTEXT_COOKIE)?.value);
}

export function writeSecondMeSession(response: NextResponse, session: SecondMeSession) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: serializeSession(session),
    httpOnly: true,
    sameSite: 'lax',
    secure: shouldUseSecureCookies(),
    path: '/',
    expires: new Date(session.expiresAt),
  });
}

export function writeOAuthState(response: NextResponse, state: string) {
  response.cookies.set({
    name: STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: 'lax',
    secure: shouldUseSecureCookies(),
    path: '/',
    maxAge: 60 * 10,
  });
}

export function writeOAuthContext(response: NextResponse, context: OAuthContext) {
  response.cookies.set({
    name: CONTEXT_COOKIE,
    value: serializeOAuthContext(context),
    httpOnly: true,
    sameSite: 'lax',
    secure: shouldUseSecureCookies(),
    path: '/',
    maxAge: 60 * 10,
  });
}

export function clearSecondMeSession(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    path: '/',
    maxAge: 0,
  });
}

export function clearOAuthState(response: NextResponse) {
  response.cookies.set({
    name: STATE_COOKIE,
    value: '',
    path: '/',
    maxAge: 0,
  });
}

export function clearOAuthContext(response: NextResponse) {
  response.cookies.set({
    name: CONTEXT_COOKIE,
    value: '',
    path: '/',
    maxAge: 0,
  });
}

export async function createSecondMeSessionFromCode(code: string) {
  const token = await exchangeSecondMeCode(code, getSecondMeRedirectUri());
  const user = await getSecondMeUserInfo(token.accessToken).catch(() => undefined);
  return createSession(token, user);
}

export async function ensureFreshSecondMeSession(session: SecondMeSession | null) {
  if (!session) {
    return { session: null, refreshed: false };
  }

  if (session.expiresAt > Date.now() + REFRESH_MARGIN_MS) {
    return { session, refreshed: false };
  }

  if (!session.refreshToken || !hasSecondMeCredentials()) {
    return { session: null, refreshed: false };
  }

  const token = await refreshSecondMeToken(session.refreshToken);
  return {
    session: createSession(token, session.user),
    refreshed: true,
  };
}
