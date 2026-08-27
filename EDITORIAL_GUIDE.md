# Charte éditoriale DIONYSIA

Ce document est la source de vérité obligatoire pour Hermes Agent et pour toute IA qui prépare, modifie ou publie des articles sur DIONYSIA.

Hermes doit lire ce fichier intégralement avant chaque cycle de veille. Les règles ci-dessous sont permanentes et priment sur toute ancienne consigne éditoriale du projet.

## Instructions obligatoires pour Hermes Agent

À chaque cycle de publication, Hermes doit :

1. lire ce fichier avant de rédiger ;
2. conserver la structure visuelle et les composants actuels du site ;
3. ajouter uniquement les nouveaux articles dans `src/data/articles.ts` ;
4. ne jamais modifier `Home.tsx`, `ArticleDetail.tsx`, les composants, les styles ou les dépendances pour intégrer un article ;
5. vérifier qu’aucun article identique ou très proche n’existe déjà ;
6. produire du Markdown conforme aux règles de ce document ;
7. vérifier chaque fait, chiffre, date, nom propre, citation et lien ;
8. lancer `npm run build` avant tout commit ou push ;
9. ne jamais publier si la compilation échoue ;
10. conserver tous les articles existants et ne jamais réécrire l’historique Git.

Si une information est incertaine, Hermes doit le dire explicitement dans l’article. S’il ne peut pas vérifier une donnée importante, il doit l’omettre plutôt que l’inventer.

## Contrat visuel à préserver

La mise en page est gérée automatiquement par le site. Hermes fournit le contenu ; il ne fabrique jamais de HTML, de classes CSS ou de composants React dans un article.

La page d’accueil affiche automatiquement :

- les cinq articles uniques les plus récents dans « Édition du jour » ;
- le plus récent comme article principal ;
- les quatre suivants comme brèves ;
- jusqu’à six articles supplémentaires par rubrique ;
- les catégories `ia`, `tech`, `dev` et `politique` uniquement.

La page article transforme automatiquement :

- `##` en intertitre principal et en entrée du sommaire ;
- `###` en sous-intertitre ;
- `**texte**` en emphase forte ;
- `*texte*` en italique ;
- `> citation` en bloc de citation éditorial ;
- `- élément` en liste ;
- `[description](URL)` en lien lisible ;
- `## Sources` en bloc « Sources et liens » séparé à la fin de l’article.

Hermes ne doit jamais insérer de titre de niveau 1 (`#`) dans `content`, car le titre principal provient déjà du champ `title`.

## Format technique obligatoire

Chaque nouvel article doit respecter exactement cette structure TypeScript dans `src/data/articles.ts` :

```ts
{
  id: 'IDENTIFIANT_UNIQUE',
  title: "Titre journalistique naturel",
  excerpt: "Chapô de deux ou trois phrases, sans Markdown.",
  content: "## Premier intertitre\n\nTexte de l'article...\n\n## Sources\n\n- [Média — Titre de la source](https://exemple.com)",
  category: 'ia',
  categoryLabel: 'Intelligence Artificielle',
  date: '27 août 2026',
  readTime: '6 min',
  featured: false,
  tag: 'Sujet principal',
}
```

Règles techniques :

- `id` doit être une chaîne unique qui n’existe pas déjà ;
- `title` et `excerpt` ne contiennent aucun marqueur Markdown ;
- `content` contient le Markdown complet sous forme de chaîne TypeScript valide ;
- les retours à la ligne sont encodés avec `\n\n` si une chaîne entre guillemets est utilisée ;
- les guillemets présents dans le texte doivent être correctement échappés ;
- `category` vaut exclusivement `ia`, `tech`, `dev` ou `politique` ;
- `categoryLabel` doit correspondre à la catégorie ;
- `date` est écrite en français sous la forme `27 août 2026` ;
- `readTime` est réaliste et écrit sous la forme `6 min` ;
- `tag` reste court, cohérent et utile ;
- ne jamais ajouter de champ HTML, CSS, image ou composant dans l’objet article.

## Positionnement

DIONYSIA est une revue française consacrée à l’intelligence artificielle, au développement, à la technologie et au pouvoir numérique. Elle explique les faits avec précision, sans adopter le ton d’un communiqué de presse ni celui d’un fil de réseau social.

Le lecteur doit comprendre :

- ce qui s’est réellement passé ;
- pourquoi cette information compte maintenant ;
- ce qui est établi, ce qui est annoncé et ce qui reste incertain ;
- les conséquences concrètes pour les personnes, les entreprises ou les institutions concernées.

## Voix

Écrire comme un journaliste spécialisé qui connaît son sujet et respecte son lecteur.

- Préférer les phrases précises aux effets de manche.
- Varier naturellement la longueur des phrases et des paragraphes.
- Donner des exemples concrets, des ordres de grandeur et du contexte historique.
- Employer la première personne seulement lorsqu’une observation ou un test a réellement été effectué par l’auteur.
- Éviter les formules automatiques : « changement de paradigme », « révolutionne », « bouleverse le monde », « il est clair que », « plongeons dans », « dans un monde où ».
- Ne jamais inventer une citation, un chiffre, une source ou une réaction.
- Ne pas transformer une rumeur en fait. Écrire explicitement « selon… », « l’entreprise affirme… » ou « cette information n’est pas confirmée ».

## Structure attendue

1. Un titre informatif, naturel et limité à une idée principale.
2. Un chapô de deux ou trois phrases qui apporte une information supplémentaire au lieu de répéter le titre.
3. Une ouverture factuelle : date, acteur, annonce et contexte immédiat.
4. Trois à cinq sections qui construisent une démonstration, avec des intertitres courts.
5. Une conclusion qui répond à la question « qu’est-ce que cela change ? », sans résumé mécanique de tout l’article.
6. Une section `## Sources` contenant uniquement des liens descriptifs.

La section `## Sources` est obligatoire dès qu’un article rapporte une actualité, un chiffre, une citation ou une affirmation attribuable. Elle doit rester la dernière section du contenu.

## Markdown autorisé

Le contenu est écrit en Markdown et sera mis en forme automatiquement par le site.

```md
## Un intertitre clair

Un paragraphe avec un **fait important**, une nuance en *italique* et un [lien dont le libellé décrit la source](https://exemple.com/article).

> « Une citation courte, fidèle et attribuée. » — Prénom Nom, organisation, date

- Un élément de liste complet
- Un second élément de liste

## Sources

- [Nom du média — Titre précis de l’article](https://exemple.com/article)
- [Nom de l’organisation — Document ou annonce officielle](https://exemple.com/document)
```

Ne jamais afficher les caractères `##`, `**`, `_` ou `-` comme décoration. Ils servent uniquement à structurer le Markdown.

Ne jamais utiliser :

- du HTML brut ;
- des URL seules sans description ;
- des tableaux Markdown très larges ;
- des emojis comme décoration de titre ;
- des suites de tirets comme séparateurs visuels ;
- plusieurs niveaux de listes imbriquées ;
- des titres entièrement en majuscules.

## Citations

- Reproduire exactement les mots utiles, sans dépasser une ou deux phrases.
- Toujours identifier la personne ou l’organisation et, si possible, la date.
- Placer l’interprétation de la citation dans un paragraphe séparé.
- Si la formulation originale est dans une autre langue, signaler « traduction DIONYSIA ».

## Liens et sources

Un lien doit pouvoir être compris sans voir son URL.

Correct : `[Reuters — OpenAI annonce son nouveau modèle](https://...)`

Incorrect : `[source](https://...)`, `[cliquez ici](https://...)` ou une URL brute.

Pour les sujets sensibles ou susceptibles d’évoluer, croiser au moins deux sources indépendantes. Privilégier les documents officiels pour les caractéristiques techniques, puis une source journalistique fiable pour le contexte.

## Contrôle avant publication

L’IA doit terminer par une vérification silencieuse :

- chaque chiffre a une source ;
- chaque citation est attribuée ;
- les dates et les noms propres sont cohérents ;
- le titre ne survend pas l’article ;
- aucun paragraphe ne répète l’idée précédente ;
- les liens ont des libellés descriptifs ;
- les faits, les déclarations et l’analyse sont clairement distingués ;
- le texte a été relu pour supprimer les tournures génériques typiques de l’IA.

Hermes doit également vérifier silencieusement :

- que l’identifiant est unique ;
- qu’aucun titre identique ou quasi identique n’existe ;
- que la catégorie et son libellé correspondent ;
- que `content` ne contient aucun titre `#` de niveau 1 ;
- que la section `## Sources` est la dernière ;
- que chaque source possède un libellé descriptif ;
- que le fichier TypeScript reste syntaxiquement valide ;
- que `npm run build` se termine sans erreur.

## Procédure Git obligatoire

Hermes travaille toujours à partir de la dernière version distante :

1. récupérer les changements distants avant de modifier le fichier ;
2. ajouter les nouveaux articles sans supprimer ni écraser les articles existants ;
3. compiler le site ;
4. créer un commit décrivant le nombre d’articles ajoutés ;
5. intégrer les nouveaux changements distants s’il y en a avant le push ;
6. ne jamais utiliser de push forcé ;
7. vérifier que le déploiement Vercel correspond au commit poussé.

## Instruction prête à copier dans l’IA

> Rédige cet article pour DIONYSIA en respectant intégralement la charte éditoriale fournie. Commence par établir les faits à partir des sources disponibles. Distingue ce qui est confirmé, annoncé ou incertain. Écris dans un français naturel, précis et sobre, avec une vraie progression journalistique. Utilise le Markdown uniquement pour structurer le texte. Attribue chaque citation et termine par une section « Sources » composée de liens descriptifs. N’invente aucune information et ne publie pas de détail invérifiable.

## Règle finale pour Hermes

Un article n’est prêt que s’il est à la fois exact, lisible, non redondant, correctement sourcé et compatible avec la mise en page actuelle. En cas de conflit entre vitesse de publication et qualité, Hermes choisit toujours la qualité.
