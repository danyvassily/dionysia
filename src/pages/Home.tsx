import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import FeaturedArticle from '@/components/FeaturedArticle';
import CategorySection from '@/components/CategorySection';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import { articles } from '@/data/articles';

const FRENCH_MONTHS: Record<string, number> = {
  janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11,
};
function parseFrenchDate(dateStr: string): Date {
  if (dateStr.includes('-')) { const [y, m, d] = dateStr.split('-').map(Number); return new Date(y, m - 1, d); }
  const parts = dateStr.split(' ');
  if (parts.length < 3) return new Date();
  return new Date(parseInt(parts[2]), FRENCH_MONTHS[parts[1]?.toLowerCase()] ?? 0, parseInt(parts[0]));
}
const FEATURED_COUNT = 6;
const sortedArticles = [...articles].sort((a, b) => parseFrenchDate(b.date).getTime() - parseFrenchDate(a.date).getTime());

export default function Home() {
  const featuredArticles = sortedArticles.slice(0, FEATURED_COUNT);
  const restArticles = sortedArticles.slice(FEATURED_COUNT);
  const articlesByCategory = {
    ia: restArticles.filter((a) => a.category === 'ia'),
    tech: restArticles.filter((a) => a.category === 'tech'),
    dev: restArticles.filter((a) => a.category === 'dev'),
    politique: restArticles.filter((a) => a.category === 'politique'),
  };
  const categoryConfig = {
    ia: { title: 'Intelligence Artificielle', subtitle: 'Agents, modèles, benchmarks et la révolution silencieuse' },
    tech: { title: 'Technologie', subtitle: 'Stack, fintech, et les infrastructures de demain' },
    dev: { title: 'Développement Web', subtitle: 'Frameworks, architectures et craftsmanship' },
    politique: { title: 'Politique Numérique', subtitle: 'Régulation, souveraineté et éthique' },
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      <Navigation />
      <Hero />

      <section id="featured" className="py-10 lg:py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-editorial)]" aria-hidden />
            <span className="overline text-[var(--ink-faint)]">À la une</span>
            <span className="ml-2 text-xs font-sans text-[var(--ink-faint)] hidden sm:inline">— Les 6 plus récents</span>
            <div className="flex-1 h-px ml-4 hidden sm:block" style={{ background: 'var(--rule)' }} />
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--rule)' }}>
            {featuredArticles.map((article, i) => <FeaturedArticle key={article.id} article={article} index={i} />)}
          </div>
        </div>
      </section>

      {(Object.keys(articlesByCategory) as Array<keyof typeof articlesByCategory>).map((cat) => (
        <CategorySection key={cat} id={cat} title={categoryConfig[cat].title} subtitle={categoryConfig[cat].subtitle} articles={articlesByCategory[cat]} />
      ))}

      <AboutSection />
      <Footer />
    </div>
  );
}
