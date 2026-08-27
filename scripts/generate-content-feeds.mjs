import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';

const origin = 'https://dionysia-blog.vercel.app';
const articlesPath = new URL('../src/data/articles.ts', import.meta.url);
const summariesPath = new URL('../src/data/articleSummaries.ts', import.meta.url);
const publicPath = new URL('../public/', import.meta.url);
const source = fs.readFileSync(articlesPath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, { module, exports: module.exports }, { timeout: 30_000 });

const monthNumbers = {
  janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11,
};
const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

function parseDate(value) {
  const [day, month, year] = value.split(' ');
  return new Date(Date.UTC(Number(year), monthNumbers[month?.toLowerCase()] ?? 0, Number(day), 12));
}

const articles = [...module.exports.articles].sort((a, b) => parseDate(b.date) - parseDate(a.date));
const summaries = module.exports.articles.map(({ content: _content, ...summary }) => summary);
const summariesSource = `import type { ArticleSummary } from './articles';\n\nexport const articleSummaries: ArticleSummary[] = ${JSON.stringify(summaries, null, 2)};\n`;
fs.writeFileSync(summariesPath, summariesSource);
const staticPages = ['/', '/rubrique/ia', '/rubrique/tech', '/rubrique/dev', '/rubrique/politique'];
const urls = [
  ...staticPages.map((path) => `  <url><loc>${origin}${path}</loc></url>`),
  ...articles.map((article) => `  <url><loc>${origin}/article/${encodeURIComponent(article.id)}</loc></url>`),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

const items = articles.slice(0, 50).map((article) => `  <item>
    <title>${escapeXml(article.title)}</title>
    <link>${origin}/article/${encodeURIComponent(article.id)}</link>
    <guid>${origin}/article/${encodeURIComponent(article.id)}</guid>
    <pubDate>${parseDate(article.date).toUTCString()}</pubDate>
    <description>${escapeXml(article.excerpt)}</description>
  </item>`);
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>DIONYSIA — Chroniques à l’ère du numérique</title>
  <link>${origin}</link>
  <description>Analyses sur l’intelligence artificielle, la technologie, le développement et la politique numérique.</description>
  <language>fr</language>
${items.join('\n')}
</channel>
</rss>
`;

fs.writeFileSync(new URL('sitemap.xml', publicPath), sitemap);
fs.writeFileSync(new URL('rss.xml', publicPath), rss);
console.log(`Index, sitemap (${articles.length} articles) et flux RSS (${items.length} articles) générés.`);
