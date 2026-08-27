import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import ArticleCard from './ArticleCard';
import type { ArticleSummary } from '@/data/articles';

interface Props { id: string; title: string; subtitle: string; articles: ArticleSummary[]; totalCount: number; }

const shortLabel: Record<string, string> = { ia: 'IA', tech: 'Tech', dev: 'Dev', politique: 'Politique' };

export default function CategorySection({ id, title, subtitle, articles, totalCount }: Props) {
  if (articles.length === 0) return null;
  return (
    <section id={id} className="scroll-mt-20 border-t border-[var(--rule)] py-12 lg:py-16" style={{ background: 'var(--paper)' }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-editorial)]" aria-hidden />
              <span className="text-[11px] font-sans font-semibold tracking-[0.12em] uppercase text-[var(--ink-faint)]">{shortLabel[id] ?? id.toUpperCase()}</span>
            </div>
            <h2 className="font-editorial text-[32px] lg:text-[44px] font-semibold tracking-[-0.03em] leading-none text-[var(--ink)]">{title}</h2>
            <p className="font-sans text-sm text-[var(--ink-muted)] mt-2 max-w-[60ch]">{subtitle}</p>
          </div>
          <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)]">Dernières publications</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 auto-rows-fr">
          {articles.slice(0, 6).map((a, i) => (
            <ArticleCard key={a.id} article={a} index={i} />
          ))}
        </div>
        <div className="mt-9 border-y border-[var(--rule)]">
          <Link
            to={`/rubrique/${id}`}
            className="group flex min-h-20 items-center justify-between gap-6 py-5 text-[var(--ink)] transition-colors hover:text-[var(--accent-editorial)]"
          >
            <div>
              <span className="overline text-[var(--ink-faint)]">Archives de la rubrique</span>
              <p className="mt-1 font-editorial text-2xl font-semibold sm:text-3xl">
                Explorer les {totalCount.toLocaleString('fr-FR')} articles
              </p>
            </div>
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--rule)] transition-all group-hover:border-[var(--accent-editorial)] group-hover:bg-[var(--accent-editorial)] group-hover:text-[var(--paper)]">
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
