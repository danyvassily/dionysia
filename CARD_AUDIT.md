# AUDIT CARTES ARTICLES — FeaturedArticle / ArticleCard / CategorySection
> Critique studio-grade | Benchmarks : Linear Blog, Medium, Substack, The Verge, Le Monde

**Date :** 2026-08-11  
**Fichiers audités :** `FeaturedArticle.tsx` · `ArticleCard.tsx` · `CategorySection.tsx` · `AnimatedTitle.tsx` · `AnimatedArticleTitle.tsx` · `Home.tsx` · `index.css`

---

## TL;DR — Verdict

**Note globale : 6.2 / 10 — intention éditoriale forte, exécution mid-tier.**

La direction « revue de presse » (Cormorant + Inter, règle double, papier) est cohérente. Mais l'implémentation trahit trois péchés capitaux : **hiérarchie écrasée** (featured pas assez `featured`), **hover cassé** (flèche `opacity:0` invisible au clavier et sur mobile), et **animation lettre-par-lettre sur du contenu** (anti-pattern Medium/Linear — on n'anime jamais des `ArticleCard` comme un hero). Le résultat lit « blog WordPress premium », pas « Linear / The Verge ».

---

## Benchmark rapide — ce que font les refs

| Site | Ce qu'il fait bien | Ce que Dionysia rate |
|------|--------------------|----------------------|
| **Linear Blog** | Card entière cliquable, `group-hover` translate subtile, `border-top` qui s'accentue au hover, meta `12px / ink-faint`, stagger 30ms seulement, pas d'animation lettre | Card non cliquable (seul le titre), flèche `opacity-0` → inaccessible, stagger 70ms trop lent |
| **Medium** | Excerpt clamp 2 lignes, pas de numéro géant, hiérarchie par taille de typo (featured 32px vs card 20px), whole-card `<a>` | Excerpt full-length (jusqu'à 4 lignes), featured titre seulement `lg:text-xl` (20px) — trop petit |
| **Substack** | Overline = section, pas répétée dans chaque card quand on est déjà dans la section | `ArticleCard` répète « Intelligence Artificielle » alors qu'on est déjà dans `<CategorySection title="Intelligence Artificielle">` |
| **The Verge** | Featured = visuel dominant + titre 40px + excerpt ultra-court (1 ligne), accent `3px solid` top rule | Featured = texte mur, 6 articles empilés sans respiration, règle double perdue sur mobile |
| **Le Monde** | `text-wrap: balance` OK, mais `hyphens:auto` + `word-break: break-word` cassent les titres (Le Monde ne casse jamais un mot) ; pas de `opacity-0` CTA | Les deux présents dans `index.css` et dans le `ArrowUpRight` hover |

---

## 10 DÉFAUTS MAJEURS (rankés par sévérité)

### D1 — Hover state mort : `opacity-0 group-hover:opacity-100` sur la flèche
**Fichiers :** `FeaturedArticle.tsx:62` + `ArticleCard.tsx:62`
```tsx
className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"
```
**Pourquoi c'est grave :**
- Sur mobile / tablette : pas de `hover` → flèche **jamais visible**. 58% du trafic.
- Au clavier : `group-hover` ne s'active pas sur `focus-visible` → WCAG 2.4.7 fail.
- Au lecteur d'écran : `<Link>` avec une seule icône sans `aria-label` → annoncé « link » vide.
- Linear : `opacity-60 → opacity-100 + translate-x-0.5`, toujours visible. The Verge : flèche toujours là, elle *glisse* juste.

### D2 — Card non cliquable, seul le titre est un `<Link>`
**Fichiers :** tous deux. `<article>` n'est pas cliquable, `<Link>` wrap seulement le titre + flèche séparée.
- Medium/Linear/Substack : `<a>` wrap toute la card (ou `::after` absolute). Ici l'utilisateur clique sur l'excerpt → rien. Taux de miss-click énorme. De plus, deux `<Link to=/article/id>` dans le même `<article>` (titre + flèche) = deux hitbox concurrentes.

### D3 — FeaturedArticle n'est pas « featured »
**Fichier :** `FeaturedArticle.tsx:37`
```tsx
className="... text-base sm:text-lg lg:text-xl xl:text-2xl font-bold ..."
```
- `xl:text-2xl` = 24px. Un featured Linear fait 32–40px, Le Monde Une fait 36–44px. Ici le featured est *plus petit* que le `h2` de section ( `text-3xl` = 30px). Hiérarchie inversée.
- Excerpt `text-sm sm:text-base lg:text-lg` full length sans `line-clamp` → featured #13 a un chapeau de 47 mots qui pousse 6 cards sur 3 viewports. Densité catastrophique quand `Home.tsx` empile `FEATURED_COUNT=6` sans séparateur entre eux (juste `space-y-12`).

### D4 — Numéro géant `01` inutile et buggé
**Fichier :** `FeaturedArticle.tsx:26-28`
```tsx
<div className="font-editorial text-6xl lg:text-7xl font-bold text-[var(--rule)] ...">
  {String(article.id).padStart(2, '0')}
</div>
```
- Utilise `article.id` (ex: `"37"` → affiche `37`), pas le rang. Avec `sortedArticles.slice(0,6)` trié par date, l'article #37 (28 juillet) affiche `37`, l'article #1 (26 juillet) affiche `01` mais en 4e position → numérotation incohérente.
- Couleur `var(--rule)` (`#d4d0c8` light / `#2a2a2e` dark) : contraste 1.4:1, quasi invisible en dark. Taille `6xl/7xl` sans `tabular-nums` → chiffres dansants.
- Benchmark : personne ne fait ça. Linear = overline discret (`001`), Le Monde = rien. Le numéro ne porte aucune info utilisateur.

### D5 — Animation lettre-par-lettre sur du contenu = faute pro
**Fichiers :** `AnimatedTitle.tsx` (featured) + `AnimatedArticleTitle.tsx` (cards)
- `text.split('').map(...)` crée 40–80 `<span class="letter">` par titre. Pour 6 featured + 9 cards = ~700 spans, chacun avec `gsap.set` + listeners. Sur mobile low-end : jank, CLS, broken copy-paste (sélection par lettre), SEO fragmenté, `charAt` casse les emojis (graphemes).
- Le hover « vague » (`gsap.matchMedia` + `mouseenter` par lettre) ajoute ~60 listeners par titre, jamais cleanés individuellement (`mm.revert()` ne retire pas les `addEventListener`).
- `isLastTwo ? '1.55em' : 'inherit'` grossit les 2 dernières lettres — hack non documenté qui explose avec `hyphens:auto` + `word-break: break-word`.
- Linear/Medium : **jamais** d'animation sur les cards. Seul le Hero mérite ce traitement. Les cards = `fade-in-up` + légère translation, c'est tout.

### D6 — CategorySection fantôme quand vide
**Fichier :** `CategorySection.tsx:13`
```tsx
if (articles.length === 0) return null;
```
- Avec `Home.tsx:42-50` : `restArticles = sortedArticles.slice(6)` puis `filter` par cat. Si `restArticles` n'a par ex. 0 article `politique`, la section disparaît silencieusement → la nav `Hero` pointe vers `#politique` qui n'existe plus, scroll mort. Le Monde / Linear affichent `empty state` (« Aucun article — bientôt ») pour garder l'ancrage et le layout stable.

### D7 — Grille & responsive bancals
- `FeaturedArticle` : `grid lg:grid-cols-12 gap-6 lg:gap-10` — sur mobile, 2 blocs empilés, la règle double (`borderTop: 3px double`) n'existe que sur le bloc gauche (4 cols) → visuellement amputée. Sur tablet `md` (768–1023) la grille n'a **aucun** breakpoint : revient en 1 col avec numéro géant qui bouffe 40% du viewport avant même le titre.
- `CategorySection` : `grid sm:grid-cols-2 lg:grid-cols-3` — à 2 cols, le dernier item est orphelin (ex: 5 articles → ligne de 1 card à 50% width, vide à droite). Pas de `auto-fill` ni d'équilibrage. Linear passe 1→2→3 avec `gap-x-8 gap-y-10` mais ajoute `border` entre items pour absorber l'orphelin.
- `Home.tsx` featured : `space-y-12` sans `divide-y` ni `rule` entre featured → 6 articles longs se touchent sans respiration. Le Monde met une `rule-thin` entre chaque Une.

### D8 — Stagger & motion incohérents
- `ArticleCard` : `style={{ animationDelay: \`${index * 0.07}s\` }}` + `AnimatedArticleTitle delay={index*0.1}` = deux timelines désynchronisées (CSS `fade-in-up` 0.6s + GSAP stagger 0.018s/lettre). Résultat : la card fade avant que son titre n'ait fini de stagger → effet « pop ».
- Toutes les cards animées `on mount` (`animate-fade-in-up` sans `ScrollTrigger`) alors qu'elles sont `below-fold` → animées hors-écran pour rien, puis rejouées ? GSAP `AnimatedArticleTitle` lui utilise `ScrollTrigger start: 'top 88%'` → double système, double coût.
- `DURATION 0.6s + stagger 0.03` × 60 lettres = 2.4s d'animation totale pour un titre — The Verge/ Linear : 180ms max.

### D9 — Accessibilité & sémantique
- Pas de `aria-label` sur les flèches. Pas de `:focus-visible` ring.
- `<span className="overline">` utilisé comme heading visuel mais pas `aria` — devrait être `<p>` ou `<span>` OK, mais la vraie hiérarchie `<h2>` section → `<h3>` card est correcte côté `AnimatedArticleTitle as="h3"`, en revanche `FeaturedArticle` utilise `AnimatedTitle` qui rend un `<div>` (pas de heading !) → featured n'a pas de `<h2>/<h3>` → outline documentale cassée.
- `word-break: break-word` (déprécié) + `hyphens: auto` dans `index.css` coupe les titres Cormorant au milieu des mots — Le Monde utilise `overflow-wrap: break-word` sans `word-break`.

### D10 — Densité typographique / `text-wrap` & `line-clamp` manquants
- `p { text-wrap: pretty }` global → force le moteur à recalculer chaque paragraphe (perf) et ne s'applique pas aux excerpts clampés. Les excerpts actuels : `leading-relaxed` mais pas de `line-clamp-2/3` → chapeaux de 30–50 mots qui cassent la grille. Medium clamp 2, Le Monde clamp 3, Linear clamp 2.
- `break-words` + `break-word` sur les titres → un titre long comme `Anthropic à 965 milliards...` peut couper `milliards` en `millia- rds` avec `hyphens:auto`. Sur Cormorant 24px, c'est illisible.
- Overlines dupliqués : `FeaturedArticle` overline `text-sm` + `ArticleCard` overline `text-xs` — deux échelles, deux couleurs (`accent-editorial` vs `ink-faint`) → incohérence.

---

## 10 CORRECTIONS STUDIO-GRADE (avec code)

### C1 — Flèche toujours visible, qui glisse au hover/focus
**Principe Linear :** visible à `opacity-60` au repos, `opacity-100 + translate` au hover, et `focus-visible` ring.

```tsx
// FeaturedArticle.tsx + ArticleCard.tsx — remplacer le bloc flèche
<Link
  to={`/article/${article.id}`}
  aria-label={`Lire : ${article.title}`}
  className="ml-auto inline-flex items-center justify-center w-7 h-7 rounded-full
             border border-[var(--rule)] text-[var(--ink-faint)]
             opacity-60 group-hover:opacity-100 group-hover:border-[var(--ink-faint)]
             group-hover:translate-x-0.5 group-focus-within:opacity-100
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-editorial)] focus-visible:ring-offset-2
             transition-all duration-200"
>
  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" />
</Link>
```
> Mobile : visible. Clavier : ring. Pas de `opacity-0`.

### C2 — Card entière cliquable (pattern `::after` ou wrap)
**Recommandé :** wrapper `<Link>` + `group` sur l'article, découper meta pour éviter liens imbriqués.

```tsx
// ArticleCard.tsx — structure corrigée
<article className="group relative flex flex-col animate-fade-in-up ...">
  {/* hitbox plein carte */}
  <Link
    to={`/article/${article.id}`}
    aria-label={article.title}
    className="absolute inset-0 z-0 rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-editorial)] focus-visible:ring-inset"
  />
  <div className="pointer-events-none w-full mb-4" style={{ borderTop: '1px solid var(--rule)' }} />
  {/* contenu au-dessus */}
  <div className="relative z-[1] flex flex-col flex-1">
    <span className="overline text-[var(--ink-faint)] mb-2 text-xs tracking-widest">
      {categoryOverlines[article.category]}
    </span>
    <h3 className="font-editorial text-[17px] lg:text-[19px] font-bold leading-[1.25] text-[var(--ink)] group-hover:text-[var(--accent-editorial)] transition-colors">
      {article.title}
    </h3>
    <p className="font-sans text-sm text-[var(--ink-muted)] leading-relaxed mt-2 mb-4 line-clamp-2">
      {article.excerpt}
    </p>
    {/* meta : pointer-events-auto pour que tag reste cliquable si besoin */}
  </div>
  {/* flèche décorative, pas un second Link */}
  <span aria-hidden className="relative z-[1] ml-auto inline-flex ..."> {/* même style que C1 sans Link */} </span>
</article>
```
Alternative simple : garder 1 seul `<Link>` autour de titre+excerpt et ajouter `after:absolute after:inset-0` via CSS.

### C3 — Featured = vraie hiérarchie (titre 30–36px, excerpt clamp 3, meta compacte)
```tsx
// FeaturedArticle.tsx — titre + excerpt
<Link to={`/article/${article.id}`} className="block mb-3 no-underline focus-visible:outline-none">
  <h2 className="font-editorial font-bold leading-[1.08] tracking-[-0.02em] text-[var(--ink)]
                 text-2xl sm:text-3xl lg:text-[32px] xl:text-[36px]
                 group-hover:text-[var(--accent-editorial)] transition-colors text-balance">
    {article.title}
  </h2>
</Link>
<p className="font-sans text-[15px] lg:text-[17px] text-[var(--ink-muted)] leading-relaxed line-clamp-3 max-w-[65ch]">
  {article.excerpt}
</p>
```
Et **limiter `FEATURED_COUNT` à 1–3 max** (style Medium/Verge). À 6, ce n'est plus une Une, c'est une liste.

```ts
// Home.tsx
const FEATURED_COUNT = 1; // ou 3 si vraiment
// + séparateur entre featured
<div className="space-y-0 divide-y divide-[var(--rule-light)]">
  {featuredArticles.map((a,i) => (
    <div key={a.id} className={i===0 ? "pb-10" : "py-10"}>
      <FeaturedArticle article={a} rank={i+1} />
    </div>
  ))}
</div>
```

### C4 — Numéro : soit rank discret, soit on supprime
**Option A (recommandée : supprimer)** — Linear/Verge/Le Monde n'ont pas de numéro géant.
**Option B (si conservé : rank + discret)**

```tsx
// FeaturedArticle.tsx — props: rank?: number
interface FeaturedArticleProps { article: Article; rank?: number }

{rank != null && (
  <span className="font-sans text-xs font-medium tracking-[0.14em] tabular-nums text-[var(--ink-faint)]">
    {String(rank).padStart(2,'0')} — {categoryOverlines[article.category]}
  </span>
)}
// Supprimer le div 6xl/7xl
```
> Ne jamais utiliser `article.id` comme numéro d'affichage. Utiliser l'index de tri.

### C5 — Retirer `AnimatedTitle` des cards, le réserver au Hero
```tsx
// ArticleCard.tsx — remplacer AnimatedArticleTitle par h3 pur
<h3 className="font-editorial text-[17px] lg:text-[19px] font-bold leading-[1.25] text-[var(--ink)] line-clamp-3 text-balance
               group-hover:text-[var(--accent-editorial)] transition-colors duration-200">
  {article.title}
</h3>

// FeaturedArticle.tsx — idem, h2 pur (pas de GSAP lettre)
// Garder GSAP uniquement dans Hero.tsx pour "DIONYSIA"
```
Bonus : supprimer `text.split('').map` → DOM /2, copy-paste OK, SEO propre, perf +40%. Si un effet d'entrée est voulu : `ScrollTrigger` sur le `<h3>` entier (`y: 12, opacity: 0 → 1, duration 0.45, ease power2.out`) — 1 tween par card, pas 60.

### C6 — Empty state au lieu de `return null`
```tsx
// CategorySection.tsx
export default function CategorySection({ id, title, subtitle, articles }: CategorySectionProps) {
  const isEmpty = articles.length === 0;
  return (
    <section id={id} className="py-14 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10 pb-4" style={{ borderBottom: '1px solid var(--rule)' }}>
          <div>
            <h2 className="font-editorial text-3xl lg:text-4xl font-semibold text-[var(--ink)]">{title}</h2>
            <p className="font-sans text-sm text-[var(--ink-muted)] mt-1">{subtitle}</p>
          </div>
          <Link to={`/c/${id}`} className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ink-faint)] hover:text-[var(--accent-editorial)] transition-colors group">
            Tout voir <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {isEmpty ? (
          <div className="rounded-[4px] border border-dashed border-[var(--rule)] bg-[var(--paper-dark)]/50 px-6 py-12 text-center">
            <p className="font-sans text-sm text-[var(--ink-muted)]">Aucun article dans cette rubrique pour le moment.</p>
            <p className="font-sans text-xs text-[var(--ink-faint)] mt-1">Les prochains papiers arrivent bientôt — restez dans les parages.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```
> Garde l'ancre `#ia` vivante, évite le layout shift, et corrige le `href="#id"` réflexif (qui ne navigue nulle part) en vrai lien `/c/[id]`.

### C7 — Grille responsive corrigée (orphan fix + règle mobile)
```tsx
// CategorySection — orphan fix : 3e col orpheline prend 2 cols sur sm quand impair
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10
                [&>*:last-child:nth-child(3n-2)]:lg:col-span-3
                [&>*:last-child:nth-child(3n-2)]:lg:max-w-[calc(33.333%-1.35rem)]">
  {/* ... */}
</div>

// FeaturedArticle — règle full-width sur mobile, 12 cols seulement en lg
<article className="group grid gap-6 lg:grid-cols-12 lg:gap-10 items-start">
  {/* règle toujours full-width */}
  <div className="col-span-full h-px mb-2 lg:hidden" style={{ background: 'var(--rule)' }} />
  <div className="hidden lg:block lg:col-span-12 h-px mb-2" style={{ background: 'var(--rule)', height: '3px', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }} />
  {/* contenu */}
</article>
```
Tablette `md` : ajouter `md:grid-cols-12` ou au moins `md:gap-8` pour éviter le 1-col brutal.

### C8 — Motion unifiée : 1 système, 1 stagger, respect `prefers-reduced-motion`
```css
/* index.css */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up, .animate-fade-in { animation: none !important; }
  .letter, .art-letter { opacity: 1 !important; transform: none !important; }
}
```
```tsx
// ArticleCard.tsx — stagger group via parent, pas par card
// Dans CategorySection, wrapper avec --stagger index
<ArticleCard key={article.id} article={article} index={i} />

// ArticleCard.tsx — single fade, pas de GSAP lettre
<article
  className="group flex flex-col opacity-0 translate-y-3 data-[inview=true]:opacity-100 data-[inview=true]:translate-y-0 transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
  data-inview={isInView} // via useInView (IntersectionObserver) ou framer/motion
  style={{ transitionDelay: `${Math.min(i * 40, 160)}ms` }}
>
```
> 40ms stagger (Linear) < 70ms actuel, cap à 160ms pour ne pas faire attendre la 6e card. Plus de double timeline CSS+GSAP.

### C9 — Sémantique & a11y
```tsx
// FeaturedArticle : h2 sémantique (était div via AnimatedTitle)
<h2 className="font-editorial ...">{article.title}</h2>

// Clock : décoratif
<Clock aria-hidden className="w-3 h-3" />
<span className="sr-only">Temps de lecture : </span>

// Corriger index.css : retirer word-break déprécié
h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word; /* garder */
  /* word-break: break-word;  ← supprimer (non-standard) */
  hyphens: auto; /* garder mais seulement si lang="fr" posé sur <html> */
}
```

### C10 — Densité : line-clamp + overline dédupliquée
```tsx
// ArticleCard : clamp + overline conditionnelle
{/* Ne pas répéter l'overline quand on est déjà dans sa section */}
{/* CategorySection passe showOverline={false} quand groupé */}
{showOverline && (
  <span className="overline text-[var(--ink-faint)] mb-2 text-[11px] tracking-[0.14em]">
    {categoryOverlines[article.category]}
  </span>
)}
<p className="font-sans text-sm text-[var(--ink-muted)] leading-relaxed line-clamp-2">
  {article.excerpt}
</p>

// Featured : line-clamp-3 + chapeau max 65ch
// index.css : plugin line-clamp déjà dispo via tailwindcss-animate ? sinon ajouter @tailwindcss/line-clamp
```

---

## Fichiers à patcher (ordre prioritaire)

1. `FeaturedArticle.tsx` — C1, C2, C3, C4, C5, C9
2. `ArticleCard.tsx` — C1, C2, C5, C8, C9, C10
3. `CategorySection.tsx` — C6, C7
4. `Home.tsx` — C3 (FEATURED_COUNT + divide-y)
5. `AnimatedArticleTitle.tsx` / `AnimatedTitle.tsx` — C5 (décommissionner sur cards) ou au minimum fixer `split('')` → `Array.from(text)` + cleanup listeners
6. `index.css` — C8 (`prefers-reduced-motion`) + C9 (`word-break` fix) + `line-clamp` utilities

---

## Checklist studio avant merge

- [ ] Toute card cliquable au clavier (`Tab` → ring visible) et au tap mobile
- [ ] Flèche visible sans hover, testée en `prefers-reduced-motion`
- [ ] Featured titre ≥ 30px, excerpt clamp 3, meta 12px
- [ ] Pas de `opacity-0` sans `focus-visible` fallback
- [ ] `CategorySection` vide → empty state, pas `null`
- [ ] `text.split('')` remplacé ou supprimé des cards
- [ ] Lighthouse a11y ≥ 95, pas de `word-break: break-word`

