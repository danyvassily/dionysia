import { ArrowLeft, Share2, Bookmark, Printer } from 'lucide-react';
import { useParams, Link } from 'react-router';
import { articles } from '@/data/articles';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AnimatedMeta from '@/components/AnimatedMeta';

const categoryOverlines: Record<string, string> = {
  ia: 'Intelligence Artificielle',
  tech: 'Technologie',
  dev: 'Developpement',
  politique: 'Politique Numerique',
};

export default function ArticleDetail() {
  const { id } = useParams();
  const article = articles.find((a) => a.id === id);

  if (!article) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
        <Navigation />
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20 text-center">
          <h1 className="font-editorial text-4xl text-[var(--ink)] mb-4">Article introuvable</h1>
          <Link to="/" className="text-sm font-sans text-[var(--accent-editorial)] hover:underline">
            Retour a l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const content = article.content || '';
  const paragraphs = content.split('\n\n').filter(Boolean);

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      <Navigation />

      <article className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-sans text-[var(--ink-muted)] hover:text-[var(--accent-editorial)] transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux chroniques
          </Link>

          {/* Overline */}
          <span className="overline text-[var(--accent-editorial)] mb-4 block">
            {categoryOverlines[article.category]}
          </span>

          {/* Title */}
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--ink)] leading-tight mb-6">
            {article.title}
          </h1>

          {/* Deck (subheadline) */}
          <p className="font-sans text-lg text-[var(--ink-muted)] leading-relaxed mb-8">
            {article.excerpt}
          </p>

          {/* Animated Meta bar */}
          <AnimatedMeta date={article.date} readTime={article.readTime} tag={article.tag} />

          {/* Action buttons */}
          <div className="flex items-center gap-2 mb-10 -mt-6">
            <button className="w-8 h-8 flex items-center justify-center hover:bg-[var(--paper-dark)] rounded transition-colors" title="Partager">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-[var(--paper-dark)] rounded transition-colors" title="Sauvegarder">
              <Bookmark className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-[var(--paper-dark)] rounded transition-colors" title="Imprimer">
              <Printer className="w-4 h-4" />
            </button>
          </div>

          {/* Article body */}
          <div className="prose-editorial">
            {paragraphs.map((para, i) => {
              if (i === 0) {
                return (
                  <p
                    key={i}
                    className="drop-cap font-sans text-[var(--ink-light)] leading-[1.75] mb-6 text-base lg:text-lg"
                    style={{ textWrap: 'pretty' }}
                  >
                    {para}
                  </p>
                );
              }
              if (para.startsWith('"') || para.startsWith('<<')) {
                return (
                  <blockquote
                    key={i}
                    className="my-8 pl-6 border-l-2 font-editorial text-xl lg:text-2xl italic text-[var(--ink-muted)] leading-relaxed"
                    style={{ borderColor: 'var(--accent-editorial)' }}
                  >
                    {para}
                  </blockquote>
                );
              }
              if (para.startsWith('### ')) {
                return (
                  <h2 key={i} className="font-editorial text-2xl lg:text-3xl font-semibold text-[var(--ink)] mt-12 mb-4">
                    {para.replace('### ', '')}
                  </h2>
                );
              }
              if (para.startsWith('>> ')) {
                return (
                  <div key={i} className="my-10 py-6 px-6" style={{ background: 'var(--paper-dark)' }}>
                    <p className="font-editorial text-xl lg:text-2xl font-semibold text-[var(--ink)] leading-snug mb-3">
                      {para.replace('>> ', '')}
                    </p>
                    <span className="text-xs font-sans text-[var(--ink-faint)] overline">Point cle</span>
                  </div>
                );
              }
              return (
                <p
                  key={i}
                  className="font-sans text-[var(--ink-light)] leading-[1.75] mb-6 text-base lg:text-[17px]"
                  style={{ textWrap: 'pretty' }}
                >
                  {para}
                </p>
              );
            })}
          </div>

          {/* Bottom tags */}
          <div className="mt-14 pt-6" style={{ borderTop: '1px solid var(--rule)' }}>
            <div className="flex items-center gap-3">
              <span className="overline text-[var(--ink-faint)]">Tags</span>
              <span className="px-3 py-1 text-xs font-sans text-[var(--ink-muted)] border" style={{ borderColor: 'var(--rule)' }}>
                {article.categoryLabel}
              </span>
              {article.tag && (
                <span className="px-3 py-1 text-xs font-sans text-[var(--accent-editorial)] border" style={{ borderColor: 'var(--rule)' }}>
                  {article.tag}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
