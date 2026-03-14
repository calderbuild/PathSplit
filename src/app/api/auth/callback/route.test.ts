import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { createSecondMeSessionFromCode } = vi.hoisted(() => ({
  createSecondMeSessionFromCode: vi.fn(),
}));

vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
  return {
    ...actual,
    createSecondMeSessionFromCode,
  };
});

import { GET } from './route';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  createSecondMeSessionFromCode.mockReset();
  vi.restoreAllMocks();
});

function encodedContext(source: string) {
  return encodeURIComponent(
    JSON.stringify({
      source,
      startedAt: Date.now() - 1200,
    }),
  );
}

describe('GET /api/auth/callback', () => {
  it('writes session and carries the auth source on success', async () => {
    createSecondMeSessionFromCode.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      scope: ['user.info', 'chat'],
      expiresAt: Date.now() + 60_000,
      user: {
        name: 'PathSplit Tester',
      },
    });

    const request = new NextRequest('https://pathsplit.app/api/auth/callback?code=auth-code&state=good-state', {
      headers: {
        cookie: [
          'pathsplit_secondme_state=good-state',
          `pathsplit_secondme_oauth_context=${encodedContext('evidence-card')}`,
        ].join('; '),
      },
    });

    const response = await GET(request);
    const location = new URL(response.headers.get('location') ?? '');

    expect(createSecondMeSessionFromCode).toHaveBeenCalledWith('auth-code');
    expect(location.pathname).toBe('/');
    expect(location.searchParams.get('auth')).toBe('connected');
    expect(location.searchParams.get('auth_source')).toBe('evidence-card');
    expect(response.cookies.get('pathsplit_secondme_session')?.value).toBeTruthy();
    expect(response.cookies.get('pathsplit_secondme_state')?.value).toBe('');
    expect(response.cookies.get('pathsplit_secondme_oauth_context')?.value).toBe('');
  });

  it('fails closed on invalid production state', async () => {
    const request = new NextRequest('https://pathsplit.app/api/auth/callback?code=auth-code&state=wrong-state', {
      headers: {
        cookie: [
          'pathsplit_secondme_state=good-state',
          `pathsplit_secondme_oauth_context=${encodedContext('hero')}`,
        ].join('; '),
      },
    });

    const response = await GET(request);
    const location = new URL(response.headers.get('location') ?? '');

    expect(createSecondMeSessionFromCode).not.toHaveBeenCalled();
    expect(location.pathname).toBe('/');
    expect(location.searchParams.get('auth')).toBe('failed-state');
    expect(location.searchParams.get('auth_source')).toBe('hero');
    expect(response.cookies.get('pathsplit_secondme_session')?.value).toBe('');
  });
});
