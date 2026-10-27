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

## 2. Mondes ✅

Un **répertoire** (ex. Blancs avec 1.e4) se découpe en mondes, du général au spécialisé.
On élargit d'abord, puis on approfondit, et on finit par se spécialiser :

| Monde | Profondeur | Lignes | Exemple (répertoire 1.e4) |
|---|---|---|---|
| 1 | 3 coups | 5-6 | Blancs : 1.e4 déjà joué, puis vos 3 coups contre 1…e5, 1…c5, 1…e6, 1…c6, 1…d5 (+ un coup à punir). Noirs : la Sicilienne contre les différents 2e coups blancs (2.Cf3, 2.c3, 2.Cc3, 2.d4) + 1…d5 contre 1.d4 |
| 2 | 3 premiers coups | 10 | + variantes des premiers coups (ex. 1…e5 2…d6, 1…c5 2…Cc6, 1…Cf6, 1…d6…) |
| 3 | 5 premiers coups | 5-6 | Les mêmes ouvertures, plus loin |
| 4 | 5 premiers coups | 10 | … |
| 5+ | 7 coups et plus | … | **Spécialisation** : une ouverture en profondeur (ex. la Partie italienne pure) |

- Objectif de chaque monde : **aucune erreur** sur la profondeur demandée, contre toutes ses lignes.
- « Coups » = **coups de l'utilisateur**. Quand le répertoire est défini par un premier coup (ex. 1.e4), ce coup est **déjà joué** : on travaille les 3 suivants (2.Cf3, 3.Fc4, 4.c3). ✅
- Répertoire Noirs : **une ouverture par premier coup blanc** (ex. Sicilienne contre 1.e4, 1…d5 contre 1.d4), avec ses variantes selon la réponse des Blancs. ✅
- Le contenu du répertoire dépend des **choix de l'utilisateur** (ex. Partie italienne contre 1…e5, Sicilienne ouverte contre 1…c5).
- Chaque monde n'introduit que du nouveau ; ce qui a été appris continue de revenir dans la révision du jour.
- Contenu : Monde 1 du répertoire 1.e4 dans `content/fr/repertoire-1e4.json`, répertoire Noirs dans `content/fr/repertoire-noirs.json` ; la spécialisation Partie italienne
  (monde avancé) dans `content/fr/italienne.json`.

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

## 6. Philosophie et construction du contenu ✅

**Objectif pédagogique** : apprendre **les meilleurs coups contre les meilleures réponses** et **comprendre les principes**
de l'ouverture (centre, développement, roque, cases faibles, plans typiques). On ne couvre pas tout : on apprend
**les grandes lignes**. On n'adapte pas le contenu au niveau réel du joueur : tout le monde apprend la bonne théorie.

### Construction des lignes : la théorie uniquement ✅

- Les lignes sont **celles de la théorie** des ouvertures, et rien d'autre : pas de base de parties, pas de lignes
  générées par un moteur. Avec l'élargissement progressif des mondes, la théorie offre largement assez de lignes.
- Point de départ : la liste **chess-openings** (CC0, déjà dans `data/`), qui donne les variantes nommées et leurs coups ;
  nous sélectionnons et ordonnons les lignes majeures de chaque ouverture, puis rédigeons les explications.

### Coups à punir ✅

- Une **variante de l'ouverture où l'adversaire commet une imprécision** (ex. dans l'Italienne : un piège connu
  ou une réponse passive), qui donne un avantage à l'utilisateur **s'il trouve le bon coup**.
- Ces variantes sont **rédigées par nous** comme les autres lignes (aucune base de données externe).
- But : obliger l'utilisateur à réfléchir avec les principes appris, au lieu de réciter.

### Rôle de Stockfish

- Analyser les parties Chess.com importées (sur l'appareil).
- Contrôle qualité du contenu : vérifier qu'aucune ligne retenue ne contient d'erreur et que chaque coup à punir
  donne bien un avantage.

### Explications

- Chaque coup a une explication de Memo **centrée sur le principe** (« on développe une pièce et on vise f7 »),
  pas seulement sur le coup. Chaque explication est étiquetée par principe (centre, développement, sécurité du roi…),
  ce qui permettra plus tard de montrer à l'utilisateur les principes qu'il maîtrise.
- **Adaptées de Wikibooks « Chess Opening Theory »** (CC BY-SA 4.0) et réécrites dans le ton de Memo, puis traduites. ✅
  Elles sont publiées sous CC BY-SA 4.0 (librement copiables) avec mention de la source.
  Les noms d'ouvertures/variantes viennent de la liste chess-openings (CC0).

## 7. Impact technique (pour plus tard)

Le moteur actuel (`packages/core`, `buildCards(lignes, profondeur)`) couvre déjà le découpage :
un monde = `buildCards(lignes.slice(0, largeur), profondeur)`, en ne gardant que les cartes nouvelles par rapport au monde précédent.
À ajouter : modèle `Ouverture → Lignes classées`, `Monde`, `Case`, et la règle de maîtrise.
