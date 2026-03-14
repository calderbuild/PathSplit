import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = process.cwd();
const slotPath = join(rootDir, '.pathsplit-agent-slots.local.json');
const configPath = join(rootDir, 'src/config/secondme-agent-seeds.json');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function readSlots() {
  if (!existsSync(slotPath)) {
    return {};
  }

  return readJson(slotPath);
}

function getApiBase() {
  return process.env.SECONDME_API_BASE || 'https://api.mindverse.com/gate/lab';
}

async function refreshAccessToken(refreshToken) {
  const payload = new URLSearchParams({
    client_id: process.env.SECONDME_CLIENT_ID || '',
    client_secret: process.env.SECONDME_CLIENT_SECRET || '',
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch(`${getApiBase()}/api/oauth/token/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload,
  });

  const json = await response.json().catch(() => null);
  if (!response.ok || !json || json.code !== 0 || !json.data?.accessToken) {
    throw new Error(json?.message || `Failed to refresh token (${response.status})`);
  }

  return json.data.accessToken;
}

function buildPayload(agentId, memory) {
  const contentHash = createHash('sha256').update(memory.contentPreview).digest('hex');

  return {
    channel: {
      kind: 'thread',
      id: `pathsplit-${agentId}`,
      meta: {
        app: 'pathsplit',
        scenario: 'parallel-lives',
      },
    },
    action: 'post_created',
    actionLabel: memory.actionLabel,
    displayText: memory.displayText,
    eventDesc: `PathSplit seeded memory for ${agentId}`,
    eventTime: memory.eventTime,
    importance: memory.importance,
    idempotencyKey: createHash('sha256')
      .update(`${agentId}:${memory.objectId}:${memory.contentPreview}`)
      .digest('hex'),
    refs: [
      {
        objectType: 'thread',
        objectId: memory.objectId,
        contentPreview: memory.contentPreview,
        snapshot: {
          text: memory.contentPreview,
          capturedAt: memory.eventTime,
          hash: `sha256:${contentHash}`,
        },
      },
    ],
    payload: {
      source: 'pathsplit',
      topic: 'startup',
      agentId,
    },
  };
}

async function ingest(accessToken, agentId, memory) {
  const response = await fetch(`${getApiBase()}/api/secondme/agent_memory/ingest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildPayload(agentId, memory)),
  });

  const json = await response.json().catch(() => null);
  if (!response.ok || !json || json.code !== 0) {
    throw new Error(json?.message || `Failed to ingest memory (${response.status})`);
  }
}

async function main() {
  if (!process.env.SECONDME_CLIENT_ID || !process.env.SECONDME_CLIENT_SECRET) {
    throw new Error('Missing SECONDME_CLIENT_ID / SECONDME_CLIENT_SECRET.');
  }

  const configs = readJson(configPath);
  const slots = readSlots();

  for (const config of configs) {
    const refreshToken =
      process.env[config.refreshTokenEnv] || slots[config.agentId]?.refreshToken;

    if (!refreshToken) {
      console.log(`skip ${config.agentId}: no refresh token configured`);
      continue;
    }

    const accessToken = await refreshAccessToken(refreshToken);
    for (const memory of config.memories) {
      await ingest(accessToken, config.agentId, memory);
    }

    console.log(`seeded ${config.agentId}: ${config.memories.length} memories`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
