import { createContext } from 'react';

export type SiteLanguage = 'fr' | 'en';

export interface LanguageContextValue {
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
}

export const LanguageContext = createContext<LanguageContextValue>({
  language: 'fr',
  setLanguage: () => undefined,
});

export const LANGUAGE_STORAGE_KEY = 'dionysia-language';

export function getPreferredLanguage(): SiteLanguage {
  if (typeof window === 'undefined') return 'fr';

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === 'fr' || stored === 'en') return stored;

  const primaryLanguage = window.navigator.languages?.[0] || window.navigator.language || 'fr';
  return primaryLanguage.toLowerCase().startsWith('en') ? 'en' : 'fr';
}

export function updateTranslationCookie(language: SiteLanguage) {
  if (language === 'en') {
    document.cookie = 'googtrans=/fr/en; path=/; max-age=31536000; SameSite=Lax';
    return;
  }

  document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
}
