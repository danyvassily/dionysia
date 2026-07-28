import { ArrowUp, Github, Twitter, Mail, Rss } from 'lucide-react';

const footerLinks = [
  {
    title: 'Navigation',
    links: [
      { label: 'Intelligence Artificielle', href: '#ia' },
      { label: 'Technologie', href: '#tech' },
      { label: 'Développement Web', href: '#dev' },
      { label: 'Politique Numérique', href: '#politique' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Newsletter', href: '#' },
      { label: 'Flux RSS', href: '#' },
      { label: 'Archives', href: '#' },
    ],
  },
];

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="pt-16 pb-10">
      {/* Top double rule */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="w-full mb-12" style={{ borderTop: '3px double var(--rule)' }} />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 mb-14">
          {/* Brand */}
          <div className="lg:col-span-5">
            <span className="font-editorial text-xl font-semibold tracking-[0.15em] text-[var(--ink)]">
              DIONYSIA
            </span>
            <p className="font-sans text-sm text-[var(--ink-muted)] leading-relaxed mt-3 max-w-sm">
              Chroniques à l'ère du numérique. Là où l'analyse rencontre l'enthousiasme,
              où la technologie rencontre la pensée critique.
            </p>
            <div className="flex items-center gap-2 mt-5">
              {[
                { icon: Twitter, href: '#' },
                { icon: Github, href: '#' },
                { icon: Mail, href: '#' },
                { icon: Rss, href: '#' },
              ].map((s) => (
                <a
                  key={s.icon.name}
                  href={s.href}
                  className="w-8 h-8 flex items-center justify-center text-[var(--ink-faint)] hover:text-[var(--accent-editorial)] transition-colors"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {footerLinks.map((group) => (
            <div key={group.title} className="lg:col-span-2">
              <h4 className="overline text-[var(--ink-faint)] mb-4">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="font-sans text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h4 className="overline text-[var(--ink-faint)] mb-4">Newsletter</h4>
            <p className="font-sans text-sm text-[var(--ink-muted)] mb-4">
              Recevez les chroniques directement dans votre boîte.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="votre@email.com"
                className="flex-1 px-3 py-2 text-sm font-sans text-[var(--ink)] placeholder:text-[var(--ink-faint)] bg-transparent border transition-colors focus:outline-none focus:border-[var(--accent-editorial)]"
                style={{ borderColor: 'var(--rule)' }}
              />
              <button
                className="px-4 py-2 text-sm font-sans font-medium text-[var(--paper)] transition-colors"
                style={{ background: 'var(--accent-editorial)' }}
              >
                OK
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid var(--rule)' }}>
          <p className="font-sans text-xs text-[var(--ink-faint)]">
            © 2026 Dany Vassily — Tous droits réservés
          </p>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-xs font-sans text-[var(--ink-faint)] hover:text-[var(--ink-muted)] transition-colors group"
          >
            Haut de page
            <ArrowUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}
