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
    <section className="pathsplit-card">
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2.5">
            <div className="pathsplit-section-kicker">{t.oauth.kicker}</div>
            <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
              {session.connected ? t.oauth.titleConnected : t.oauth.titleDisconnected}
            </h2>
            <p className="max-w-2xl text-[0.88rem] leading-6 text-stone-600">
              {session.connected ? t.oauth.descConnected : t.oauth.descDisconnected}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="pathsplit-meta-chip">
              {t.oauth.chipReal} {realCardCount}
            </span>
            <span className="pathsplit-meta-chip">
              {t.oauth.chipMock} {productViewCount}
            </span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[t.oauth.step1, t.oauth.step2, session.connected ? t.oauth.step3Connected : t.oauth.step3Disconnected].map((step, i) => (
            <div key={i} className="rounded-xl border border-black/6 bg-white/60 p-3.5">
              <div className="pathsplit-meta-label">{i + 1}</div>
              <p className="mt-1.5 text-[0.84rem] leading-6 text-stone-600">{step}</p>
            </div>
          ))}
        </div>

        {session.available ? (
          session.connected ? (
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onContinueLive(livePrompt)}
                className="pathsplit-cta"
              >
                {t.oauth.ctaConnected}
              </button>
              <span className="text-[0.8rem] leading-5 text-stone-500">
                {t.oauth.ctaConnectedHelper}
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/api/auth/login?source=evidence-card"
                className="pathsplit-cta"
              >
                {t.oauth.ctaDisconnected}
              </a>
              <span className="text-[0.8rem] leading-5 text-stone-500">
                {t.oauth.ctaDisconnectedHelper}
              </span>
            </div>
          )
        ) : (
          <p className="text-[0.84rem] leading-6 text-stone-500">
            {t.oauth.noOauth}
          </p>
        )}
      </div>
    </section>
  );
}
