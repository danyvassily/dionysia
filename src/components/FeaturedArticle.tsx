import { Link } from 'react-router';
import { ArrowUpRight, Clock } from 'lucide-react';
import AnimatedArticleTitle from './AnimatedArticleTitle';
import type { Article } from '@/data/articles';

interface FeaturedArticleProps {
  article: Article;
}

const categoryOverlines: Record<string, string> = {
  ia: 'Intelligence Artificielle',
  tech: 'Technologie',
  dev: 'Developpement',
  politique: 'Politique Numerique',
};

export default function FeaturedArticle({ article }: FeaturedArticleProps) {
  return (
    <article className="group grid lg:grid-cols-12 gap-6 lg:gap-10 items-start animate-fade-in-up">
      {/* Visual / number side */}
      <div className="lg:col-span-4 flex flex-col">
        <div className="w-full mb-4" style={{ borderTop: '3px double var(--rule)' }} />
        <span className="overline text-[var(--accent-editorial)] mb-3">
          {categoryOverlines[article.category]}
        </span>
        <div className="font-editorial text-6xl lg:text-7xl font-bold text-[var(--rule)] leading-none select-none">
          {String(article.id).padStart(2, '0')}
        </div>
      </div>

      {/* Content side */}
      <div className="lg:col-span-8">
        {/* Animated Title */}
        <Link to={`/article/${article.id}`} className="block mb-4">
          <AnimatedArticleTitle
            text={article.title}
            as="h2"
            className="font-editorial text-2xl lg:text-3xl xl:text-4xl font-semibold text-[var(--ink)] leading-tight hover:text-[var(--accent-editorial)] transition-colors duration-300"
          />
        </Link>

        <p className="font-sans text-base text-[var(--ink-muted)] leading-relaxed mb-6">
          {article.excerpt}
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs font-sans text-[var(--ink-faint)]">
            <span>{article.date}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime}
            </span>
            {article.tag && (
              <>
                <span>·</span>
                <span className="text-[var(--accent-editorial)]">{article.tag}</span>
              </>
            )}
          </div>
          <Link
            to={`/article/${article.id}`}
            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ArrowUpRight className="w-4 h-4 text-[var(--ink-muted)]" />
          </Link>
        </div>
      </div>
    </article>
  );
}
