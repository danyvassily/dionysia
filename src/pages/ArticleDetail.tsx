import { ArrowLeft, Share2, Link2, Bookmark, Check, Clock, Calendar } from 'lucide-react';
import { useParams, Link } from 'react-router';
import { useEffect, useState, useMemo, useRef } from 'react';
import { articles } from '@/data/articles';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const over: Record<string, string> = { ia: 'Intelligence Artificielle', tech: 'Technologie', dev: 'Développement', politique: 'Politique Numérique' };

function useReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? Math.min(100, (scrolled / max) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return p;
}

export default function ArticleDetail() {
  const { id } = useParams();
  const article = articles.find((a) => a.id === id);
  const progress = useReadingProgress();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(() => { try { return localStorage.getItem(`dionysia:bookmark:${id}`) === '1'; } catch { return false; } });
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  // TOC from ### headings in content
  const { paragraphs, headings } = useMemo(() => {
    if (!article) return { paragraphs: [] as string[], headings: [] as { id: string; text: string }[] };
    const paras = (article.content || '').split('\n\n').filter(Boolean);
    const hs: { id: string; text: string }[] = [];
    paras.forEach((p) => {
      if (p.startsWith('### ')) {
        const text = p.replace('### ', '').trim();
        const hid = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        hs.push({ id: hid, text });
      }
    });
    return { paragraphs: paras, headings: hs };
  }, [article]);

  // Active TOC
  useEffect(() => {
    if (!headings.length || !bodyRef.current) return;
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-toc]'));
    const heads = headings.map(h => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    if (!heads.length) return;
    let active: string | null = null;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) active = e.target.id; });
      links.forEach(a => {
        const isActive = a.getAttribute('data-toc') === active;
        a.classList.toggle('text-[var(--accent-editorial)]', !!isActive);
        a.classList.toggle('font-medium', !!isActive);
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    heads.forEach(h => obs.observe(h));
    return () => obs.disconnect();
  }, [headings]);

  const related = useMemo(() => {
    if (!article) return [];
    return articles.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 3);
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
        <Navigation />
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20 text-center">
          <h1 className="font-editorial text-4xl mb-4">Article introuvable</h1>
          <Link to="/" className="text-sm font-sans text-[var(--accent-editorial)] hover:underline">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: article.title, url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      <Navigation />
      {/* Reading progress */}
      <div className="fixed top-[56px] lg:top-[64px] left-0 right-0 h-[2px] z-40 pointer-events-none" style={{ background: 'var(--rule)' }}>
        <div className="h-full bg-[var(--accent-editorial)] transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      <article className="pt-20 lg:pt-28 pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Main */}
            <div className="lg:col-span-8 lg:col-start-1">
              <Link to="/" className="inline-flex items-center gap-2 text-xs font-sans font-medium tracking-wide text-[var(--ink-muted)] hover:text-[var(--accent-editorial)] transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" /> Retour aux chroniques
              </Link>

              <span className="inline-flex px-2.5 py-1 rounded-full border text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-[var(--accent-editorial)] bg-[var(--paper-soft)] mb-4" style={{ borderColor: 'color-mix(in srgb, var(--accent-editorial) 18%, var(--rule))' }}>
                {over[article.category] ?? article.category}
              </span>

              <h1 className="font-editorial text-[28px] sm:text-[34px] lg:text-[42px] font-bold leading-[1.02] tracking-[-0.03em] text-[var(--ink)] text-balance max-w-[22ch]">
                {article.title}
              </h1>
              <p className="font-sans text-[16px] lg:text-[18px] leading-relaxed text-[var(--ink-muted)] mt-4 max-w-[60ch] text-pretty">
                {article.excerpt}
              </p>

              {/* Meta bar — editorial */}
              <div className="mt-6 flex flex-wrap items-center gap-3 py-4 border-y text-xs font-sans text-[var(--ink-faint)]" style={{ borderColor: 'var(--rule)' }}>
                <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {article.date}</span>
                <span className="w-1 h-1 rounded-full bg-[var(--rule-strong)]" />
                <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {article.readTime}</span>
                {article.tag && (<><span className="w-1 h-1 rounded-full bg-[var(--rule-strong)]" /><span className="text-[var(--accent-editorial)] font-medium">{article.tag}</span></>)}
                <div className="ml-auto flex items-center gap-1.5">
                  <button onClick={share} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors" style={{ borderColor: 'var(--rule)' }}>
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />} {copied ? 'Copié' : 'Partager'}
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(()=>setCopied(false), 1600); }} className="w-8 h-8 inline-flex items-center justify-center rounded-full border text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors" style={{ borderColor: 'var(--rule)' }} aria-label="Copier le lien">
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setSaved(v=>{ const nv=!v; try{ localStorage.setItem(`dionysia:bookmark:${id}`, nv?'1':'0'); }catch{} return nv; })} aria-pressed={saved} className={`w-8 h-8 inline-flex items-center justify-center rounded-full border transition-colors ${saved ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'}`} style={{ borderColor: saved ? 'var(--ink)' : 'var(--rule)' }} aria-label="Sauvegarder">
                    <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div ref={bodyRef} className="prose-editorial mt-8">
                {paragraphs.map((para, i) => {
                  if (i === 0) return <p key={i} className="drop-cap font-sans text-[var(--ink-light)] leading-[1.78] mb-6 text-[17px]">{para}</p>;
                  if (para.startsWith('>> ')) return (
                    <aside key={i} className="my-8 rounded-xl border-l-[3px] bg-[var(--paper-soft)] px-6 py-5" style={{ borderLeftColor: 'var(--accent-editorial)', borderColor: 'var(--rule)' }}>
                      <p className="font-editorial text-[18px] lg:text-[20px] font-semibold leading-snug text-[var(--ink)]">{para.replace('>> ', '')}</p>
                      <span className="overline text-[var(--ink-faint)] mt-2 block">Point clé</span>
                    </aside>
                  );
                  if (para.startsWith('### ')) {
                    const text = para.replace('### ', '');
                    const hid = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    return <h2 key={i} id={hid} className="font-editorial text-[22px] lg:text-[26px] font-bold tracking-[-0.02em] text-[var(--ink)] mt-10 mb-4 scroll-mt-24">{text}</h2>;
                  }
                  if (para.startsWith('> ')) return <blockquote key={i} className="my-7 pl-5 border-l-2 font-editorial text-[18px] lg:text-[20px] italic leading-relaxed text-[var(--ink-muted)]" style={{ borderColor: 'var(--accent-editorial)' }}>{para.replace(/^>+\s?/, '')}</blockquote>;
                  if (para.startsWith('- ') || para.startsWith('* ')) {
                    const items = para.split('\n').filter(Boolean);
                    return <ul key={i} className="my-6 space-y-2 list-disc pl-5 font-sans text-[var(--ink-light)]">{items.map((it, k) => <li key={k}>{it.replace(/^[-*]\s/, '')}</li>)}</ul>;
                  }
                  return <p key={i} className="font-sans text-[var(--ink-light)] leading-[1.78] mb-6 text-[17px]">{para}</p>;
                })}
              </div>

              {/* Tags bottom */}
              {article.tag && (
                <div className="mt-10 pt-6 border-t flex items-center gap-2" style={{ borderColor: 'var(--rule)' }}>
                  <span className="text-xs font-sans text-[var(--ink-faint)]">Tag</span>
                  <span className="inline-flex px-2.5 py-1 rounded-full border text-xs font-sans font-medium bg-[var(--paper-soft)]" style={{ borderColor: 'var(--rule)', color: 'var(--ink)' }}>{article.tag}</span>
                </div>
              )}

              {/* Related */}
              {related.length > 0 && (
                <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--rule)' }}>
                  <h3 className="font-editorial text-lg font-semibold mb-4">À lire ensuite</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {related.map((r) => (
                      <Link key={r.id} to={`/article/${r.id}`} className="group block rounded-xl border p-4 hover:bg-[var(--paper-soft)] transition-colors" style={{ borderColor: 'var(--rule)' }}>
                        <span className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-[var(--ink-faint)]">{over[r.category] ?? r.category}</span>
                        <p className="font-editorial font-semibold leading-snug text-[var(--ink)] group-hover:text-[var(--accent-editorial)] mt-1 line-clamp-2 text-sm">{r.title}</p>
                        <span className="text-xs font-sans text-[var(--ink-faint)] mt-2 inline-flex gap-1"><Clock className="w-3 h-3" />{r.readTime}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* TOC rail — desktop */}
            <aside className="hidden lg:block lg:col-span-4">
              <div className="sticky top-[88px] space-y-6">
                {headings.length > 0 && (
                  <nav aria-label="Sommaire" className="rounded-xl border bg-[var(--paper-dark)] p-5" style={{ borderColor: 'var(--rule)' }}>
                    <p className="overline text-[var(--ink-faint)] mb-3">Sommaire</p>
                    <ol className="space-y-2">
                      {headings.map((h) => (
                        <li key={h.id}><a href={`#${h.id}`} data-toc={h.id} className="toc-link text-sm font-sans text-[var(--ink-muted)] hover:text-[var(--accent-editorial)] transition-colors line-clamp-1">{h.text}</a></li>
                      ))}
                    </ol>
                  </nav>
                )}
                <div className="rounded-xl border p-5" style={{ borderColor: 'var(--rule)', background: 'var(--paper)' }}>
                  <p className="font-editorial font-semibold text-[var(--ink)]">DIONYSIA</p>
                  <p className="font-sans text-sm text-[var(--ink-muted)] mt-1 leading-relaxed">Chroniques à l'ère du numérique. Abonnez-vous pour ne rien manquer.</p>
                  <Link to="/#featured" className="mt-4 inline-flex h-9 px-4 items-center bg-[var(--ink)] text-[var(--paper)] text-sm font-sans font-medium hover:opacity-90 transition-opacity">Explorer</Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
      <Footer />
    </div>
  );
}
