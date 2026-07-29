import { Link } from 'react-router';
import { ArrowUpRight, Clock } from 'lucide-react';
import AnimatedArticleTitle from './AnimatedArticleTitle';
import type { Article } from '@/data/articles';

interface ArticleCardProps {
  article: Article;
  index?: number;
}

const categoryOverlines: Record<string, string> = {
  ia: 'Intelligence Artificielle',
  tech: 'Technologie',
  dev: 'Developpement',
  politique: 'Politique',
};

export default function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  return (
    <article
      className="group flex flex-col animate-fade-in-up"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* Top rule */}
      <div className="w-full mb-4" style={{ borderTop: '1px solid var(--rule)' }} />

      {/* Overline */}
      <span className="overline text-[var(--ink-faint)] mb-2 text-xs tracking-widest">
        {categoryOverlines[article.category]}
      </span>

      {/* GRAND TITRE avec animation GSAP */}
      <Link to={`/article/${article.id}`} className="block mb-3 no-underline">
        <AnimatedArticleTitle
          text={article.title}
          as="h3"
          className="font-editorial text-sm sm:text-base lg:text-lg font-bold text-[var(--ink)] leading-snug hover:text-[var(--accent-editorial)] transition-colors duration-300 break-words"
          delay={index * 0.1}
        />
      </Link>

      {/* Excerpt */}
      <p className="font-sans text-sm sm:text-base text-[var(--ink-muted)] leading-relaxed mb-4 flex-1">
        {article.excerpt}
      </p>

      {/* Meta footer */}
      <div className="flex items-center gap-3 text-xs font-sans text-[var(--ink-faint)]">
        <span className="font-medium">{article.date}</span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {article.readTime}
        </span>
        {article.tag && (
          <>
            <span>·</span>
            <span className="text-[var(--accent-editorial)] font-medium">{article.tag}</span>
          </>
        )}
        <Link
          to={`/article/${article.id}`}
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <ArrowUpRight className="w-4 h-4 text-[var(--ink-muted)]" />
        </Link>
      </div>
    </article>
  );
}
