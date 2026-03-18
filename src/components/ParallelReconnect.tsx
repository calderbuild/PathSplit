'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import type { CrossroadProfile, CrossroadMatch, ZhihuSearchResult } from '@/lib/types';

interface ParallelReconnectProps {
  profile: CrossroadProfile;
}

export function ParallelReconnect({ profile }: ParallelReconnectProps) {
  const { t } = useI18n();
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
      <div className="border-l-4 border-purple-500 pl-4">
        <div className="text-sm font-medium text-gray-500 mb-1">{t.match?.kicker ?? '反事实匹配'}</div>
        <div className="text-gray-600">{t.match?.loading ?? '正在寻找走过另一条路的人...'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-purple-500 pl-4">
        <div className="text-sm font-medium text-gray-500 mb-1">{t.match?.kicker ?? '反事实社交匹配'}</div>
        <h3 className="text-xl font-semibold text-gray-900">
          {matched ? (t.match?.titleMatched ?? '找到了走过另一条路的人') : (t.match?.titleFallback ?? '知乎上的相关讨论')}
        </h3>
      </div>

      {matched && match && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-purple-600 font-medium mb-1">{t.match?.symmetryLabel ?? '对称度'}</div>
              <div className="text-3xl font-bold text-purple-900">{match.symmetryScore}</div>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(match.matchedProfile.createdAt).toLocaleDateString('zh-CN')}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">{t.match?.reasonLabel ?? '匹配原因'}</div>
              <div className="text-gray-900">{match.matchReason}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">{t.match?.theirReflectionLabel ?? 'TA 的反思'}</div>
              <div className="text-gray-800 italic">&ldquo;{match.matchedProfile.userReflection}&rdquo;</div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {match.matchedProfile.keyEmotions.map((emotion) => (
                <span key={emotion} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {emotion}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-purple-200">
            <div className="text-sm text-gray-600">
              {t.match?.nextStepHint ?? '这是一个真实走过另一条路的人。你们可以在知乎圈子中继续讨论。'}
            </div>
          </div>
        </div>
      )}

      {!matched && zhihuResults.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600 mb-4">
            {t.match?.zhihuFallbackHint ?? '暂时没有找到反事实匹配，但知乎上有这些相关讨论：'}
          </div>

          {zhihuResults.map((result, index) => (
            <a
              key={index}
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="font-medium text-gray-900 mb-1">{result.title}</div>
              <div className="text-sm text-gray-600 mb-2">{result.excerpt}</div>
              <div className="text-xs text-gray-500">作者：{result.author}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
