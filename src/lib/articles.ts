import { articles, type Article } from '@/data/articles';

export type ArticleCategory = Article['category'];

const months: Record<string, number> = {
  janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11,
};

export const categoryConfig: Record<ArticleCategory, { title: string; short: string; subtitle: string }> = {
  ia: {
    title: 'Intelligence artificielle',
    short: 'IA',
    subtitle: 'Modèles, agents et nouveaux usages — sans le bruit promotionnel.',
  },
  tech: {
    title: 'Technologie',
    short: 'Tech',
    subtitle: 'Entreprises, infrastructures et produits qui transforment nos usages.',
  },
  dev: {
    title: 'Développement',
    short: 'Dev',
    subtitle: 'Pratiques, outils et architectures racontés par ceux qui construisent.',
  },
  politique: {
    title: 'Politique numérique',
    short: 'Politique',
    subtitle: 'Régulation, souveraineté et rapports de pouvoir à l’ère des plateformes.',
  },
};

export function isArticleCategory(value: string | undefined): value is ArticleCategory {
  return value === 'ia' || value === 'tech' || value === 'dev' || value === 'politique';
}

function parseFrenchDate(value: string) {
  if (value.includes('-')) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const [day, month, year] = value.split(' ');
  return new Date(Number(year), months[month?.toLowerCase()] ?? 0, Number(day));
}

function normalizeTitle(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9à-ÿ]+/g, ' ').trim();
}

export function sortAndDeduplicateArticles(items: Article[]) {
  const seen = new Set<string>();
  return [...items]
    .sort((a, b) => parseFrenchDate(b.date).getTime() - parseFrenchDate(a.date).getTime())
    .filter((item) => {
      const key = normalizeTitle(item.title);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export const sortedArticles = sortAndDeduplicateArticles(articles);
