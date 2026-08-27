import { ArrowDownRight } from 'lucide-react';

const sections = [
  ['IA', '#ia'],
  ['Technologie', '#tech'],
  ['Développement', '#dev'],
  ['Politique numérique', '#politique'],
];

export default function Hero() {
  return (
    <header id="hero" className="border-b border-[var(--rule)] bg-[var(--paper)] pt-[64px]">
      <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-12 sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-[var(--accent-editorial)]" aria-hidden />
              <p className="overline text-[var(--ink-faint)]">Revue indépendante · Paris</p>
            </div>
            <h1 className="mt-6 max-w-[12ch] font-editorial text-[clamp(3.8rem,10vw,8.5rem)] font-semibold leading-[0.78] tracking-[-0.06em] text-[var(--ink)]">
              DIONYSIA
            </h1>
            <p className="mt-7 max-w-[31ch] font-editorial text-[clamp(1.7rem,4vw,3rem)] leading-[1.02] tracking-[-0.025em]">
              Comprendre la technologie avant qu’elle ne nous échappe.
            </p>
          </div>

          <div className="border-t border-[var(--ink)] pt-5 lg:border-l lg:border-t-0 lg:pb-1 lg:pl-6 lg:pt-0">
            <p className="text-sm leading-6 text-[var(--ink-muted)]">
              Enquêtes, analyses et chroniques sur l’intelligence artificielle, le code et le pouvoir.
            </p>
            <a href="#featured" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink)] hover:text-[var(--accent-editorial)]">
              Lire l’édition du jour <ArrowDownRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <nav aria-label="Rubriques" className="mt-12 grid border-y border-[var(--rule)] sm:grid-cols-2 lg:grid-cols-4">
          {sections.map(([label, href], index) => (
            <a
              key={href}
              href={href}
              className={`group flex items-center justify-between py-4 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] sm:px-4 ${index > 0 ? 'lg:border-l lg:border-[var(--rule)]' : ''}`}
            >
              <span>{label}</span><span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
