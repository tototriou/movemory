# Plan produit

## 1. Vision

Une app mobile + web pour **apprendre et réviser ses ouvertures** par une séance quotidienne sur l'échiquier,
avec les codes de Duolingo : séries de jours (streak), XP, niveaux, sessions de 5 minutes.
Pas de partie entre joueurs : uniquement de la révision.

## 2. Boucle principale (la « révision du jour »)

1. L'utilisateur choisit ses ouvertures (Blancs et Noirs) : ex. Italienne avec les Blancs, Caro-Kann contre 1.e4.
2. Le répertoire est découpé en **cartes** : une carte = une position où c'est à lui de jouer + le(s) bon(s) coup(s).
3. Chaque jour, une session mélange :
   - les cartes **à revoir** (répétition espacée, algorithme FSRS) ;
   - quelques **nouvelles** cartes, dans l'ordre de la ligne (le 1er coup avant le 5e) ;
   - plus tard : des **problèmes tactiques** issus des ouvertures choisies, et des **positions tirées de ses parties**.
4. En cas d'erreur : on montre la solution (flèche + explication), la carte est reposée en fin de session
   et reviendra plus souvent les jours suivants.

### Profondeur selon le niveau

| Niveau | Coups révisés par ligne |
|---|---|
| Débutant | 3 |
| Intermédiaire | 5 |
| Avancé | 7 |
| Expert | 10+ |

Le niveau monte automatiquement quand une ligne est maîtrisée (toutes ses cartes stables).

### Format : toujours sur l'échiquier

Pas de QCM : chaque exercice est une **position sur un échiquier jouable**, l'utilisateur doit **jouer le bon coup**
(glisser ou taper la pièce). L'adversaire répond automatiquement selon le répertoire, et on enchaîne.

- **Nouvelle position** : la ligne est d'abord montrée (coups animés + explication), puis on demande de la rejouer.
- **Révision** : position seule, coup de mémoire.
- **Ligne complète** : jouer 3 à 10 coups d'affilée, l'adversaire variant ses réponses parmi celles du répertoire.
- **Punis l'erreur** : l'adversaire joue une erreur connue de l'ouverture, il faut trouver la réfutation.
- **Problème du jour** : tactique tirée d'une partie jouée dans cette ouverture ou d'une de ses propres parties.

Aides : bouton **Indice** (surligne la pièce à jouer, la révision est notée « difficile »),
puis **Solution** (flèche du bon coup). Un mauvais coup est annulé avec animation + explication.

## 3. Import de parties

- Connexion des pseudos **Lichess** et **Chess.com** (API publiques, sans mot de passe).
- Pour chaque partie importée :
  - **écart au répertoire** : « tu as joué 4.d3, ton répertoire dit 4.c3 » → la carte repasse en tête (sans moteur) ;
  - **erreurs dans l'ouverture** (coups 1 à 15) détectées par moteur → transformées en exercices perso.

## 4. Gamification

Streak quotidien, XP, ligues hebdomadaires (classement entre amis, sans jeu entre eux), badges
(« Italienne maîtrisée »), notifications de rappel, objectif quotidien réglable.

## 5. Modèle économique (à discuter)

Freemium : 1 ouverture par couleur + révision quotidienne gratuites ; abonnement pour répertoire illimité,
import de parties, analyse par moteur, statistiques.

## 6. Feuille de route

| Phase | Contenu | Statut |
|---|---|---|
| 0. Fondations | Monorepo, moteur de cartes, FSRS, base d'ouvertures Lichess, tests | ✅ fait |
| 1. MVP jouable | Maquette validée, échiquier tactile (drag & drop), révision du jour, choix des ouvertures, sauvegarde locale | à faire |
| 2. Comptes | Supabase (auth, synchro des révisions), streak, XP | à faire |
| 3. Import de parties | Lichess + Chess.com, écarts au répertoire | à faire |
| 4. Moteur | Erreurs d'ouverture via Stockfish, problèmes tactiques par ouverture | à faire |
| 5. Lancement | Notifications, onboarding, stores (EAS), abonnement | à faire |

## 7. Questions ouvertes

- Nom définitif de l'app (« Gambit » est un nom de code).
- Code source ouvert ou fermé ? (impact sur les bibliothèques GPL, voir MOTEURS.md)
- Mode hors-ligne complet dès le MVP ?
- Contenu pédagogique (explications des coups) : écrit à la main, généré, ou les deux ?
