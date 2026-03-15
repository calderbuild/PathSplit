'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { en } from './en';
import { zh } from './zh';
import type { Translations } from './en';

type Locale = 'en' | 'zh';

const translations: Record<Locale, Translations> = { en, zh };

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('pathsplit-locale') as Locale) || 'zh';
    }
    return 'zh';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pathsplit-locale', newLocale);
      document.documentElement.lang = newLocale === 'zh' ? 'zh-CN' : 'en';
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'zh' : 'en');
  }, [locale, setLocale]);

  const value = useMemo(
    () => ({ locale, t: translations[locale], setLocale, toggleLocale }),
    [locale, setLocale, toggleLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
