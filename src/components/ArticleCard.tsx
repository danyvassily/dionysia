import { Link } from 'react-router';
import { ArrowUpRight, Clock } from 'lucide-react';
import type { Article } from '@/data/articles';

interface ArticleCardProps { article: Article; index?: number; }

export default function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  // Screenshot-exact: card white, border light-gray, rounded 10-12px, 3 zones: tag / excerpt / footer divider
  // No title animation on excerpt cards — excerpt is the hero (screenshot shows excerpt, not title)
  return (
    <article
      className="group flex flex-col h-full rounded-[12px] border bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
      style={{ borderColor: '#E5E7EB', animationDelay: `${index * 0.04}s` }}
    >
      <div className="p-5 sm:p-5 flex flex-col flex-1">
        {/* Tag line — pill IA + · tag (screenshot style: IA pill beige + · Kimi K3 blue) */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-sans font-medium tracking-wide bg-[#F3F0E9] text-[#1E293B] border border-[#E8E4DC]">
            {article.category === 'ia' ? 'IA' : article.category === 'tech' ? 'Tech' : article.category === 'dev' ? 'Dev' : 'Politique'}
          </span>
          {article.tag && (
            <>
              <span className="text-[#9CA3AF] text-[11px]">·</span>
              <span className="text-[11px] font-sans font-medium text-[#0F2E4D] truncate max-w-[14ch]">{article.tag}</span>
            </>
          )}
        </div>

        {/* Body excerpt — 4 lines clamp, 14px charcoal, like screenshot (no title, excerpt IS the content) */}
        {/* Title is hidden visually but kept for SEO/a11y as sr-only + the card links to article */}
        <Link to={`/article/${article.id}`} className="block flex-1 group/link">
          <h3 className="sr-only">{article.title}</h3>
          <p className="font-sans text-[14px] leading-[1.6] text-[#374151] line-clamp-4 group-hover/link:text-[#111827] transition-colors">
            {article.excerpt}
          </p>
        </Link>

        {/* Footer divider + meta (screenshot: thin divider + date · clock X min + ↗ circle) */}
        <div className="mt-4 pt-3 flex items-center gap-1.5 text-[12px] font-sans text-[#9CA3AF] border-t" style={{ borderColor: '#E5E7EB' }}>
          <span className="font-medium text-[#6B7280]">{article.date}</span>
          <span className="text-[#D1D5DB]">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#9CA3AF]" />
            {article.readTime}
          </span>
          <Link
            to={`/article/${article.id}`}
            aria-label={`Lire : ${article.title}`}
            className="ml-auto inline-flex items-center justify-center w-7 h-7 rounded-full border bg-white hover:bg-[#111827] hover:text-white hover:border-[#111827] transition-colors shrink-0"
            style={{ borderColor: '#E5E7EB' }}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
