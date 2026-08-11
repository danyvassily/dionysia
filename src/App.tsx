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
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (location.pathname === prevPath.current) return;
    ScrollTrigger.getAll().forEach((t) => t.kill());
    window.scrollTo(0, 0);

    if (reduceMotion) {
      setDisplayLocation(location);
      prevPath.current = location.pathname;
      window.scrollTo(0, 0);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setDisplayLocation(location);
        prevPath.current = location.pathname;
        window.scrollTo(0, 0);
        gsap.fromTo(containerRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
      },
    });
    tl.to(containerRef.current, { opacity: 0, y: -8, duration: 0.18, ease: 'power2.in' });
    return () => { tl.kill(); };
  }, [location, reduceMotion]);

  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
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

export default function App() { return <AnimatedRoutes />; }
