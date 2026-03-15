'use client';

import { useState } from 'react';
import { AgentAvatar } from './AgentAvatar';
import { SafetyLabel } from './SafetyLabel';
import { useI18n } from '@/lib/i18n/context';
import type { AgentCardState, FollowupResponse, FollowupStreamHandlers } from '@/lib/types';

export function PerspectiveCard({
  card,
  onAskFollowup,
}: {
  card: AgentCardState;
  onAskFollowup: (
    agentId: string,
    question: string,
    handlers?: FollowupStreamHandlers,
  ) => Promise<FollowupResponse>;
}) {
  const { t } = useI18n();
  const isStreaming = card.status === 'streaming';
  const [draft, setDraft] = useState(t.card.defaultDraft);
  const [answer, setAnswer] = useState<string>();
  const [answerMode, setAnswerMode] = useState<'mock' | 'secondme'>();
  const [isAsking, setIsAsking] = useState(false);
  const [isStreamingAnswer, setIsStreamingAnswer] = useState(false);
  const [followupError, setFollowupError] = useState<string>();

  const statusLabel = {
    waiting: t.card.waiting,
    streaming: t.card.streaming,
    done: t.card.done,
    error: t.card.error,
  }[card.status];

  async function askFollowup() {
    setIsAsking(true);
    setIsStreamingAnswer(true);
    setFollowupError(undefined);
    setAnswer('');
    setAnswerMode(undefined);

    try {
      const response = await onAskFollowup(card.meta.id, draft, {
        onMode(mode) {
          setAnswerMode(mode);
        },
        onChunk(chunk) {
          setAnswer((current) => `${current ?? ''}${chunk}`);
        },
      });
      setAnswer(response.answer);
      setAnswerMode(response.mode);
    } catch (error) {
      setFollowupError(error instanceof Error ? error.message : t.errors.followupFailed);
    } finally {
      setIsAsking(false);
      setIsStreamingAnswer(false);
    }
  }

  return (
    <article className="pathsplit-card flex min-h-[340px] flex-col gap-4">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <AgentAvatar agent={card.meta} />
          <div>
            <div className="pathsplit-meta-label">{statusLabel}</div>
            <h3 className="mt-1 text-xl font-semibold text-stone-950">{card.meta.label}</h3>
          </div>
        </div>
        <SafetyLabel compact variant={card.meta.memoryMode} />
      </header>

      <div className="space-y-2">
        <p className="text-sm leading-6 text-stone-700">{card.meta.persona.background}</p>
        <p className="pathsplit-meta-label">{card.meta.persona.currentState}</p>
      </div>

      <div className="flex-1 rounded-[1.6rem] border border-black/6 bg-stone-50/90 p-5">
        {card.status === 'waiting' ? (
          <div className="space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-stone-200" />
            <div className="h-4 w-full animate-pulse rounded-full bg-stone-200" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-stone-200" />
          </div>
        ) : card.status === 'error' ? (
          <p className="text-sm leading-7 text-rose-700">{card.error}</p>
        ) : (
          <p className={`text-base leading-8 text-stone-900 ${isStreaming ? 'streaming-cursor' : ''}`}>{card.content}</p>
        )}
      </div>

      <footer className="pathsplit-meta-label flex items-center justify-between">
        <span>{card.meta.persona.name}</span>
        <span>{card.meta.memoryMode === 'mock' ? t.card.mockMode : t.card.realMode}</span>
      </footer>

      {card.status === 'done' ? (
        <div className="rounded-[1.5rem] border border-black/8 bg-white/70 p-4">
          <div className="pathsplit-meta-label">{t.card.followUp}</div>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="mt-3 min-h-24 w-full resize-none rounded-[1rem] border border-black/10 bg-stone-50 px-4 py-3 text-sm leading-7 text-stone-900 outline-none transition focus:border-stone-900"
            maxLength={200}
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={askFollowup}
              disabled={isAsking}
              className="rounded-full bg-stone-900 px-4 py-2 text-xs uppercase tracking-[0.22em] text-stone-50 transition hover:bg-stone-800 disabled:opacity-50"
            >
              {isAsking ? t.card.askingButton : t.card.askButton}
            </button>
            {answerMode ? (
              <span className="pathsplit-meta-label">
                {answerMode === 'mock' ? t.card.mockReply : t.card.realReply}
              </span>
            ) : null}
          </div>
          {followupError ? <p className="mt-3 text-sm leading-7 text-rose-700">{followupError}</p> : null}
          {answer || isAsking ? (
            <p className={`mt-4 text-sm leading-7 text-stone-800 ${isStreamingAnswer ? 'streaming-cursor' : ''}`}>{answer}</p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
