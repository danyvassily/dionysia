import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import gsap from 'gsap';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (location.pathname === (displayChildren as any)?.props?.location?.pathname) return;

    setIsAnimating(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setDisplayChildren(children);
        setIsAnimating(false);
      },
    });

    // Fade out current page
    tl.to(containerRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.25,
      ease: 'power2.in',
    });

    tl.call(() => setDisplayChildren(children));

    // Fade in new page
    tl.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: 'power2.out',
      }
    );

    return () => {
      tl.kill();
    };
  }, [location, children]);

  return (
    <div ref={containerRef} style={{ opacity: isAnimating ? 0 : 1 }}>
      {displayChildren}
    </div>
  );
}
