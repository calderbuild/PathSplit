import type { AgentMeta, CrossroadProfile, CrossroadMatch } from './types';

const profiles = new Map<string, CrossroadProfile>();

/** 种子画像 - 启动时预置 */
const SEED_PROFILES: CrossroadProfile[] = [
  {
    userId: 'seed-001',
    topic: '应该离开大厂去创业吗',
    resonatedPath: '创业第 3 年，还在硬扛',
    fearedPath: '创业失败，回到大厂',
    currentSide: 'left',
    keyEmotions: ['焦虑', '兴奋'],
    userReflection: '我最共鸣创业者那条路，因为我也在考虑离开大厂。但看到失败回归的经历，我又开始担心自己是不是高估了自己的能力。',
    narrativeSummaries: {
      'founder-still-running': '2023 年 3 月离职创业，现在公司 12 人，月流水 90 万但现金流紧张',
      'stayed-in-big-tech': '29 岁差点辞职，最后选择留在阿里，现在是业务线总监',
      'failed-and-returned': '离开腾讯创业 18 个月后关停，重新回到大厂负责新业务孵化',
    },
    createdAt: Date.now() - 86400000,
  },
  {
    userId: 'seed-002',
    topic: '30 岁要不要从大厂跳去创业',
    resonatedPath: '留在大厂，升成总监',
    fearedPath: '创业第 3 年，还在硬扛',
    currentSide: 'stayed',
    keyEmotions: ['后悔', '安全感'],
    userReflection: '李岚说的"把勇气折现成年终奖"戳中了我。我不是不敢走，是还没想清楚到底要什么。',
    narrativeSummaries: {
      'founder-still-running': '2023 年 3 月离职创业，现在公司 12 人，月流水 90 万但现金流紧张',
      'stayed-in-big-tech': '29 岁差点辞职，最后选择留在阿里，现在是业务线总监',
      'failed-and-returned': '离开腾讯创业 18 个月后关停，重新回到大厂负责新业务孵化',
    },
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    userId: 'seed-003',
    topic: '大厂跳创业',
    resonatedPath: '创业失败，回到大厂',
    fearedPath: '创业第 3 年，还在硬扛',
    currentSide: 'considering',
    keyEmotions: ['面子', '时间成本'],
    userReflection: '周舟的"面子不是最贵的，时间才是"让我重新思考。也许先验证再辞职才是更聪明的路。',
    narrativeSummaries: {
      'founder-still-running': '2023 年 3 月离职创业，现在公司 12 人，月流水 90 万但现金流紧张',
      'stayed-in-big-tech': '29 岁差点辞职，最后选择留在阿里，现在是业务线总监',
      'failed-and-returned': '离开腾讯创业 18 个月后关停，重新回到大厂负责新业务孵化',
    },
    createdAt: Date.now() - 86400000 * 1,
  },
];

export function seedDemoProfiles() {
  SEED_PROFILES.forEach((p) => profiles.set(p.userId, p));
}

export function storeProfile(profile: CrossroadProfile) {
  profiles.set(profile.userId, profile);
}

export function findCounterfactualMatch(profile: CrossroadProfile): CrossroadMatch | null {
  const oppositeMap: Record<string, string[]> = {
    stayed: ['left', 'considering'],
    left: ['stayed', 'returned'],
    considering: ['stayed', 'left'],
    returned: ['left'],
  };

  const oppositeSides = oppositeMap[profile.currentSide] ?? [];

  const candidates = Array.from(profiles.values()).filter(
    (p) =>
      p.userId !== profile.userId &&
      p.topic === profile.topic &&
      oppositeSides.includes(p.currentSide)
  );

  if (candidates.length === 0) {
    return null;
  }

  const scored = candidates.map((candidate) => {
    let score = 0;

    if (candidate.resonatedPath === profile.fearedPath) score += 40;
    if (candidate.fearedPath === profile.resonatedPath) score += 40;

    const sharedEmotions = profile.keyEmotions.filter((e) =>
      candidate.keyEmotions.includes(e)
    );
    score += sharedEmotions.length * 5;

    return { candidate, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  if (!best || best.score < 20) {
    return null;
  }

  const matchReason = buildMatchReason(profile, best.candidate);

  return {
    matchedUserId: best.candidate.userId,
    matchedProfile: best.candidate,
    matchReason,
    symmetryScore: best.score,
  };
}

function buildMatchReason(user: CrossroadProfile, matched: CrossroadProfile): string {
  const reasons: string[] = [];

  if (matched.resonatedPath === user.fearedPath) {
    reasons.push(`TA 选择了你最担心的路径（${user.fearedPath}）`);
  }

  if (matched.fearedPath === user.resonatedPath) {
    reasons.push(`TA 最担心的恰好是你共鸣的路径（${user.resonatedPath}）`);
  }

  const sharedEmotions = user.keyEmotions.filter((e) =>
    matched.keyEmotions.includes(e)
  );
  if (sharedEmotions.length > 0) {
    reasons.push(`你们都经历过：${sharedEmotions.join('、')}`);
  }

  return reasons.join('；');
}

export function searchZhihu(topic: string): { title: string; url: string; excerpt: string; author: string }[] {
  return [
    {
      title: '从大厂跳出来创业一年后，我想说的几件事',
      url: 'https://www.zhihu.com/question/mock-1',
      excerpt: '离开字节后做了 18 个月 SaaS，最大的感受是现金流焦虑比想象中更持久...',
      author: '匿名用户',
    },
    {
      title: '30 岁还在大厂，是不是就没机会创业了？',
      url: 'https://www.zhihu.com/question/mock-2',
      excerpt: '我 32 岁才从阿里出来，现在公司 15 人，年营收刚过千万。晚不晚取决于你准备了什么...',
      author: '李明',
    },
    {
      title: '创业失败后回大厂，是一种什么体验？',
      url: 'https://www.zhihu.com/question/mock-3',
      excerpt: '第一周确实有点尴尬，但很快发现没人在意。最大的收获是知道了什么叫低成本验证...',
      author: '周舟',
    },
  ];
}
