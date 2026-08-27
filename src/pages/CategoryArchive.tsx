import { ArrowLeft, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import ArticleCard from '@/components/ArticleCard';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import { categoryConfig, isArticleCategory, sortedArticles } from '@/lib/articles';

const PAGE_SIZE = 12;

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function CategoryArchive() {
  const { category } = useParams();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const validCategory = isArticleCategory(category) ? category : null;
  const categoryArticles = useMemo(
    () => validCategory ? sortedArticles.filter((item) => item.category === validCategory) : [],
    [validCategory],
  );
  const filteredArticles = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return categoryArticles;
    return categoryArticles.filter((item) => normalize(`${item.title} ${item.excerpt} ${item.tag ?? ''}`).includes(needle));
  }, [categoryArticles, query]);

  const pageCount = Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleArticles = filteredArticles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (validCategory) document.title = `${categoryConfig[validCategory].title} — Archives DIONYSIA`;
    return () => { document.title = "DIONYSIA — Chroniques à l'ère du numérique"; };
  }, [validCategory]);

  const changePage = (nextPage: number) => {
    setPage(Math.min(pageCount, Math.max(1, nextPage)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!validCategory) {
    return (
      <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
        <Navigation />
        <main className="mx-auto max-w-3xl px-6 pb-24 pt-36 text-center">
          <p className="overline text-[var(--accent-editorial)]">Archives</p>
          <h1 className="mt-3 font-editorial text-5xl">Rubrique introuvable</h1>
          <Link to="/" className="mt-8 inline-flex text-sm font-semibold underline">Retour à l’accueil</Link>
        </main>
      </div>
    );
  }

  const config = categoryConfig[validCategory];

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Navigation />
      <main className="pb-20 pt-24 lg:pt-32">
        <header className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <Link to={`/#${validCategory}`} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)] hover:text-[var(--ink)]">
            <ArrowLeft className="h-4 w-4" /> Retour à l’édition
          </Link>

          <div className="mt-10 grid gap-8 border-b-2 border-[var(--ink)] pb-8 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <p className="overline text-[var(--accent-editorial)]">Archives · {config.short}</p>
              <h1 className="mt-3 max-w-[16ch] font-editorial text-[clamp(3.2rem,8vw,6.8rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
                {config.title}
              </h1>
              <p className="mt-6 max-w-[60ch] text-base leading-7 text-[var(--ink-muted)]">{config.subtitle}</p>
            </div>
            <div className="border-l-2 border-[var(--accent-editorial)] pl-5">
              <p className="font-editorial text-4xl font-semibold">{categoryArticles.length.toLocaleString('fr-FR')}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--ink-faint)]">articles disponibles</p>
              <p className="mt-4 text-sm leading-6 text-[var(--ink-muted)]">Toute la rubrique, du plus récent au plus ancien.</p>
            </div>
          </div>

          <div className="grid gap-5 border-b border-[var(--rule)] py-6 md:grid-cols-[1fr_auto] md:items-center">
            <label className="relative block max-w-xl">
              <span className="sr-only">Rechercher dans cette rubrique</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]" />
              <input
                type="search"
                value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1); }}
                placeholder={`Rechercher dans ${config.title.toLowerCase()}…`}
                className="h-12 w-full border border-[var(--rule)] bg-transparent pl-11 pr-11 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)] focus:border-[var(--accent-editorial)]"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} aria-label="Effacer la recherche" className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center text-[var(--ink-faint)] hover:text-[var(--ink)]">
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <p className="text-xs text-[var(--ink-faint)]">
              {query ? `${filteredArticles.length.toLocaleString('fr-FR')} résultat${filteredArticles.length > 1 ? 's' : ''}` : `Page ${currentPage} sur ${pageCount}`}
            </p>
          </div>
        </header>

        <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8" aria-label="Articles de la rubrique">
          {visibleArticles.length > 0 ? (
            <div className="grid auto-rows-fr gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {visibleArticles.map((article, index) => (
                <ArticleCard key={article.id} article={article} index={(currentPage - 1) * PAGE_SIZE + index} />
              ))}
            </div>
          ) : (
            <div className="border-y border-[var(--rule)] py-20 text-center">
              <p className="font-editorial text-3xl font-semibold">Aucun article trouvé</p>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">Essayez un autre mot-clé ou revenez à toute la rubrique.</p>
              <button type="button" onClick={() => setQuery('')} className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] underline">Effacer la recherche</button>
            </div>
          )}

          {pageCount > 1 && (
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-between border-y border-[var(--rule)] py-5">
              <button
                type="button"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" /> Précédente
              </button>
              <span className="font-editorial text-lg">{currentPage} <span className="text-[var(--ink-faint)]">/ {pageCount}</span></span>
              <button
                type="button"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === pageCount}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] disabled:cursor-not-allowed disabled:opacity-30"
              >
                Suivante <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
