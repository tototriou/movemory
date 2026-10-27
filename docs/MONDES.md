# Système de progression : catalogues, mondes et parcours de Memo

> Document de travail : les points marqués **(à valider)** sont des propositions.

## 1. Catalogues

- L'utilisateur choisit les ouvertures qu'il joue, dans **deux catalogues** : un pour les **Blancs**, un pour les **Noirs**.
  Exemple : Blancs → Partie italienne ; Noirs → Caro-Kann (contre 1.e4) et Gambit dame refusé (contre 1.d4).
- Chaque ouverture est livrée avec ses **lignes majeures**, classées par importance (de la plus jouée à la moins jouée).
  Toutes les lignes majeures sont considérées comme **correctes**.
- L'utilisateur peut **ajouter ses propres lignes** à tout moment.
- **Freemium** : le nombre d'ouvertures disponibles dans les catalogues est la partie payante
  (ex. 1 ouverture par couleur gratuite, davantage avec l'abonnement).

## 2. Mondes

Chaque ouverture se découpe en mondes qui croisent **profondeur** (nombre de coups) et **largeur** (nombre de lignes).
On élargit d'abord, puis on approfondit :

| Monde | Profondeur | Lignes majeures |
|---|---|---|
| 1 | 3 premiers coups | 5-6 |
| 2 | 3 premiers coups | 10 |
| 3 | 5 premiers coups | 5-6 |
| 4 | 5 premiers coups | 10 |
| 5 | 7 premiers coups | 5-6 |
| 6 | 7 premiers coups | 10 |
| … | +2 coups | … |

- **(à valider)** « Coups » = coups de l'utilisateur (3 coups avec les Blancs = 1.e4, 2.Cf3, 3.Fc4).
- Chaque monde n'introduit que du **nouveau contenu** (nouvelles lignes ou nouveaux coups) ; ce qui a été appris
  dans les mondes précédents continue de revenir dans la révision du jour (répétition espacée).
- Chaque ouverture a son propre décor de monde (ex. « Italie » pour la Partie italienne).

## 3. Le parcours de Memo

- Une carte par monde ; chaque **case = un ensemble de coups** à maîtriser (ex. une ligne majeure jusqu'à la profondeur du monde).
- **Memo avance d'une case quand cet ensemble de coups est maîtrisé**, jusqu'au bout du parcours.
- **(à valider)** « Maîtrisé » = chaque position de la case réussie sans indice lors d'au moins 2 séances,
  sur 2 jours différents (dans FSRS : stabilité ≥ 3 jours).
- Cases spéciales :
  - **coffre** : récompense (gemmes, accessoire pour Memo) ;
  - **défi final** : jouer toutes les lignes du monde d'affilée, sans erreur → débloque le monde suivant.

## 4. Lignes ajoutées par l'utilisateur

- **(à valider)** Trois façons d'en ajouter :
  1. jouer les coups sur l'échiquier ;
  2. coller un PGN ;
  3. depuis une partie Chess.com importée (« ajouter cette variante à mes révisions »).
- **(à valider)** Elles rejoignent le monde en cours sous forme de nouvelles cases, et entrent tout de suite dans la révision du jour.

## 5. Correction des coups

- **(à valider)** Dans une position, tout coup prévu par **une des lignes retenues** dans le monde (majeures + ajoutées)
  est accepté comme juste.
- Un coup hors de ces lignes → écran « Pas votre ligne » + explication de Memo + la position revient plus souvent.

## 6. Contenu

- Les lignes majeures et leurs explications sont **rédigées par nous** (l'API Chess.com ne fournit pas de statistiques
  d'ouvertures), puis traduites. C'est aussi le contenu valorisé dans l'offre payante.

## 7. Impact technique (pour plus tard)

Le moteur actuel (`packages/core`, `buildCards(lignes, profondeur)`) couvre déjà le découpage :
un monde = `buildCards(lignes.slice(0, largeur), profondeur)`, en ne gardant que les cartes nouvelles par rapport au monde précédent.
À ajouter : modèle `Ouverture → Lignes classées`, `Monde`, `Case`, et la règle de maîtrise.
