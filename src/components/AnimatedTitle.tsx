import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface AnimatedTitleProps {
  text: string;
  className?: string;
}

/**
 * AnimatedTitle — GSAP letter-by-letter reveal with responsive wrapping.
 *
 * Desktop : chaque lettre s'anime individuellement (inline, wrappable).
 * Jamais de scroll horizontal — les spans sont `display: inline` pour
 * permettre le wrapping naturel, pas `inline-block` qui casse le flux.
 *
 * Guideline UX Pro Max §5 : pas de scroll horizontal, mobile-first.
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

    // Subtle hover effect on desktop
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      letters.forEach((letter) => {
        const onEnter = () => {
          gsap.to(letter, {
            y: -4,
            color: 'var(--accent-editorial)',
            duration: 0.25,
            ease: 'power2.out',
          });
        };
        const onLeave = () => {
          gsap.to(letter, {
            y: 0,
            color: 'var(--ink)',
            duration: 0.25,
            ease: 'power2.out',
          });
        };
        letter.addEventListener('mouseenter', onEnter);
        letter.addEventListener('mouseleave', onLeave);
        return () => {
          letter.removeEventListener('mouseenter', onEnter);
          letter.removeEventListener('mouseleave', onLeave);
        };
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
                display: 'inline', // ← CRITIQUE : inline pour wrapping naturel
                transformStyle: 'preserve-3d',
                fontSize: isLastTwo ? '1.55em' : 'inherit',
              }}
            >
              {char === ' ' ? ' ' : char}
            </span>
          );
        })}
      </span>
      {/* Animated underline — full width of the text block */}
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
