import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedArticleTitleProps {
  text: string;
  className?: string;
  as?: 'h2' | 'h3';
  delay?: number;
}

/**
 * AnimatedArticleTitle — GSAP letter-by-letter reveal on scroll,
 * with responsive wrapping and mobile-first sizing.
 *
 * Letters are `display: inline` so long titles wrap naturally —
 * never force horizontal scroll.
 *
 * Guideline UX Pro Max §5 : pas de scroll horizontal.
 */
export default function AnimatedArticleTitle({
  text,
  className = '',
  as: Tag = 'h3',
  delay = 0,
}: AnimatedArticleTitleProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const letters = containerRef.current.querySelectorAll('.art-letter');
    const underline = containerRef.current.querySelector('.art-underline');

    // Check if element is already visible
    const rect = containerRef.current.getBoundingClientRect();
    const isAlreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;

    const animate = (tl: gsap.core.Timeline) => {
      tl.to(letters, {
        opacity: 1,
        y: 0,
        skewY: 0,
        duration: 0.4,
        ease: 'power3.out',
        stagger: 0.018,
        delay,
      });
      if (underline) {
        tl.to(
          underline,
          { scaleX: 1, duration: 0.5, ease: 'power2.inOut' },
          '-=0.15'
        );
      }
    };

    // Initial state
    gsap.set(letters, { opacity: 0, y: 18, skewY: 2 });
    if (underline) {
      gsap.set(underline, { scaleX: 0, transformOrigin: 'left center' });
    }

    if (isAlreadyVisible) {
      // Animate immediately
      const tl = gsap.timeline();
      animate(tl);
      return () => {
        tl.kill();
      };
    }

    // Below the fold — ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });

    animate(tl);

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === containerRef.current) t.kill();
      });
    };
  }, [text, delay]);

  return (
    <div ref={containerRef} className="relative">
      <Tag className={className}>
        {text.split('').map((char, i) => (
          <span
            key={i}
            className="art-letter inline select-none"
          >
            {char}
          </span>
        ))}
      </Tag>
      <span
        className="art-underline absolute -bottom-0.5 left-0 h-[1px] w-full block"
        style={{
          background: 'var(--accent-editorial)',
          opacity: 0.3,
        }}
      />
    </div>
  );
}
