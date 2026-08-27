import type { ArticleSummary } from '@/data/articles';
import { getArticleVisual } from '@/lib/articleVisuals';

interface Props {
  article: ArticleSummary;
  className?: string;
  caption?: boolean;
  eager?: boolean;
}

export default function ArticleVisual({ article, className = '', caption = false, eager = false }: Props) {
  const visual = getArticleVisual(article);
  const image = (
    <img
      src={visual.src}
      alt={visual.alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding="async"
      width="1600"
      height="900"
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
    />
  );

  return (
    <figure className={className}>
      <div className="aspect-[16/9] overflow-hidden bg-[var(--paper-dark)]">
        {visual.sourceUrl ? (
          <a href={visual.sourceUrl} target="_blank" rel="noreferrer noopener" aria-label={`Source de l’image : ${visual.credit}`}>
            {image}
          </a>
        ) : image}
      </div>
      {caption && (
        <figcaption className="mt-2 text-[10px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">
          {visual.credit}{visual.license ? ` · ${visual.license}` : ''}
        </figcaption>
      )}
    </figure>
  );
}
