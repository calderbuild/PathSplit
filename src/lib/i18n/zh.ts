import type { Translations } from './en';

export const zh: Translations = {
  hero: {
    badge: 'PathSplit 产品',
    badgeSub: '知乎 x Second Me 黑客松作品',
    title: ['把人生决策，', '从搜索结果', '升级成可追问的', '真人网络。'],
    description:
      'PathSplit 更像一本会开口的决策特刊，而不是一个急着给答案的聊天框。你先看见三条平行人生怎么分叉，再决定要不要把这张证据卡递给自己的 SecondMe，继续问深一层。',
  },

  journey: {
    kicker: '体验节奏',
    title: '先看见代价，再决定要不要把问题交给真人网络。',
    note: 'PathSplit 不会先把你挡在登录页外。真正需要连接 SecondMe 的，是最后那一段属于你的真人继续追问。',
    steps: [
      { title: '先展开', body: '三条平行人生先把代价、幻觉和后撤成本摊开。' },
      { title: '再对照', body: '系统先替你做一段岔路口预演，看看哪条路最刺痛你。' },
      { title: '再连接', body: '如果还想继续，就把证据卡交给自己的 SecondMe，进入真人网络。' },
    ],
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
    network: { label: '真人网络', value: '继续追问' },
  },

  input: {
    kicker: '问题输入',
    title: '把一个纠结说具体一点',
    description:
      '这个产品当前优先打磨「大厂跳创业」场景。其他预设问题用于展示 PathSplit 的产品结构，但不会像主场景一样深入。',
    explorePill: '先看见冲突，再决定要不要连上真人网络',
    noOauthPill: '当前环境仅开放基础产品体验',
    oauthConnected: 'SecondMe 已连接，结果后可直接真人追问',
    oauthConnect: '先连上我的 SecondMe',
    fieldLabel: '你的问题',
    placeholder:
      '例如：我在大厂做产品第 6 年，年薪还行，但越来越像在维护别人的增量。我想创业，可我还背着房贷。',
    submitIdle: '开始展开人生路径',
    submitLoading: '正在展开三条路径...',
    helperText: '你会先拿到三条路径，而不是一个答案。证据卡出来后，再决定要不要把问题带进真人网络。',
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
    titleConnected: '把这张证据卡递给你的真人分身',
    titleDisconnected: '这张证据卡，只是前半段',
    livePromptIntro: '我刚看完这张 PathSplit 证据卡：',
    livePromptInstruction: '请不要复述卡片。站在我的真实处境里，只回答两个点：\n1. 现在最该优先验证的一个风险是什么？\n2. 我接下来 7 天内最值得做的一个动作是什么？',
    descConnected:
      '上面的样本已经把路摊开了。现在该把这张证据卡连同你的真实处境，一起交给自己的 SecondMe。',
    descDisconnected:
      '你已经看到了 3 条平行人生线，也拿到了一张证据卡。接下来有两种走法：停在样本层，或者把它交给自己的 SecondMe，让这次犹豫进入真人网络。',
    nowTitle: '你已经拿到',
    now1: '三条彼此拉扯的平行人生路径',
    now2: '一张把代价说具体的证据卡',
    now3: '一次无需登录的岔路口预演',
    unlockTitleConnected: '现在可以继续',
    unlockTitleDisconnected: '连接之后会发生',
    unlock1: '证据卡会连同你的主问题，一起进入自己的 SecondMe',
    unlock2: '体验会从样本推演，切到真人分身的第一人称继续追问',
    unlock3Connected: '这扇门已经打开，你现在就可以把问题问深一层。',
    unlock3Disconnected: '这次连接也会记作一次有效的 SecondMe OAuth 进入，不用重新跑前面的流程。',
    ctaConnected: '用这张证据卡继续问我的 SecondMe',
    ctaConnectedHelper: '会自动把建议问题填进真人能力区。',
    ctaDisconnected: '把这张证据卡交给我的分身',
    ctaDisconnectedHelper: '回来后会保留当前进度，你可以直接进入真人继续追问。',
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
      '连接后，你可以把证据卡和主问题直接问给自己的 SecondMe，而不是只停留在上面的样本推演。',
    connectCta: '连接 SecondMe，继续追问',
    lockedTitle: '把这张证据卡，带进你自己的真人网络',
    lockedDescription:
      '上面的内容更像一本被翻开的样本册；这里只有一个角色，就是你自己的 SecondMe。连接后，问题会从“别人怎么走”变成“我现在该怎么走”。',
    lockedPoint1: '把证据卡和主问题一起带进自己的分身记忆',
    lockedPoint2: '从样本阅读切到真人分身的第一人称继续追问',
    lockedPoint3: '这一步也会被记作一次有效的 SecondMe OAuth 进入',
    slotKicker: '并行真人槽位',
    slotDescription:
      '依次登录 3 个 SecondMe 账号，各绑定到一条人生线。绑定后 /api/explore 会优先走真实分身，缺失的槽位自动回落记忆视角。',
    slotReady: 'ready',
    slotReadyVia: (source: string) => `已就绪 · ${source}`,
    slotEmpty: '空槽位',
    slotSeeds: (count: number) => `记忆 ${count}`,
    slotSynced: (time: string) => `同步于 ${time}`,
    slotScopes: (scopes: string) => `权限: ${scopes}`,
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
    kicker: '岔路口预演',
    title: '先让分身视角替你把冲突说出来',
    description:
      '这里先不用登录。系统会根据刚才的三条路径，生成一段第一人称反应，再让三个视角依次回应，帮你确认哪条路最刺痛你。',
    idleHint:
      '它不是最后那条真人链路，而是一段先听见自己、再听见反驳、最后留下岔路口画像的预演。',
    startButton: '开始岔路口对话',
    step1: '听见自己',
    step2: '听见反驳',
    step3: '留下画像',
    userReflecting: '正在生成你的反应...',
    userReflectionDone: '你的第一反应',
    personaReplying: '正在回应...',
  },

  match: {
    kicker: '反事实回声',
    loading: '正在寻找走过另一条路的人...',
    titleMatched: '去另一条路上，找一个真的走过的人',
    titleFallback: '先去知乎真实讨论里找回声',
    symmetryLabel: '对称度',
    reasonLabel: '匹配原因',
    theirReflectionLabel: 'TA 的反思',
    nextStepHint: '这是一个真实走过另一条路的人。接下来，应该让人与人真正重新接上。',
    zhihuFallbackHint: '暂时没有找到反事实匹配，但知乎真实讨论里已经有一些回声：',
    authorPrefix: '作者',
  },

  zhihu: {
    kicker: '知乎相关讨论',
    title: '知乎上走过这条路的人',
    description: '这些知乎用户分享了类似的经历和思考。',
  },
};
