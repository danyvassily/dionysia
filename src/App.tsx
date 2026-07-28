import { Routes, Route, useLocation } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';

function AnimatedRoutes() {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const prevPath = useRef(location.pathname);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location.pathname === prevPath.current) return;

    const tl = gsap.timeline({
      onComplete: () => {
        setDisplayLocation(location);
        prevPath.current = location.pathname;
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
