import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';

const articlesPath = new URL('../src/data/articles.ts', import.meta.url);
const source = fs.readFileSync(articlesPath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, { module, exports: module.exports }, { timeout: 30_000 });

const { articles } = module.exports;
const errors = [];
const warnings = [];
const ids = new Set();
const titles = new Set();

function normalizeTitle(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

for (const article of articles) {
  const label = `${article.id ?? '?'} — ${article.title ?? 'sans titre'}`;
  if (!article.id || ids.has(article.id)) errors.push(`Identifiant absent ou répété : ${label}`);
  ids.add(article.id);

  const normalizedTitle = normalizeTitle(article.title ?? '');
  if (!normalizedTitle || titles.has(normalizedTitle)) errors.push(`Titre absent ou répété : ${label}`);
  titles.add(normalizedTitle);

  if (!['ia', 'tech', 'dev', 'politique'].includes(article.category)) errors.push(`Catégorie invalide : ${label}`);
  if (!/^#{2,3}\s+Sources?\s*$/im.test(article.content ?? '')) warnings.push(`Section Sources absente : ${label}`);
  if ((article.content?.match(/https?:\/\//g) ?? []).length < 2) warnings.push(`Moins de deux liens : ${label}`);
  if (/^#\s+/m.test(article.content ?? '')) errors.push(`Titre H1 interdit dans le contenu : ${label}`);
  if (/^>>\s+/m.test(article.content ?? '')) errors.push(`Citation mal formée (utiliser >) : ${label}`);
}

if (warnings.length) console.warn(`${warnings.length} avertissements éditoriaux historiques.`);
if (errors.length) {
  console.error(errors.slice(0, 30).join('\n'));
  if (errors.length > 30) console.error(`… et ${errors.length - 30} autres erreurs.`);
  process.exit(1);
}

console.log(`${articles.length} articles validés : identifiants et titres uniques.`);
