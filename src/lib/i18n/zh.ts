import type { Translations } from './en';

export const zh: Translations = {
  hero: {
    badge: 'PathSplit 产品',
    badgeSub: '知乎 x Second Me 黑客松作品',
    title: ['把人生决策，', '从搜索结果', '升级成可追问的', '真人网络。'],
    description:
      'PathSplit 是一个人生决策产品。你先看到三条平行人生路径，再把证据卡接入自己的 SecondMe，把问题继续问深一层。',
  },

  editorial: {
    kicker: '产品视角',
    body: '它不是一个给建议的问答页，而是一条更像产品主流程的决策体验: 先展开三条人生路径，再把证据卡接入真人网络，继续追问真实分身。',
    whoFor: { label: '适合谁', body: '正在权衡大厂、创业、回撤成本的人。' },
    whatYouGet: { label: '你会得到什么', body: '三条路径、一张证据卡、一次真人继续追问。' },
  },

  stats: {
    scene: { label: '产品主场景', value: '大厂跳创业' },
    perspectives: { label: '并行视角', value: '3 条人生路径' },
    network: { label: '真人网络', value: 'OAuth 继续追问' },
  },

  input: {
    kicker: '问题输入',
    title: '把一个纠结说具体一点',
    description:
      '这个产品当前优先打磨「大厂跳创业」场景。其他预设问题用于展示 PathSplit 的产品结构，但不会像主场景一样深入。',
    explorePill: '先 explore，再决定要不要连真人分身',
    noOauthPill: '当前环境仅开放基础产品体验',
    oauthConnected: 'SecondMe 已连接，结果后可直接真人追问',
    oauthConnect: '连接 SecondMe，计入 OAuth 授权登录',
    fieldLabel: '你的问题',
    placeholder:
      '例如：我在大厂做产品第 6 年，年薪还行，但越来越像在维护别人的增量。我想创业，可我还背着房贷。',
    submitIdle: '开始展开人生路径',
    submitLoading: '正在展开三条路径...',
    helperText: '我们会先返回 3 条路径，而不是 1 个答案；证据卡出来后再引导真人追问。',
  },

  presets: {
    'startup-main': '大厂跳创业',
    'career-switch': '非 CS 转程序员',
    overseas: '去海外工作',
    'grad-school': '读研还是工作',
    'gap-year': '裸辞去旅行',
  } as Record<string, string>,

  card: {
    waiting: '等待生成',
    streaming: '正在展开',
    done: '已完成',
    error: '暂不可用',
    followUp: '继续追问',
    askButton: '追问这个视角',
    askingButton: '追问中...',
    defaultDraft: '创业最难熬的时刻是什么？',
    mockMode: '非实时路径资料',
    realMode: '已授权真人分身',
    mockReply: 'PathSplit 资料回复',
    realReply: 'SecondMe 实时回复',
  },

  safety: {
    mock: 'PathSplit 路径资料 | 非实时真人，基于真实经历整理',
    real: 'SecondMe 真人分身 | 已授权连接，实时生成',
  },

  narrative: {
    kicker: '决策拆解',
    chip: '3 条路径并行展开',
  },

  evidence: {
    kicker: '平行人生证据卡',
    ifAgainLabel: '如果重来',
  },

  oauth: {
    kicker: '下一步',
    titleConnected: '把这张证据卡同步给你的真人分身',
    titleDisconnected: '连接 SecondMe，把 PathSplit 接入真人网络',
    descConnected:
      '上面的三条路径里，已授权真人分身与非实时路径资料会混合存在。下一步不是继续看样本，而是把这张证据卡和你的真实处境一起问给自己的 SecondMe。',
    descDisconnected:
      '你已经看到了 3 条平行人生线。现在连接 SecondMe，可以把这次体验计入 OAuth 授权登录，并继续追问真人分身。',
    step1: '你的 SecondMe 分身会读取你的真实记忆，生成专属于你的反应——不是泛泛而谈。',
    step2: '3 个 persona 会直接回应你的处境，岔路口对话因人而异。',
    step3Connected: '现在直接把证据卡同步进真人链路，继续追问你自己的分身。',
    step3Disconnected: '这次决策体验会写入你的 AI 分身记忆，下次它会记得你面对过这个岔路口。',
    ctaConnected: '用这张证据卡继续问我的 SecondMe',
    ctaConnectedHelper: '会自动把建议问题填进真人能力区。',
    ctaDisconnected: '让我的分身参与这场对话',
    ctaDisconnectedHelper: '连接后分身会读取你的真实记忆，岔路口对话将因你而不同。',
    noOauth:
      '当前环境还没配置 OAuth，所以这里先展示产品转化位；上线时需要补齐 SECONDME_CLIENT_ID / SECONDME_CLIENT_SECRET。',
    chipReal: '真人',
    chipMock: '非实时资料',
    chipPortal: 'Portal 计数',
  },

  live: {
    kicker: 'SecondMe 真人网络',
    title: '真人网络，不再停留在样本推演',
    description:
      '这里连接的是你自己的 SecondMe。上面的三条人生线可以混合出现非实时路径资料和已授权真人分身，到了这一区域，就只保留真人授权与真人追问链路。',
    connectionLabel: '连接状态',
    noConfig: '还没有配置 SECONDME_CLIENT_ID / SECONDME_CLIENT_SECRET，当前只开放 PathSplit 的基础产品体验。',
    tokenExpiry: 'Token 截止',
    disconnect: '断开连接',
    connectPrompt:
      '连接后可以把证据卡和主问题直接问给你的 SecondMe，而不是只停留在上面的非实时路径资料。',
    connectCta: '连接 SecondMe，进入真人链路',
    slotKicker: '并行真人槽位',
    slotDescription:
      '依次登录 3 个 SecondMe 账号，各绑定到一条人生线。绑定后 /api/explore 会优先走真实分身，缺失的槽位自动回落记忆视角。',
    slotReady: 'ready',
    questionKicker: '真人问题',
    questionTitle: '把主问题同步给你的 SecondMe',
    syncButton: '同步主问题',
    askIdle: '问我的 SecondMe',
    askLoading: '真人追问中...',
    askHelper: '这里是实时真人分身链路，不会伪装成上面的创业者角色，也不会冒充上面的三条路径视角。',
    replyLabel: 'SecondMe 回复',
    notConnected: '未连接',
    bindEnvLocked: 'Env Locked',
    bindBinding: 'Binding...',
    bindConfigured: '重新绑定当前账号',
    bindEmpty: '绑定当前账号并注入',
  },

  auth: {
    connected: 'SecondMe 已连接。',
    connectedEvidence: '现在可以把刚才的证据卡直接同步给真人分身。',
    connectedLive: '真人能力区已经解锁，可以继续追问。',
    denied: '你取消了 SecondMe 授权，当前产品体验仍然可继续。',
    disconnected: 'SecondMe 已断开，当前会退回 PathSplit 的路径体验模式。',
    failedState: 'OAuth 状态校验失败，请重新发起连接。',
    failedExchange: 'SecondMe 授权完成了，但令牌交换失败，请稍后重试。',
    misconfigured: '当前环境还没配好 SecondMe OAuth，暂时只能运行 PathSplit 的基础体验。',
  },

  errors: {
    followupFailed: '追问暂时失败。',
    streamNoContent: '追问流没有返回内容。',
    secondmeUnavailable: 'SecondMe 暂时不可用。',
    bindFailed: '绑定 Agent 失败。',
    EMPTY_INPUT: '先把问题说清楚。一个具体困惑，比一个宏大主题更有价值。',
    INPUT_TOO_LONG: '先收窄一下问题。当前产品单次最多支持 500 字输入。',
    BLOCKED_TOPIC: '当前产品不处理医疗、法律、自伤或投资等高风险决策。请换成职业和人生路径类问题。',
    SERVICE_UNAVAILABLE: '服务暂时不可用，请稍后重试。',
    bindSuccess: (name: string) => `已绑定 ${name}。`,
    bindSuccessWithSeeds: (name: string, seeded: number, total: number) =>
      `已绑定 ${name}，并注入 ${seeded}/${total} 条记忆。`,
  },

  lang: {
    switchTo: 'EN',
    current: 'ZH',
  },

  misc: {
    fallbackInitial: '我',
    connectedFallbackName: '已连接的 SecondMe',
    livePlaceholder: '连接后，把你的真实问题问给自己的 SecondMe。',
  },

  crossroad: {
    kicker: '岔路口对话',
    title: '你的分身看完三条路径后的反应',
    description: '你的 SecondMe Agent 会代表你生成第一人称反应，然后三个 persona 会依次回应。',
    idleHint: '你的 SecondMe 分身将读取三条路径，说出你的真实反应——然后三个 persona 会直接回应你的处境。',
    startButton: '开始岔路口对话',
    userReflecting: '正在生成你的反应...',
    userReflectionDone: '你的内心反应',
    personaReplying: '正在回应...',
  },

  match: {
    kicker: '反事实社交匹配',
    loading: '正在寻找走过另一条路的人...',
    titleMatched: '找到了走过另一条路的人',
    titleFallback: '知乎上的相关讨论',
    symmetryLabel: '对称度',
    reasonLabel: '匹配原因',
    theirReflectionLabel: 'TA 的反思',
    nextStepHint: '这是一个真实走过另一条路的人。你们可以在知乎圈子中继续讨论。',
    zhihuFallbackHint: '暂时没有找到反事实匹配，但知乎上有这些相关讨论：',
  },

  zhihu: {
    kicker: '知乎相关讨论',
    title: '知乎上走过这条路的人',
    description: '这些知乎用户分享了类似的经历和思考。',
  },
};
