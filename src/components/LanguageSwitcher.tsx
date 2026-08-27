import { useLanguage } from '@/hooks/useLanguage';
import type { SiteLanguage } from '@/lib/language';

const languages: Array<{ code: SiteLanguage; flag: string; label: string }> = [
  { code: 'fr', flag: '🇫🇷', label: 'Lire en français' },
  { code: 'en', flag: '🇬🇧', label: 'Read in English' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div role="group" aria-label="Choisir la langue / Choose language" className="notranslate inline-flex items-center border border-[var(--rule)]" translate="no">
      {languages.map((item) => {
        const active = language === item.code;
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code)}
            aria-label={item.label}
            aria-pressed={active}
            title={item.label}
            className={`inline-flex h-8 w-8 items-center justify-center text-[15px] transition-colors ${active ? 'bg-[var(--ink)]' : 'hover:bg-[var(--paper-dark)]'}`}
          >
            <span aria-hidden="true" className={active ? 'saturate-100' : 'grayscale-[35%] opacity-75'}>{item.flag}</span>
          </button>
        );
      })}
    </div>
  );
}
