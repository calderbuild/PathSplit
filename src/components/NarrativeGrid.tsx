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
    <section className="space-y-6">
      <div className="pathsplit-section-shell flex flex-col gap-4">
        <div className="pathsplit-section-kicker">{t.narrative.kicker}</div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="max-w-3xl text-lg leading-8 text-stone-800">{rationale}</p>
          <div className="pathsplit-meta-chip">
            {t.narrative.chip}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {cards.map((card, index) => (
          <div key={card.meta.id} className="pathsplit-rise" style={{ animationDelay: `${index * 120}ms` }}>
            <PerspectiveCard card={card} onAskFollowup={onAskFollowup} />
          </div>
        ))}
      </div>
    </section>
  );
}
