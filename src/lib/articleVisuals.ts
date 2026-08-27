import type { ArticleImage, ArticleSummary } from '@/data/articles';

const fallbackVisuals: Record<ArticleSummary['category'], ArticleImage> = {
  ia: {
    src: '/images/editorial/ia-default.jpg',
    alt: 'Réseau neuronal abstrait traversant une architecture noire et ivoire.',
    credit: 'Illustration DIONYSIA générée par IA',
  },
  tech: {
    src: '/images/editorial/tech-default.jpg',
    alt: 'Processeur monumental relié à une infrastructure urbaine.',
    credit: 'Illustration DIONYSIA générée par IA',
  },
  dev: {
    src: '/images/editorial/dev-default.jpg',
    alt: 'Modules logiciels abstraits formant un pont et plusieurs branches.',
    credit: 'Illustration DIONYSIA générée par IA',
  },
  politique: {
    src: '/images/editorial/politique-default.jpg',
    alt: 'Institutions, balance et réseaux numériques dans une composition abstraite.',
    credit: 'Illustration DIONYSIA générée par IA',
  },
};

export function getArticleVisual(article: ArticleSummary) {
  return article.image ?? fallbackVisuals[article.category];
}
