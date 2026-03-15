'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import { PRESET_TOPICS } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/context';
import { QuestionInput } from './QuestionInput';
import { NarrativeGrid } from './NarrativeGrid';
import { EvidenceCard } from './EvidenceCard';
import { LiveModePanel } from './LiveModePanel';
import { OAuthConversionPanel } from './OAuthConversionPanel';
import { LanguageToggle } from './LanguageToggle';
import type {
  AgentCardState,
  EvidenceCard as EvidenceCardType,
  FollowupResponse,
  FollowupStreamEvent,
  FollowupStreamHandlers,
  SSEEvent,
  SecondMeSessionStatus,
} from '@/lib/types';

function getErrorMessage(
  payload: FollowupResponse | { message?: string } | null,
  fallback: string,
) {
  if (payload && 'message' in payload && typeof payload.message === 'string') {
    return payload.message;
  }

  return fallback;
}

function getAuthNotice(
  auth: string | null,
  source: string | null,
  authT: { connected: string; connectedEvidence: string; connectedLive: string; denied: string; disconnected: string; failedState: string; failedExchange: string; misconfigured: string },
) {
  switch (auth) {
    case 'connected':
      return {
        tone: 'success' as const,
        message:
          source === 'evidence-card'
            ? `${authT.connected} ${authT.connectedEvidence}`
            : `${authT.connected} ${authT.connectedLive}`,
      };
    case 'denied':
      return { tone: 'warning' as const, message: authT.denied };
    case 'disconnected':
      return { tone: 'warning' as const, message: authT.disconnected };
    case 'failed-state':
      return { tone: 'error' as const, message: authT.failedState };
    case 'failed-exchange':
      return { tone: 'error' as const, message: authT.failedExchange };
    case 'misconfigured':
      return { tone: 'error' as const, message: authT.misconfigured };
    default:
      return null;
  }
}

async function consumeSseStream(
  question: string,
  handlers: {
    onEvent: (event: SSEEvent) => void;
  },
) {
  const response = await fetch('/api/explore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? 'Failed to connect to /api/explore');
  }

  if (!response.body) {
    throw new Error('Failed to connect to /api/explore');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';

    for (const frame of frames) {
      const line = frame
        .split('\n')
        .find((item) => item.startsWith('data: '));

      if (!line) {
        continue;
      }

      const event = JSON.parse(line.slice(6)) as SSEEvent;
      handlers.onEvent(event);
    }
  }
}

async function consumeFollowupStream(
  url: string,
  prompt: string,
  errorFallback: string,
  noContentError: string,
  handlers?: FollowupStreamHandlers,
) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question: prompt }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | FollowupResponse
      | { message?: string }
      | null;
    throw new Error(getErrorMessage(payload, errorFallback));
  }

  if (!response.body) {
    throw new Error(noContentError);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let answer = '';
  let mode: FollowupResponse['mode'] = 'mock';

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';

    for (const frame of frames) {
      const line = frame
        .split('\n')
        .find((item) => item.startsWith('data: '));

      if (!line) {
        continue;
      }

      const event = JSON.parse(line.slice(6)) as FollowupStreamEvent;
      switch (event.type) {
        case 'meta':
          mode = event.data.mode;
          handlers?.onMode?.(event.data.mode);
          break;
        case 'chunk':
          answer += event.data.content;
          handlers?.onChunk?.(event.data.content);
          break;
        case 'error':
          throw new Error(event.data.message);
        case 'done':
          return {
            answer: answer.trim(),
            mode,
          } satisfies FollowupResponse;
      }
    }
  }

  return {
    answer: answer.trim(),
    mode,
  } satisfies FollowupResponse;
}

export function PathSplitExperience() {
  const { t } = useI18n();
  const [question, setQuestion] = useState(PRESET_TOPICS[0].prompt);
  const [cards, setCards] = useState<AgentCardState[]>([]);
  const [evidenceCard, setEvidenceCard] = useState<EvidenceCardType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [safetyError, setSafetyError] = useState<string>();
  const [globalError, setGlobalError] = useState<string>();
  const [rationale, setRationale] = useState('');
  const [authNotice, setAuthNotice] = useState<{ tone: 'success' | 'warning' | 'error'; message: string } | null>(null);
  const [livePrompt, setLivePrompt] = useState<string>();
  const [livePromptVersion, setLivePromptVersion] = useState(0);
  const [session, setSession] = useState<SecondMeSessionStatus>({
    available: false,
    connected: false,
    scope: [],
  });
  const resultsRef = useRef<HTMLElement | null>(null);
  const evidenceRef = useRef<HTMLElement | null>(null);
  const livePanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadSession() {
      const response = await fetch('/api/auth/session', {
        cache: 'no-store',
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json().catch(() => null)) as SecondMeSessionStatus | null;
      if (payload) {
        setSession(payload);
      }
    }

    void loadSession();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    const notice = getAuthNotice(url.searchParams.get('auth'), url.searchParams.get('auth_source'), t.auth);
    if (!notice) {
      return;
    }

    setAuthNotice(notice);
    url.searchParams.delete('auth');
    url.searchParams.delete('auth_source');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, [t.auth]);

  useEffect(() => {
    if (cards.length < 1) {
      return;
    }

    resultsRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [cards.length]);

  useEffect(() => {
    if (!evidenceCard) {
      return;
    }

    evidenceRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [evidenceCard]);

  useEffect(() => {
    if (!session.connected || authNotice?.tone !== 'success') {
      return;
    }

    livePanelRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [authNotice, session.connected]);

  function continueToLive(prompt: string) {
    setLivePrompt(prompt);
    setLivePromptVersion((current) => current + 1);
    livePanelRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  async function askFollowup(
    agentId: string,
    prompt: string,
    handlers?: FollowupStreamHandlers,
  ): Promise<FollowupResponse> {
    if (handlers) {
      return consumeFollowupStream(
        `/api/chat/${agentId}?stream=1`,
        prompt,
        t.errors.followupFailed,
        t.errors.streamNoContent,
        handlers,
      );
    }

    const response = await fetch(`/api/chat/${agentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: prompt }),
    });

    const payload = (await response.json().catch(() => null)) as
      | FollowupResponse
      | { message?: string }
      | null;

    if (!response.ok) {
      throw new Error(getErrorMessage(payload, t.errors.followupFailed));
    }

    return payload as FollowupResponse;
  }

  async function askLiveSelf(prompt: string): Promise<FollowupResponse> {
    const response = await fetch('/api/chat/live', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: prompt }),
    });

    const payload = (await response.json().catch(() => null)) as
      | FollowupResponse
      | { message?: string }
      | null;

    if (!response.ok) {
      throw new Error(getErrorMessage(payload, t.errors.followupFailed));
    }

    return payload as FollowupResponse;
  }

  async function onSubmit() {
    setIsLoading(true);
    setSafetyError(undefined);
    setGlobalError(undefined);
    setEvidenceCard(null);
    setCards([]);
    setRationale('');

    try {
      await consumeSseStream(question, {
        onEvent(event) {
          startTransition(() => {
            switch (event.type) {
              case 'session':
                setRationale(event.data.rationale);
                setCards(
                  event.data.agents.map((agent) => ({
                    meta: agent,
                    status: 'waiting',
                    content: '',
                  })),
                );
                break;
              case 'agent_start':
                setCards((current) =>
                  current.map((card) =>
                    card.meta.id === event.data.agentId ? { ...card, status: 'streaming' } : card,
                  ),
                );
                break;
              case 'agent_chunk':
                setCards((current) =>
                  current.map((card) =>
                    card.meta.id === event.data.agentId
                      ? {
                          ...card,
                          status: 'streaming',
                          content: `${card.content}${event.data.content}`,
                        }
                      : card,
                  ),
                );
                break;
              case 'agent_done':
                setCards((current) =>
                  current.map((card) =>
                    card.meta.id === event.data.agentId ? { ...card, status: 'done' } : card,
                  ),
                );
                break;
              case 'agent_error':
                setCards((current) =>
                  current.map((card) =>
                    card.meta.id === event.data.agentId
                      ? { ...card, status: 'error', error: event.data.message }
                      : card,
                  ),
                );
                break;
              case 'evidence_card':
                setEvidenceCard(event.data);
                break;
              case 'error':
                setGlobalError(event.data.message);
                break;
              case 'done':
                setIsLoading(false);
                break;
            }
          });
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      setSafetyError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const realCardCount = cards.filter((card) => card.meta.memoryMode === 'secondme').length;
  const showLivePanel = Boolean(evidenceCard) || session.connected;

  function translateError(code?: string) {
    if (!code) return undefined;
    const known = t.errors[code as keyof typeof t.errors];
    return typeof known === 'string' ? known : code;
  }

  return (
    <main className="pathsplit-shell">
      <LanguageToggle />
      <section className="pathsplit-hero-grid grid gap-10 xl:grid-cols-[minmax(0,1fr)_27.75rem]">
        <div className="pathsplit-hero-copy space-y-8">
          <div className="space-y-5">
            <div className="pathsplit-product-badge">
              <span className="pathsplit-product-dot" />
              <span>{t.hero.badge}</span>
              <span className="text-stone-300">·</span>
              <span className="text-stone-600">{t.hero.badgeSub}</span>
            </div>
            <div className="space-y-4">
              <h1 className="pathsplit-hero-title max-w-4xl font-semibold tracking-[-0.05em] text-stone-950">
                {t.hero.title.map((line, i) => (
                  <span key={i} className="block md:whitespace-nowrap">{line}</span>
                ))}
              </h1>
              <p className="max-w-2xl text-[1.08rem] leading-8 text-stone-700">{t.hero.description}</p>
            </div>
          </div>

          <div className="pathsplit-editorial-note">
            <div className="pathsplit-editorial-layout">
              <div className="space-y-4">
                <div className="pathsplit-section-kicker">{t.editorial.kicker}</div>
                <p className="max-w-3xl text-base leading-8 text-stone-700">
                  {t.editorial.body}
                </p>
              </div>
              <div className="pathsplit-mini-card">
                <div className="pathsplit-meta-label">{t.editorial.whoFor.label}</div>
                <p className="mt-2 text-sm leading-7 text-stone-700">{t.editorial.whoFor.body}</p>
              </div>
              <div className="pathsplit-mini-card">
                <div className="pathsplit-meta-label">{t.editorial.whatYouGet.label}</div>
                <p className="mt-2 text-sm leading-7 text-stone-700">{t.editorial.whatYouGet.body}</p>
              </div>
            </div>
          </div>

          <div className="pathsplit-stat-strip grid gap-6 sm:grid-cols-3">
            {[t.stats.scene, t.stats.perspectives, t.stats.network].map((item) => (
              <div key={item.label} className="pathsplit-stat-card">
                <div className="pathsplit-meta-label">{item.label}</div>
                <div className="mt-3 whitespace-nowrap text-[1.85rem] leading-none font-semibold text-stone-950">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <QuestionInput
          value={question}
          loading={isLoading}
          safetyError={translateError(safetyError)}
          sessionAvailable={session.available}
          sessionConnected={session.connected}
          presets={PRESET_TOPICS}
          onChange={setQuestion}
          onPreset={(prompt) => {
            setQuestion(prompt);
            setSafetyError(undefined);
          }}
          onSubmit={onSubmit}
        />
      </section>

      {authNotice ? (
        <section
          className={`rounded-[1.8rem] border p-5 text-sm leading-7 ${
            authNotice.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : authNotice.tone === 'warning'
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-rose-300 bg-rose-50 text-rose-700'
          }`}
        >
          {authNotice.message}
        </section>
      ) : null}

      {globalError ? (
        <section className="rounded-[1.8rem] border border-rose-300 bg-rose-50 p-5 text-sm leading-7 text-rose-700">
          {globalError}
        </section>
      ) : null}

      {cards.length > 0 ? (
        <section ref={resultsRef} className="pathsplit-rise">
          <NarrativeGrid cards={cards} rationale={rationale} onAskFollowup={askFollowup} />
        </section>
      ) : null}
      {evidenceCard ? (
        <section ref={evidenceRef} className="pathsplit-rise space-y-6">
          <EvidenceCard card={evidenceCard} />
          <OAuthConversionPanel
            question={question}
            evidenceCard={evidenceCard}
            session={session}
            cardCount={cards.length}
            realCardCount={realCardCount}
            onContinueLive={continueToLive}
          />
        </section>
      ) : null}
      {showLivePanel ? (
        <div id="secondme-live-panel" ref={livePanelRef} className="pathsplit-rise">
          <LiveModePanel
            question={question}
            injectedPrompt={livePrompt}
            promptVersion={livePromptVersion}
            session={session}
            onAsk={askLiveSelf}
          />
        </div>
      ) : null}
    </main>
  );
}
