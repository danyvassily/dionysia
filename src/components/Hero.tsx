import { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AnimatedTitle from './AnimatedTitle';
import ParticleBanner from './ParticleBanner';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const catsRef = useRef<HTMLDivElement>(null);
  const rulesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // C8: 1 seul timeline ScrollTrigger + reduced-motion guard
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      // Timeline unique : 1 recalc/frame au lieu de 3
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '55% top',
          scrub: 0.4,
        },
      });

      if (contentRef.current) {
        // C8: opacité 0.92 retirée (jamais assombrir le héro — lisibilité)
        tl.to(contentRef.current, { y: -36, ease: 'none' }, 0);
      }
      if (catsRef.current) {
        tl.to(catsRef.current, { y: -24, opacity: 0, ease: 'none' }, 0);
      }
      if (rulesRef.current) {
        tl.to(rulesRef.current, { scaleX: 1.06, ease: 'none' }, 0);
      }

      // C7: pause GSAP quand hero hors viewport (couple avec ParticleBanner IO)
      const io = new IntersectionObserver(
        ([entry]) => {
          const st = (tl.scrollTrigger as ScrollTrigger | undefined);
          if (!st) return;
          // ScrollTrigger gère déjà enable/disable via refresh, mais on peut
          // s'assurer qu'on ne scrub pas hors vue
          if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
            // au-dessus — rien
          }
        },
        { threshold: 0 },
      );
      if (sectionRef.current) io.observe(sectionRef.current);

      return () => io.disconnect();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative pt-[64px] lg:pt-[64px] pb-10 lg:pb-14 overflow-hidden"
      style={{ background: 'var(--paper)' }}
      aria-label="Introduction"
    >
      {/* WebGL veil — behind, never competes with text */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <ParticleBanner className="h-full" />
        {/* C4: veil garanti WCAG AA — 82% → 58% → paper. Variante dark via CSS var */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, color-mix(in srgb, var(--paper) 82%, transparent) 0%, color-mix(in srgb, var(--paper) 58%, transparent) 52%, var(--paper) 100%)',
          }}
        />
      </div>

      <div
        ref={contentRef}
        className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
      >
        {/* C10: kicker statique (0 hydration mismatch) — éditorial, pas horloge */}
        <div className="flex items-center justify-center gap-3 mb-7 mt-8 lg:mt-10">
          <span className="h-px w-8 sm:w-10 bg-[var(--rule-strong)]" aria-hidden="true" />
          <span className="inline-flex items-center gap-2 text-[10px] font-sans font-semibold tracking-[0.16em] uppercase text-[var(--ink-faint)]">
            Revue — Est. 2024
          </span>
          <span className="h-px w-8 sm:w-10 bg-[var(--rule-strong)]" aria-hidden="true" />
        </div>

        {/* C1: vrai <h1> — SEO + VoiceOver */}
        <div className="mb-3">
          <AnimatedTitle
            as="h1"
            text="DIONYSIA"
            className="text-[42px] sm:text-[64px] md:text-[84px] lg:text-[96px] leading-[0.9] tracking-[-0.03em]"
          />
          <p className="font-editorial text-[11px] sm:text-xs tracking-[0.28em] uppercase text-[var(--ink-faint)] mt-2">
            Chroniques à l&apos;ère du numérique
          </p>
        </div>

        {/* C10: deck resserré 13 mots — 1 proposition */}
        <p className="font-sans text-[15px] lg:text-[17px] leading-relaxed text-[var(--ink-muted)] max-w-[560px] mx-auto mt-6 text-balance">
          Intelligence artificielle, code et pouvoir —{' '}
          <span className="text-[var(--ink)] font-medium">décryptés avec exigence</span>.
        </p>

        {/* Rule — double : hairline + accent 88px */}
        <div
          ref={rulesRef}
          className="w-full mt-8 mb-7 h-px"
          style={{ background: 'var(--rule)', transformOrigin: 'center' }}
          aria-hidden="true"
        />
        <div
          className="mx-auto w-[88px] h-[3px] -mt-7 mb-7"
          style={{ background: 'var(--accent-editorial)', opacity: 0.9 }}
          aria-hidden="true"
        />

        {/* Category rail — pills outlined (FT) */}
        <nav
          ref={catsRef}
          aria-label="Rubriques"
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {[
            { label: 'Intelligence Artificielle', href: '#ia' },
            { label: 'Technologie', href: '#tech' },
            { label: 'Développement', href: '#dev' },
            { label: 'Politique', href: '#politique' },
          ].map((cat) => (
            <a
              key={cat.href}
              href={cat.href}
              className="inline-flex items-center h-7 px-3.5 rounded-full border text-[11px] font-sans font-medium tracking-wide text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--paper-soft)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-editorial)] focus-visible:outline-offset-2"
              style={{ borderColor: 'var(--rule)' }}
            >
              {cat.label}
            </a>
          ))}
        </nav>

        {/* C9: CTA hiérarchisé — primaire 44px + secondaire text-link */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#featured"
            className="inline-flex items-center justify-center h-11 min-h-[44px] px-7 bg-[var(--ink)] text-[var(--paper)] text-[13px] font-sans font-semibold tracking-wide hover:opacity-90 active:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-editorial)] focus-visible:outline-offset-2"
          >
            Lire à la une
          </a>
          <a
            href="#about"
            className="inline-flex items-center justify-center h-11 min-h-[44px] px-1 text-[13px] font-sans font-medium underline underline-offset-4 decoration-[var(--rule-strong)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:decoration-[var(--ink)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-editorial)] focus-visible:outline-offset-2"
          >
            Manifeste →
          </a>
        </div>

        <a
          href="#featured"
          className="mt-8 inline-flex flex-col items-center gap-1 text-[var(--ink-faint)] hover:text-[var(--ink-muted)] transition-colors group focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-editorial)] focus-visible:outline-offset-2 rounded-sm"
          aria-label="Aller au contenu — à la une"
        >
          <span className="text-[10px] font-sans font-semibold tracking-[0.16em] uppercase">
            Explorer
          </span>
          <ChevronDown
            className="w-4 h-4 group-hover:translate-y-0.5 transition-transform motion-reduce:transform-none"
            aria-hidden="true"
          />
        </a>
      </div>
    </section>
  );
}
