import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import gsap from 'gsap';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const previousPath = useRef(location.pathname);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (location.pathname === previousPath.current) return;
    previousPath.current = location.pathname;

    // Animation state is intentionally synchronized with route changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
