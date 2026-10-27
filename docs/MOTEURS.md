# Moteurs et bibliothèques — options et recommandations

Document de travail pour décider de l'implémentation. ✅ = recommandation actuelle.

## 1. Logique d'échecs (règles, coups légaux, notation)

| Option | Licence | Notes |
|---|---|---|
| ✅ **chess.js** | BSD-2 | Déjà en place dans `packages/core`. Simple, très utilisée, SAN/FEN/PGN. |
| chessops (Lichess) | GPL-3 | Plus rapide, variantes, mais GPL. |

## 2. Échiquier jouable (UI)

C'est la pièce centrale : drag & drop fluide, animations, flèches, surlignage, sur iOS / Android / web.

| Option | Licence | Plateformes | Notes |
|---|---|---|---|
| ✅ **Composant maison** (décidé) : `react-native-svg` + `react-native-gesture-handler` + `reanimated` | — | toutes | Un seul code, contrôle total du rendu (style, flèches, animations « Duolingo »). ~1 à 2 semaines. |
| react-native-chessboard | MIT | iOS/Android (web partiel) | Démarrage rapide, peu maintenu, personnalisation limitée. |
| chessground (Lichess) | GPL-3 | web (mobile via WebView) | Excellent, mais GPL et WebView sur mobile. |
| react-chessboard | MIT | web seulement | Ne couvre pas le natif. |

Pièces : jeux SVG libres (ex. « cburnett », CC BY-SA, ou un jeu dessiné pour l'app).

## 3. Moteur d'analyse (code fermé + analyse locale)

La révision des ouvertures n'a **pas besoin de moteur** (le répertoire donne la réponse). Le moteur sert
uniquement à analyser les parties importées. Stockfish est sous GPL-3 : il ne peut pas être embarqué dans
une app à code fermé, ni « réimplémenté » à partir de son code (un portage serait une œuvre dérivée, donc GPL).

| Option | Où | Licence | Notes |
|---|---|---|---|
| ✅ **Écarts au répertoire** | appareil | — | Aucun moteur : déjà codé dans `packages/core` (`findRepertoireDeviation`). |
| ✅ **Lichess Cloud Eval API** | API, au moment de l'import | gratuit | Évaluations pré-calculées des positions courantes : idéal pour les 10-15 premiers coups. Résultat mis en cache → consultable hors-ligne. |
| ✅ **Leorik** (moteur NNUE, ~3 400 Elo CCRL) | appareil | **MIT** | Licence permissive : on peut le porter (TypeScript / Rust → WASM et natif) en gardant la mention de copyright. Réseau entraîné en auto-jeu, sans données GPL. Bien plus fort que nécessaire pour détecter les erreurs d'amateurs. |
| Moteur maison (clean-room) | appareil | à nous | Possible (alpha-beta + évaluation simple), mais des mois de travail pour un niveau bien inférieur. |
| Stockfish sur notre serveur | serveur | GPL-3 | Autorisé avec un code fermé (pas de distribution du binaire), mais pas « local ». Option de secours. |
| API tierces (chess-api.com…) | API | — | Conditions et pérennité incertaines : à éviter pour un produit. |

## 4. Données

| Besoin | Source | Licence |
|---|---|---|
| ✅ Noms et lignes d'ouvertures (3 865) | [lichess-org/chess-openings](https://github.com/lichess-org/chess-openings) → `data/openings.json` | CC0 |
| ✅ Coups les plus joués par niveau (réponses réalistes de l'adversaire, erreurs fréquentes) | Lichess Opening Explorer API (à mettre en cache) | libre |
| ✅ Problèmes tactiques **classés par ouverture** (~5 M) | Base de puzzles Lichess (`database.lichess.org`) | CC0 |
| ✅ Parties de l'utilisateur | API Lichess (`/api/games/user`) + API publique Chess.com (archives PGN mensuelles) | publiques |

La base de puzzles Lichess contient un tag d'ouverture pour chaque problème : on peut proposer
« les tactiques typiques de *ta* Caro-Kann », ce que personne ne fait aujourd'hui.

## 5. Répétition espacée

✅ **FSRS** via `ts-fsrs` (MIT) — l'algorithme moderne d'Anki, plus efficace que SM-2. Déjà en place.
Note : erreur → « Again », indice ou >20 s → « Hard », <4 s → « Easy », sinon « Good ».

## 6. Backend

| Option | Notes |
|---|---|
| ✅ **Supabase** | Postgres + auth (Google/Apple/email) + RLS ; schéma dans `supabase/migrations`. |
| Firebase | Possible, mais NoSQL moins adapté aux stats. |
| + worker (Fly.io / Railway) | File de tâches pour l'import et l'analyse Stockfish. |

Mode hors-ligne : la session du jour est calculée **sur le téléphone** (`packages/core`), les révisions
sont stockées localement puis synchronisées → l'app fonctionne dans le métro.

## 7. App

✅ **Expo (React Native)** + Expo Router : iOS, Android et web avec un seul code, builds et mises à jour via EAS.

## Décisions

Voir [DECISIONS.md](DECISIONS.md).
