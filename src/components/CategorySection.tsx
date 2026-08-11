// ArrowRight removed — count badge now
import ArticleCard from './ArticleCard';
import type { Article } from '@/data/articles';

interface Props { id: string; title: string; subtitle: string; articles: Article[]; }

const shortLabel: Record<string, string> = { ia: 'IA', tech: 'Tech', dev: 'Dev', politique: 'Politique' };

export default function CategorySection({ id, title, subtitle, articles }: Props) {
  if (articles.length === 0) return null;
  return (
    <section id={id} className="py-10 lg:py-14" style={{ background: 'var(--paper)' }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — exact screenshot: dot + IA · title · subtitle · Tout voir → */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-editorial)]" aria-hidden />
              <span className="text-[11px] font-sans font-semibold tracking-[0.12em] uppercase text-[var(--ink-faint)]">{shortLabel[id] ?? id.toUpperCase()}</span>
            </div>
            <h2 className="font-editorial text-[24px] lg:text-[30px] font-bold tracking-[-0.02em] leading-none text-[var(--ink)]">{title}</h2>
            <p className="font-sans text-[13px] text-[var(--ink-muted)] mt-1.5 max-w-[52ch]">{subtitle}</p>
          </div>
          <a href={`#${id}`} className="hidden sm:inline-flex items-center gap-1 text-[13px] font-sans text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors shrink-0 mt-1">
            Tout voir <span aria-hidden>→</span>
          </a>
        </div>
        <div className="h-px w-full mb-6" style={{ background: 'var(--rule)' }} />
        {/* Grid — 3 cols, equal height, generous gutters like screenshot */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 auto-rows-fr">
          {articles.slice(0, 6).map((a, i) => (
            <ArticleCard key={a.id} article={a} index={i} />
          ))}
        </div>
        {articles.length > 6 && (
          <div className="mt-6 text-center">
            <span className="text-xs font-sans text-[var(--ink-faint)]">+{articles.length - 6} autres articles dans {title}</span>
          </div>
        )}
      </div>
    </section>
  );
}
