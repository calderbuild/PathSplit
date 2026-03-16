'use client';

import { PerspectiveCard } from './PerspectiveCard';
import { useI18n } from '@/lib/i18n/context';
import type { AgentCardState, FollowupResponse, FollowupStreamHandlers } from '@/lib/types';

export function NarrativeGrid({
  cards,
  rationale,
  onAskFollowup,
}: {
  cards: AgentCardState[];
  rationale: string;
  onAskFollowup: (
    agentId: string,
    question: string,
    handlers?: FollowupStreamHandlers,
  ) => Promise<FollowupResponse>;
}) {
  const { t } = useI18n();

  return (
    <section className="space-y-5">
      <div className="pathsplit-section-shell flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="pathsplit-section-kicker">{t.narrative.kicker}</div>
          <div className="pathsplit-meta-chip">
            {t.narrative.chip}
          </div>
        </div>
        <p className="max-w-3xl text-[0.94rem] leading-7 text-stone-700">{rationale}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {cards.map((card, index) => (
          <div key={card.meta.id} className="pathsplit-rise" style={{ animationDelay: `${index * 120}ms` }}>
            <PerspectiveCard card={card} onAskFollowup={onAskFollowup} />
          </div>
        ))}
      </div>
    </section>
  );
}
