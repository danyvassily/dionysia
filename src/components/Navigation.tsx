import { useState, useEffect, useRef } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useTheme } from '@/hooks/useTheme';

const navLinks = [
  { label: 'IA', href: '/#ia', id: 'ia' },
  { label: 'Tech', href: '/#tech', id: 'tech' },
  { label: 'Dev', href: '/#dev', id: 'dev' },
  { label: 'Politique', href: '/#politique', id: 'politique' },
];

export default function Navigation() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Scroll shadow + scrollspy
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      // scrollspy: find closest section to top
      const ids = ['featured', 'ia', 'tech', 'dev', 'politique', 'about'];
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) current = id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  // lock body when mobile open + focus trap basics + esc
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
      window.addEventListener('keydown', onKey);
      return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileOpen]);

  const handleAnchor = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      // after nav, scroll after tick
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', `/#${id}`);
    }
  };

  return (
    <>
      {/* Skip link */}
      <a href="#featured" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2 focus:bg-[var(--ink)] focus:text-[var(--paper)] focus:text-sm focus:rounded">
        Aller au contenu
      </a>

      <nav
        role="navigation"
        aria-label="Navigation principale"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-[var(--paper)]/90 backdrop-blur-[12px] supports-[backdrop-filter]:bg-[var(--paper)]/80 shadow-[0_1px_0_var(--rule)]'
            : 'bg-[var(--paper)]'
        }`}
        style={{ borderColor: 'var(--rule)' }}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[56px] lg:h-[64px]">
            {/* Logo */}
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 group">
              <span className="font-editorial text-[18px] lg:text-[20px] font-semibold tracking-[0.18em] text-[var(--ink)] group-hover:text-[var(--accent-editorial)] transition-colors">
                DIONYSIA
              </span>
              <span className="hidden sm:inline-flex items-center h-4 w-px bg-[var(--rule)]" aria-hidden />
              <span className="hidden sm:inline text-[10px] font-sans tracking-[0.14em] uppercase text-[var(--ink-faint)]">Chroniques</span>
            </Link>

            {/* Center nav — desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = active === link.id;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(e) => handleAnchor(e, link.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative px-3.5 py-2 text-[11px] font-sans font-semibold tracking-[0.12em] uppercase transition-colors duration-200 rounded-sm ${
                      isActive ? 'text-[var(--ink)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute left-3.5 right-3.5 -bottom-[9px] h-[2px] bg-[var(--accent-editorial)] transition-all duration-300 ${isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-50'}`}
                      style={{ transformOrigin: 'center' }}
                    />
                  </a>
                );
              })}
            </div>

            {/* Right */}
            <div className="flex items-center gap-1.5">
              <Link
                to="/#featured"
                onClick={(e) => handleAnchor(e, 'featured')}
                className="hidden lg:inline-flex items-center h-8 px-4 text-[11px] font-sans font-medium tracking-wide border text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] hover:border-[var(--ink)] transition-colors"
                style={{ borderColor: 'var(--rule)' }}
              >
                À la une
              </Link>
              <button
                onClick={toggleTheme}
                aria-label={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
                className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--paper-dark)] border border-transparent hover:border-[var(--rule)] transition-all"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                className="md:hidden w-9 h-9 inline-flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink)] border border-transparent hover:border-[var(--rule)] transition-colors ml-1"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar — fine line under nav */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--rule)]" aria-hidden />
      </nav>

      {/* Mobile sheet */}
      <div
        id="mobile-menu"
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-40 md:hidden transition ${mobileOpen ? 'visible' : 'invisible pointer-events-none'}`}
      >
        <div onClick={() => setMobileOpen(false)} className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`} />
        <div
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute top-0 right-0 h-full w-[88%] max-w-[360px] bg-[var(--paper)] border-l shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ borderColor: 'var(--rule)' }}
        >
          <div className="flex items-center justify-between h-[56px] px-6 border-b" style={{ borderColor: 'var(--rule)' }}>
            <span className="font-editorial text-sm font-semibold tracking-[0.14em]">DIONYSIA</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Fermer" className="w-9 h-9 inline-flex items-center justify-center border hover:bg-[var(--paper-dark)] transition-colors" style={{ borderColor: 'var(--rule)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-6 py-6">
            <p className="overline text-[var(--ink-faint)] mb-4">Rubriques</p>
            <div className="divide-y" style={{ borderColor: 'var(--rule)' } as any}>
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleAnchor(e, link.id)}
                  className="flex items-center justify-between py-4 text-[13px] font-sans font-medium tracking-[0.08em] uppercase text-[var(--ink)] hover:text-[var(--accent-editorial)] transition-colors"
                >
                  {link.label}
                  <span className="text-[var(--ink-faint)]">→</span>
                </a>
              ))}
              <a href="/#about" onClick={(e) => handleAnchor(e, 'about')} className="flex items-center justify-between py-4 text-[13px] font-sans font-medium tracking-[0.08em] uppercase text-[var(--ink)] hover:text-[var(--accent-editorial)] transition-colors">
                À propos <span className="text-[var(--ink-faint)]">→</span>
              </a>
            </div>
            <Link to="/#featured" onClick={(e) => handleAnchor(e as any, 'featured')} className="mt-6 inline-flex w-full items-center justify-center h-10 bg-[var(--ink)] text-[var(--paper)] text-sm font-sans font-medium hover:opacity-90 transition-opacity">Explorer les chroniques</Link>
          </div>
        </div>
      </div>
    </>
  );
}
