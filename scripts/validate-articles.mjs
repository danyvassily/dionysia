import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
const imageSources = new Set();
const publicPath = fileURLToPath(new URL('../public/', import.meta.url));

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

  if (article.image) {
    const image = article.image;
    const extension = path.extname(image.src).toLowerCase();
    if (imageSources.has(image.src)) errors.push(`Image déjà utilisée par un autre article : ${label}`);
    imageSources.add(image.src);
    if (!image.src.startsWith(`/images/articles/${article.id}-`)) errors.push(`Le fichier image doit commencer par /images/articles/${article.id}- : ${label}`);
    if (!['.svg', '.webp', '.png', '.jpg', '.jpeg'].includes(extension)) errors.push(`Format image non autorisé : ${label}`);
    if (!image.alt || image.alt.trim().length < 15) errors.push(`Texte alternatif insuffisant : ${label}`);
    if (!image.credit?.trim()) errors.push(`Crédit image absent : ${label}`);
    if (!/^https:\/\//.test(image.sourceUrl ?? '')) errors.push(`Lien vers la source originale absent : ${label}`);
    if (!image.license?.trim()) errors.push(`Licence ou autorisation absente : ${label}`);
    if (!['logo', 'flag', 'photo', 'illustration'].includes(image.kind)) errors.push(`Type d’image invalide : ${label}`);
    if (extension !== '.svg' && ((image.width ?? 0) < 1200 || (image.height ?? 0) < 630)) {
      errors.push(`Image raster trop petite ou dimensions absentes (minimum 1200 × 630) : ${label}`);
    }
    const localPath = path.resolve(publicPath, `.${image.src}`);
    if (!localPath.startsWith(publicPath) || !fs.existsSync(localPath)) errors.push(`Fichier image local introuvable : ${label}`);
  }
}

const imageDirectory = path.join(publicPath, 'images', 'articles');
if (fs.existsSync(imageDirectory)) {
  const hashes = new Map();
  const stack = [imageDirectory];
  while (stack.length) {
    const directory = stack.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) stack.push(entryPath);
      else {
        const hash = crypto.createHash('sha256').update(fs.readFileSync(entryPath)).digest('hex');
        const previous = hashes.get(hash);
        if (previous) errors.push(`Fichiers image identiques : ${path.relative(publicPath, previous)} et ${path.relative(publicPath, entryPath)}`);
        else hashes.set(hash, entryPath);
      }
    }
  }
}

if (warnings.length) console.warn(`${warnings.length} avertissements éditoriaux historiques.`);
if (errors.length) {
  console.error(errors.slice(0, 30).join('\n'));
  if (errors.length > 30) console.error(`… et ${errors.length - 30} autres erreurs.`);
  process.exit(1);
}

console.log(`${articles.length} articles validés : identifiants et titres uniques.`);
