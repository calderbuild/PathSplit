import type { AgentMeta, PresetTopic } from './types';

export const PRODUCT_MESSAGING = {
  badge: '反事实社交匹配',
  tagline: '你没走的路上，有人在等你',
  description: 'PathSplit 是一个 A2A 人生决策产品。先看三条平行人生路径，再通过岔路口对话找到走过另一条路的真人。',
};

export const PRESET_TOPICS: PresetTopic[] = [
  {
    id: 'startup-main',
    label: '大厂跳创业',
    prompt: '30 岁要不要从大厂跳去创业？我担心现金流、身份落差和失败后的回撤。',
    stage: 'mvp',
    note: '主场景，叙事质量已针对这个问题打磨。',
  },
  {
    id: 'career-switch',
    label: '非 CS 转程序员',
    prompt: '非 CS 专业转行做程序员现实吗？',
    stage: 'later',
    note: '非 MVP，仅展示产品广度。',
  },
  {
    id: 'overseas',
    label: '去海外工作',
    prompt: '要不要去日本或者美国工作？',
    stage: 'later',
    note: '非 MVP，仅展示产品广度。',
  },
  {
    id: 'grad-school',
    label: '读研还是工作',
    prompt: '读研和直接工作，哪条路更适合现在的我？',
    stage: 'later',
    note: '非 MVP，仅展示产品广度。',
  },
  {
    id: 'gap-year',
    label: '裸辞去旅行',
    prompt: '裸辞去旅行一年值得吗？',
    stage: 'later',
    note: '非 MVP，仅展示产品广度。',
  },
];

export const STARTUP_AGENTS: AgentMeta[] = [
  {
    id: 'founder-still-running',
    label: '创业第 3 年，还在硬扛',
    theme: 'from-amber-500 to-orange-700',
    memoryMode: 'mock',
    persona: {
      name: '张明',
      age: 31,
      background: '前字节跳动增长产品经理，28 岁和大学室友一起做企业服务创业',
      currentState: '公司 12 人，月流水刚过 90 万，现金流仍然紧',
      tone: '务实、疲惫、会说 burn rate 和 PMF',
    },
  },
  {
    id: 'stayed-in-big-tech',
    label: '留在大厂，升成总监',
    theme: 'from-sky-500 to-indigo-700',
    memoryMode: 'mock',
    persona: {
      name: '李岚',
      age: 33,
      background: '前阿里中台负责人，反复考虑创业后选择继续留在体系内',
      currentState: '现在是业务线总监，手上有期权和团队稳定性',
      tone: '克制、清醒、数字敏感',
    },
  },
  {
    id: 'failed-and-returned',
    label: '创业失败，回到大厂',
    theme: 'from-rose-500 to-red-700',
    memoryMode: 'mock',
    persona: {
      name: '周舟',
      age: 32,
      background: '前腾讯技术专家，辞职后做 AI 教育项目，18 个月后关停',
      currentState: '重新回到大厂，负责新业务孵化',
      tone: '坦白、有点自嘲，但不鸡汤',
    },
  },
];

export const STARTUP_DIMENSIONS = ['现金流', '身份落差', '关系代价', '后撤成本'];
