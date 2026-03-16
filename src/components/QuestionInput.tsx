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
        <div className="space-y-3">
          <div className="pathsplit-section-kicker">{t.input.kicker}</div>
          <h2 className="text-[1.75rem] leading-[1.1] font-semibold tracking-tight text-stone-950">{t.input.title}</h2>
          <p className="text-[0.88rem] leading-6 text-stone-600">
            {t.input.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="pathsplit-soft-pill">
            {t.input.explorePill}
          </span>
          {sessionAvailable ? (
            sessionConnected ? (
              <span className="rounded-full border border-emerald-200/60 bg-emerald-50/80 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-emerald-700">
                {t.input.oauthConnected}
              </span>
            ) : (
              <a
                href="/api/auth/login?source=hero"
                className="pathsplit-soft-pill transition hover:border-black/16 hover:text-stone-900"
              >
                {t.input.oauthConnect}
              </a>
            )
          ) : null}
        </div>

        <label className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="pathsplit-meta-label">{t.input.fieldLabel}</span>
            <span className="pathsplit-counter">{value.trim().length}/500</span>
          </div>
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={t.input.placeholder}
            className="min-h-[7.5rem] w-full resize-none rounded-2xl border border-black/8 bg-white px-4 py-3.5 text-[0.92rem] leading-7 text-stone-900 outline-none transition focus:border-stone-400"
            maxLength={500}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onPreset(preset.prompt)}
              className={`rounded-full border px-3.5 py-1.5 text-[0.8rem] transition ${
                preset.stage === 'mvp'
                  ? 'border-stone-900 bg-stone-900 text-stone-50 hover:bg-stone-800'
                  : 'border-black/8 bg-white/80 text-stone-600 hover:border-black/16 hover:text-stone-900'
              }`}
            >
              {t.presets[preset.id] ?? preset.label}
            </button>
          ))}
        </div>

        {safetyError ? <p className="text-[0.84rem] leading-6 text-rose-600">{safetyError}</p> : null}

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="pathsplit-cta pathsplit-cta-accent w-full"
          >
            {loading ? t.input.submitLoading : t.input.submitIdle}
          </button>
          <p className="text-center text-[0.78rem] leading-5 text-stone-500">
            {t.input.helperText}
          </p>
        </div>
      </div>
    </section>
  );
}
