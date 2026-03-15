'use client';

import { useI18n } from '@/lib/i18n/context';

export function SafetyLabel({
  compact = false,
  variant = 'mock',
}: {
  compact?: boolean;
  variant?: 'mock' | 'secondme';
}) {
  const { t } = useI18n();
  const label = variant === 'secondme' ? t.safety.real : t.safety.mock;

  return (
    <div
      className={`pathsplit-meta-chip gap-2 backdrop-blur ${compact ? '' : 'shadow-sm'}`}
    >
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      <span>{label}</span>
    </div>
  );
}
