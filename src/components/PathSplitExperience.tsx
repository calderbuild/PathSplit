'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import { APP_COPY, HERO_STATS, PRESET_TOPICS } from '@/lib/constants';
import { QuestionInput } from './QuestionInput';
import { NarrativeGrid } from './NarrativeGrid';
import { EvidenceCard } from './EvidenceCard';
import { LiveModePanel } from './LiveModePanel';
import { OAuthConversionPanel } from './OAuthConversionPanel';
import type {
  AgentCardState,
  EvidenceCard as EvidenceCardType,
  FollowupResponse,
  FollowupStreamEvent,
  FollowupStreamHandlers,
  SSEEvent,
  SecondMeSessionStatus,
} from '@/lib/types';

function getErrorMessage(payload: FollowupResponse | { message?: string } | null) {
  if (payload && 'message' in payload && typeof payload.message === 'string') {
    return payload.message;
  }

  return '追问暂时失败。';
}

function getAuthNotice(auth: string | null, source: string | null) {
  switch (auth) {
    case 'connected':
      return {
        tone: 'success' as const,
        message:
          source === 'evidence-card'
            ? 'SecondMe 已连接。现在可以把刚才的证据卡直接同步给真人分身。'
            : 'SecondMe 已连接。真人能力区已经解锁，可以继续追问。',
      };
    case 'denied':
      return {
        tone: 'warning' as const,
        message: '你取消了 SecondMe 授权，当前产品体验仍然可继续。',
      };
    case 'disconnected':
      return {
        tone: 'warning' as const,
        message: 'SecondMe 已断开，当前会退回 PathSplit 的路径体验模式。',
      };
    case 'failed-state':
      return {
        tone: 'error' as const,
        message: 'OAuth 状态校验失败，请重新发起连接。',
      };
    case 'failed-exchange':
      return {
        tone: 'error' as const,
        message: 'SecondMe 授权完成了，但令牌交换失败，请稍后重试。',
      };
    case 'misconfigured':
      return {
        tone: 'error' as const,
        message: '当前环境还没配好 SecondMe OAuth，暂时只能运行 PathSplit 的基础体验。',
      };
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
    throw new Error(getErrorMessage(payload));
  }

  if (!response.body) {
    throw new Error('追问流没有返回内容。');
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
    const notice = getAuthNotice(url.searchParams.get('auth'), url.searchParams.get('auth_source'));
    if (!notice) {
      return;
    }

    setAuthNotice(notice);
    url.searchParams.delete('auth');
    url.searchParams.delete('auth_source');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

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
      return consumeFollowupStream(`/api/chat/${agentId}?stream=1`, prompt, handlers);
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
      throw new Error(getErrorMessage(payload));
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
      throw new Error(getErrorMessage(payload));
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

  return (
    <main className="pathsplit-shell">
      <section className="pathsplit-hero-grid grid gap-10 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-8">
          <div className="space-y-5">
            <div className="pathsplit-product-badge">
              <span className="pathsplit-product-dot" />
              <span>PathSplit 产品</span>
              <span className="text-stone-300">/</span>
              <span className="text-stone-400">知乎 x Second Me 黑客松作品</span>
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-6xl leading-[0.92] font-semibold tracking-[-0.04em] text-stone-950 md:text-7xl">
                {APP_COPY.subtitle}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-700">{APP_COPY.description}</p>
            </div>
          </div>

          <div className="pathsplit-editorial-note space-y-4">
            <div className="pathsplit-section-kicker">产品视角</div>
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <p className="max-w-2xl text-base leading-8 text-stone-700">
                它不是一个给建议的问答页，而是一条更像产品主流程的决策体验: 先展开三条人生路径，再把证据卡接入真人网络，继续追问真实分身。
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-black/8 bg-white/70 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-stone-500">适合谁</div>
                  <p className="mt-2 text-sm leading-7 text-stone-700">正在权衡大厂、创业、回撤成本的人。</p>
                </div>
                <div className="rounded-[1.4rem] border border-black/8 bg-white/70 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-stone-500">你会得到什么</div>
                  <p className="mt-2 text-sm leading-7 text-stone-700">三条路径、一张证据卡、一次真人继续追问。</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {HERO_STATS.map((item) => (
              <div key={item.label} className="pathsplit-stat-card">
                <div className="text-xs uppercase tracking-[0.28em] text-stone-500">{item.label}</div>
                <div className="mt-3 text-2xl font-semibold text-stone-950">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <QuestionInput
          value={question}
          loading={isLoading}
          safetyError={safetyError}
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
