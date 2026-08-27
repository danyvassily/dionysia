import { Routes, Route, useLocation } from 'react-router';
import { useEffect } from 'react';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
      </Routes>
    </>
  );
}
