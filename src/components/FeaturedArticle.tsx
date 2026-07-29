import { Link } from 'react-router';
import { ArrowUpRight, Clock } from 'lucide-react';
import AnimatedTitle from './AnimatedTitle';
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
        <span className="overline text-[var(--accent-editorial)] mb-3 text-sm tracking-widest">
          {categoryOverlines[article.category]}
        </span>
        <div className="font-editorial text-6xl lg:text-7xl font-bold text-[var(--rule)] leading-none select-none">
          {String(article.id).padStart(2, '0')}
        </div>
      </div>

      {/* Content side */}
      <div className="lg:col-span-8">
        {/* GRAND TITRE avec animation GSAP */}
        <Link to={`/article/${article.id}`} className="block mb-5 no-underline">
          <AnimatedTitle
            text={article.title}
            className="font-editorial text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-[var(--ink)] leading-snug hover:text-[var(--accent-editorial)] transition-colors duration-300 break-words"
          />
        </Link>

        <p className="font-sans text-sm sm:text-base lg:text-lg text-[var(--ink-muted)] leading-relaxed mb-6">
          {article.excerpt}
        </p>

        <div className="flex items-center gap-4">
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
