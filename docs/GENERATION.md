# Génération automatique des mondes

Objectif : produire les mondes de **n'importe quelle ouverture** sans tout rédiger à la main.
Prototype : `packages/core/scripts/generate-worlds.cjs` (`pnpm --filter @gambit/core worlds:generate "Partie italienne" w e4 e5 Nf3 Nc6 Bc4`).

## Entrées

- **L'ouverture choisie** : son camp et sa séquence de définition (Italienne : Blancs, `1.e4 e5 2.Cf3 Cc6 3.Fc4` ;
  Sicilienne : Noirs, `1.e4 c5`).
- **L'arbre de théorie** : les 3 865 variantes nommées de chess-openings (CC0). Chaque nœud compte le nombre de
  variantes qui passent par lui : c'est son **poids théorique** (une variante très étudiée a beaucoup de sous-variantes).
- **Stockfish** : évalue chaque coup (perte en centipions par rapport au meilleur coup).

## Algorithme

1. **Candidats adverses** :
   - *intérieur* : les réponses de l'adversaire **après** la séquence (ex. 3…Fc5, 3…Cf6, 3…Fe7) ;
   - *déviation* : les coups adverses **le long** de la séquence qui empêchent l'ouverture (ex. 1…c5, 1…e6, 2…Cf6, 2…d6).
     L'utilisateur doit alors jouer autre chose que son coup « réflexe ».
2. **Tri** : par part de la théorie au nœud (poids du coup / poids du nœud).
   - coup adverse qui perd ≤ 0,8 pion → ligne normale ;
   - coup adverse qui perd ≥ 0,9 pion, connu de la théorie (poids ≥ 2) → **coup à punir** (le plus proche de l'ouverture).
3. **Prolongement de chaque ligne** jusqu'à la profondeur du monde :
   - **coups de l'utilisateur** = le **meilleur coup** de la théorie selon Stockfish (perte ≤ 0,4 pion ; à 0,15 près, le plus étudié) ;
   - **coups de l'adversaire** = la **réponse principale** de la théorie (la plus étudiée parmi celles qui perdent ≤ 0,4 pion) ;
   - quand la théorie s'arrête : Stockfish complète (signalé pour relecture).
4. **Composition des mondes** (profondeur, largeur) = (3, 6), (3, 10), (5, 6), (5, 10), (7, 6)… :
   moitié lignes intérieures, moitié déviations, + 1 coup à punir.
5. **Contrôle qualité** : légalité, aucune perte > 0,4 pion sur un coup appris (Stockfish), transpositions fusionnées.

## Ce qui reste manuel (ou assisté)

- **Explications de Memo** : brouillon généré (IA) à partir du coup, des principes détectés automatiquement
  (centre, développement, roque, gain de temps, capture, échec) et de la page Wikibooks correspondante, puis relecture.
- **Relecture** des lignes complétées par Stockfish et du coup à punir.

## Résultat du prototype (extrait)

```
Partie italienne · monde 1 (3 coups, 6 lignes)
· intérieur   1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3
· intérieur   1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5
· intérieur   1.e4 e5 2.Nf3 Nc6 3.Bc4 Be7 4.d4
↪ déviation   1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4
↪ déviation   1.e4 e6 2.d4 d5 3.Nc3 Bb4 4.e5
⚔ à punir     1.e4 e5 2.Nf3 f5 3.Nxe5 Qf6 4.Nc4

Sicilienne (Noirs) · monde 1 (3 coups, 6 lignes)
· intérieur   1.e4 c5 2.Nf3 d6 3.d4 cxd4
· intérieur   1.e4 c5 2.d4 cxd4 3.c3 dxc3
· intérieur   1.e4 c5 2.Nc3 Nc6 3.g3 g6
↪ déviation   1.d4 Nf6 2.c4 e6 3.Nf3 d5
↪ déviation   1.c4 e5 2.Nc3 Nf6 3.Nf3 Nc6
```

## Pistes d'amélioration

- Choisir le coup à punir de préférence à l'intérieur de l'ouverture (côté Noirs, le prototype propose encore 1.g4).
- Enrichir l'arbre avec les pages Wikibooks (lignes plus profondes que les variantes nommées).
- Mettre en cache les évaluations Stockfish (fichier JSON) pour régénérer vite.
