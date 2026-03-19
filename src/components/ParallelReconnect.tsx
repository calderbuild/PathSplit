'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import type { CrossroadProfile, CrossroadMatch, ZhihuSearchResult } from '@/lib/types';

interface ParallelReconnectProps {
  profile: CrossroadProfile;
}

export function ParallelReconnect({ profile }: ParallelReconnectProps) {
  const { locale, t } = useI18n();
  const dateLocale = locale === 'zh' ? 'zh-CN' : 'en-US';
  const [loading, setLoading] = useState(true);
  const [matched, setMatched] = useState(false);
  const [match, setMatch] = useState<CrossroadMatch | null>(null);
  const [zhihuResults, setZhihuResults] = useState<ZhihuSearchResult[]>([]);

  useEffect(() => {
    const findMatch = async () => {
      try {
        const response = await fetch('/api/crossroad/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        });

        if (!response.ok) {
          throw new Error('Failed to find match');
        }

        const data = await response.json();

        if (data.matched) {
          setMatched(true);
          setMatch(data.match);
        } else {
          setMatched(false);
          setZhihuResults(data.zhihuFallback ?? []);
        }
      } catch (error) {
        console.error('Failed to find match:', error);
      } finally {
        setLoading(false);
      }
    };

    findMatch();
  }, [profile]);

  if (loading) {
    return (
      <section className="pathsplit-card">
        <div className="pathsplit-section-kicker">{t.match.kicker}</div>
        <div className="mt-3 text-[0.9rem] leading-7 text-stone-600">{t.match.loading}</div>
      </section>
    );
  }

  return (
    <section className="pathsplit-card space-y-6">
      <div className="space-y-3">
        <div className="pathsplit-section-kicker">{t.match.kicker}</div>
        <h3 className="text-2xl font-semibold tracking-tight text-stone-950">
          {matched ? t.match.titleMatched : t.match.titleFallback}
        </h3>
      </div>

      {matched && match && (
        <div className="pathsplit-match-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="pathsplit-meta-label mb-1">{t.match.symmetryLabel}</div>
              <div className="text-3xl font-bold text-stone-950">{match.symmetryScore}</div>
            </div>
            <div className="text-sm text-stone-500">
              {new Date(match.matchedProfile.createdAt).toLocaleDateString(dateLocale)}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium text-stone-700 mb-1">{t.match.reasonLabel}</div>
              <div className="text-stone-900">{match.matchReason}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-stone-700 mb-1">{t.match.theirReflectionLabel}</div>
              <div className="text-stone-800 italic">&ldquo;{match.matchedProfile.userReflection}&rdquo;</div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {match.matchedProfile.keyEmotions.map((emotion) => (
                <span key={emotion} className="pathsplit-match-chip">
                  {emotion}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-black/8">
            <div className="text-sm leading-6 text-stone-600">
              {t.match.nextStepHint}
            </div>
          </div>
        </div>
      )}

      {!matched && zhihuResults.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm leading-6 text-stone-600 mb-4">
            {t.match.zhihuFallbackHint}
          </div>

          {zhihuResults.map((result, index) => (
            <a
              key={index}
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pathsplit-zhihu-link"
            >
              <div className="font-medium text-stone-900 mb-1">{result.title}</div>
              <div className="text-sm leading-6 text-stone-600 mb-2">{result.excerpt}</div>
              <div className="text-xs tracking-[0.12em] uppercase text-stone-500">{t.match.authorPrefix} · {result.author}</div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
