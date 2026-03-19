'use client';

import { useI18n } from '@/lib/i18n/context';
import type { EvidenceCard, SecondMeSessionStatus } from '@/lib/types';

function buildLivePrompt(question: string, evidenceCard: EvidenceCard, t: { livePromptIntro: string; livePromptInstruction: string }) {
  return `${question}\n\n${t.livePromptIntro}\n${evidenceCard.summary}\n\n${t.livePromptInstruction}`;
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
  const livePrompt = buildLivePrompt(question, evidenceCard, t.oauth);
  const productViewCount = Math.max(0, cardCount - realCardCount);

  return (
    <section className="pathsplit-card pathsplit-oauth-panel">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2.5">
            <div className="pathsplit-section-kicker">{t.oauth.kicker}</div>
            <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
              {session.connected ? t.oauth.titleConnected : t.oauth.titleDisconnected}
            </h2>
            <p className="max-w-2xl text-[0.9rem] leading-7 text-stone-600">
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

        <div className="pathsplit-oauth-compare">
          <article className="pathsplit-oauth-column">
            <div className="pathsplit-meta-label">{t.oauth.nowTitle}</div>
            <div className="mt-3 space-y-3">
              {[t.oauth.now1, t.oauth.now2, t.oauth.now3].map((item, index) => (
                <div key={item} className="pathsplit-oauth-row">
                  <span className="pathsplit-oauth-dot">{index + 1}</span>
                  <p className="text-[0.84rem] leading-6 text-stone-700">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="pathsplit-oauth-column pathsplit-oauth-column-accent">
            <div className="pathsplit-meta-label">
              {session.connected ? t.oauth.unlockTitleConnected : t.oauth.unlockTitleDisconnected}
            </div>
            <div className="mt-3 space-y-3">
              {[t.oauth.unlock1, t.oauth.unlock2, session.connected ? t.oauth.unlock3Connected : t.oauth.unlock3Disconnected].map((item, index) => (
                <div key={item} className="pathsplit-oauth-row">
                  <span className="pathsplit-oauth-dot">{index + 1}</span>
                  <p className="text-[0.84rem] leading-6 text-stone-800">{item}</p>
                </div>
              ))}
            </div>
          </article>
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
