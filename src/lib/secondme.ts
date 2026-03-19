const DEFAULT_SECONDME_BASE = 'https://api.mindverse.com/gate/lab';
const DEFAULT_SECONDME_OAUTH_AUTHORIZE = 'https://go.second.me/oauth/';
const DEFAULT_SECONDME_FOLLOWUP_MODEL = 'google_ai_studio/gemini-2.0-flash';

interface SecondMeEnvelope<T> {
  code: number;
  data?: T;
  message?: string;
}

export interface SecondMeTokenPayload {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string[];
}

export interface SecondMeUserProfile {
  name?: string;
  bio?: string;
  avatar?: string;
}

export interface SecondMeChatRequest {
  message: string;
  sessionId?: string;
  model?: string;
  systemPrompt?: string;
  enableWebSearch?: boolean;
}

export interface SecondMeAgentMemoryIngestPayload {
  channel: {
    kind: string;
    id?: string;
    url?: string;
    meta?: Record<string, unknown>;
  };
  action: string;
  refs: Array<{
    objectType: string;
    objectId: string;
    type?: string;
    url?: string;
    contentPreview?: string;
    snapshot?: {
      text: string;
      capturedAt?: number;
      hash?: string;
    };
  }>;
  actionLabel?: string;
  displayText?: string;
  eventDesc?: string;
  eventTime?: number;
  importance?: number;
  idempotencyKey?: string;
  payload?: Record<string, unknown>;
}

function normalizeScope(scope: unknown) {
  if (Array.isArray(scope)) {
    return scope.filter((item): item is string => typeof item === 'string');
  }

  if (typeof scope === 'string') {
    return scope
      .split(/[,\s]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function buildFormPayload(values: Record<string, string>) {
  const payload = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    payload.set(key, value);
  }

  return payload;
}

async function readEnvelope<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as SecondMeEnvelope<T> | null;

  if (!response.ok || !payload || payload.code !== 0 || !payload.data) {
    throw new Error(payload?.message ?? 'SecondMe request failed.');
  }

  return payload.data;
}

async function ensureEnvelopeSuccess<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as SecondMeEnvelope<T> | null;

  if (!response.ok || !payload || payload.code !== 0) {
    throw new Error(payload?.message ?? 'SecondMe request failed.');
  }

  return payload.data ?? null;
}

export function getSecondMeApiBase() {
  return process.env.SECONDME_API_BASE || DEFAULT_SECONDME_BASE;
}

export function getSecondMeAuthorizationBase() {
  return process.env.SECONDME_OAUTH_AUTHORIZE_URL || DEFAULT_SECONDME_OAUTH_AUTHORIZE;
}

export function getDemoMode() {
  return process.env.NEXT_PUBLIC_PATHSPLIT_DEMO_MODE || 'mock';
}

export function getSecondMeFollowupModel() {
  return process.env.SECONDME_FOLLOWUP_MODEL || DEFAULT_SECONDME_FOLLOWUP_MODEL;
}

export function hasSecondMeCredentials() {
  return Boolean(process.env.SECONDME_CLIENT_ID && process.env.SECONDME_CLIENT_SECRET);
}

export async function exchangeSecondMeCode(code: string, redirectUri: string) {
  if (!hasSecondMeCredentials()) {
    throw new Error('SecondMe OAuth is not configured.');
  }

  const response = await fetch(`${getSecondMeApiBase()}/api/oauth/token/code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: buildFormPayload({
      client_id: process.env.SECONDME_CLIENT_ID ?? '',
      client_secret: process.env.SECONDME_CLIENT_SECRET ?? '',
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const data = await readEnvelope<{
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    scope?: string[] | string;
  }>(response);

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    tokenType: data.tokenType,
    expiresIn: data.expiresIn,
    scope: normalizeScope(data.scope),
  } satisfies SecondMeTokenPayload;
}

export async function refreshSecondMeToken(refreshToken: string) {
  if (!hasSecondMeCredentials()) {
    throw new Error('SecondMe OAuth is not configured.');
  }

  const response = await fetch(`${getSecondMeApiBase()}/api/oauth/token/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: buildFormPayload({
      client_id: process.env.SECONDME_CLIENT_ID ?? '',
      client_secret: process.env.SECONDME_CLIENT_SECRET ?? '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await readEnvelope<{
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    scope?: string[] | string;
  }>(response);

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    tokenType: data.tokenType,
    expiresIn: data.expiresIn,
    scope: normalizeScope(data.scope),
  } satisfies SecondMeTokenPayload;
}

export async function getUserShades(accessToken: string) {
  const response = await fetch(`${getSecondMeApiBase()}/api/secondme/user/shades`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await readEnvelope<{
    shades: Array<{
      shadeName: string;
      shadeContent: string;
      sourceTopics: string[];
      confidenceLevel: string;
      hasPublicContent: boolean;
    }>;
  }>(response);

  return data.shades.filter((s) => s.hasPublicContent);
}

export async function getSecondMeUserInfo(accessToken: string) {
  const response = await fetch(`${getSecondMeApiBase()}/api/secondme/user/info`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await readEnvelope<Record<string, unknown>>(response);

  return {
    name: typeof data.name === 'string' ? data.name : undefined,
    bio: typeof data.bio === 'string' ? data.bio : undefined,
    avatar: typeof data.avatar === 'string' ? data.avatar : undefined,
  } satisfies SecondMeUserProfile;
}

export function extractSecondMeContent(frame: string) {
  const line = frame
    .split('\n')
    .find((item) => item.startsWith('data:'));

  if (!line) {
    return null;
  }

  const raw = line.slice(5).trim();
  if (!raw || raw === '[DONE]') {
    return null;
  }

  try {
    const payload = JSON.parse(raw) as {
      choices?: Array<{
        delta?: {
          content?: string;
        };
      }>;
    };

    return payload.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}

export async function* streamSecondMeChat(accessToken: string, request: SecondMeChatRequest) {
  const response = await fetch(`${getSecondMeApiBase()}/api/secondme/chat/stream`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || 'SecondMe chat failed.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';

    for (const frame of frames) {
      const content = extractSecondMeContent(frame);
      if (content) {
        yield content;
      }
    }
  }
}

export async function collectSecondMeChatReply(
  accessToken: string,
  message: string | SecondMeChatRequest,
) {
  let answer = '';

  for await (const chunk of streamSecondMeChat(
    accessToken,
    typeof message === 'string' ? { message } : message,
  )) {
    answer += chunk;
  }

  return answer.trim() || 'SecondMe 暂时没有返回内容。';
}

export async function ingestSecondMeAgentMemory(
  accessToken: string,
  payload: SecondMeAgentMemoryIngestPayload,
) {
  const response = await fetch(`${getSecondMeApiBase()}/api/secondme/agent_memory/ingest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return ensureEnvelopeSuccess<Record<string, unknown>>(response);
}
