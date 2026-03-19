'use client';

import { useEffect, useState } from 'react';
import { STARTUP_AGENTS } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/context';
import type { AgentSlotStatus, FollowupResponse, SecondMeSessionStatus } from '@/lib/types';

function getInitial(name: string | undefined, fallback: string) {
  return (name?.trim().charAt(0) || fallback).toUpperCase();
}

function slotLabel(agentId: string) {
  return STARTUP_AGENTS.find((item) => item.id === agentId)?.label ?? agentId;
}

export function LiveModePanel({
  question,
  injectedPrompt,
  promptVersion,
  session,
  onAsk,
}: {
  question: string;
  injectedPrompt?: string;
  promptVersion: number;
  session: SecondMeSessionStatus;
  onAsk: (prompt: string) => Promise<FollowupResponse>;
}) {
  const { locale, t } = useI18n();
  const dateLocale = locale === 'zh' ? 'zh-CN' : 'en-US';

  const [draft, setDraft] = useState(question);
  const [answer, setAnswer] = useState<string>();
  const [error, setError] = useState<string>();
  const [isAsking, setIsAsking] = useState(false);
  const [slots, setSlots] = useState<AgentSlotStatus[]>([]);
  const [slotError, setSlotError] = useState<string>();
  const [slotMessage, setSlotMessage] = useState<string>();
  const [bindingAgentId, setBindingAgentId] = useState<string>();

  function formatExpiry(value?: number) {
    if (!value) return t.live.notConnected;
    return new Intl.DateTimeFormat(dateLocale, {
      hour: '2-digit',
      minute: '2-digit',
      month: 'numeric',
      day: 'numeric',
    }).format(new Date(value));
  }

  function formatSlotUpdate(value?: number) {
    if (!value) return '';
    return new Intl.DateTimeFormat(dateLocale, {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }

  async function loadSlots() {
    const response = await fetch('/api/auth/agent-slots', { cache: 'no-store' });
    if (!response.ok) return;
    const payload = (await response.json().catch(() => null)) as
      | { enabled?: boolean; slots?: AgentSlotStatus[] }
      | null;
    if (payload?.enabled && Array.isArray(payload.slots)) {
      setSlots(payload.slots);
    }
  }

  useEffect(() => {
    setDraft((current) => (current.trim() ? current : question));
  }, [question]);

  useEffect(() => {
    if (!injectedPrompt?.trim()) return;
    setDraft(injectedPrompt);
  }, [injectedPrompt, promptVersion]);

  useEffect(() => {
    void loadSlots();
  }, [session.connected]);

  async function askLiveSelf() {
    setIsAsking(true);
    setError(undefined);
    try {
      const response = await onAsk(draft);
      setAnswer(response.answer);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t.errors.secondmeUnavailable);
    } finally {
      setIsAsking(false);
    }
  }

  async function bindAgentSlot(agentId: string) {
    setBindingAgentId(agentId);
    setSlotError(undefined);
    setSlotMessage(undefined);
    try {
      const response = await fetch('/api/auth/agent-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, seed: true }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string; slots?: AgentSlotStatus[]; seeded?: { seeded: number; total: number } | null }
        | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? t.errors.bindFailed);
      }
      if (Array.isArray(payload?.slots)) {
        setSlots(payload.slots);
      }
      if (payload?.seeded) {
        setSlotMessage(t.errors.bindSuccessWithSeeds(slotLabel(agentId), payload.seeded.seeded, payload.seeded.total));
      } else {
        setSlotMessage(t.errors.bindSuccess(slotLabel(agentId)));
      }
    } catch (issue) {
      setSlotError(issue instanceof Error ? issue.message : t.errors.bindFailed);
    } finally {
      setBindingAgentId(undefined);
    }
  }

  return (
    <section className="pathsplit-panel overflow-hidden">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <div className="pathsplit-section-kicker">{t.live.kicker}</div>
          <div className="space-y-2.5">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-950">{t.live.title}</h2>
            <p className="text-[0.88rem] leading-6 text-stone-600">
              {t.live.description}
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-black/8 bg-stone-50/80 p-4">
          <div className="pathsplit-meta-label">{t.live.connectionLabel}</div>
            {!session.available ? (
              <p className="mt-3 text-sm leading-7 text-stone-700">
                {t.live.noConfig}
              </p>
            ) : session.connected ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3">
                  {session.user?.avatar ? (
                    <div
                      aria-hidden="true"
                      className="h-12 w-12 rounded-full border border-black/8 bg-cover bg-center"
                      style={{ backgroundImage: `url("${session.user.avatar}")` }}
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/8 bg-stone-900 text-sm font-semibold text-stone-50">
                      {getInitial(session.user?.name, t.misc.fallbackInitial)}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-stone-950">{session.user?.name || t.misc.connectedFallbackName}</div>
                  <div className="pathsplit-meta-label">
                      {t.live.tokenExpiry} {formatExpiry(session.expiresAt)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/api/auth/logout"
                    className="rounded-full border border-black/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-stone-600 transition hover:border-black/20 hover:text-stone-950"
                  >
                    {t.live.disconnect}
                  </a>
                  {session.scope.length > 0 ? (
                    <div className="pathsplit-meta-chip">
                      {t.live.slotScopes(session.scope.join(', '))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <p className="text-sm leading-7 text-stone-700">
                  {t.live.connectPrompt}
                </p>
                <a
                  href="/api/auth/login?source=live-panel"
                  className="pathsplit-cta inline-flex"
                >
                  {t.live.connectCta}
                </a>
              </div>
            )}
          </div>

          {session.connected && slots.length > 0 ? (
            <div className="rounded-[1.6rem] border border-black/8 bg-white/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="pathsplit-meta-label">{t.live.slotKicker}</div>
                  <div className="mt-1 text-sm leading-7 text-stone-700">
                    {t.live.slotDescription}
                  </div>
                </div>
                <div className="pathsplit-meta-chip">
                  {t.live.slotReady} {slots.filter((slot) => slot.configured).length}/{slots.length}
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {slots.map((slot) => {
                  const lockedByEnv = slot.source === 'env';
                  const isBinding = bindingAgentId === slot.agentId;

                  return (
                    <div key={slot.agentId} className="rounded-[1.2rem] border border-black/8 bg-stone-50/80 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-stone-950">{slotLabel(slot.agentId)}</div>
                          <div className="pathsplit-meta-label mt-1">
                            {slot.configured ? t.live.slotReadyVia(slot.source ?? 'local') : t.live.slotEmpty}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={!session.connected || lockedByEnv || isBinding}
                          onClick={() => bindAgentSlot(slot.agentId)}
                          className="rounded-full border border-black/10 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-stone-700 transition hover:border-black/20 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {lockedByEnv
                            ? t.live.bindEnvLocked
                            : isBinding
                              ? t.live.bindBinding
                              : slot.configured
                                ? t.live.bindConfigured
                                : t.live.bindEmpty}
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="pathsplit-meta-chip">
                          {t.live.slotSeeds(slot.memoryCount)}
                        </span>
                        {slot.slotName ? (
                          <span className="pathsplit-meta-chip">
                            {slot.slotName}
                          </span>
                        ) : null}
                        {slot.updatedAt ? (
                          <span className="pathsplit-meta-chip">
                            {t.live.slotSynced(formatSlotUpdate(slot.updatedAt))}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              {slotError ? <p className="mt-4 text-sm leading-7 text-rose-700">{slotError}</p> : null}
              {slotMessage ? <p className="mt-4 text-sm leading-7 text-emerald-700">{slotMessage}</p> : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-black/8 bg-white/75 p-5">
          {session.connected ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="pathsplit-meta-label">{t.live.questionKicker}</div>
                  <div className="mt-1 text-lg font-semibold text-stone-950">{t.live.questionTitle}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setDraft(question)}
                  className="rounded-full border border-black/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-stone-600 transition hover:border-black/20 hover:text-stone-950"
                >
                  {t.live.syncButton}
                </button>
              </div>

              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="mt-4 min-h-40 w-full resize-none rounded-[1.4rem] border border-black/10 bg-stone-50 px-5 py-4 text-sm leading-8 text-stone-900 outline-none transition focus:border-stone-900"
                placeholder={t.misc.livePlaceholder}
                maxLength={500}
              />

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={askLiveSelf}
                  disabled={isAsking}
                  className="pathsplit-cta"
                >
                  {isAsking ? t.live.askLoading : t.live.askIdle}
                </button>
                <span className="text-[0.8rem] leading-5 text-stone-500">
                  {t.live.askHelper}
                </span>
              </div>

              {error ? <p className="mt-4 text-sm leading-7 text-rose-700">{error}</p> : null}
              {answer ? (
                <div className="mt-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50/80 p-5">
                  <div className="pathsplit-meta-label text-emerald-800">{t.live.replyLabel}</div>
                  <p className="mt-3 text-sm leading-8 text-stone-800">{answer}</p>
                </div>
              ) : null}
            </>
          ) : (
            <div className="pathsplit-live-locked">
              <div className="pathsplit-meta-label">{t.live.questionKicker}</div>
              <div className="mt-2 text-lg font-semibold text-stone-950">{t.live.lockedTitle}</div>
              <p className="mt-3 text-[0.88rem] leading-7 text-stone-600">{t.live.lockedDescription}</p>

              <div className="mt-5 grid gap-3">
                {[t.live.lockedPoint1, t.live.lockedPoint2, t.live.lockedPoint3].map((item, index) => (
                  <div key={item} className="pathsplit-live-locked-row">
                    <span className="pathsplit-live-locked-index">{index + 1}</span>
                    <p className="text-[0.84rem] leading-6 text-stone-700">{item}</p>
                  </div>
                ))}
              </div>

              {session.available ? (
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <a
                    href="/api/auth/login?source=live-panel"
                    className="pathsplit-cta"
                  >
                    {t.live.connectCta}
                  </a>
                  <span className="text-[0.8rem] leading-5 text-stone-500">
                    {t.live.connectPrompt}
                  </span>
                </div>
              ) : (
                <p className="mt-5 text-[0.84rem] leading-6 text-stone-500">
                  {t.live.noConfig}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
