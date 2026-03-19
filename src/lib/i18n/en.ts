export const en = {
  hero: {
    badge: 'PathSplit Product',
    badgeSub: 'Zhihu x Second Me Hackathon Entry',
    title: ['Turn life decisions,', 'from search results', 'into a queryable', 'human network.'],
    description:
      'PathSplit behaves more like an editorial decision dossier than a chatbot. You first watch three parallel lives split apart, then decide whether this evidence card deserves a deeper conversation with your own SecondMe.',
  },

  journey: {
    kicker: 'Experience Rhythm',
    title: 'See the cost first. Decide about the human network second.',
    note: "PathSplit doesn't shove you into a login wall. SecondMe only matters in the final stretch, when you want to keep asking as yourself.",
    steps: [
      { title: 'Unfold', body: 'Three parallel lives lay out the tradeoffs, illusions, and retreat costs.' },
      { title: 'Mirror', body: 'A crossroad preview lets your own perspective push back before you commit.' },
      { title: 'Connect', body: 'If you still want more, hand the evidence card to your own SecondMe and enter the human network.' },
    ],
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
    network: { label: 'Human Network', value: 'Live Follow-up' },
  },

  input: {
    kicker: 'Question Input',
    title: 'Describe your dilemma in detail',
    description:
      "This product currently focuses on the 'Big Tech to Startup' scenario. Other presets demonstrate PathSplit's product structure but won't go as deep.",
    explorePill: 'See the tension first, decide about the human network after',
    noOauthPill: 'Basic product experience only in current environment',
    oauthConnected: 'SecondMe connected -- real-human follow-up available after results',
    oauthConnect: 'Connect my SecondMe first',
    fieldLabel: 'Your Question',
    placeholder:
      "E.g.: I've been a PM at a big tech company for 6 years. Pay is fine, but I feel like I'm maintaining someone else's growth. I want to start a company, but I still have a mortgage.",
    submitIdle: 'Start Exploring Paths',
    submitLoading: 'Unfolding three paths...',
    helperText:
      "You'll get three paths instead of one answer. After the evidence card appears, you can decide whether it deserves the real-human lane.",
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
    titleConnected: 'Hand this evidence card to your real avatar',
    titleDisconnected: 'This evidence card is only the first half',
    livePromptIntro: 'I just reviewed this PathSplit evidence card:',
    livePromptInstruction: "Don't repeat the card. From my actual situation, answer two things:\n1. What's the single most important risk I should validate right now?\n2. What's the one action worth taking in the next 7 days?",
    descConnected:
      "The sample paths above already did their job. Now the move is to bring this evidence card, along with your actual situation, to your own SecondMe.",
    descDisconnected:
      "You've already seen three parallel lives and one evidence card. From here you can either stop at the sample layer, or pass it into your own SecondMe and let the dilemma enter the human network.",
    nowTitle: 'Already in your hands',
    now1: 'Three parallel lives pulling in different directions',
    now2: 'One evidence card that makes the costs concrete',
    now3: 'One crossroad preview that works before login',
    unlockTitleConnected: 'Now you can continue',
    unlockTitleDisconnected: 'After connecting',
    unlock1: 'The evidence card and your main question move into your own SecondMe',
    unlock2: 'The experience shifts from sample projection to live first-person follow-up',
    unlock3Connected: 'This door is already open. You can ask deeper right now.',
    unlock3Disconnected:
      'This connection is also counted as a valid SecondMe OAuth entry, without forcing you to replay the earlier steps.',
    ctaConnected: 'Ask my SecondMe with this evidence card',
    ctaConnectedHelper: 'Auto-fills the suggested question into the real-human section.',
    ctaDisconnected: 'Give this evidence card to my avatar',
    ctaDisconnectedHelper:
      'After you return, your progress stays here and you can continue straight into the real-human follow-up.',
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
      'After connecting, you can ask your own SecondMe with the evidence card and the main question, instead of staying with the sample paths above.',
    connectCta: 'Connect SecondMe and continue',
    lockedTitle: 'Carry this evidence card into your own human network',
    lockedDescription:
      "Everything above behaves like a beautifully annotated sample book. Here there is only one character left: your own SecondMe. After connecting, the question stops being 'how did they live?' and becomes 'what should I do now?'",
    lockedPoint1: 'Bring the evidence card and main question into your own avatar memory',
    lockedPoint2: 'Switch from sample reading to live first-person follow-up',
    lockedPoint3: 'This step also counts as a valid SecondMe OAuth entry',
    slotKicker: 'Parallel Real-Human Slots',
    slotDescription:
      'Log into 3 SecondMe accounts, each bound to a life path. After binding, /api/explore prefers real avatars; missing slots auto-fallback to memory perspective.',
    slotReady: 'ready',
    slotReadyVia: (source: string) => `ready via ${source}`,
    slotEmpty: 'empty slot',
    slotSeeds: (count: number) => `seeds ${count}`,
    slotSynced: (time: string) => `synced ${time}`,
    slotScopes: (scopes: string) => `scopes: ${scopes}`,
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

  crossroad: {
    kicker: 'Crossroad Preview',
    title: 'Let a first-person voice say the conflict out loud first',
    description:
      'No login yet. This stage turns the three paths you just saw into one first-person reaction, then lets the three perspectives answer back so you can feel which route actually hurts.',
    idleHint:
      "This isn't the final live-human lane. It's a rehearsal: hear yourself, hear the pushback, then leave behind a crossroad profile.",
    startButton: 'Start Crossroad Conversation',
    step1: 'Hear yourself',
    step2: 'Hear the pushback',
    step3: 'Leave a profile',
    userReflecting: 'Generating your reaction...',
    userReflectionDone: 'Your first reaction',
    personaReplying: 'Replying...',
  },

  match: {
    kicker: 'Counterfactual Echo',
    loading: 'Looking for someone who took the other path...',
    titleMatched: 'Now find a real person who actually walked the other road',
    titleFallback: 'For now, look for echoes in Zhihu\'s real discussions',
    symmetryLabel: 'Symmetry',
    reasonLabel: 'Match reason',
    theirReflectionLabel: 'Their reflection',
    nextStepHint: 'This is someone who actually took the other path. The next step is to let the people behind the agents reconnect for real.',
    zhihuFallbackHint: "No counterfactual match yet, but Zhihu's real discussion graph is already echoing this dilemma:",
    authorPrefix: 'Author',
  },

  zhihu: {
    kicker: 'Related Zhihu Discussions',
    title: 'People on Zhihu who took this path',
    description: 'These Zhihu users shared similar experiences and reflections.',
  },
};

export type Translations = typeof en;
