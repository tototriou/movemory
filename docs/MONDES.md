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

## 2. Mondes : petits, progressifs ✅

Chaque ouverture se découpe en **petits mondes** d'au moins **5 lignes**. D'un monde à l'autre, on **pousse les lignes
plus loin** et on **ajoute des lignes** :

| Monde | Profondeur | Lignes (Partie italienne) |
|---|---|---|
| 1 · Les bases | 3 coups | Giuoco Piano, Deux cavaliers, Petrov ↪, Scandinave ↪, Sicilienne ↪ |
| 2 · Un coup plus loin | 4 coups | + Damiano ⚔ (coup à punir) |
| 3 · Jusqu'au roque | 5 coups | + Hongroise |
| … | +1 coup | + 1 ligne (Paris, 3…h6, Blackburne, Philidor… en réserve) |

- « Coups » = coups de l'utilisateur. Quand l'ouverture commence par un coup de l'utilisateur (1.e4), il est déjà joué.
- Lignes **intérieures** (variantes de l'ouverture), **déviations** ↪ (l'adversaire empêche l'ouverture : il faut jouer
  autre chose que le coup réflexe) et **coups à punir** ⚔.
- Un monde se débloque en réussissant le défi final du précédent. Les positions déjà apprises reviennent dans les parties.
- Les mondes seront **générés automatiquement** pour toutes les ouvertures : voir [GENERATION.md](GENERATION.md).

## 3. L'apprentissage : séances d'une dizaine de questions ✅

Chaque **position** (un coup à trouver) passe par 3 niveaux :

| Niveau | Question |
|---|---|
| 0 → 1 · Découverte | Memo montre le coup (flèche) et l'explique |
| 1 → 2 · De mémoire | La même position, sans aide (bouton **Indice** si besoin, mais la position ne monte pas) |
| 2 → 3 · En partie | **Partie** : l'adversaire choisit au hasard une des lignes, il faut la reconnaître |

- **Une séance = une dizaine de questions**, puis retour à la carte.
- **Première séance d'un monde** : Memo montre d'emblée **4-5 lignes** ; ensuite on joue, et une nouvelle ligne arrive
  dès que les autres sont presque sues (c'est pour ça qu'il faut au moins 5 lignes par monde : assez de variété).
- Les questions sont **mélangées** (jamais deux de suite sur la même ligne). S'il reste peu à apprendre, la séance est
  complétée par des parties de révision.
- **Erreur** → explication de Memo, Memo **recule d'un pas**, et la position est **reposée en priorité à la séance suivante**.

### La carte : un chemin continu, du départ à l'arrivée ✅

- Le chemin compte **un pas par niveau à gagner** (3 pas par nouvelle position du monde).
- **Memo avance pendant la séance** (mini-chemin en haut de l'écran) et, au retour sur la carte, on le voit **se déplacer**
  de son ancienne position à la nouvelle. Il recule quand on se trompe.
- **Coffre à mi-chemin**, **défi final à l'arrivée** (toutes les lignes en partie, sans indice ni erreur) → monde suivant.
- Ensuite, la révision du jour (répétition espacée) refait passer les positions de temps en temps.

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
