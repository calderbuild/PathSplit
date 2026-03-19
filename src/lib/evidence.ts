import type { AgentMeta, EvidenceCard } from './types';

function extractNumbers(content: string) {
  const matches = content.match(/\d+\s*(?:万|k|个月|人|天|年)/g);
  return matches?.slice(0, 3) ?? [];
}

function firstSentence(content: string) {
  return content.split(/(?<=。|！|？)/)[0]?.trim() ?? content;
}

function lastSentence(content: string) {
  const sentences = content.split(/(?<=。|！|？)/).map((item) => item.trim()).filter(Boolean);
  return sentences.at(-1) ?? content;
}

function extractIfAgain(content: string) {
  const match = content.match(/如果重来(?:一次)?，?([^。！？]+)/);
  return match ? match[1].trim() : '他没有直接回答这个问题。';
}

export function generateEvidenceCard(topic: string, agents: AgentMeta[], narratives: Map<string, string>): EvidenceCard {
  const paths = agents.map((agent) => {
    const content = narratives.get(agent.id) ?? '';
    return {
      agentId: agent.id,
      label: agent.label,
      keyDecision: firstSentence(content),
      outcome: lastSentence(content),
      keyNumbers: extractNumbers(content),
      ifAgain: extractIfAgain(content),
    };
  });

  return {
    topic,
    summary: '三条路径没有哪条天然正确，但每条都把”代价”说得更具体了。',
    paths,
    generatedAt: new Date().toISOString(),
  };
}

export function extractNarrativeSummary(content: string): string {
  const sentences = content.split(/(?<=。|！|？)/).map((s) => s.trim()).filter(Boolean);
  if (sentences.length <= 2) {
    return content;
  }
  return sentences.slice(0, 2).join('') + '...';
}
