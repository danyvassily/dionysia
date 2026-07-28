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

    // Check if element is already in viewport
    const rect = containerRef.current.getBoundingClientRect();
    const isAlreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (isAlreadyVisible) {
      // Animate immediately — no ScrollTrigger needed
      gsap.set(letters, {
        opacity: 0,
        y: 24,
        skewY: 2,
      });
      if (underline) {
        gsap.set(underline, { scaleX: 0, transformOrigin: 'left center' });
      }

      const tl = gsap.timeline({ delay });
      tl.to(letters, {
        opacity: 1,
        y: 0,
        skewY: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.025,
      });
      if (underline) {
        tl.to(
          underline,
          { scaleX: 1, duration: 0.6, ease: 'power2.inOut' },
          '-=0.2'
        );
      }

      return () => {
        tl.kill();
      };
    }

    // Element is below the fold — use ScrollTrigger
    gsap.set(letters, {
      opacity: 0,
      y: 24,
      skewY: 2,
    });
    if (underline) {
      gsap.set(underline, { scaleX: 0, transformOrigin: 'left center' });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    tl.to(letters, {
      opacity: 1,
      y: 0,
      skewY: 0,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.025,
      delay,
    });

    if (underline) {
      tl.to(
        underline,
        { scaleX: 1, duration: 0.6, ease: 'power2.inOut' },
        '-=0.2'
      );
    }

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === containerRef.current) t.kill();
      });
    };
  }, [text, delay]);

  return (
    <div ref={containerRef} className="relative inline">
      <Tag className={className}>
        {text.split('').map((char, i) => (
          <span
            key={i}
            className="art-letter inline-block"
            style={{
              whiteSpace: char === ' ' ? 'pre' : undefined,
            }}
          >
            {char}
          </span>
        ))}
      </Tag>
      <span
        className="art-underline absolute -bottom-1 left-0 h-[1px] w-full block"
        style={{
          background: 'var(--accent-editorial)',
          opacity: 0.3,
        }}
      />
    </div>
  );
}
