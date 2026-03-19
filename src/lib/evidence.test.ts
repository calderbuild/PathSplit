import { describe, expect, it } from 'vitest';
import { STARTUP_AGENTS } from './constants';
import { generateEvidenceCard } from './evidence';

describe('generateEvidenceCard', () => {
  it('extracts path evidence from narratives', () => {
    const narratives = new Map([
      [
        'founder-still-running',
        '2023 年我离职创业，手里只剩 11 万。后来公司账上只够活 47 天。如果重来一次，我还是会走。',
      ],
      [
        'stayed-in-big-tech',
        '我带着 40 人团队留在大厂。2024 年拿到晋升。如果重来，我还是会先把可退的路铺宽。',
      ],
      [
        'failed-and-returned',
        '创业 18 个月后我关掉公司，账上只剩 23 万。如果重来，我会更早验证销售。',
      ],
    ]);

    const card = generateEvidenceCard('要不要创业？', STARTUP_AGENTS, narratives);

    expect(card.paths).toHaveLength(3);
    expect(card.paths[0]?.keyNumbers).toContain('11 万');
    expect(card.paths[0]?.ifAgain).toBe('我还是会走');
    expect(card.summary).toContain('代价');
  });
});
