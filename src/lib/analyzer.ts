import { PRESET_TOPICS, STARTUP_DIMENSIONS } from './constants';
import { getStartupAgentsForRuntime } from './real-agents';
import type { DilemmaAnalysis } from './types';

function topicLooksLikeStartup(question: string) {
  return /(创业|大厂|离职|辞职|字节|阿里|腾讯|公司|现金流|回撤)/i.test(question);
}

export async function analyzeDilemma(question: string): Promise<DilemmaAnalysis> {
  const topic = question.trim();
  const agents = getStartupAgentsForRuntime();

  if (topicLooksLikeStartup(topic)) {
    return {
      topic,
      dimensions: STARTUP_DIMENSIONS,
      agents,
      rationale: '优先拉出现金流、身份落差、关系代价和后撤成本四个维度，匹配三种最容易改变决策的真实后果。',
    };
  }

  const preset = PRESET_TOPICS.find((item) => item.prompt === topic);
  const requested = preset?.label ?? '当前问题';

  return {
    topic,
    dimensions: ['风险暴露', '现实约束', '长期后果'],
    agents,
    rationale: `${requested} 还没有单独的 Agent 组合，当前产品先用“大厂跳创业”主场景呈现 PathSplit 的核心体验。`,
  };
}
