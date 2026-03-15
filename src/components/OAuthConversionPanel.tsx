'use client';

import { useI18n } from '@/lib/i18n/context';
import type { EvidenceCard, SecondMeSessionStatus } from '@/lib/types';

function buildLivePrompt(question: string, evidenceCard: EvidenceCard) {
  return `${question}

我刚看完这张 PathSplit 证据卡：
${evidenceCard.summary}

请不要复述卡片。站在我的真实处境里，只回答两个点：
1. 现在最该优先验证的一个风险是什么？
2. 我接下来 7 天内最值得做的一个动作是什么？`;
}

export function OAuthConversionPanel({
  question,
  evidenceCard,
  session,
  cardCount,
  realCardCount,
  onContinueLive,
}: {
  question: string;
  evidenceCard: EvidenceCard;
  session: SecondMeSessionStatus;
  cardCount: number;
  realCardCount: number;
  onContinueLive: (prompt: string) => void;
}) {
  const { t } = useI18n();
  const livePrompt = buildLivePrompt(question, evidenceCard);
  const productViewCount = Math.max(0, cardCount - realCardCount);

  return (
    <section className="pathsplit-card border-black/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(245,245,244,0.94))]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="pathsplit-section-kicker">{t.oauth.kicker}</div>
            <h2 className="text-3xl font-semibold text-stone-950">
              {session.connected ? t.oauth.titleConnected : t.oauth.titleDisconnected}
            </h2>
            <p className="max-w-3xl text-base leading-8 text-stone-700">
              {session.connected ? t.oauth.descConnected : t.oauth.descDisconnected}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="pathsplit-meta-chip">
              {t.oauth.chipReal} {realCardCount}
            </span>
            <span className="pathsplit-meta-chip">
              {t.oauth.chipMock} {productViewCount}
            </span>
            <span className="pathsplit-meta-chip">
              {t.oauth.chipPortal}
            </span>
          </div>
        </div>

        <div className="grid gap-3 text-sm leading-7 text-stone-700 md:grid-cols-3">
          <div className="rounded-[1.3rem] border border-black/8 bg-white/80 p-4">
            <div className="pathsplit-meta-label">1</div>
            <p className="mt-2">{t.oauth.step1}</p>
          </div>
          <div className="rounded-[1.3rem] border border-black/8 bg-white/80 p-4">
            <div className="pathsplit-meta-label">2</div>
            <p className="mt-2">{t.oauth.step2}</p>
          </div>
          <div className="rounded-[1.3rem] border border-black/8 bg-white/80 p-4">
            <div className="pathsplit-meta-label">3</div>
            <p className="mt-2">
              {session.connected ? t.oauth.step3Connected : t.oauth.step3Disconnected}
            </p>
          </div>
        </div>

        {session.available ? (
          session.connected ? (
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onContinueLive(livePrompt)}
                className="rounded-full bg-[linear-gradient(135deg,#0f172a,#0f766e)] px-6 py-3 text-xs uppercase tracking-[0.24em] text-stone-50 transition hover:translate-y-[-1px]"
              >
                {t.oauth.ctaConnected}
              </button>
              <span className="text-sm leading-7 text-stone-700">
                {t.oauth.ctaConnectedHelper}
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/api/auth/login?source=evidence-card"
                className="rounded-full bg-stone-900 px-6 py-3 text-xs uppercase tracking-[0.24em] text-stone-50 transition hover:bg-stone-800"
              >
                {t.oauth.ctaDisconnected}
              </a>
              <span className="text-sm leading-7 text-stone-700">
                {t.oauth.ctaDisconnectedHelper}
              </span>
            </div>
          )
        ) : (
          <p className="text-sm leading-7 text-stone-700">
            {t.oauth.noOauth}
          </p>
        )}
      </div>
    </section>
  );
}
