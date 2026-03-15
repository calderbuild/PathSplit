'use client';

import { useI18n } from '@/lib/i18n/context';
import type { PresetTopic } from '@/lib/types';

export function QuestionInput({
  value,
  loading,
  safetyError,
  sessionAvailable,
  sessionConnected,
  presets,
  onChange,
  onPreset,
  onSubmit,
}: {
  value: string;
  loading: boolean;
  safetyError?: string;
  sessionAvailable: boolean;
  sessionConnected: boolean;
  presets: PresetTopic[];
  onChange: (value: string) => void;
  onPreset: (prompt: string) => void;
  onSubmit: () => void;
}) {
  const { t } = useI18n();

  return (
    <section className="pathsplit-panel pathsplit-input-panel">
      <div className="flex flex-col gap-5">
        <div className="space-y-3.5">
          <div className="pathsplit-section-kicker">{t.input.kicker}</div>
          <h2 className="text-[2.15rem] leading-[1.02] font-semibold text-stone-950">{t.input.title}</h2>
          <p className="max-w-xl text-[1.02rem] leading-8 text-stone-700">
            {t.input.description}
          </p>
          <div className="flex flex-wrap items-center gap-2.5 text-sm leading-7 text-stone-700">
            <span className="pathsplit-soft-pill">
              {t.input.explorePill}
            </span>
            {sessionAvailable ? (
              sessionConnected ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-700">
                  {t.input.oauthConnected}
                </span>
              ) : (
                <a
                  href="/api/auth/login?source=hero"
                  className="pathsplit-soft-pill border-black/10 bg-white text-stone-700 transition hover:border-black/20 hover:text-stone-950"
                >
                  {t.input.oauthConnect}
                </a>
              )
            ) : (
              <span className="pathsplit-soft-pill">
                {t.input.noOauthPill}
              </span>
            )}
          </div>
        </div>

        <label className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="pathsplit-meta-label">{t.input.fieldLabel}</span>
            <span className="pathsplit-counter">{value.trim().length}/500</span>
          </div>
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={t.input.placeholder}
            className="min-h-[8.3rem] w-full resize-none rounded-[1.8rem] border border-black/10 bg-white px-5 py-4 text-base leading-8 text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition focus:border-stone-900"
            maxLength={500}
          />
        </label>

        <div className="flex flex-wrap gap-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onPreset(preset.prompt)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                preset.stage === 'mvp'
                  ? 'border-stone-900 bg-stone-900 text-stone-50 hover:bg-stone-800'
                  : 'border-black/12 bg-white text-stone-700 hover:border-black/25 hover:bg-stone-50'
              }`}
            >
              {t.presets[preset.id] ?? preset.label}
            </button>
          ))}
        </div>

        {safetyError ? <p className="text-sm leading-7 text-rose-700">{safetyError}</p> : null}

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="rounded-full bg-[linear-gradient(135deg,#111827,#7c2d12)] px-7 py-3 text-sm uppercase tracking-[0.26em] text-stone-50 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t.input.submitLoading : t.input.submitIdle}
          </button>
          <span className="max-w-sm text-sm leading-7 text-stone-700">
            {t.input.helperText}
          </span>
        </div>
      </div>
    </section>
  );
}
