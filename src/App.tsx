import { Routes, Route, useLocation } from 'react-router';
import { lazy, Suspense, useEffect } from 'react';
import Home from './pages/Home';

const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const CategoryArchive = lazy(() => import('./pages/CategoryArchive'));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div className="min-h-screen bg-[var(--paper)]" aria-label="Chargement de la page" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/rubrique/:category" element={<CategoryArchive />} />
        </Routes>
      </Suspense>
    </>
  );
}
