'use client';

import { useI18n } from '@/lib/i18n/context';

export function LanguageToggle() {
  const { locale, toggleLocale, t } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="pathsplit-lang-toggle"
      aria-label={`Switch to ${locale === 'en' ? 'Chinese' : 'English'}`}
    >
      {t.lang.switchTo}
    </button>
  );
}
