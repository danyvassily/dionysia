import { Link } from 'react-router';
import { ArrowUpRight, Clock } from 'lucide-react';
import AnimatedArticleTitle from './AnimatedArticleTitle';
import type { Article } from '@/data/articles';

interface ArticleCardProps { article: Article; index?: number; }
const over: Record<string, string> = { ia: 'Intelligence Artificielle', tech: 'Technologie', dev: 'Développement', politique: 'Politique Numérique' };

export default function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  return (
    <article className="group flex flex-col h-full rounded-xl border bg-[var(--paper)] hover:bg-[var(--paper-dark)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden" style={{ borderColor: 'var(--rule)' }}>
      {/* Top accent line */}
      <div className="h-[3px] w-full bg-[var(--accent-editorial)] opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex px-2 py-0.5 rounded-full bg-[var(--paper-soft)] border text-[10px] font-sans font-semibold tracking-[0.1em] uppercase text-[var(--ink-muted)]" style={{ borderColor: 'var(--rule)' }}>{over[article.category] ?? article.category}</span>
          {article.tag && <span className="text-[11px] font-sans font-medium text-[var(--accent-editorial)]">· {article.tag}</span>}
        </div>
        <Link to={`/article/${article.id}`} className="block mb-2">
          <AnimatedArticleTitle
            text={article.title}
            as="h3"
            className="font-editorial text-[15px] lg:text-[16.5px] font-bold leading-snug text-[var(--ink)] group-hover:text-[var(--accent-editorial)] transition-colors line-clamp-3 break-words"
            delay={index * 0.06}
          />
        </Link>
        <p className="font-sans text-[13px] leading-relaxed text-[var(--ink-muted)] line-clamp-3 flex-1">{article.excerpt}</p>
        <div className="mt-4 pt-4 flex items-center gap-2 text-[11px] font-sans text-[var(--ink-faint)] border-t" style={{ borderColor: 'var(--rule)' }}>
          <span className="font-medium text-[var(--ink-muted)]">{article.date}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
          <Link to={`/article/${article.id}`} aria-label={`Lire ${article.title}`} className="ml-auto inline-flex items-center justify-center w-7 h-7 rounded-full border bg-[var(--paper)] hover:bg-[var(--ink)] hover:text-[var(--paper)] hover:border-[var(--ink)] transition-colors" style={{ borderColor: 'var(--rule)' }}>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
