'use client';

import { SafetyLabel } from './SafetyLabel';
import { useI18n } from '@/lib/i18n/context';
import type { EvidenceCard as EvidenceCardType } from '@/lib/types';

export function EvidenceCard({ card }: { card: EvidenceCardType }) {
  const { t } = useI18n();

  return (
    <section className="pathsplit-card relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.18),transparent_70%)]" />
      <div className="relative space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="pathsplit-section-kicker">{t.evidence.kicker}</div>
            <h2 className="mt-2 text-3xl font-semibold text-stone-950">{card.topic}</h2>
          </div>
          <SafetyLabel />
        </div>

        <p className="pathsplit-evidence-summary max-w-3xl text-lg leading-8 text-stone-800">{card.summary}</p>

        <div className="grid gap-4 lg:grid-cols-3">
          {card.paths.map((path, index) => (
            <article key={path.agentId} className="pathsplit-evidence-path">
              <div className="flex items-center justify-between gap-3">
                <span className="pathsplit-evidence-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="pathsplit-meta-label text-right">{path.label}</div>
              </div>
              <p className="mt-4 text-sm leading-7 text-stone-800">{path.keyDecision}</p>
              <p className="mt-3 text-sm leading-7 text-stone-700">{path.outcome}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {path.keyNumbers.map((metric) => (
                  <span
                    key={`${path.agentId}-${metric}`}
                    className="rounded-full border border-black/8 bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-stone-700"
                  >
                    {metric}
                  </span>
                ))}
              </div>

              <div className="mt-5 border-t border-black/8 pt-4 text-sm leading-7 text-stone-700">
                <span className="pathsplit-meta-label mr-2">{t.evidence.ifAgainLabel}</span>
                {path.ifAgain}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
