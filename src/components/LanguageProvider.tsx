import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import {
  getPreferredLanguage,
  LanguageContext,
  LANGUAGE_STORAGE_KEY,
  type SiteLanguage,
  updateTranslationCookie,
} from '@/lib/language';

interface GoogleTranslateElement {
  new (options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean }, elementId: string): unknown;
}

declare global {
  interface Window {
    google?: { translate?: { TranslateElement?: GoogleTranslateElement } };
    googleTranslateElementInit?: () => void;
  }
}

const GOOGLE_TRANSLATE_SCRIPT_ID = 'dionysia-google-translate';

function applyEnglishTranslation() {
  const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  const englishOption = select?.querySelector('option[value="en"]');
  if (!select || !englishOption) return false;
  select.value = 'en';
  select.dispatchEvent(new Event('change', { bubbles: true }));
  window.setTimeout(() => document.documentElement.classList.remove('translation-pending'), 250);
  return true;
}

function scheduleEnglishTranslation() {
  const delays = [100, 300, 600, 1000, 1500];
  const timers: number[] = [];

  const attempt = (index: number) => {
    const timer = window.setTimeout(() => {
      const translated = applyEnglishTranslation();
      if (!translated && index < delays.length - 1) attempt(index + 1);
    }, delays[index]);
    timers.push(timer);
  };

  attempt(0);
  return timers;
}

function initializeGoogleTranslate() {
  const TranslateElement = window.google?.translate?.TranslateElement;
  if (!TranslateElement) return;

  if (!document.querySelector('.goog-te-combo')) {
    new TranslateElement(
      { pageLanguage: 'fr', includedLanguages: 'en', autoDisplay: false },
      'google_translate_element',
    );
  }

}

function loadGoogleTranslate() {
  window.googleTranslateElementInit = initializeGoogleTranslate;

  if (window.google?.translate?.TranslateElement) {
    initializeGoogleTranslate();
    return;
  }

  if (document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  script.onerror = () => document.documentElement.classList.remove('translation-pending');
  document.head.appendChild(script);
}

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SiteLanguage>(getPreferredLanguage);
  const { pathname } = useLocation();

  const setLanguage = useCallback((nextLanguage: SiteLanguage) => {
    if (nextLanguage === language) return;

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    updateTranslationCookie(nextLanguage);
    document.documentElement.lang = nextLanguage;
    setLanguageState(nextLanguage);
    window.location.reload();
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
    updateTranslationCookie(language);

    if (language === 'en') {
      document.documentElement.classList.add('translation-pending');
      loadGoogleTranslate();
      const revealTimer = window.setTimeout(() => document.documentElement.classList.remove('translation-pending'), 4200);
      return () => window.clearTimeout(revealTimer);
    }

    document.documentElement.classList.remove('translation-pending');
  }, [language]);

  useEffect(() => {
    if (language !== 'en') return;
    const routeTimers = scheduleEnglishTranslation();
    return () => routeTimers.forEach((timer) => window.clearTimeout(timer));
  }, [language, pathname]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
      <div id="google_translate_element" className="translation-engine notranslate" aria-hidden="true" />
    </LanguageContext.Provider>
  );
}
