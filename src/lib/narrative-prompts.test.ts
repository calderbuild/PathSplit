import { describe, expect, it } from 'vitest';
import { STARTUP_AGENTS } from './constants';
import {
  buildFollowupSystemPrompt,
  buildNarrativeSystemPrompt,
  getFewShotReference,
  getPersonaVoiceGuide,
  getPromptBlacklist,
} from './narrative-prompts';

describe('narrative prompt builders', () => {
  it('injects blacklist, dimensions, and few-shot reference into narrative prompts', () => {
    const agent = STARTUP_AGENTS[0];
    const prompt = buildNarrativeSystemPrompt(agent, '30 岁要不要跳去创业？', ['现金流', '身份落差']);

    expect(prompt).toContain('现金流、身份落差');
    expect(prompt).toContain(getFewShotReference().question);
    expect(prompt).toContain('绝对禁止这些词或句式');
    expect(prompt).toContain(getPromptBlacklist()[0]);
    expect(prompt).toContain(getPersonaVoiceGuide(agent.id)[0]);
  });

  it('keeps follow-up prompts short, direct, and persona-specific', () => {
    const agent = STARTUP_AGENTS[2];
    const prompt = buildFollowupSystemPrompt(agent);

    expect(prompt).toContain('180 到 320 个中文字符');
    expect(prompt).toContain('不要把自己写成导师');
    expect(prompt).toContain(getPersonaVoiceGuide(agent.id)[0]);
    expect(prompt).toContain(getPromptBlacklist()[0]);
  });
});
