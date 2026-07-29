import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface AnimatedTitleProps {
  text: string;
  className?: string;
}

/**
 * AnimatedTitle — GSAP letter-by-letter reveal + wave hover.
 *
 * Chaque lettre réagit au hover avec un effet de vague :
 * la lettre survolée monte, et les lettres adjacentes (±2)
 * suivent avec une intensité décroissante.
 */
export default function AnimatedTitle({ text, className = '' }: AnimatedTitleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || !containerRef.current) return;
    hasAnimated.current = true;

    const letters = containerRef.current.querySelectorAll('.letter');

    // Set initial state
    gsap.set(letters, {
      opacity: 0,
      y: 32,
      rotateX: -60,
    });

    // Animate in with stagger — letters wrap naturally because they're inline
    gsap.to(letters, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: {
        each: 0.03,
        from: 'start',
      },
      delay: 0.15,
    });

    // Wave hover effect — chaque lettre influence ses voisines
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      const letterArray = Array.from(letters) as HTMLElement[];

      // Pré-calculer les cibles d'animation pour chaque distance
      const waveConfig = [
        { dist: 0, y: -12, scale: 1.4, color: 'var(--accent-editorial)' },   // lettre survolée
        { dist: 1, y: -6,  scale: 1.15, color: 'var(--ink-light)' },          // ±1
        { dist: 2, y: -3,  scale: 1.05, color: 'var(--ink)' },                // ±2
      ];

      const animateWave = (centerIdx: number, enter: boolean) => {
        waveConfig.forEach(({ dist, y, scale, color }) => {
          const targets: HTMLElement[] = [];

          if (dist === 0) {
            targets.push(letterArray[centerIdx]);
          } else {
            const left = letterArray[centerIdx - dist];
            const right = letterArray[centerIdx + dist];
            if (left) targets.push(left);
            if (right) targets.push(right);
          }

          if (targets.length === 0) return;

          if (enter) {
            gsap.to(targets, {
              y,
              scale,
              color,
              duration: 0.3,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          } else {
            gsap.to(targets, {
              y: 0,
              scale: 1,
              color: 'var(--ink)',
              duration: 0.4,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          }
        });
      };

      letterArray.forEach((letter, idx) => {
        const onEnter = () => animateWave(idx, true);
        const onLeave = () => animateWave(idx, false);
        letter.addEventListener('mouseenter', onEnter);
        letter.addEventListener('mouseleave', onLeave);
      });
    });

    // Underline draw animation
    const underline = containerRef.current.querySelector('.title-underline');
    if (underline) {
      gsap.set(underline, { scaleX: 0, transformOrigin: 'left center' });
      gsap.to(underline, {
        scaleX: 1,
        duration: 1.2,
        ease: 'power3.inOut',
        delay: 0.6,
      });
    }

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <span className="block" style={{ perspective: '400px' }}>
        {text.split('').map((char, i) => {
          const isLastTwo = i >= text.length - 2;
          return (
            <span
              key={i}
              className="letter inline cursor-default select-none"
              style={{
                fontFamily: 'inherit',
                fontWeight: 'inherit',
                lineHeight: 'inherit',
                letterSpacing: 'inherit',
                color: 'var(--ink)',
                display: 'inline',
                transformStyle: 'preserve-3d',
                fontSize: isLastTwo ? '1.55em' : 'inherit',
                transition: 'none', // GSAP gère tout
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
      </span>
      <span
        className="title-underline absolute bottom-0 left-0 right-0 h-[2px] block"
        style={{
          background:
            'linear-gradient(90deg, var(--accent-editorial), var(--accent-warm), var(--accent-editorial))',
          opacity: 0.6,
        }}
      />
    </div>
  );
}
