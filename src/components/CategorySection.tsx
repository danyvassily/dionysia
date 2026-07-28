import { ArrowRight } from 'lucide-react';
import ArticleCard from './ArticleCard';
import type { Article } from '@/data/articles';

interface CategorySectionProps {
  id: string;
  title: string;
  subtitle: string;
  articles: Article[];
}

export default function CategorySection({ id, title, subtitle, articles }: CategorySectionProps) {
  if (articles.length === 0) return null;

  return (
    <section id={id} className="py-14 lg:py-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10 pb-4" style={{ borderBottom: '1px solid var(--rule)' }}>
          <div>
            <h2 className="font-editorial text-3xl lg:text-4xl font-semibold text-[var(--ink)]">
              {title}
            </h2>
            <p className="font-sans text-sm text-[var(--ink-muted)] mt-1">
              {subtitle}
            </p>
          </div>
          <a
            href={`#${id}`}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[var(--ink-faint)] hover:text-[var(--accent-editorial)] transition-colors group"
          >
            Tout voir
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Articles grid — 3 cols */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {articles.map((article, i) => (
            <ArticleCard key={article.id} article={article} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
