import { ArrowLeft, Bookmark, Calendar, Check, Clock, Link2, Share2 } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { articles } from '@/data/articles';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ArticleVisual from '@/components/ArticleVisual';
import { getArticleVisual } from '@/lib/articleVisuals';

const categoryNames: Record<string, string> = {
  ia: 'Intelligence artificielle',
  tech: 'Technologie',
  dev: 'Développement',
  politique: 'Politique numérique',
};

const slugify = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const root = document.documentElement;
      const total = root.scrollHeight - root.clientHeight;
      setProgress(total > 0 ? Math.min(100, (root.scrollTop / total) * 100) : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return progress;
}

const markdownComponents: Components = {
  h1: ({ children }) => <h2 id={slugify(String(children))}>{children}</h2>,
  h2: ({ children }) => <h2 id={slugify(String(children))}>{children}</h2>,
  h3: ({ children }) => <h3 id={slugify(String(children))}>{children}</h3>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {children}
      <span className="sr-only"> (nouvel onglet)</span>
    </a>
  ),
};

function splitSources(content: string) {
  const match = /^#{2,3}\s+Sources?\s*$/im.exec(content);
  if (!match || match.index === undefined) return { body: content, sources: '' };
  return {
    body: content.slice(0, match.index).trim(),
    sources: content.slice(match.index + match[0].length).trim(),
  };
}

export default function ArticleDetail() {
  const { id } = useParams();
  const article = articles.find((item) => item.id === id);
  const progress = useReadingProgress();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(() => {
    try { return localStorage.getItem(`dionysia:bookmark:${id}`) === '1'; } catch { return false; }
  });

  const content = useMemo(() => splitSources(article?.content ?? ''), [article]);
  const headings = useMemo(() => {
    const found: Array<{ id: string; label: string }> = [];
    for (const match of content.body.matchAll(/^#{2,3}\s+(.+)$/gm)) {
      const label = match[1].replace(/[*_`]/g, '').trim();
      found.push({ id: slugify(label), label });
    }
    return found;
  }, [content.body]);

  const related = useMemo(() => {
    if (!article) return [];
    return articles
      .filter((item) => item.id !== article.id && item.category === article.category)
      .slice(-3)
      .reverse();
  }, [article]);

  useEffect(() => {
    document.title = article ? `${article.title} — DIONYSIA` : 'Article introuvable — DIONYSIA';
    if (!article) return () => { document.title = "DIONYSIA — Chroniques à l'ère du numérique"; };

    const visual = getArticleVisual(article);
    const canonicalUrl = `${window.location.origin}/article/${article.id}`;
    const metadata: Array<[string, string, string]> = [
      ['name', 'description', article.excerpt],
      ['property', 'og:type', 'article'],
      ['property', 'og:title', article.title],
      ['property', 'og:description', article.excerpt],
      ['property', 'og:url', canonicalUrl],
      ['name', 'twitter:card', 'summary_large_image'],
    ];
    const imageUrl = visual ? new URL(visual.src, window.location.origin).href : null;
    if (imageUrl) metadata.push(['property', 'og:image', imageUrl]);
    const touched: Array<{ element: HTMLMetaElement; previous: string; created: boolean }> = [];
    for (const [attribute, key, value] of metadata) {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      const created = !element;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      const previous = element.content;
      element.content = value;
      touched.push({ element, previous, created });
    }
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const canonicalCreated = !canonical;
    const previousCanonical = canonical?.href ?? '';
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
    const structuredData = document.createElement('script');
    structuredData.type = 'application/ld+json';
    structuredData.dataset.dionysiaArticle = 'true';
    structuredData.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      ...(imageUrl ? { image: imageUrl } : {}),
      author: { '@type': 'Person', name: 'Dany Vassily' },
      publisher: { '@type': 'Organization', name: 'DIONYSIA' },
      mainEntityOfPage: canonicalUrl,
    });
    document.head.appendChild(structuredData);

    return () => {
      document.title = "DIONYSIA — Chroniques à l'ère du numérique";
      structuredData.remove();
      touched.forEach(({ element, previous, created }) => {
        if (created) element.remove();
        else element.content = previous;
      });
      if (canonicalCreated) canonical?.remove();
      else if (canonical) canonical.href = previousCanonical;
    };
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
        <Navigation />
        <main className="mx-auto max-w-3xl px-6 pb-24 pt-36 text-center">
          <p className="overline text-[var(--accent-editorial)]">Erreur 404</p>
          <h1 className="mt-3 font-editorial text-5xl">Article introuvable</h1>
          <Link to="/" className="mt-8 inline-flex text-sm font-medium underline">Retour aux chroniques</Link>
        </main>
      </div>
    );
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url: window.location.href });
        return;
      } catch { /* partage annulé : proposer la copie */ }
    }
    await copyLink();
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Navigation />
      <div className="fixed left-0 right-0 top-[56px] z-40 h-[2px] bg-[var(--rule)] lg:top-[64px]">
        <div className="h-full bg-[var(--accent-editorial)]" style={{ width: `${progress}%` }} />
      </div>

      <main className="pb-20 pt-24 lg:pt-32">
        <header className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)] hover:text-[var(--ink)]">
            <ArrowLeft className="h-4 w-4" /> Toutes les chroniques
          </Link>

          <div className="mt-10 grid gap-8 border-b border-[var(--rule)] pb-10 lg:grid-cols-[1fr_220px] lg:items-end">
            <div>
              <p className="overline text-[var(--accent-editorial)]">{categoryNames[article.category]}</p>
              <h1 className="mt-4 max-w-[26ch] text-pretty font-editorial text-[clamp(2.4rem,5.4vw,4.7rem)] font-semibold leading-[0.96] tracking-[-0.045em]">
                {article.title}
              </h1>
              <p className="mt-6 max-w-[66ch] font-sans text-lg leading-8 text-[var(--ink-muted)] lg:text-xl">
                {article.excerpt}
              </p>
            </div>

            <div className="border-l-2 border-[var(--accent-editorial)] pl-4 font-sans text-sm">
              <p className="font-semibold text-[var(--ink)]">Dany Vassily</p>
              <p className="mt-1 text-xs text-[var(--ink-faint)]">Analyse & veille numérique</p>
              <div className="mt-4 flex flex-col gap-2 text-xs text-[var(--ink-muted)]">
                <span className="inline-flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />{article.date}</span>
                <span className="inline-flex items-center gap-2"><Clock className="h-3.5 w-3.5" />{article.readTime} de lecture</span>
              </div>
            </div>
          </div>
          <ArticleVisual article={article} className="mt-8" caption eager />
        </header>

        <div className="mx-auto mt-10 grid max-w-[1100px] gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,720px)_240px] lg:justify-between">
          <article>
            <div className="article-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {content.body}
              </ReactMarkdown>
            </div>

            {content.sources && (
              <aside className="article-sources" aria-labelledby="sources-title">
                <p className="overline text-[var(--accent-editorial)]">Références</p>
                <h2 id="sources-title">Sources et liens</h2>
                <p className="sources-intro">Les liens ci-dessous permettent de vérifier les faits et d’aller plus loin.</p>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {content.sources}
                </ReactMarkdown>
              </aside>
            )}

            <div className="mt-12 flex flex-wrap items-center gap-2 border-y border-[var(--rule)] py-5">
              <button onClick={share} className="editorial-action">
                {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                {copied ? 'Lien copié' : 'Partager'}
              </button>
              <button onClick={copyLink} className="editorial-action" aria-label="Copier le lien"><Link2 className="h-4 w-4" /> Copier le lien</button>
              <button
                onClick={() => setSaved((value) => {
                  const next = !value;
                  try { localStorage.setItem(`dionysia:bookmark:${id}`, next ? '1' : '0'); } catch { /* stockage indisponible */ }
                  return next;
                })}
                className={`editorial-action ${saved ? 'is-active' : ''}`}
                aria-pressed={saved}
              >
                <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} /> {saved ? 'Sauvegardé' : 'Sauvegarder'}
              </button>
            </div>

            {related.length > 0 && (
              <section className="mt-14" aria-labelledby="related-title">
                <p className="overline text-[var(--accent-editorial)]">Poursuivre la lecture</p>
                <h2 id="related-title" className="mt-2 font-editorial text-3xl">À lire ensuite</h2>
                <div className="mt-5 divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
                  {related.map((item) => (
                    <Link key={item.id} to={`/article/${item.id}`} className="group grid gap-2 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div>
                        <p className="font-editorial text-xl font-semibold leading-tight group-hover:text-[var(--accent-editorial)]">{item.title}</p>
                        <p className="mt-2 line-clamp-1 text-sm text-[var(--ink-muted)]">{item.excerpt}</p>
                      </div>
                      <span className="text-xs text-[var(--ink-faint)]">{item.readTime} →</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-28">
              {headings.length > 0 && (
                <nav aria-label="Sommaire">
                  <p className="overline border-b border-[var(--ink)] pb-3">Dans cet article</p>
                  <ol className="mt-4 space-y-3">
                    {headings.map((heading, index) => (
                      <li key={`${heading.id}-${index}`}>
                        <a href={`#${heading.id}`} className="grid grid-cols-[22px_1fr] text-sm leading-snug text-[var(--ink-muted)] hover:text-[var(--accent-editorial)]">
                          <span className="font-editorial text-[var(--ink-faint)]">{String(index + 1).padStart(2, '0')}</span>
                          <span>{heading.label}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              <div className="mt-8 border-t border-[var(--rule)] pt-5">
                <p className="font-editorial text-lg font-semibold">Une information vérifiable.</p>
                <p className="mt-2 text-xs leading-5 text-[var(--ink-faint)]">Chaque analyse distingue les faits, les citations et l’interprétation éditoriale.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
