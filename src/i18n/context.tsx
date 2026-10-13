import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Lang } from '@/types/api';
import { translations, type TranslationKey } from './translations';

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'saaya-lang';

const RTL_LANGS: Lang[] = ['ur', 'sd'];

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    return stored && ['en', 'ur', 'sd'].includes(stored) ? stored : 'en';
  });

  const dir: 'ltr' | 'rtl' = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }

  function t(key: TranslationKey): string {
    const dict = translations[lang] as Record<string, string>;
    return dict[key] ?? translations.en[key] ?? key;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
