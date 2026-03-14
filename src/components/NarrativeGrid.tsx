import { PerspectiveCard } from './PerspectiveCard';
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
  return (
    <section className="space-y-6">
      <div className="pathsplit-section-shell flex flex-col gap-4">
        <div className="pathsplit-section-kicker">决策拆解</div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="max-w-3xl text-lg leading-8 text-stone-800">{rationale}</p>
          <div className="rounded-full border border-black/8 bg-white/75 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-stone-500">
            3 条路径并行展开
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
