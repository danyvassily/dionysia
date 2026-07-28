import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import FeaturedArticle from '@/components/FeaturedArticle';
import CategorySection from '@/components/CategorySection';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import { articles } from '@/data/articles';

export default function Home() {
  const featuredArticles = articles.filter((a) => a.featured);
  const articlesByCategory = {
    ia: articles.filter((a) => a.category === 'ia' && !a.featured),
    tech: articles.filter((a) => a.category === 'tech' && !a.featured),
    dev: articles.filter((a) => a.category === 'dev' && !a.featured),
    politique: articles.filter((a) => a.category === 'politique' && !a.featured),
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
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
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
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
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
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="w-full" style={{ borderTop: '1px solid var(--rule)' }} />
      </div>

      <AboutSection />
      <Footer />
    </div>
  );
}
