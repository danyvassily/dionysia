// ArrowRight removed — count badge now
import ArticleCard from './ArticleCard';
import type { Article } from '@/data/articles';

interface Props { id: string; title: string; subtitle: string; articles: Article[]; }

const shortLabel: Record<string, string> = { ia: 'IA', tech: 'Tech', dev: 'Dev', politique: 'Politique' };

export default function CategorySection({ id, title, subtitle, articles }: Props) {
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
      </div>
    </section>
  );
}
