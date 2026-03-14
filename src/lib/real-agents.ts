import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import agentSeedsJson from '@/config/secondme-agent-seeds.json';
import { STARTUP_AGENTS } from './constants';
import { buildFollowupSystemPrompt, buildNarrativeSystemPrompt } from './narrative-prompts';
import {
  collectSecondMeChatReply,
  getSecondMeFollowupModel,
  ingestSecondMeAgentMemory,
  refreshSecondMeToken,
  streamSecondMeChat,
  type SecondMeAgentMemoryIngestPayload,
} from './secondme';
import type { AgentMeta } from './types';

interface RealAgentSeedMemory {
  objectId: string;
  actionLabel: string;
  displayText: string;
  contentPreview: string;
  importance: number;
  eventTime?: number;
}

interface RealAgentSeedConfig {
  agentId: string;
  refreshTokenEnv: string;
  memories: RealAgentSeedMemory[];
}

interface LocalAgentSlot {
  refreshToken: string;
  name?: string;
  updatedAt: number;
}

type LocalAgentSlotMap = Record<string, LocalAgentSlot>;

export interface RealAgentStatus {
  agentId: string;
  configured: boolean;
  source: 'env' | 'local' | 'none';
  slotName?: string;
  updatedAt?: number;
  memoryCount: number;
}

const SLOT_PATH = join(process.cwd(), '.pathsplit-agent-slots.local.json');
const agentSeeds = agentSeedsJson as RealAgentSeedConfig[];
const agentSeedMap = new Map(agentSeeds.map((entry) => [entry.agentId, entry]));

function shouldReadLocalSlots() {
  return process.env.NODE_ENV !== 'test' || process.env.PATHSPLIT_ENABLE_LOCAL_AGENT_SLOTS_IN_TEST === '1';
}

function readLocalSlots(): LocalAgentSlotMap {
  if (!shouldReadLocalSlots()) {
    return {};
  }

  if (!existsSync(SLOT_PATH)) {
    return {};
  }

  try {
    const raw = JSON.parse(readFileSync(SLOT_PATH, 'utf8')) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(raw).flatMap(([agentId, value]) => {
        if (!value || typeof value !== 'object') {
          return [];
        }

        const slot = value as Partial<LocalAgentSlot>;
        if (typeof slot.refreshToken !== 'string' || !slot.refreshToken.trim()) {
          return [];
        }

        return [
          [
            agentId,
            {
              refreshToken: slot.refreshToken,
              name: typeof slot.name === 'string' ? slot.name : undefined,
              updatedAt: typeof slot.updatedAt === 'number' ? slot.updatedAt : Date.now(),
            } satisfies LocalAgentSlot,
          ],
        ];
      }),
    );
  } catch {
    return {};
  }
}

function writeLocalSlots(slots: LocalAgentSlotMap) {
  writeFileSync(SLOT_PATH, `${JSON.stringify(slots, null, 2)}\n`, 'utf8');
}

function getSeed(agentId: string) {
  return agentSeedMap.get(agentId);
}

function getConfiguredSlot(agentId: string) {
  const seed = getSeed(agentId);
  if (!seed) {
    return null;
  }

  const envRefreshToken = process.env[seed.refreshTokenEnv];
  if (envRefreshToken) {
    return {
      refreshToken: envRefreshToken,
      source: 'env' as const,
      name: undefined,
      updatedAt: undefined,
    };
  }

  const local = readLocalSlots()[agentId];
  if (local) {
    return {
      refreshToken: local.refreshToken,
      source: 'local' as const,
      name: local.name,
      updatedAt: local.updatedAt,
    };
  }

  return null;
}

function buildMemoryPayload(agentId: string, memory: RealAgentSeedMemory): SecondMeAgentMemoryIngestPayload {
  const hash = createHash('sha256').update(memory.contentPreview).digest('hex');

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
          hash: `sha256:${hash}`,
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

export function isSupportedRealAgentId(agentId: string) {
  return agentSeedMap.has(agentId);
}

export function canConfigureLocalAgentSlots() {
  return process.env.NODE_ENV !== 'production';
}

export function saveRealAgentSlot(agentId: string, refreshToken: string, name?: string) {
  if (!isSupportedRealAgentId(agentId)) {
    throw new Error('Unknown agent slot.');
  }

  if (!canConfigureLocalAgentSlots()) {
    throw new Error('Agent slot capture is only available in local development.');
  }

  const slots = readLocalSlots();
  slots[agentId] = {
    refreshToken,
    name,
    updatedAt: Date.now(),
  };
  writeLocalSlots(slots);
}

export function listRealAgentStatuses(): RealAgentStatus[] {
  return STARTUP_AGENTS.map((agent) => {
    const seed = getSeed(agent.id);
    const configured = getConfiguredSlot(agent.id);

    return {
      agentId: agent.id,
      configured: Boolean(configured),
      source: configured?.source ?? 'none',
      slotName: configured?.name,
      updatedAt: configured?.updatedAt,
      memoryCount: seed?.memories.length ?? 0,
    } satisfies RealAgentStatus;
  });
}

export function hasConfiguredRealAgent(agentId: string) {
  return Boolean(getConfiguredSlot(agentId));
}

export function getStartupAgentsForRuntime() {
  return STARTUP_AGENTS.map<AgentMeta>((agent) => ({
    ...agent,
    memoryMode: hasConfiguredRealAgent(agent.id) ? 'secondme' : 'mock',
  }));
}

async function getAccessTokenForAgent(agentId: string) {
  const slot = getConfiguredSlot(agentId);
  if (!slot) {
    throw new Error(`No configured refresh token for ${agentId}.`);
  }

  return refreshSecondMeToken(slot.refreshToken);
}

export async function seedRealAgentMemories(agentId: string) {
  const seed = getSeed(agentId);
  if (!seed) {
    throw new Error('Unknown agent seed.');
  }

  const token = await getAccessTokenForAgent(agentId);
  let seeded = 0;

  for (const memory of seed.memories) {
    await ingestSecondMeAgentMemory(token.accessToken, buildMemoryPayload(agentId, memory));
    seeded += 1;
  }

  return {
    seeded,
    total: seed.memories.length,
  };
}

export async function streamRealAgentNarrative(agent: AgentMeta, question: string, dimensions: string[]) {
  const token = await getAccessTokenForAgent(agent.id);
  return streamSecondMeChat(token.accessToken, {
    message: question,
    systemPrompt: buildNarrativeSystemPrompt(agent, question, dimensions),
  });
}

export async function askRealAgentFollowup(agent: AgentMeta, question: string) {
  const token = await getAccessTokenForAgent(agent.id);
  return collectSecondMeChatReply(token.accessToken, {
    message: question,
    model: getSecondMeFollowupModel(),
    systemPrompt: buildFollowupSystemPrompt(agent),
  });
}

export async function streamRealAgentFollowup(agent: AgentMeta, question: string) {
  const token = await getAccessTokenForAgent(agent.id);
  return streamSecondMeChat(token.accessToken, {
    message: question,
    model: getSecondMeFollowupModel(),
    systemPrompt: buildFollowupSystemPrompt(agent),
  });
}
