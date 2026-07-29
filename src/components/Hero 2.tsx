import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';
import AnimatedTitle from './AnimatedTitle';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const catsRef = useRef<HTMLDivElement>(null);
  const rulesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Force scroll to top on mount
    window.scrollTo(0, 0);

    if (!sectionRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      // Parallax: content moves slower than scroll
      gsap.to(contentRef.current, {
        y: -80,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });

      // Meta line fades and moves up faster
      if (metaRef.current) {
        gsap.to(metaRef.current, {
          y: -120,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '40% top',
            scrub: true,
          },
        });
      }

      // Category nav fades slower
      if (catsRef.current) {
        gsap.to(catsRef.current, {
          y: -60,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '50% top',
            scrub: true,
          },
        });
      }

      // Rule line expands on scroll
      if (rulesRef.current) {
        gsap.fromTo(
          rulesRef.current,
          { scaleX: 1 },
          {
            scaleX: 1.3,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: '60% top',
              scrub: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative pt-28 pb-16 lg:pt-32 lg:pb-20 overflow-hidden"
      style={{ background: 'var(--paper)' }}
    >
      <div ref={contentRef} className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
        {/* Top meta line */}
        <div ref={metaRef} className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-12" style={{ background: 'var(--rule)' }} />
          <span className="overline text-[var(--ink-muted)]">Chroniques & Analyses</span>
          <div className="h-px w-12" style={{ background: 'var(--rule)' }} />
        </div>

        {/* Animated title */}
        <div className="mb-6">
          <AnimatedTitle
            text="DIONYSIA"
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem]"
          />
        </div>

        {/* Subtitle / tagline */}
        <p
          className="font-sans text-base lg:text-lg text-[var(--ink-muted)] max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in"
          style={{ animationDelay: '0.6s' }}
        >
          Intelligence artificielle, technologies emergentes, code et pouvoir.
          L'information decryptee a la maniere d'une grande revue.
        </p>

        {/* Horizontal rule */}
        <div
          ref={rulesRef}
          className="w-full mb-10 animate-fade-in"
          style={{ animationDelay: '0.8s', borderTop: '3px double var(--rule)', transformOrigin: 'center' }}
        />

        {/* Category navigation */}
        <div
          ref={catsRef}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 animate-fade-in"
          style={{ animationDelay: '0.9s' }}
        >
          {[
            { label: 'Intelligence Artificielle', href: '#ia' },
            { label: 'Technologie', href: '#tech' },
            { label: 'Developpement', href: '#dev' },
            { label: 'Politique', href: '#politique' },
          ].map((cat) => (
            <a
              key={cat.href}
              href={cat.href}
              className="text-sm font-sans font-medium text-[var(--ink-light)] hover:text-[var(--accent-editorial)] transition-colors duration-200"
            >
              {cat.label}
            </a>
          ))}
        </div>

        {/* Scroll cue */}
        <div className="mt-14 animate-fade-in" style={{ animationDelay: '1.1s' }}>
          <a
            href="#featured"
            className="inline-flex flex-col items-center gap-1 text-[var(--ink-faint)] hover:text-[var(--ink-muted)] transition-colors"
          >
            <span className="overline">Explorer</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}
