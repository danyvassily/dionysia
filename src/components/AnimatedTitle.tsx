import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface AnimatedTitleProps {
  text: string;
  className?: string;
}

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
      y: 60,
      rotateX: -90,
    });

    // Animate in with stagger
    gsap.to(letters, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.06,
      delay: 0.2,
    });

    // Subtle hover effect setup
    letters.forEach((letter) => {
      letter.addEventListener('mouseenter', () => {
        gsap.to(letter, {
          y: -4,
          color: 'var(--accent-editorial)',
          duration: 0.25,
          ease: 'power2.out',
        });
      });
      letter.addEventListener('mouseleave', () => {
        gsap.to(letter, {
          y: 0,
          color: 'var(--ink)',
          duration: 0.25,
          ease: 'power2.out',
        });
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
        delay: 0.8,
      });
    }
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <div className="flex items-baseline" style={{ perspective: '600px' }}>
        {text.split('').map((char, i) => {
          const isLastTwo = i >= text.length - 2;
          return (
            <span
              key={i}
              className="letter inline-block cursor-default"
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontWeight: 700,
                lineHeight: 0.9,
                letterSpacing: '-0.03em',
                color: 'var(--ink)',
                display: 'inline-block',
                transformStyle: 'preserve-3d',
                fontSize: isLastTwo ? '1.55em' : '1em',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
      </div>
      {/* Animated underline */}
      <div
        className="title-underline absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, var(--accent-editorial), var(--accent-warm), var(--accent-editorial))',
          opacity: 0.6,
        }}
      />
    </div>
  );
}
