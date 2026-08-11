import { Link } from 'react-router';
import { ArrowUpRight, Clock } from 'lucide-react';
import AnimatedTitle from './AnimatedTitle';
import type { Article } from '@/data/articles';

interface FeaturedArticleProps { article: Article; index?: number; }

const over: Record<string, string> = { ia: 'Intelligence Artificielle', tech: 'Technologie', dev: 'Développement', politique: 'Politique Numérique' };

export default function FeaturedArticle({ article, index = 0 }: FeaturedArticleProps) {
  const n = String(index + 1).padStart(2, '0');
  return (
    <article className="group relative grid lg:grid-cols-12 gap-6 lg:gap-8 items-start py-8 lg:py-9 border-b last:border-b-0" style={{ borderColor: 'var(--rule)' }}>
      {/* Left rail — number + meta */}
      <div className="lg:col-span-3 flex lg:flex-col gap-4 lg:gap-3">
        <span className="font-editorial text-[44px] lg:text-[56px] font-bold leading-none tracking-[-0.04em] text-[var(--ink-ghost)] select-none">{n}</span>
        <div className="flex flex-col gap-2 pt-1">
          <span className="inline-flex self-start px-2 py-1 rounded-full border text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-[var(--accent-editorial)] bg-[var(--paper-soft)]" style={{ borderColor: 'color-mix(in srgb, var(--accent-editorial) 18%, var(--rule))' }}>{over[article.category] ?? article.category}</span>
          <span className="flex items-center gap-2 text-[11px] font-sans text-[var(--ink-faint)]">
            <Clock className="w-3 h-3" /> {article.date} · {article.readTime} {article.tag && <>· <span className="text-[var(--accent-editorial)] font-medium">{article.tag}</span></>}
          </span>
        </div>
      </div>

      {/* Right — content */}
      <div className="lg:col-span-9">
        <Link to={`/article/${article.id}`} className="block group/title">
          <AnimatedTitle
            text={article.title}
            className="font-editorial text-[18px] sm:text-[20px] lg:text-[22px] font-bold leading-[1.18] text-[var(--ink)] group-hover/title:text-[var(--accent-editorial)] transition-colors line-clamp-3"
          />
        </Link>
        <p className="font-sans text-[13.5px] lg:text-[14.5px] leading-relaxed text-[var(--ink-muted)] mt-3 line-clamp-3 max-w-[62ch]">{article.excerpt}</p>
        <div className="mt-4 flex items-center gap-3">
          <Link to={`/article/${article.id}`} className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[var(--ink)] hover:text-[var(--accent-editorial)] transition-colors">
            Lire l'article <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <span className="h-3 w-px bg-[var(--rule)]" aria-hidden />
          <span className="text-[11px] font-sans text-[var(--ink-faint)]">{article.readTime} de lecture</span>
        </div>
      </div>
    </article>
  );
}
