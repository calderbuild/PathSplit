import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe('GET /api/auth/login', () => {
  it('starts OAuth and persists login source context', () => {
    process.env.SECONDME_CLIENT_ID = 'test-client';
    process.env.SECONDME_CLIENT_SECRET = 'test-secret';
    process.env.SECONDME_REDIRECT_URI = 'https://pathsplit.app/api/auth/callback';
    process.env.SECONDME_OAUTH_SCOPES = 'user.info,chat';

    const response = GET(new NextRequest('https://pathsplit.app/api/auth/login?source=evidence-card'));
    const location = new URL(response.headers.get('location') ?? '');
    const contextCookie = response.cookies.get('pathsplit_secondme_oauth_context');

    expect(response.status).toBe(307);
    expect(location.origin + location.pathname).toContain('/oauth');
    expect(location.searchParams.get('client_id')).toBe('test-client');
    expect(location.searchParams.get('redirect_uri')).toBe('https://pathsplit.app/api/auth/callback');
    expect(location.searchParams.get('state')).toBeTruthy();
    expect(response.cookies.get('pathsplit_secondme_state')?.value).toBeTruthy();
    expect(contextCookie).toBeTruthy();
    expect(JSON.parse(decodeURIComponent(contextCookie?.value ?? '{}'))).toMatchObject({
      source: 'evidence-card',
    });
  });

  it('redirects home when OAuth config is missing', () => {
    delete process.env.SECONDME_CLIENT_ID;
    delete process.env.SECONDME_CLIENT_SECRET;

    const response = GET(new NextRequest('https://pathsplit.app/api/auth/login?source=hero'));
    const location = new URL(response.headers.get('location') ?? '');

    expect(response.status).toBe(307);
    expect(location.pathname).toBe('/');
    expect(location.searchParams.get('auth')).toBe('misconfigured');
  });
});
