import { Routes, Route, useLocation } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';

gsap.registerPlugin(ScrollTrigger);

function AnimatedRoutes() {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const prevPath = useRef(location.pathname);
  const [displayLocation, setDisplayLocation] = useState(location);

  // Reset scroll on route change
  useEffect(() => {
    if (location.pathname === prevPath.current) return;

    // Kill all ScrollTriggers from previous page to prevent scroll hijacking
    ScrollTrigger.getAll().forEach((t) => t.kill());
    // Force scroll to top immediately
    window.scrollTo(0, 0);

    const tl = gsap.timeline({
      onComplete: () => {
        setDisplayLocation(location);
        prevPath.current = location.pathname;
        // Force scroll to top again after content swap
        window.scrollTo(0, 0);
        // Fade in
        gsap.fromTo(
          containerRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
        );
      },
    });

    // Fade out
    tl.to(containerRef.current, {
      opacity: 0,
      y: -12,
      duration: 0.2,
      ease: 'power2.in',
    });

    return () => {
      tl.kill();
    };
  }, [location]);

  // On first mount, ensure we're at the top
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <div ref={containerRef}>
      <Routes location={displayLocation}>
        <Route path="/" element={<Home />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return <AnimatedRoutes />;
}
