import type { ArticleSummary } from '@/data/articles';
import { getArticleBrandMarks } from '@/lib/articleBrands';
import { getArticleVisual } from '@/lib/articleVisuals';

const categoryNames: Record<ArticleSummary['category'], string> = {
  ia: 'Intelligence artificielle',
  tech: 'Technologie',
  dev: 'Développement',
  politique: 'Politique numérique',
};

const categoryAccents: Record<ArticleSummary['category'], string> = {
  ia: '#2647c7',
  tech: '#c43d27',
  dev: '#315f42',
  politique: '#722d38',
};

function hashArticle(article: ArticleSummary) {
  let value = 2166136261;
  for (const character of `${article.id}:${article.title}`) {
    value ^= character.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function UniqueEditorialVisual({ article }: { article: ArticleSummary }) {
  const seed = hashArticle(article);
  const marks = getArticleBrandMarks(article);
  const accent = categoryAccents[article.category];
  const rotation = (seed % 28) - 14;
  const x = 18 + (seed % 54);
  const y = 16 + ((seed >>> 7) % 48);
  const size = 30 + ((seed >>> 13) % 24);
  const index = String(Number.parseInt(article.id, 10) || (seed % 999)).padStart(3, '0');

  return (
    <div
      role="img"
      aria-label={`Composition éditoriale unique pour l’article : ${article.title}`}
      className="relative aspect-[16/9] overflow-hidden bg-[#e9e1d2] text-[#171713]"
      style={{
        backgroundImage: `linear-gradient(${95 + (seed % 35)}deg, rgba(255,255,255,.5), transparent 48%), repeating-linear-gradient(90deg, rgba(23,23,19,.055) 0 1px, transparent 1px 9%)`,
      }}
    >
      <div className="absolute inset-y-0 right-0 w-[38%] bg-[#171713]" style={{ clipPath: `polygon(${seed % 35}% 0, 100% 0, 100% 100%, 0 100%)` }} />
      {marks.length === 0 && (
        <div
          className="absolute rounded-full opacity-90 mix-blend-multiply"
          style={{ width: `${size}%`, aspectRatio: '1', left: `${x}%`, top: `${y}%`, background: accent, transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
        />
      )}
      <div
        className="absolute border border-[#171713]/45 bg-[#f5efe4]/55"
        style={{ width: `${24 + (seed % 22)}%`, aspectRatio: '1.4', left: `${8 + ((seed >>> 4) % 52)}%`, bottom: `${4 + ((seed >>> 11) % 23)}%`, transform: `rotate(${-rotation}deg)` }}
      />
      <div className="absolute inset-0 flex flex-col justify-between p-[clamp(1rem,3vw,2rem)]">
        <div className="flex items-start justify-between gap-4 text-[9px] font-semibold uppercase tracking-[0.16em]">
          <span>{categoryNames[article.category]}</span>
          <span className="text-[#f5efe4]">N° {index}</span>
        </div>
        {marks.length > 0 ? (
          <div className={`relative z-10 grid max-w-[76%] gap-2 ${marks.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {marks.map((mark) => (
              <div key={mark.src} className="flex min-h-[clamp(3.8rem,9vw,7rem)] items-center justify-center border border-black/10 bg-white/95 p-[clamp(.65rem,2vw,1.25rem)] shadow-sm">
                <img
                  src={mark.src}
                  alt={`${mark.kind === 'flag' ? 'Drapeau' : 'Logo'} ${mark.label}`}
                  loading="lazy"
                  decoding="async"
                  className={`max-h-[clamp(2.3rem,6vw,4.8rem)] w-full object-contain ${mark.kind === 'flag' ? 'max-w-[8rem]' : 'max-w-[10rem]'}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="relative z-10 max-w-[62%] font-editorial text-[clamp(1.05rem,2.7vw,2.15rem)] font-semibold leading-[0.94] tracking-[-0.035em] line-clamp-3">
            {article.tag ?? article.title}
          </p>
        )}
      </div>
    </div>
  );
}

interface Props {
  article: ArticleSummary;
  className?: string;
  caption?: boolean;
  eager?: boolean;
}

export default function ArticleVisual({ article, className = '', caption = false, eager = false }: Props) {
  const visual = getArticleVisual(article);
  if (!visual) {
    return (
      <figure className={className}>
        <UniqueEditorialVisual article={article} />
        {caption && (
          <figcaption className="mt-2 text-[10px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">
            Composition éditoriale unique DIONYSIA
          </figcaption>
        )}
      </figure>
    );
  }

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
          {visual.credit} · {visual.license}
        </figcaption>
      )}
    </figure>
  );
}
