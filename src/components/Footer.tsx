import { ArrowUp, Github, Instagram, Mail, Rss, Check } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

const footerLinks = [
  { title: 'Rubriques', links: [
    { label: 'Intelligence Artificielle', href: '/#ia' },
    { label: 'Technologie', href: '/#tech' },
    { label: 'Développement Web', href: '/#dev' },
    { label: 'Politique Numérique', href: '/#politique' },
  ]},
  { title: 'Ressources', links: [
    { label: 'À la une', href: '/#featured' },
    { label: 'À propos', href: '/#about' },
    { label: 'Flux RSS', href: '/rss.xml' },
  ]},
];

export default function Footer() {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus('err'); return; }
    const subject = encodeURIComponent('Inscription à la newsletter DIONYSIA');
    const body = encodeURIComponent(`Bonjour,\n\nJe souhaite recevoir la newsletter DIONYSIA à cette adresse : ${email}`);
    window.location.href = `mailto:danyvassiliakos@gmail.com?subject=${subject}&body=${body}`;
    setStatus('ok');
    setTimeout(() => setStatus('idle'), 3000);
  };
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="pt-10 pb-8" style={{ background: 'var(--paper)', borderTop: '1px solid var(--rule)' }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top rule */}
        <div className="w-full mb-10 h-px" style={{ background: 'var(--rule-strong)' }} />
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 mb-10">
          <div className="lg:col-span-5">
            <span className="font-editorial text-[18px] font-semibold tracking-[0.16em] text-[var(--ink)]">DIONYSIA</span>
            <p className="font-sans text-[13.5px] leading-relaxed text-[var(--ink-muted)] mt-3 max-w-[36ch]">
              Chroniques à l'ère du numérique. Une revue exigeante où l'analyse rencontre l'enthousiasme.
            </p>
            <div className="flex items-center gap-1.5 mt-5">
              {[
                { icon: Instagram, href: 'https://www.instagram.com/danyvassiliakos/', label: 'Instagram', external: true },
                { icon: Github, href: 'https://github.com/danyvassily/dionysia', label: 'GitHub', external: true },
                { icon: Mail, href: 'mailto:danyvassiliakos@gmail.com', label: 'Envoyer un e-mail', external: false },
                { icon: Rss, href: '/rss.xml', label: 'Flux RSS', external: false },
              ].map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} target={s.external ? '_blank' : undefined} rel={s.external ? 'noreferrer noopener' : undefined} className="w-8 h-8 inline-flex items-center justify-center rounded-full border text-[var(--ink-faint)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors" style={{ borderColor: 'var(--rule)' }}>
                  <s.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
            <div className="mt-5 space-y-2 border-t border-[var(--rule)] pt-4">
              <a href="mailto:danyvassiliakos@gmail.com" className="group flex items-center gap-2 text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[var(--ink-faint)] group-hover:text-[var(--accent-editorial)]" />
                <span className="underline decoration-[var(--rule-strong)] underline-offset-4">danyvassiliakos@gmail.com</span>
              </a>
              <a href="https://www.instagram.com/danyvassiliakos/" target="_blank" rel="noreferrer noopener" className="group flex items-center gap-2 text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">
                <Instagram className="h-3.5 w-3.5 shrink-0 text-[var(--ink-faint)] group-hover:text-[var(--accent-editorial)]" />
                <span className="underline decoration-[var(--rule-strong)] underline-offset-4">@danyvassiliakos</span>
              </a>
            </div>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title} className="lg:col-span-2">
              <h4 className="overline text-[var(--ink-faint)] mb-3">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}><a href={link.href} className="font-sans text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
          <div className="lg:col-span-3">
            <h4 className="overline text-[var(--ink-faint)] mb-3">Newsletter</h4>
            <p className="font-sans text-sm text-[var(--ink-muted)] mb-3">Les chroniques, une fois par semaine. Sans spam.</p>
            <form onSubmit={submit} className="flex gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="votre@email.com"
                aria-label="Adresse email"
                className="flex-1 h-9 px-3 text-sm font-sans bg-transparent border placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent-editorial)] transition-colors"
                style={{ borderColor: status === 'err' ? '#ef4444' : 'var(--rule)' }}
              />
              <button type="submit" className="h-9 px-4 text-sm font-sans font-medium bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 transition-opacity inline-flex items-center gap-1.5">
                {status === 'ok' ? <><Check className="w-3.5 h-3.5" /> OK</> : 'OK'}
              </button>
            </form>
            {status === 'ok' && <p className="text-xs font-sans text-[var(--success)] mt-2">Votre messagerie va s’ouvrir pour confirmer l’inscription.</p>}
            {status === 'err' && <p className="text-xs font-sans text-red-500 mt-2">Email invalide.</p>}
          </div>
        </div>
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t" style={{ borderColor: 'var(--rule)' }}>
          <div>
            <p className="font-sans text-xs text-[var(--ink-faint)]">© {new Date().getFullYear()} Dany Vassily — Tous droits réservés · Fait avec exigence.</p>
            {language === 'en' && (
              <p className="notranslate mt-1 text-[10px] text-[var(--ink-faint)]" translate="no">
                Automatic English translation powered by Google Translate. The French version is the original.
              </p>
            )}
          </div>
          <button onClick={scrollToTop} className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors group">
            Haut de page <ArrowUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}
