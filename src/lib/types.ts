export type AgentState = 'waiting' | 'streaming' | 'done' | 'error';

export interface Persona {
  name: string;
  age: number;
  background: string;
  currentState: string;
  tone: string;
}

/** Agent 元信息 */
export interface AgentMeta {
  id: string;
  label: string;
  persona: Persona;
  theme: string;
  memoryMode: 'mock' | 'secondme';
}

export interface PresetTopic {
  id: string;
  label: string;
  prompt: string;
  stage: 'mvp' | 'later';
  note: string;
}

/** 困惑分析结果 */
export interface DilemmaAnalysis {
  topic: string;
  dimensions: string[];
  agents: AgentMeta[];
  rationale: string;
}

export interface NarrativePath {
  agentId: string;
  label: string;
  keyDecision: string;
  outcome: string;
  keyNumbers: string[];
  ifAgain: string;
}

/** 平行人生证据卡 */
export interface EvidenceCard {
  topic: string;
  summary: string;
  paths: NarrativePath[];
  generatedAt: string;
}

export interface SafetyResult {
  allowed: boolean;
  reason?: string;
}

export interface FollowupResponse {
  answer: string;
  mode: 'mock' | 'secondme';
}

export interface FollowupStreamHandlers {
  onMode?: (mode: 'mock' | 'secondme') => void;
  onChunk?: (chunk: string) => void;
}

export type FollowupStreamEvent =
  | { type: 'meta'; data: { mode: 'mock' | 'secondme' } }
  | { type: 'chunk'; data: { content: string } }
  | { type: 'done' }
  | { type: 'error'; data: { message: string } };

export interface SecondMeSessionStatus {
  available: boolean;
  connected: boolean;
  expiresAt?: number;
  scope: string[];
  user?: {
    name?: string;
    bio?: string;
    avatar?: string;
  };
}

export interface AgentSlotStatus {
  agentId: string;
  configured: boolean;
  source: 'env' | 'local' | 'none';
  slotName?: string;
  updatedAt?: number;
  memoryCount: number;
}

/** SSE 事件类型 */
export type SSEEvent =
  | { type: 'session'; data: { topic: string; dimensions: string[]; rationale: string; agents: AgentMeta[] } }
  | { type: 'agent_start'; data: { agentId: string; label: string } }
  | { type: 'agent_chunk'; data: { agentId: string; content: string } }
  | { type: 'agent_done'; data: { agentId: string } }
  | { type: 'agent_error'; data: { agentId: string; message: string } }
  | { type: 'evidence_card'; data: EvidenceCard }
  | { type: 'done' }
  | { type: 'error'; data: { message: string } };

export interface AgentCardState {
  meta: AgentMeta;
  status: AgentState;
  content: string;
  error?: string;
}
