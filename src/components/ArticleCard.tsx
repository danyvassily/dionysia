import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import type { Article } from '@/data/articles';

interface ArticleCardProps { article: Article; index?: number }

const labels: Record<Article['category'], string> = {
  ia: 'IA', tech: 'Tech', dev: 'Dev', politique: 'Politique',
};

export default function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  return (
    <article className="group flex h-full flex-col border-t border-[var(--rule)] pt-5" style={{ animationDelay: `${index * 0.04}s` }}>
      <div className="flex items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
        <span>{labels[article.category]}{article.tag ? ` · ${article.tag}` : ''}</span>
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>

      <Link to={`/article/${article.id}`} className="mt-4 block">
        <h3 className="font-editorial text-[1.65rem] font-semibold leading-[1.04] tracking-[-0.02em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent-editorial)]">
          {article.title}
        </h3>
      </Link>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--ink-muted)]">{article.excerpt}</p>

      <div className="mt-auto flex items-center border-b border-[var(--rule)] pb-5 pt-6 text-xs text-[var(--ink-faint)]">
        <span>{article.date} · {article.readTime}</span>
        <Link to={`/article/${article.id}`} className="ml-auto inline-flex h-8 w-8 items-center justify-center border border-[var(--rule)] text-[var(--ink)] transition-colors hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]" aria-label={`Lire : ${article.title}`}>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
