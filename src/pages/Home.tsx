import { ArrowUpRight, Clock } from 'lucide-react';
import { Link } from 'react-router';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import CategorySection from '@/components/CategorySection';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import { articles, type Article } from '@/data/articles';

const months: Record<string, number> = {
  janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11,
};

function parseFrenchDate(value: string) {
  if (value.includes('-')) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const [day, month, year] = value.split(' ');
  return new Date(Number(year), months[month?.toLowerCase()] ?? 0, Number(day));
}

function deduplicate(items: Article[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.title.toLowerCase().replace(/[^a-z0-9à-ÿ]+/g, ' ').trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const sortedArticles = deduplicate(
  [...articles].sort((a, b) => parseFrenchDate(b.date).getTime() - parseFrenchDate(a.date).getTime()),
);

const categoryNames: Record<Article['category'], string> = {
  ia: 'Intelligence artificielle',
  tech: 'Technologie',
  dev: 'Développement',
  politique: 'Politique numérique',
};

export default function Home() {
  const featured = sortedArticles.slice(0, 5);
  const [lead, ...briefs] = featured;
  const remaining = sortedArticles.slice(5);
  const byCategory = {
    ia: remaining.filter((item) => item.category === 'ia'),
    tech: remaining.filter((item) => item.category === 'tech'),
    dev: remaining.filter((item) => item.category === 'dev'),
    politique: remaining.filter((item) => item.category === 'politique'),
  };
  const config = {
    ia: { title: 'Intelligence artificielle', subtitle: 'Modèles, agents et nouveaux usages — sans le bruit promotionnel.' },
    tech: { title: 'Technologie', subtitle: 'Entreprises, infrastructures et produits qui transforment nos usages.' },
    dev: { title: 'Développement', subtitle: 'Pratiques, outils et architectures racontés par ceux qui construisent.' },
    politique: { title: 'Politique numérique', subtitle: 'Régulation, souveraineté et rapports de pouvoir à l’ère des plateformes.' },
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Navigation />
      <Hero />

      <section id="featured" className="scroll-mt-20 py-12 lg:py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between border-b-2 border-[var(--ink)] pb-3">
            <div>
              <p className="overline text-[var(--accent-editorial)]">Édition du jour</p>
              <h2 className="mt-1 font-editorial text-4xl font-semibold">À la une</h2>
            </div>
            <p className="hidden text-xs text-[var(--ink-faint)] sm:block">Les cinq informations à retenir</p>
          </div>

          {lead && (
            <div className="grid gap-8 border-b border-[var(--rule)] py-8 lg:grid-cols-[1.45fr_1fr] lg:gap-12 lg:py-10">
              <article>
                <p className="overline text-[var(--accent-editorial)]">{categoryNames[lead.category]}</p>
                <Link to={`/article/${lead.id}`} className="group block">
                  <h3 className="mt-4 max-w-[19ch] font-editorial text-[clamp(2.2rem,5vw,4.4rem)] font-semibold leading-[0.95] tracking-[-0.04em] group-hover:text-[var(--accent-editorial)]">
                    {lead.title}
                  </h3>
                </Link>
              </article>
              <div className="flex flex-col justify-end">
                <p className="text-base leading-7 text-[var(--ink-muted)]">{lead.excerpt}</p>
                <div className="mt-6 flex items-center justify-between border-t border-[var(--rule)] pt-4 text-xs text-[var(--ink-faint)]">
                  <span>{lead.date} · {lead.readTime}</span>
                  <Link to={`/article/${lead.id}`} className="inline-flex items-center gap-2 font-semibold uppercase tracking-[0.1em] text-[var(--ink)] hover:text-[var(--accent-editorial)]">
                    Lire <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {briefs.map((item, index) => (
              <article key={item.id} className={`flex min-h-[280px] flex-col py-6 sm:px-6 ${index === 0 ? 'sm:pl-0' : ''} ${index > 0 ? 'lg:border-l lg:border-[var(--rule)]' : ''}`}>
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                  <span>{categoryNames[item.category]}</span><span>0{index + 2}</span>
                </div>
                <Link to={`/article/${item.id}`} className="group mt-5 block">
                  <h3 className="font-editorial text-2xl font-semibold leading-[1.02] group-hover:text-[var(--accent-editorial)]">{item.title}</h3>
                </Link>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--ink-muted)]">{item.excerpt}</p>
                <div className="mt-auto flex items-center gap-2 pt-6 text-xs text-[var(--ink-faint)]">
                  <Clock className="h-3.5 w-3.5" /> {item.readTime}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {(Object.keys(byCategory) as Array<keyof typeof byCategory>).map((category) => (
        <CategorySection
          key={category}
          id={category}
          title={config[category].title}
          subtitle={config[category].subtitle}
          articles={byCategory[category]}
        />
      ))}

      <AboutSection />
      <Footer />
    </div>
  );
}
