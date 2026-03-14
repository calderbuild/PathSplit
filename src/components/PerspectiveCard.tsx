'use client';

import { useState } from 'react';
import { AgentAvatar } from './AgentAvatar';
import { SafetyLabel } from './SafetyLabel';
import type { AgentCardState, FollowupResponse, FollowupStreamHandlers } from '@/lib/types';

function statusCopy(status: AgentCardState['status']) {
  switch (status) {
    case 'waiting':
      return '等待生成';
    case 'streaming':
      return '正在展开';
    case 'done':
      return '已完成';
    case 'error':
      return '暂不可用';
  }
}

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
  const isStreaming = card.status === 'streaming';
  const [draft, setDraft] = useState('创业最难熬的时刻是什么？');
  const [answer, setAnswer] = useState<string>();
  const [answerMode, setAnswerMode] = useState<'mock' | 'secondme'>();
  const [isAsking, setIsAsking] = useState(false);
  const [isStreamingAnswer, setIsStreamingAnswer] = useState(false);
  const [followupError, setFollowupError] = useState<string>();

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
      setFollowupError(error instanceof Error ? error.message : '追问暂时失败。');
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
            <div className="text-sm uppercase tracking-[0.28em] text-stone-500">{statusCopy(card.status)}</div>
            <h3 className="mt-1 text-xl font-semibold text-stone-950">{card.meta.label}</h3>
          </div>
        </div>
        <SafetyLabel compact variant={card.meta.memoryMode} />
      </header>

      <div className="space-y-2">
        <p className="text-sm leading-6 text-stone-700">{card.meta.persona.background}</p>
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{card.meta.persona.currentState}</p>
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

      <footer className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-stone-500">
        <span>{card.meta.persona.name}</span>
        <span>{card.meta.memoryMode === 'mock' ? 'PathSplit 记忆视角' : 'SecondMe 真人分身'}</span>
      </footer>

      {card.status === 'done' ? (
        <div className="rounded-[1.5rem] border border-black/8 bg-white/70 p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-stone-500">继续追问</div>
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
              {isAsking ? '追问中...' : '追问这个视角'}
            </button>
            {answerMode ? (
              <span className="text-[11px] uppercase tracking-[0.22em] text-stone-500">
                {answerMode === 'mock' ? 'PathSplit 回复' : 'SecondMe 回复'}
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
