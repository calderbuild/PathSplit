export const en = {
  hero: {
    badge: 'PathSplit Product',
    badgeSub: 'Zhihu x Second Me Hackathon Entry',
    title: ['Turn life decisions,', 'from search results', 'into a queryable', 'human network.'],
    description:
      'PathSplit is a life-decision product. You first see three parallel life paths, then connect the evidence card to your own SecondMe to ask deeper questions.',
  },

  editorial: {
    kicker: 'Product Perspective',
    body: "It's not a Q&A page that gives advice -- it's a decision experience closer to a product's core flow: first unfold three life paths, then connect the evidence card to a human network and keep asking real avatars.",
    whoFor: { label: 'Who is this for', body: 'People weighing big-tech, startup, and retreat costs.' },
    whatYouGet: { label: 'What you get', body: 'Three paths, one evidence card, one real-human follow-up.' },
  },

  stats: {
    scene: { label: 'Primary Scenario', value: 'Big Tech to Startup' },
    perspectives: { label: 'Parallel Views', value: '3 Life Paths' },
    network: { label: 'Human Network', value: 'OAuth Follow-up' },
  },

  input: {
    kicker: 'Question Input',
    title: 'Describe your dilemma in detail',
    description:
      "This product currently focuses on the 'Big Tech to Startup' scenario. Other presets demonstrate PathSplit's product structure but won't go as deep.",
    explorePill: 'Explore first, then decide whether to connect a real avatar',
    noOauthPill: 'Basic product experience only in current environment',
    oauthConnected: 'SecondMe connected -- real-human follow-up available after results',
    oauthConnect: 'Connect SecondMe for OAuth login',
    fieldLabel: 'Your Question',
    placeholder:
      "E.g.: I've been a PM at a big tech company for 6 years. Pay is fine, but I feel like I'm maintaining someone else's growth. I want to start a company, but I still have a mortgage.",
    submitIdle: 'Start Exploring Paths',
    submitLoading: 'Unfolding three paths...',
    helperText:
      "We'll return 3 paths, not 1 answer; after the evidence card appears, we guide you to real-human follow-up.",
  },

  presets: {
    'startup-main': 'Big Tech to Startup',
    'career-switch': 'Non-CS to Developer',
    overseas: 'Working Abroad',
    'grad-school': 'Grad School vs Work',
    'gap-year': 'Quit and Travel',
  } as Record<string, string>,

  card: {
    waiting: 'Generating',
    streaming: 'Unfolding',
    done: 'Complete',
    error: 'Unavailable',
    followUp: 'Follow Up',
    askButton: 'Ask this perspective',
    askingButton: 'Asking...',
    defaultDraft: 'What was the hardest moment of starting up?',
    mockMode: 'PathSplit path data',
    realMode: 'Authorized real avatar',
    mockReply: 'PathSplit Data Reply',
    realReply: 'SecondMe Live Reply',
  },

  safety: {
    mock: 'PathSplit path data | Non-realtime, based on real experiences',
    real: 'SecondMe Real Avatar | Authorized connection, generated live',
  },

  narrative: {
    kicker: 'Decision Breakdown',
    chip: '3 paths unfolding in parallel',
  },

  evidence: {
    kicker: 'Parallel Lives Evidence Card',
    ifAgainLabel: 'If I Could Do It Again',
  },

  oauth: {
    kicker: 'Next Step',
    titleConnected: 'Sync this evidence card to your real avatar',
    titleDisconnected: 'Connect SecondMe to plug PathSplit into the human network',
    descConnected:
      "Among the three paths above, authorized real avatars and non-realtime path data coexist. The next step isn't to keep reading samples -- it's to ask your own SecondMe with this evidence card and your real situation.",
    descDisconnected:
      "You've seen 3 parallel life paths. Now connect SecondMe to register this experience as an OAuth login and continue asking real avatars.",
    step1: "Keep the first-screen experience intact -- don't block judges behind a login wall.",
    step2: 'Convert to OAuth after the evidence card appears -- stronger value perception, less drop-off.',
    step3Connected:
      "Now sync the evidence card directly into the real-human pipeline -- prove this isn't just static content.",
    step3Disconnected:
      'After connecting, enter the real-human pipeline immediately -- no need to restart exploration.',
    ctaConnected: 'Ask my SecondMe with this evidence card',
    ctaConnectedHelper: 'Auto-fills the suggested question into the real-human section.',
    ctaDisconnected: 'Connect SecondMe for OAuth login',
    ctaDisconnectedHelper:
      'When you return, your product context is preserved -- you can jump straight into real-human follow-up.',
    noOauth:
      "OAuth isn't configured in this environment. This section demonstrates the conversion placement; for production, add SECONDME_CLIENT_ID / SECONDME_CLIENT_SECRET.",
    chipReal: 'Real',
    chipMock: 'Non-realtime data',
    chipPortal: 'Portal count',
  },

  live: {
    kicker: 'SecondMe Human Network',
    title: 'Human network -- beyond sample projection',
    description:
      "This connects to your own SecondMe. The three life paths above can mix non-realtime path data with authorized real avatars; in this section, it's exclusively real-human authorization and follow-up.",
    connectionLabel: 'Connection Status',
    noConfig:
      'SECONDME_CLIENT_ID / SECONDME_CLIENT_SECRET not configured. Only basic PathSplit experience is available.',
    tokenExpiry: 'Token expires',
    disconnect: 'Disconnect',
    connectPrompt:
      'After connecting, you can ask your SecondMe directly with the evidence card and main question, instead of staying with the non-realtime path data above.',
    connectCta: 'Connect SecondMe -- enter the human pipeline',
    slotKicker: 'Parallel Real-Human Slots',
    slotDescription:
      'Log into 3 SecondMe accounts, each bound to a life path. After binding, /api/explore prefers real avatars; missing slots auto-fallback to memory perspective.',
    slotReady: 'ready',
    questionKicker: 'Real-Human Question',
    questionTitle: 'Sync the main question to your SecondMe',
    syncButton: 'Sync main question',
    askIdle: 'Ask my SecondMe',
    askLoading: 'Asking real human...',
    askHelper:
      "This is the live real-avatar pipeline. It won't impersonate the startup personas above or pretend to be any of the three path perspectives.",
    replyLabel: 'SecondMe Reply',
    notConnected: 'Not connected',
    bindEnvLocked: 'Env Locked',
    bindBinding: 'Binding...',
    bindConfigured: 'Rebind current account',
    bindEmpty: 'Bind current account & inject',
  },

  auth: {
    connected: 'SecondMe connected.',
    connectedEvidence: 'You can now sync the evidence card directly to your real avatar.',
    connectedLive: 'The real-human section is now unlocked -- you can continue asking.',
    denied: 'You cancelled SecondMe authorization. The current product experience continues.',
    disconnected: 'SecondMe disconnected. Falling back to PathSplit path experience mode.',
    failedState: 'OAuth state validation failed. Please re-initiate the connection.',
    failedExchange: 'SecondMe authorization completed, but token exchange failed. Please try again later.',
    misconfigured:
      "This environment doesn't have SecondMe OAuth configured yet. Only the basic PathSplit experience is available.",
  },

  errors: {
    followupFailed: 'Follow-up temporarily failed.',
    streamNoContent: 'Follow-up stream returned no content.',
    secondmeUnavailable: 'SecondMe is temporarily unavailable.',
    bindFailed: 'Failed to bind agent.',
    EMPTY_INPUT: 'Please describe your question first. A specific dilemma is more valuable than a grand theme.',
    INPUT_TOO_LONG: 'Please narrow your question. Max 500 characters per submission.',
    BLOCKED_TOPIC:
      'This product does not handle medical, legal, self-harm, or investment decisions. Please switch to career and life-path questions.',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
    bindSuccess: (name: string) => `Bound ${name}.`,
    bindSuccessWithSeeds: (name: string, seeded: number, total: number) =>
      `Bound ${name} and injected ${seeded}/${total} memories.`,
  },

  lang: {
    switchTo: 'ZH',
    current: 'EN',
  },

  misc: {
    fallbackInitial: 'M',
    connectedFallbackName: 'Connected SecondMe',
    livePlaceholder: 'After connecting, ask your real question to your own SecondMe.',
  },
};

export type Translations = typeof en;
