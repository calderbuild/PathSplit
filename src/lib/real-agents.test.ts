import { afterEach, describe, expect, it } from 'vitest';
import {
  getStartupAgentsForRuntime,
  hasConfiguredRealAgent,
  listRealAgentStatuses,
} from './real-agents';

describe('real agent runtime', () => {
  afterEach(() => {
    delete process.env.SECONDME_AGENT_FOUNDER_REFRESH_TOKEN;
    delete process.env.SECONDME_AGENT_STAYED_REFRESH_TOKEN;
    delete process.env.SECONDME_AGENT_RETURNED_REFRESH_TOKEN;
  });

  it('marks agents as secondme when refresh tokens are configured', () => {
    process.env.SECONDME_AGENT_FOUNDER_REFRESH_TOKEN = 'rt_founder';

    const agents = getStartupAgentsForRuntime();

    expect(hasConfiguredRealAgent('founder-still-running')).toBe(true);
    expect(agents.find((agent) => agent.id === 'founder-still-running')?.memoryMode).toBe('secondme');
    expect(agents.find((agent) => agent.id === 'stayed-in-big-tech')?.memoryMode).toBe('mock');
  });

  it('reports slot status from env-backed tokens', () => {
    process.env.SECONDME_AGENT_RETURNED_REFRESH_TOKEN = 'rt_returned';

    const status = listRealAgentStatuses().find((item) => item.agentId === 'failed-and-returned');

    expect(status).toMatchObject({
      agentId: 'failed-and-returned',
      configured: true,
      source: 'env',
      memoryCount: 4,
    });
  });
});
