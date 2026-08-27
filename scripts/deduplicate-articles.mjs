import fs from 'node:fs';
import ts from 'typescript';

const articlesPath = new URL('../src/data/articles.ts', import.meta.url);
const source = fs.readFileSync(articlesPath, 'utf8');
const sourceFile = ts.createSourceFile(
  articlesPath.pathname,
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);

let articlesArray;

function visit(node) {
  if (
    ts.isVariableDeclaration(node)
    && ts.isIdentifier(node.name)
    && node.name.text === 'articles'
    && node.initializer
    && ts.isArrayLiteralExpression(node.initializer)
  ) {
    articlesArray = node.initializer;
  }
  ts.forEachChild(node, visit);
}

visit(sourceFile);

if (!articlesArray) {
  throw new Error('Impossible de trouver le tableau articles.');
}

function readProperty(object, propertyName) {
  if (!ts.isObjectLiteralExpression(object)) return undefined;
  const property = object.properties.find((candidate) => (
    ts.isPropertyAssignment(candidate)
    && candidate.name.getText(sourceFile).replace(/["']/g, '') === propertyName
  ));
  if (!property || !ts.isPropertyAssignment(property)) return undefined;
  const value = property.initializer;
  if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) return value.text;
  return undefined;
}

function normalizeTitle(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const records = articlesArray.elements.map((element, index) => ({
  element,
  index,
  id: readProperty(element, 'id'),
  title: readProperty(element, 'title'),
}));

const latestByTitle = new Map();
for (const record of records) {
  if (record.title) latestByTitle.set(normalizeTitle(record.title), record.index);
}

const kept = records.filter((record) => (
  !record.title || latestByTitle.get(normalizeTitle(record.title)) === record.index
));
const removed = records.filter((record) => !kept.includes(record));

if (removed.length === 0) {
  console.log(`Aucun doublon de titre parmi ${records.length} articles.`);
  process.exit(0);
}

console.log(`${removed.length} doublons détectés ; ${kept.length} articles uniques seront conservés.`);

if (!process.argv.includes('--write')) {
  console.error('Relancez avec --write pour conserver la version la plus récente de chaque titre.');
  process.exit(1);
}

const retainedSource = kept
  .map(({ element }) => source.slice(element.getStart(sourceFile), element.getEnd()))
  .join(',\n');
const nextArray = `[\n${retainedSource},\n]`;
const output = source.slice(0, articlesArray.getStart(sourceFile))
  + nextArray
  + source.slice(articlesArray.getEnd());

fs.writeFileSync(articlesPath, output);
console.log(`Suppression terminée : ${removed.length} doublons retirés.`);
