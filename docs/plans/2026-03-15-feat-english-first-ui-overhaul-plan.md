---
title: "English-First UI Overhaul with i18n Toggle"
type: feat
date: 2026-03-15
---

# English-First UI Overhaul with i18n Toggle

## Overview

Two parallel workstreams: (1) add lightweight i18n so the app defaults to English with a Chinese toggle, and (2) iteratively audit and fix UI/UX issues using Playwright screenshots and the `frontend-design` skill. All AI-generated narrative content stays in Chinese (it's the product's content language); only static UI chrome switches.

## Problem Statement

The app is entirely in Chinese, limiting accessibility for international hackathon judges and the broader SecondMe community. Additionally, the current UI has visual rough edges (inconsistent spacing, card density, typography balance) that could be improved through systematic Playwright-driven auditing.

## Scope

### In

- i18n infrastructure: React Context + translation objects, language toggle component
- English translations for all static UI text (~120 strings across 10 files)
- `<html lang>` attribute switching
- localStorage persistence of language preference
- Iterative Playwright visual audit: screenshot -> identify issues -> fix -> re-screenshot
- Typography, spacing, and layout improvements identified through audit
- Update `layout.tsx` metadata for English

### Out

- Translating AI-generated narrative content (agent stories, evidence cards, follow-up answers)
- Translating persona names, backgrounds, or agent memory content
- URL-based routing (`/en/`, `/zh/`)
- Server-side locale detection
- next-intl or any third-party i18n library
- Full visual redesign (we iterate on the existing design)

## Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Translation objects become stale when Chinese copy changes | Medium | Co-locate en/zh in same translation file; linter could catch missing keys |
| Context re-render performance with frequent language switches | Low | Language changes are rare; Context value is stable object reference |
| English text longer than Chinese breaks layout | Medium | Test all components at both languages during Playwright audit |
| AI content in Chinese while UI in English feels disjointed | Low | This is intentional -- clear visual separation between UI chrome and content |

## Compatibility

- No API route changes (server-side errors use error codes, translated client-side)
- No data model changes
- Existing Chinese experience preserved as toggle option
- All tests should pass with either language setting
- Agent labels (persona names, card titles like "创业第 3 年，还在硬扛") stay in Chinese -- they are persona data, not UI chrome. English users see English section headers with Chinese persona names. This is the intended bilingual experience.

---

## Task List

### Phase 1: i18n Infrastructure

**Goal**: Build the translation system, zero visual changes yet.

#### Task 1.1: Create translation files

**Description**: Create a `src/lib/i18n/` directory with translation objects for English and Chinese.

**Files**: `src/lib/i18n/en.ts`, `src/lib/i18n/zh.ts`, `src/lib/i18n/index.ts`

**Approach**:

```typescript
// src/lib/i18n/en.ts
export const en = {
  // Hero
  hero: {
    badge: 'PathSplit Product',
    badgeSub: 'Zhihu x Second Me Hackathon Entry',
    title: ['Turn life decisions,', 'from search results', 'into a queryable', 'human network.'],
    description: 'PathSplit is a life-decision product. You first see three parallel life paths, then connect the evidence card to your own SecondMe to ask deeper questions.',
  },
  // Editorial note
  editorial: {
    kicker: 'Product Perspective',
    body: "It's not a Q&A page that gives advice -- it's a decision experience closer to a product's core flow: first unfold three life paths, then connect the evidence card to a human network and keep asking real avatars.",
    whoFor: { label: 'Who is this for', body: 'People weighing big-tech, startup, and retreat costs.' },
    whatYouGet: { label: 'What you get', body: 'Three paths, one evidence card, one real-human follow-up.' },
  },
  // Stats
  stats: {
    scene: { label: 'Primary Scenario', value: 'Big Tech to Startup' },
    perspectives: { label: 'Parallel Views', value: '3 Life Paths' },
    network: { label: 'Human Network', value: 'OAuth Follow-up' },
  },
  // Question input
  input: {
    kicker: 'Question Input',
    title: 'Describe your dilemma in detail',
    description: "This product currently focuses on the 'Big Tech to Startup' scenario. Other presets demonstrate PathSplit's product structure but won't go as deep.",
    explorePill: 'Explore first, then decide whether to connect a real avatar',
    noOauthPill: 'Basic product experience only in current environment',
    oauthConnected: 'SecondMe connected -- real-human follow-up available after results',
    oauthConnect: 'Connect SecondMe for OAuth login',
    fieldLabel: 'Your Question',
    placeholder: "E.g.: I've been a PM at a big tech company for 6 years. Pay is fine, but I feel like I'm maintaining someone else's growth. I want to start a company, but I still have a mortgage.",
    submitIdle: 'Start Exploring Paths',
    submitLoading: 'Unfolding three paths...',
    helperText: "We'll return 3 paths, not 1 answer; after the evidence card appears, we guide you to real-human follow-up.",
  },
  // Presets
  presets: {
    'startup-main': 'Big Tech to Startup',
    'career-switch': 'Non-CS to Developer',
    'overseas': 'Working Abroad',
    'grad-school': 'Grad School vs Work',
    'gap-year': 'Quit and Travel',
  },
  // Perspective card
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
  // Safety label
  safety: {
    mock: 'PathSplit path data | Non-realtime, based on real experiences',
    real: 'SecondMe Real Avatar | Authorized connection, generated live',
  },
  // Narrative grid
  narrative: {
    kicker: 'Decision Breakdown',
    chip: '3 paths unfolding in parallel',
  },
  // Evidence card
  evidence: {
    kicker: 'Parallel Lives Evidence Card',
    ifAgainLabel: 'If I Could Do It Again',
  },
  // OAuth conversion panel
  oauth: {
    kicker: 'Next Step',
    titleConnected: 'Sync this evidence card to your real avatar',
    titleDisconnected: 'Connect SecondMe to plug PathSplit into the human network',
    descConnected: "Among the three paths above, authorized real avatars and non-realtime path data coexist. The next step isn't to keep reading samples -- it's to ask your own SecondMe with this evidence card and your real situation.",
    descDisconnected: "You've seen 3 parallel life paths. Now connect SecondMe to register this experience as an OAuth login and continue asking real avatars.",
    step1: "Keep the first-screen experience intact -- don't block judges behind a login wall.",
    step2: 'Convert to OAuth after the evidence card appears -- stronger value perception, less drop-off.',
    step3Connected: "Now sync the evidence card directly into the real-human pipeline -- prove this isn't just static content.",
    step3Disconnected: 'After connecting, enter the real-human pipeline immediately -- no need to restart exploration.',
    ctaConnected: 'Ask my SecondMe with this evidence card',
    ctaConnectedHelper: 'Auto-fills the suggested question into the real-human section.',
    ctaDisconnected: 'Connect SecondMe for OAuth login',
    ctaDisconnectedHelper: "When you return, your product context is preserved -- you can jump straight into real-human follow-up.",
    noOauth: "OAuth isn't configured in this environment. This section demonstrates the conversion placement; for production, add SECONDME_CLIENT_ID / SECONDME_CLIENT_SECRET.",
    chipReal: 'Real',
    chipMock: 'Non-realtime data',
    chipPortal: 'Portal count',
  },
  // Live mode panel
  live: {
    kicker: 'SecondMe Human Network',
    title: 'Human network -- beyond sample projection',
    description: "This connects to your own SecondMe. The three life paths above can mix non-realtime path data with authorized real avatars; in this section, it's exclusively real-human authorization and follow-up.",
    connectionLabel: 'Connection Status',
    noConfig: "SECONDME_CLIENT_ID / SECONDME_CLIENT_SECRET not configured. Only basic PathSplit experience is available.",
    tokenExpiry: 'Token expires',
    disconnect: 'Disconnect',
    connectPrompt: "After connecting, you can ask your SecondMe directly with the evidence card and main question, instead of staying with the non-realtime path data above.",
    connectCta: 'Connect SecondMe -- enter the human pipeline',
    slotKicker: 'Parallel Real-Human Slots',
    slotDescription: 'Log into 3 SecondMe accounts, each bound to a life path. After binding, /api/explore prefers real avatars; missing slots auto-fallback to memory perspective.',
    slotReady: 'ready',
    questionKicker: 'Real-Human Question',
    questionTitle: 'Sync the main question to your SecondMe',
    syncButton: 'Sync main question',
    askIdle: 'Ask my SecondMe',
    askLoading: 'Asking real human...',
    askHelper: "This is the live real-avatar pipeline. It won't impersonate the startup personas above or pretend to be any of the three path perspectives.",
    replyLabel: 'SecondMe Reply',
    notConnected: 'Not connected',
    bindEnvLocked: 'Env Locked',
    bindBinding: 'Binding...',
    bindConfigured: 'Rebind current account',
    bindEmpty: 'Bind current account & inject',
  },
  // Auth notices
  auth: {
    connected: 'SecondMe connected.',
    connectedEvidence: 'You can now sync the evidence card directly to your real avatar.',
    connectedLive: 'The real-human section is now unlocked -- you can continue asking.',
    denied: 'You cancelled SecondMe authorization. The current product experience continues.',
    disconnected: 'SecondMe disconnected. Falling back to PathSplit path experience mode.',
    failedState: 'OAuth state validation failed. Please re-initiate the connection.',
    failedExchange: 'SecondMe authorization completed, but token exchange failed. Please try again later.',
    misconfigured: "This environment doesn't have SecondMe OAuth configured yet. Only the basic PathSplit experience is available.",
  },
  // Errors (client-side fallbacks + server error code translations)
  errors: {
    followupFailed: 'Follow-up temporarily failed.',
    streamNoContent: 'Follow-up stream returned no content.',
    secondmeUnavailable: 'SecondMe is temporarily unavailable.',
    bindFailed: 'Failed to bind agent.',
    // Server error codes (safety.ts returns codes, client translates)
    EMPTY_INPUT: 'Please describe your question first. A specific dilemma is more valuable than a grand theme.',
    INPUT_TOO_LONG: 'Please narrow your question. Max 500 characters per submission.',
    BLOCKED_TOPIC: 'This product does not handle medical, legal, self-harm, or investment decisions. Please switch to career and life-path questions.',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
    // Interpolated (functions)
    bindSuccess: (name: string) => `Bound ${name}.`,
    bindSuccessWithSeeds: (name: string, seeded: number, total: number) =>
      `Bound ${name} and injected ${seeded}/${total} memories.`,
  },
  // Language toggle
  lang: {
    switchTo: 'ZH',
    current: 'EN',
  },
  // Misc
  misc: {
    fallbackInitial: 'M',
    connectedFallbackName: 'Connected SecondMe',
    livePlaceholder: 'After connecting, ask your real question to your own SecondMe.',
  },
} as const;
```

```typescript
// src/lib/i18n/zh.ts -- mirrors en.ts structure with Chinese values
// (current Chinese copy extracted from components)
```

**Type safety**: Define `type Translations = typeof en` and declare `zh` as `const zh: Translations = { ... }`. This gives a compile error if any key is missing in `zh.ts`.

**Interpolation**: Keys that need dynamic values are functions (e.g., `bindSuccess: (name: string) => string`). Both `en.ts` and `zh.ts` must implement the same function signatures. The `as const` assertion is removed from the top-level export to allow function values.

**Acceptance**: Both translation files export objects with identical key structures. TypeScript catches missing keys at build time.

#### Task 1.2: Create i18n Context and Provider

**Description**: React Context that holds current locale and the `t()` lookup function.

**Files**: `src/lib/i18n/context.tsx`

**Approach**:

```typescript
'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { en } from './en';
import { zh } from './zh';

type Locale = 'en' | 'zh';
type Translations = typeof en;

const translations: Record<Locale, Translations> = { en, zh };

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('pathsplit-locale') as Locale) || 'en';
    }
    return 'en';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pathsplit-locale', newLocale);
      document.documentElement.lang = newLocale === 'zh' ? 'zh-CN' : 'en';
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'zh' : 'en');
  }, [locale, setLocale]);

  const value = useMemo(
    () => ({ locale, t: translations[locale], setLocale, toggleLocale }),
    [locale, setLocale, toggleLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
```

**Acceptance**: `useI18n()` returns `{ locale, t, setLocale, toggleLocale }`. Default locale is `'en'`.

#### Task 1.3: Add I18nProvider to layout

**Description**: Wrap the app in I18nProvider. Since `layout.tsx` is a server component, we need a thin client wrapper.

**Files**: `src/app/layout.tsx`, `src/app/page.tsx` or a new `src/components/Providers.tsx`

**Approach**: Create a `Providers` client component that wraps `I18nProvider` around children. Use it in `layout.tsx`:

```tsx
// src/components/Providers.tsx
'use client';
import { I18nProvider } from '@/lib/i18n/context';
export function Providers({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
```

```tsx
// layout.tsx -- wrap body children
<body><Providers>{children}</Providers></body>
```

Also update metadata to English defaults:
```tsx
export const metadata: Metadata = {
  title: 'PathSplit - Parallel Lives Explorer',
  description: 'Turn life decisions into queryable product experiences: three paths, one evidence card, one real-human follow-up.',
};
```

**Note**: Change `<html lang="zh-CN">` to `<html lang="en">` in the server component to match the new default. The client-side `I18nProvider` will update it to `zh-CN` if the user has a Chinese preference in localStorage. This avoids SSR hydration mismatch for the default case.

**Acceptance**: Provider wraps the entire app. No visual change yet.

#### Task 1.4: Refactor safety.ts to return error codes

**Description**: Server-side `safety.ts` currently returns Chinese error messages directly. Refactor to return error codes that the client translates.

**Files**: `src/lib/safety.ts`, `src/app/api/explore/route.ts`

**Approach**:

```typescript
// safety.ts -- return codes instead of messages
export function validateUserInput(question: string): SafetyResult {
  const trimmed = question.trim();
  if (!trimmed) return { allowed: false, reason: 'EMPTY_INPUT' };
  if (trimmed.length > MAX_INPUT_LENGTH) return { allowed: false, reason: 'INPUT_TOO_LONG' };
  const blocked = BLOCKED_PATTERNS.find((p) => p.test(trimmed));
  if (blocked) return { allowed: false, reason: 'BLOCKED_TOPIC' };
  return { allowed: true };
}

export function redactErrorMessage(_: unknown) {
  return 'SERVICE_UNAVAILABLE';
}
```

Client-side: When `safetyError` is set, look up `t.errors[errorCode]` before displaying. If the code isn't in the translation, display it as-is (backward compatible).

**Note**: This also fixes `redactErrorMessage` which currently leaks Chinese text.

**Acceptance**: API returns error codes, client translates them per locale.

#### Task 1.5: Create LanguageToggle component

**Description**: A small toggle button in the top-right corner of the page.

**Files**: `src/components/LanguageToggle.tsx`

**Approach**:

```tsx
'use client';
import { useI18n } from '@/lib/i18n/context';

export function LanguageToggle() {
  const { locale, toggleLocale, t } = useI18n();
  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="pathsplit-lang-toggle"
      aria-label={`Switch to ${locale === 'en' ? 'Chinese' : 'English'}`}
    >
      {t.lang.switchTo}
    </button>
  );
}
```

Position: fixed top-right, pill button style matching `pathsplit-meta-chip` aesthetic.

CSS in `globals.css`:
```css
.pathsplit-lang-toggle {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 50;
  border: 1px solid rgba(23, 23, 23, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  padding: 0.5rem 1rem;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink);
  cursor: pointer;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  transition: all 180ms ease;
}

.pathsplit-lang-toggle:hover {
  border-color: rgba(23, 23, 23, 0.2);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
  transform: translateY(-1px);
}
```

**Acceptance**: Toggle button appears top-right, switches language on click, persists to localStorage.

---

### Phase 2: Wire i18n to All Components

**Goal**: Replace all hardcoded Chinese/English strings with `t.*` lookups.

#### Task 2.1: PathSplitExperience.tsx

**Description**: Wire hero section, auth notices, error messages.

**Files**: `src/components/PathSplitExperience.tsx`

**Key changes**:
- Import `useI18n`
- Replace `APP_COPY.subtitle` / `APP_COPY.description` with `t.hero.*`
- Replace `HERO_STATS` with `t.stats.*` mapped values
- Refactor `getAuthNotice()`: currently a standalone function that can't access hooks. Move it inside the component body, or restructure to accept `t.auth` as parameter. E.g.: `function getAuthNotice(auth: string | null, source: string | null, authT: typeof t.auth)`
- Replace `getErrorMessage()` fallback `'追问暂时失败。'` with `t.errors.followupFailed`
- Replace `consumeFollowupStream` error `'追问流没有返回内容。'` with `t.errors.streamNoContent` -- note: this function is outside React, so pass the translation string as a parameter or restructure
- `safetyError` display: look up `t.errors[safetyError]` if the value matches an error code, otherwise display as-is
- Render `<LanguageToggle />` component (or add to layout)

**Important**: Each child component uses `useI18n()` directly rather than prop-drilling `t`.

**Acceptance**: Hero section, auth notices, error messages switch between EN/ZH.

#### Task 2.2: QuestionInput.tsx

**Description**: Wire all input panel text.

**Files**: `src/components/QuestionInput.tsx`

**Key changes**:
- Section kicker, title, description, pills, field label, placeholder, button text, helper text
- Preset button labels from `t.presets[preset.id]`

**Note**: The preset `prompt` values (the actual question text) stay in Chinese -- they are product content, not UI chrome. Only the button labels switch.

**Acceptance**: Input panel fully bilingual.

#### Task 2.3: PerspectiveCard.tsx

**Description**: Wire status labels, follow-up section text.

**Files**: `src/components/PerspectiveCard.tsx`

**Key changes**:
- `statusCopy()` function uses `t.card.*`
- Follow-up section labels, button text, mode labels
- Footer labels (mock/real mode display)

**Note**: `card.content` (narrative text), `card.meta.persona.*` (persona details), `draft` default value stay in Chinese.

**Acceptance**: Card chrome bilingual; narrative content stays Chinese.

#### Task 2.4: EvidenceCard.tsx

**Description**: Wire evidence card section header and labels.

**Files**: `src/components/EvidenceCard.tsx`

**Key changes**:
- Section kicker "Parallel Lives Evidence Card"
- "If I Could Do It Again" label

**Note**: `card.topic`, `card.summary`, `path.keyDecision`, `path.outcome`, `path.ifAgain` are AI-generated content -- stay in Chinese.

**Acceptance**: Evidence card chrome bilingual.

#### Task 2.5: OAuthConversionPanel.tsx

**Description**: Wire OAuth conversion copy.

**Files**: `src/components/OAuthConversionPanel.tsx`

**Key changes**:
- All headings, descriptions, step cards, button labels, helper text
- `buildLivePrompt()` function's Chinese template -- this is a prompt sent to SecondMe, should stay in Chinese regardless of UI language

**Acceptance**: OAuth panel chrome bilingual.

#### Task 2.6: LiveModePanel.tsx

**Description**: Wire live mode panel text.

**Files**: `src/components/LiveModePanel.tsx`

**Key changes**:
- Section kicker, title, description, connection status, slot labels
- Button text, placeholder, error messages
- `formatExpiry()` and `formatSlotUpdate()`: change hardcoded `'zh-CN'` to `locale === 'zh' ? 'zh-CN' : 'en-US'`
- `getInitial()` fallback: `'我'` -> `t.misc.fallbackInitial` (`'M'` in English, `'我'` in Chinese)
- Connected user fallback name: `'已连接的 SecondMe'` -> `t.misc.connectedFallbackName`
- Textarea placeholder: -> `t.misc.livePlaceholder`
- Binding success messages: use interpolated `t.errors.bindSuccess(name)` / `t.errors.bindSuccessWithSeeds(name, seeded, total)`

**Acceptance**: Live panel chrome bilingual. Date/time formatting respects locale.

#### Task 2.7: SafetyLabel.tsx, AgentAvatar.tsx, NarrativeGrid.tsx

**Description**: Wire remaining small components.

**Files**: `src/components/SafetyLabel.tsx`, `src/components/NarrativeGrid.tsx`

**Key changes**:
- SafetyLabel trust text
- NarrativeGrid kicker and chip text

**Acceptance**: All static UI text uses `t.*`.

#### Task 2.8: Update constants.ts

**Description**: Remove duplicated copy from constants that's now in translation files. Keep structural data (agent IDs, themes, persona objects).

**Files**: `src/lib/constants.ts`

**Key changes**:
- Remove `APP_COPY` (replaced by `t.hero`)
- Remove `HERO_STATS` (replaced by `t.stats`)
- Remove `TRUST_LABEL` (replaced by `t.safety`)
- Keep `STARTUP_AGENTS`, `STARTUP_DIMENSIONS`, `PRESET_TOPICS` (structural data)
- `PRESET_TOPICS[*].label` stays in constants but is overridden by `t.presets[id]` at render time

**Acceptance**: No orphaned copy in constants.ts.

---

### Phase 3: Iterative Playwright Visual Audit

**Goal**: Systematically screenshot, identify issues, fix them, verify.

#### Task 3.1: Full-page audit at 1440px (English)

**Description**: Screenshot the full page in English, identify visual issues.

**Files**: All component files as needed

**Approach**:
1. Navigate to `localhost:3000` (now defaults to English)
2. Full-page screenshot
3. Identify top 5 visual issues (spacing, alignment, typography, color, hierarchy)
4. Fix each one
5. Re-screenshot to verify

**Focus areas**:
- English text may overflow or underflow containers designed for Chinese
- Heading line-height may need adjustment for Latin text
- Button widths with English labels
- Card content density with English UI chrome + Chinese AI content

**Acceptance**: No visual regressions; English UI looks intentional, not translated.

#### Task 3.2: Full-page audit at 1440px (Chinese)

**Description**: Verify Chinese mode still looks correct after all changes.

**Approach**: Toggle to Chinese, full-page screenshot, compare with baseline.

**Acceptance**: Chinese mode visually identical or improved vs current state.

#### Task 3.3: Responsive audit at 375px (mobile)

**Description**: Check mobile layout in both languages.

**Approach**: Resize to 375x812, screenshot both languages.

**Focus areas**:
- Language toggle not overlapping content
- Input panel not overflowing
- Cards stacking properly

**Acceptance**: No horizontal overflow; all text readable.

#### Task 3.4: Streaming state audit

**Description**: Submit a question and screenshot during streaming state.

**Approach**: Click submit, wait for cards to appear, screenshot streaming state.

**Focus areas**:
- Skeleton -> streaming transition
- Card status labels in English
- Streaming cursor behavior

**Acceptance**: Streaming state looks polished in English.

#### Task 3.5: Fix issues from audit rounds

**Description**: Address all issues found in Tasks 3.1-3.4.

**Files**: `src/app/globals.css`, component files as identified

**Approach**: Apply `frontend-design` skill principles:
- Only animate `transform` and `opacity`
- Use `cubic-bezier(0.25, 1, 0.5, 1)` for motion
- Maintain warm editorial aesthetic
- Ensure bilingual text has adequate spacing

**Acceptance**: All audit issues resolved, both languages look polished.

---

## Acceptance Criteria

### Functional

- [x] App defaults to English on first visit
- [x] Language toggle switches all static UI text between EN/ZH
- [x] Language preference persists across page reloads (localStorage)
- [x] `<html lang>` attribute updates with language toggle
- [x] AI-generated content (narratives, evidence card data, follow-up answers) stays in Chinese regardless of UI language
- [x] Persona names, backgrounds, and agent prompts stay in Chinese
- [x] Preset question text stays in Chinese (product content)
- [x] OAuth flow works in both languages
- [x] `npm run build` passes
- [x] `npm run lint` passes
- [x] `npm test` passes

### Visual

- [x] English UI looks native, not translated
- [x] No text overflow or truncation in either language
- [x] Language toggle is visible but not distracting (top-right fixed)
- [x] Card layouts work with English chrome + Chinese content
- [ ] Streaming state looks polished in English
- [x] No layout shift when switching languages

### i18n Architecture

- [x] Translation files have identical key structures (TypeScript enforced via shared type)
- [x] No hardcoded user-facing strings remain in components (including error fallbacks)
- [x] Dynamic AI content explicitly excluded from translation system
- [x] `useI18n()` hook works in all client components
- [x] Server-side errors use error codes, client translates them
- [x] `Intl.DateTimeFormat` locale parameter is dynamic
- [x] Phase 2 tasks shipped atomically (no partially-translated intermediate state)
- [x] No SSR hydration mismatch (`<html lang="en">` matches default locale)

---

## Technical Considerations

### What gets translated (static UI chrome)

- Section kickers ("Question Input", "Decision Breakdown")
- Headings and titles
- Button labels
- Status labels ("Generating", "Complete")
- Helper text and descriptions
- Error messages
- Pill/chip labels
- Placeholder text
- Metadata (page title, description)

### What stays in Chinese (product content)

- AI-generated narratives from agents
- Evidence card data (topic, summary, paths, keyNumbers, ifAgain)
- Follow-up question drafts and answers
- Persona names, ages, backgrounds, currentState
- Preset question prompts (the actual Chinese questions)
- Agent memory content
- SecondMe API prompts (buildLivePrompt template)

### Translation file size estimate

~120 keys across 8 namespaces. Each file ~4KB. No performance concern.

---

## References

### Internal

- Existing UI polish plan: `docs/plans/2026-03-14-feat-ui-polish-demo-ready-plan.md`
- Current components: `src/components/*.tsx`
- Copy constants: `src/lib/constants.ts`
- CSS design system: `src/app/globals.css`

### Key Files to Modify

| File | Changes |
|------|---------|
| `src/lib/i18n/en.ts` | New: English translations |
| `src/lib/i18n/zh.ts` | New: Chinese translations (extracted from components) |
| `src/lib/i18n/context.tsx` | New: React Context + Provider + useI18n hook |
| `src/components/Providers.tsx` | New: Client wrapper for providers |
| `src/components/LanguageToggle.tsx` | New: Toggle button component |
| `src/app/layout.tsx` | Modified: Wrap in Providers, update metadata |
| `src/components/PathSplitExperience.tsx` | Modified: Wire i18n |
| `src/components/QuestionInput.tsx` | Modified: Wire i18n |
| `src/components/PerspectiveCard.tsx` | Modified: Wire i18n |
| `src/components/EvidenceCard.tsx` | Modified: Wire i18n |
| `src/components/OAuthConversionPanel.tsx` | Modified: Wire i18n |
| `src/components/LiveModePanel.tsx` | Modified: Wire i18n |
| `src/components/SafetyLabel.tsx` | Modified: Wire i18n |
| `src/components/NarrativeGrid.tsx` | Modified: Wire i18n |
| `src/lib/constants.ts` | Modified: Remove duplicated copy |
| `src/app/globals.css` | Modified: Add toggle styles |
