import { TRUST_LABEL } from '@/lib/constants';

function labelForVariant(variant: 'mock' | 'secondme') {
  if (variant === 'secondme') {
    return 'SecondMe 真人分身 | 基于注入经历记忆生成';
  }

  return TRUST_LABEL;
}

export function SafetyLabel({
  compact = false,
  variant = 'mock',
}: {
  compact?: boolean;
  variant?: 'mock' | 'secondme';
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-stone-600 backdrop-blur ${compact ? '' : 'shadow-sm'}`}
    >
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      <span>{labelForVariant(variant)}</span>
    </div>
  );
}
