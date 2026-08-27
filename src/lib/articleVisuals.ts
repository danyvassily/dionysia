import type { ArticleSummary } from '@/data/articles';

export function getArticleVisual(article: ArticleSummary) {
  return article.image;
}
