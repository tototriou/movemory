# Système de progression : catalogues, mondes et parcours de Memo

> Document de travail. ✅ = validé.

## 1. Catalogues

- L'utilisateur choisit les ouvertures qu'il joue, dans **deux catalogues** : un pour les **Blancs**, un pour les **Noirs**.
  Exemple : Blancs → Partie italienne ; Noirs → Caro-Kann (contre 1.e4) et Gambit dame refusé (contre 1.d4).
- Chaque ouverture est livrée avec ses **lignes majeures**, classées par importance (de la plus jouée à la moins jouée).
  Toutes les lignes majeures sont considérées comme **correctes**.
- L'utilisateur peut **ajouter des lignes** à tout moment, en les choisissant dans le catalogue (voir § 4).
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

- « Coups » = **coups de l'utilisateur** (3 coups avec les Blancs = 1.e4, 2.Cf3, 3.Fc4). ✅
- Chaque monde n'introduit que du **nouveau contenu** (nouvelles lignes ou nouveaux coups) ; ce qui a été appris
  dans les mondes précédents continue de revenir dans la révision du jour (répétition espacée).
- Chaque ouverture a son propre décor de monde (ex. « Italie » pour la Partie italienne).

## 3. Le parcours de Memo

- Une carte par monde ; chaque **case = un ensemble de coups** à maîtriser (ex. une ligne majeure jusqu'à la profondeur du monde).
- **Memo avance d'une case quand cet ensemble de coups est maîtrisé**, jusqu'au bout du parcours.
- « Maîtrisé » = chaque position de la case réussie sans indice lors d'au moins 2 séances,
  sur 2 jours différents (dans FSRS : stabilité ≥ 3 jours). ✅
- Les positions maîtrisées **reviennent quand même**, de plus en plus espacées, pour vérifier qu'elles ne sont
  pas oubliées (rappels de la répétition espacée + « contrôles surprise » dans la révision du jour).
  Une position ratée lors d'un rappel redevient « à revoir », sans faire reculer Memo. ✅
- Cases spéciales :
  - **coffre** : récompense (gemmes, accessoire pour Memo) ;
  - **défi final** : jouer toutes les lignes du monde d'affilée, sans erreur → débloque le monde suivant.

## 4. Ajout de lignes : depuis un catalogue ✅

- Les lignes ne sont **pas saisies librement** : l'utilisateur les choisit dans un **catalogue prédéfini**
  (à la manière du catalogue d'ouvertures de Chess.com) : Ouverture → Variantes → Sous-variantes,
  chacune avec son nom, ses coups, sa popularité et ses explications.
- Ajouter une variante la fait entrer dans le monde en cours (nouvelles cases) et dans la révision du jour.
- Avantage : chaque ligne est vérifiée (Stockfish) et expliquée à l'avance.

## 5. Correction des coups

- ✅ Dans une position, tout coup prévu par **une des lignes retenues** dans le monde (majeures + ajoutées)
  est accepté comme juste.
- Un coup hors de ces lignes → écran « Pas votre ligne » + explication de Memo + la position revient plus souvent.

## 6. Contenu : d'où viennent les lignes majeures

Calculées à partir de vraies parties, une fois, **au moment de construire l'app** (aucune dépendance en temps réel) :

| Source | Contenu | Licence | Usage |
|---|---|---|---|
| ✅ **Base de parties Lichess** (database.lichess.org) | ~100 M de parties classées par mois, avec l'Elo des joueurs | **CC0** (libre) | Statistiques des coups les plus joués, **par niveau** (ex. 1200-1600, 1600-2000, 2000+) |
| ✅ **chess-openings** (Lichess) | 3 865 noms d'ouvertures et variantes (code ECO) | **CC0** | Noms et arborescence du catalogue (déjà importé dans `data/`) |
| The Week in Chess (TWIC) | Parties de maîtres, chaque semaine | à vérifier | Lignes « théoriques » de haut niveau |
| Stockfish | Évaluation | GPL (déjà adopté) | Vérifier que chaque ligne retenue est saine |

Pipeline proposé (script hors-ligne, relancé de temps en temps) :
1. Lire un échantillon de parties (ex. quelques millions de parties rapides/classiques) et compter, pour chaque position
   des 20 premiers demi-coups, la fréquence de chaque coup selon la tranche d'Elo.
2. Pour chaque ouverture du catalogue : **lignes majeures** = réponses adverses les plus fréquentes ;
   **nos coups** = coup principal de la théorie, vérifié par Stockfish.
3. Exporter en JSON (`content/openings/*.json`), puis **nous rédigeons les explications** de chaque coup (et les traduisons).

Bonus possible : « les lignes les plus jouées **à votre niveau** », grâce aux tranches d'Elo.
Chess.com reste la plateforme prioritaire pour l'import des parties de l'utilisateur ; Lichess ne sert ici que de source de données libres.

## 7. Impact technique (pour plus tard)

Le moteur actuel (`packages/core`, `buildCards(lignes, profondeur)`) couvre déjà le découpage :
un monde = `buildCards(lignes.slice(0, largeur), profondeur)`, en ne gardant que les cartes nouvelles par rapport au monde précédent.
À ajouter : modèle `Ouverture → Lignes classées`, `Monde`, `Case`, et la règle de maîtrise.
