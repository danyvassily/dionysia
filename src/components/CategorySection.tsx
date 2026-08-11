// ArrowRight removed — count badge now
import ArticleCard from './ArticleCard';
import type { Article } from '@/data/articles';

interface Props { id: string; title: string; subtitle: string; articles: Article[]; }

export default function CategorySection({ id, title, subtitle, articles }: Props) {
  if (articles.length === 0) return null;
  return (
    <section id={id} className="py-12 lg:py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 pb-4 border-b" style={{ borderColor: 'var(--rule)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-editorial)]" aria-hidden />
              <span className="overline text-[var(--ink-faint)]">{title}</span>
            </div>
            <h2 className="font-editorial text-[26px] lg:text-[32px] font-semibold tracking-[-0.02em] text-[var(--ink)]">{title}</h2>
            <p className="font-sans text-[13px] text-[var(--ink-muted)] mt-1 max-w-[52ch]">{subtitle}</p>
          </div>
          {articles.length > 3 && <span className="hidden sm:inline-flex text-xs font-sans text-[var(--ink-faint)]">{articles.length} articles</span>}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {articles.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
        </div>
      </div>
    </section>
  );
}
