import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const navLinks = [
  { label: 'Accueil', href: '#hero' },
  { label: 'IA', href: '#ia' },
  { label: 'Tech', href: '#tech' },
  { label: 'Dev', href: '#dev' },
  { label: 'Politique', href: '#politique' },
];

export default function Navigation() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[var(--paper)]/95 backdrop-blur-sm shadow-[0_1px_0_var(--rule)]'
            : 'bg-[var(--paper)]'
        }`}
        style={{ borderBottom: '1px solid var(--rule)' }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo — small caps éditorial */}
            <a href="#hero" className="font-editorial text-lg font-semibold tracking-[0.15em] text-[var(--ink)] hover:text-[var(--accent-editorial)] transition-colors duration-300">
              DIONYSIA
            </a>

            {/* Center nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-xs font-sans font-medium tracking-[0.08em] uppercase text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right: theme toggle + mobile */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                aria-label={theme === 'light' ? 'Passer au mode sombre' : 'Passer au mode clair'}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--paper-dark)] transition-all duration-200"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-8 h-8 flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 pt-14 animate-fade-in"
          style={{ background: 'var(--paper)' }}
        >
          <div className="max-w-6xl mx-auto px-6 py-8 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm font-sans font-medium tracking-[0.08em] uppercase text-[var(--ink-muted)] hover:text-[var(--ink)] border-b transition-colors"
                style={{ borderColor: 'var(--rule)' }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
