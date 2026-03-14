'use client';

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
  const livePrompt = buildLivePrompt(question, evidenceCard);
  const productViewCount = Math.max(0, cardCount - realCardCount);

  return (
    <section className="pathsplit-card border-black/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(245,245,244,0.94))]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.3em] text-stone-500">下一步</div>
            <h2 className="text-3xl font-semibold text-stone-950">
              {session.connected ? '把这张证据卡同步给你的真人分身' : '连接 SecondMe，把 PathSplit 接入真人网络'}
            </h2>
            <p className="max-w-3xl text-base leading-8 text-stone-700">
              {session.connected
                ? '上面的三条路径里，真人分身与记忆视角会混合存在。下一步不是继续看样本，而是把这张证据卡和你的真实处境一起问给自己的 SecondMe。'
                : '你已经看到了 3 条平行人生线。现在连接 SecondMe，可以把这次体验计入 OAuth 授权登录，并继续追问真人分身。'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-stone-500">
            <span className="rounded-full border border-black/8 bg-white px-3 py-2">
              真人 {realCardCount}
            </span>
            <span className="rounded-full border border-black/8 bg-white px-3 py-2">
              记忆视角 {productViewCount}
            </span>
            <span className="rounded-full border border-black/8 bg-white px-3 py-2">
              Portal 计数
            </span>
          </div>
        </div>

        <div className="grid gap-3 text-sm leading-7 text-stone-700 md:grid-cols-3">
          <div className="rounded-[1.3rem] border border-black/8 bg-white/80 p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-stone-500">1</div>
            <p className="mt-2">先保留首屏体验，不把评委挡在登录墙前。</p>
          </div>
          <div className="rounded-[1.3rem] border border-black/8 bg-white/80 p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-stone-500">2</div>
            <p className="mt-2">证据卡出来后再转 OAuth，价值感更强，掉线更少。</p>
          </div>
          <div className="rounded-[1.3rem] border border-black/8 bg-white/80 p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-stone-500">3</div>
            <p className="mt-2">
              {session.connected
                ? '现在直接把证据卡同步进真人链路，验证这不只是静态内容展示。'
                : '连接后立刻进入真人链路，不需要重新开始整个探索。'}
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
                用这张证据卡继续问我的 SecondMe
              </button>
              <span className="text-sm leading-7 text-stone-600">
                会自动把建议问题填进真人能力区。
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/api/auth/login?source=evidence-card"
                className="rounded-full bg-stone-900 px-6 py-3 text-xs uppercase tracking-[0.24em] text-stone-50 transition hover:bg-stone-800"
              >
                连接 SecondMe，计入授权登录
              </a>
              <span className="text-sm leading-7 text-stone-600">
                回来后会保留当前产品理解，你可以直接进入真人追问。
              </span>
            </div>
          )
        ) : (
          <p className="text-sm leading-7 text-stone-600">
            当前环境还没配置 OAuth，所以这里先展示产品转化位；上线时需要补齐 `SECONDME_CLIENT_ID` / `SECONDME_CLIENT_SECRET`。
          </p>
        )}
      </div>
    </section>
  );
}
