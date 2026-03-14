'use client';

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
  return (
    <section className="pathsplit-panel">
      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.32em] text-stone-500">问题输入</div>
          <h2 className="text-3xl font-semibold text-stone-950">把一个纠结说具体一点</h2>
          <p className="max-w-2xl text-base leading-7 text-stone-700">
            这个产品当前优先打磨「大厂跳创业」场景。其他预设问题用于展示 PathSplit 的产品结构，但不会像主场景一样深入。
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm leading-7 text-stone-600">
            <span className="rounded-full border border-black/8 bg-stone-50 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-500">
              先 explore，再决定要不要连真人分身
            </span>
            {sessionAvailable ? (
              sessionConnected ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-700">
                  SecondMe 已连接，结果后可直接真人追问
                </span>
              ) : (
                <a
                  href="/api/auth/login?source=hero"
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-700 transition hover:border-black/20 hover:text-stone-950"
                >
                  连接 SecondMe，计入 OAuth 授权登录
                </a>
              )
            ) : (
              <span className="rounded-full border border-black/8 bg-stone-50 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-500">
                当前环境仅开放基础产品体验
              </span>
            )}
          </div>
        </div>

        <label className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm uppercase tracking-[0.22em] text-stone-500">你的问题</span>
            <span className="pathsplit-counter">{value.trim().length}/500</span>
          </div>
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="例如：我在大厂做产品第 6 年，年薪还行，但越来越像在维护别人的增量。我想创业，可我还背着房贷。"
            className="min-h-40 w-full resize-none rounded-[1.8rem] border border-black/10 bg-white px-5 py-4 text-base leading-8 text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition focus:border-stone-900"
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
                  : 'border-black/10 bg-stone-100 text-stone-600 hover:border-black/20'
              }`}
            >
              {preset.label}
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
            {loading ? '正在展开三条路径...' : '开始展开人生路径'}
          </button>
          <span className="text-sm leading-7 text-stone-600">
            我们会先返回 3 条路径，而不是 1 个答案；证据卡出来后再引导真人追问。
          </span>
        </div>
      </div>
    </section>
  );
}
