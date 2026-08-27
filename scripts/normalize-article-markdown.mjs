import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';

const articlesPath = new URL('../src/data/articles.ts', import.meta.url);
const source = fs.readFileSync(articlesPath, 'utf8');
const sourceFile = ts.createSourceFile(articlesPath.pathname, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
let articlesArray;

function visit(node) {
  if (
    ts.isVariableDeclaration(node)
    && ts.isIdentifier(node.name)
    && node.name.text === 'articles'
    && node.initializer
    && ts.isArrayLiteralExpression(node.initializer)
  ) articlesArray = node.initializer;
  ts.forEachChild(node, visit);
}
visit(sourceFile);
if (!articlesArray) throw new Error('Impossible de trouver le tableau articles.');

const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, { module, exports: module.exports }, { timeout: 30_000 });

let changed = 0;
const normalized = module.exports.articles.map((article) => {
  let content = article.content ?? '';
  const next = content
    .replace(/^---\n[\s\S]*?\n---\n+/, '')
    .replace(/^#\s+[^\n]+\n+/, '')
    .replace(/^>>\s+/gm, '> ')
    .replace(/^\*\*Sources?\s*:?\*\*\s*$/gim, '## Sources')
    .replace(/^Sources?\s*:\s*$/gim, '## Sources')
    .trim();
  if (next !== content) changed += 1;
  return { ...article, content: next };
});

const nextArray = JSON.stringify(normalized, null, 2);
const output = source.slice(0, articlesArray.getStart(sourceFile))
  + nextArray
  + source.slice(articlesArray.getEnd());
fs.writeFileSync(articlesPath, output);
console.log(`${changed} articles normalisés.`);
