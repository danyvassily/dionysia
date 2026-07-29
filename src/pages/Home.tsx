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
  // "28 juillet 2026" or "2026-07-28" → Date
  if (dateStr.includes('-')) {
    // ISO format: "2026-07-28"
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const parts = dateStr.split(' ');
  if (parts.length < 3) return new Date(); // fallback
  const day = parseInt(parts[0]);
  const month = FRENCH_MONTHS[parts[1]?.toLowerCase()] ?? 0;
  const year = parseInt(parts[2]);
  return new Date(year, month, day);
}

// ─── CLASSEMENT DYNAMIQUE ──────────────────────────────────────────────────
// Les 6 articles les plus récents sont en « À la une ».
// Les autres sont répartis dans leurs sections par catégorie.
// Le flag `featured` dans les données n'est plus utilisé.
const FEATURED_COUNT = 6;

// Sort articles: newest first
const sortedArticles = [...articles].sort(
  (a, b) => parseFrenchDate(b.date).getTime() - parseFrenchDate(a.date).getTime()
);

export default function Home() {
  // Top N → featured. Rest → categories.
  const featuredArticles = sortedArticles.slice(0, FEATURED_COUNT);
  const restArticles = sortedArticles.slice(FEATURED_COUNT);

  const articlesByCategory = {
    ia: restArticles.filter((a) => a.category === 'ia'),
    tech: restArticles.filter((a) => a.category === 'tech'),
    dev: restArticles.filter((a) => a.category === 'dev'),
    politique: restArticles.filter((a) => a.category === 'politique'),
  };

  const categoryConfig = {
    ia: {
      title: 'Intelligence Artificielle',
      subtitle: 'Agents, modèles, benchmarks et la révolution silencieuse',
    },
    tech: {
      title: 'Technologie',
      subtitle: 'Stack, fintech, et les infrastructures de demain',
    },
    dev: {
      title: 'Développement Web',
      subtitle: 'Frameworks, architectures et craftsmanship',
    },
    politique: {
      title: 'Politique Numérique',
      subtitle: 'Régulation, souveraineté et éthique',
    },
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      <Navigation />
      <Hero />

      {/* Featured Section */}
      <section id="featured" className="py-14 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-12 pb-4" style={{ borderBottom: '1px solid var(--rule)' }}>
            <span className="overline text-[var(--ink-faint)]">À la une</span>
            <div className="flex-1 h-px" style={{ background: 'var(--rule)' }} />
          </div>

          <div className="space-y-12">
            {featuredArticles.map((article) => (
              <FeaturedArticle key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full" style={{ borderTop: '1px solid var(--rule)' }} />
      </div>

      {/* Category sections */}
      {(Object.keys(articlesByCategory) as Array<keyof typeof articlesByCategory>).map((cat) => (
        <CategorySection
          key={cat}
          id={cat}
          title={categoryConfig[cat].title}
          subtitle={categoryConfig[cat].subtitle}
          articles={articlesByCategory[cat]}
        />
      ))}

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full" style={{ borderTop: '1px solid var(--rule)' }} />
      </div>

      <AboutSection />
      <Footer />
    </div>
  );
}
