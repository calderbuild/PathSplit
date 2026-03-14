'use client';

import { useEffect, useState } from 'react';
import { STARTUP_AGENTS } from '@/lib/constants';
import type { AgentSlotStatus, FollowupResponse, SecondMeSessionStatus } from '@/lib/types';

function formatExpiry(value?: number) {
  if (!value) {
    return '未连接';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(value));
}

function getInitial(name?: string) {
  return (name?.trim().charAt(0) || '我').toUpperCase();
}

function formatSlotUpdate(value?: number) {
  if (!value) {
    return '未绑定';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
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
  const [draft, setDraft] = useState(question);
  const [answer, setAnswer] = useState<string>();
  const [error, setError] = useState<string>();
  const [isAsking, setIsAsking] = useState(false);
  const [slots, setSlots] = useState<AgentSlotStatus[]>([]);
  const [slotError, setSlotError] = useState<string>();
  const [slotMessage, setSlotMessage] = useState<string>();
  const [bindingAgentId, setBindingAgentId] = useState<string>();

  async function loadSlots() {
    const response = await fetch('/api/auth/agent-slots', {
      cache: 'no-store',
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json().catch(() => null)) as
      | {
          enabled?: boolean;
          slots?: AgentSlotStatus[];
        }
      | null;

    if (payload?.enabled && Array.isArray(payload.slots)) {
      setSlots(payload.slots);
    }
  }

  useEffect(() => {
    setDraft((current) => (current.trim() ? current : question));
  }, [question]);

  useEffect(() => {
    if (!injectedPrompt?.trim()) {
      return;
    }

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
      setError(issue instanceof Error ? issue.message : 'SecondMe 暂时不可用。');
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId, seed: true }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string;
            slots?: AgentSlotStatus[];
            seeded?: {
              seeded: number;
              total: number;
            } | null;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? '绑定 Agent 失败。');
      }

      if (Array.isArray(payload?.slots)) {
        setSlots(payload.slots);
      }

      if (payload?.seeded) {
        setSlotMessage(`已绑定 ${slotLabel(agentId)}，并注入 ${payload.seeded.seeded}/${payload.seeded.total} 条记忆。`);
      } else {
        setSlotMessage(`已绑定 ${slotLabel(agentId)}。`);
      }
    } catch (issue) {
      setSlotError(issue instanceof Error ? issue.message : '绑定 Agent 失败。');
    } finally {
      setBindingAgentId(undefined);
    }
  }

  return (
    <section className="pathsplit-panel overflow-hidden">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.32em] text-stone-500">SecondMe 真人网络</div>
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold text-stone-950">真人网络，不再停留在样本推演</h2>
            <p className="text-base leading-7 text-stone-700">
              这里连接的是你自己的 SecondMe。上面的三条人生线可以是 mixed mode，到了这一区域，就进入真人授权与真人追问链路。
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-black/8 bg-stone-50/80 p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-stone-500">连接状态</div>
            {!session.available ? (
              <p className="mt-3 text-sm leading-7 text-stone-700">
                还没有配置 `SECONDME_CLIENT_ID` / `SECONDME_CLIENT_SECRET`，当前只开放 PathSplit 的基础产品体验。
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
                      {getInitial(session.user?.name)}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-stone-950">{session.user?.name || '已连接的 SecondMe'}</div>
                  <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
                      Token 截止 {formatExpiry(session.expiresAt)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/api/auth/logout"
                    className="rounded-full border border-black/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-stone-600 transition hover:border-black/20 hover:text-stone-950"
                  >
                    断开连接
                  </a>
                  {session.scope.length > 0 ? (
                    <div className="rounded-full border border-black/8 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-stone-500">
                      scopes: {session.scope.join(', ')}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <p className="text-sm leading-7 text-stone-700">
                  连接后可以把证据卡和主问题直接问给你的 SecondMe，而不是只停留在当前的记忆视角。
                </p>
                <a
                  href="/api/auth/login?source=live-panel"
                  className="inline-flex rounded-full bg-stone-900 px-5 py-3 text-xs uppercase tracking-[0.24em] text-stone-50 transition hover:bg-stone-800"
                >
                  连接 SecondMe，进入真人链路
                </a>
              </div>
            )}
          </div>

          {session.connected && slots.length > 0 ? (
            <div className="rounded-[1.6rem] border border-black/8 bg-white/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-stone-500">并行真人槽位</div>
                  <div className="mt-1 text-sm leading-7 text-stone-700">
                    依次登录 3 个 SecondMe 账号，各绑定到一条人生线。绑定后 `/api/explore` 会优先走真实分身，缺失的槽位自动回落记忆视角。
                  </div>
                </div>
                <div className="rounded-full border border-black/8 bg-stone-50 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-stone-500">
                  ready {slots.filter((slot) => slot.configured).length}/{slots.length}
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
                          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-500">
                            {slot.configured ? `ready via ${slot.source}` : 'empty slot'}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={!session.connected || lockedByEnv || isBinding}
                          onClick={() => bindAgentSlot(slot.agentId)}
                          className="rounded-full border border-black/10 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-stone-700 transition hover:border-black/20 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {lockedByEnv
                            ? 'Env Locked'
                            : isBinding
                              ? 'Binding...'
                              : slot.configured
                                ? '重新绑定当前账号'
                                : '绑定当前账号并注入'}
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-stone-500">
                        <span className="rounded-full border border-black/8 bg-white px-3 py-2">
                          seeds {slot.memoryCount}
                        </span>
                        {slot.slotName ? (
                          <span className="rounded-full border border-black/8 bg-white px-3 py-2">
                            {slot.slotName}
                          </span>
                        ) : null}
                        {slot.updatedAt ? (
                          <span className="rounded-full border border-black/8 bg-white px-3 py-2">
                            synced {formatSlotUpdate(slot.updatedAt)}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-stone-500">真人问题</div>
              <div className="mt-1 text-lg font-semibold text-stone-950">把主问题同步给你的 SecondMe</div>
            </div>
            <button
              type="button"
              onClick={() => setDraft(question)}
              className="rounded-full border border-black/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-stone-600 transition hover:border-black/20 hover:text-stone-950"
            >
              同步主问题
            </button>
          </div>

          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={!session.connected}
            className="mt-4 min-h-40 w-full resize-none rounded-[1.4rem] border border-black/10 bg-stone-50 px-5 py-4 text-sm leading-8 text-stone-900 outline-none transition focus:border-stone-900 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="连接后，把你的真实问题问给自己的 SecondMe。"
            maxLength={500}
          />

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={askLiveSelf}
              disabled={!session.connected || isAsking}
              className="rounded-full bg-[linear-gradient(135deg,#0f172a,#0f766e)] px-6 py-3 text-xs uppercase tracking-[0.24em] text-stone-50 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAsking ? '真人追问中...' : '问我的 SecondMe'}
            </button>
            <span className="text-sm leading-7 text-stone-600">
              这里是实时真人分身链路，不会伪装成上面的创业者角色，也不会冒充上面的三条路径视角。
            </span>
          </div>

          {error ? <p className="mt-4 text-sm leading-7 text-rose-700">{error}</p> : null}
          {answer ? (
            <div className="mt-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50/80 p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-emerald-700">SecondMe 回复</div>
              <p className="mt-3 text-sm leading-8 text-stone-800">{answer}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
