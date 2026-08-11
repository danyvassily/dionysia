import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface AnimatedTitleProps {
  text: string;
  className?: string;
  /** Sémantique — Hero doit passer "h1" pour SEO/axe (D1) */
  as?: 'h1' | 'h2' | 'p' | 'div' | 'span';
  /** Désactive l'intro stagger (ex: SSR preview) */
  reducedMotion?: boolean;
}

/**
 * AnimatedTitle — letter-by-letter reveal + micro-wave hover.
 *
 * CORRECTIONS STUDIO (audit 2026-08-11):
 *  C1: prop `as` → rend un vrai <h1> quand demandé
 *  C2: supprime `isLastTwo 1.55em` (logotype intact)
 *  C3: micro-wave y:-4 scale:1.06, hover:hover only, reduced-motion guarded
 */
export default function AnimatedTitle({
  text,
  className = '',
  as = 'div',
  reducedMotion = false,
}: AnimatedTitleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || !containerRef.current) return;
    hasAnimated.current = true;

    const prefersReduced =
      reducedMotion ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const letters = containerRef.current.querySelectorAll<HTMLElement>('.letter');
    if (!letters.length) return;

    // Intro — sans rotateX 3D cheap qui flicker sur Safari (perspective 400px retiré)
    if (prefersReduced) {
      gsap.set(letters, { opacity: 1, y: 0 });
    } else {
      gsap.set(letters, { opacity: 0, y: 14 });
      gsap.to(letters, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: { each: 0.028, from: 'start' },
        delay: 0.12,
      });
    }

    // Underline — 1.1s power3.inOut
    const underline = containerRef.current.querySelector<HTMLElement>('.title-underline');
    if (underline) {
      if (prefersReduced) {
        gsap.set(underline, { scaleX: 1 });
      } else {
        gsap.set(underline, { scaleX: 0, transformOrigin: 'left center' });
        gsap.to(underline, {
          scaleX: 1,
          duration: 1.1,
          ease: 'power3.inOut',
          delay: 0.55,
        });
      }
    }

    // Wave hover — micro, discret, seulement si hover capable + pas reduced-motion
    if (prefersReduced) return;
    const mm = gsap.matchMedia();
    // hover:hover évite d'activer sur touch (iPad trackpad faux positif sinon)
    const cleanupFns: Array<() => void> = [];

    mm.add('(hover: hover) and (min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const letterArray = Array.from(letters);

      // C3: micro-wave — luxe discret, pas CodePen
      const waveConfig = [
        { dist: 0, y: -4, scale: 1.06, color: 'var(--accent-editorial)' },
        { dist: 1, y: -2, scale: 1.02, color: 'var(--ink)' },
      ] as const;

      const animateWave = (centerIdx: number, enter: boolean) => {
        waveConfig.forEach(({ dist, y, scale, color }) => {
          const targets: HTMLElement[] = [];
          if (dist === 0) targets.push(letterArray[centerIdx]);
          else {
            const l = letterArray[centerIdx - dist];
            const r = letterArray[centerIdx + dist];
            if (l) targets.push(l);
            if (r) targets.push(r);
          }
          if (!targets.length) return;
          gsap.to(targets, {
            y: enter ? y : 0,
            scale: enter ? scale : 1,
            color: enter ? color : 'var(--ink)',
            duration: enter ? 0.22 : 0.32,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
      };

      letterArray.forEach((letter, idx) => {
        const onEnter = () => animateWave(idx, true);
        const onLeave = () => animateWave(idx, false);
        letter.addEventListener('mouseenter', onEnter);
        letter.addEventListener('mouseleave', onLeave);
        cleanupFns.push(() => {
          letter.removeEventListener('mouseenter', onEnter);
          letter.removeEventListener('mouseleave', onLeave);
        });
      });

      // matchMedia cleanup
      return () => cleanupFns.forEach((fn) => fn());
    });

    return () => {
      mm.revert();
      cleanupFns.forEach((fn) => fn());
    };
  }, [reducedMotion]);

  const Tag = as as 'h1';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Tag sémantique pour h1/p, div wrapper otherwise */}
      {as === 'h1' || as === 'h2' ? (
        <Tag
          className="block font-editorial font-semibold tracking-[-0.03em] leading-[0.9]"
          style={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit', letterSpacing: 'inherit' }}
          aria-label={text}
        >
          {/* aria-hidden letters + accessible text fallback for SR */}
          <span aria-hidden="true">
            {text.split('').map((char, i) => (
              <span
                key={i}
                className="letter inline-block cursor-default select-none will-change-transform"
                style={{
                  color: 'var(--ink)',
                  display: 'inline-block',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>
        </Tag>
      ) : (
        <span className="block font-editorial font-semibold tracking-[-0.03em] leading-[0.9]">
          {text.split('').map((char, i) => (
            <span
              key={i}
              className="letter inline-block cursor-default select-none will-change-transform"
              style={{ color: 'var(--ink)', display: 'inline-block' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </span>
      )}
      <span
        className="title-underline absolute bottom-0 left-0 right-0 h-[2px] block"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(90deg, var(--accent-editorial), var(--accent-warm), var(--accent-editorial))',
          opacity: 0.55,
        }}
      />
    </div>
  );
}
