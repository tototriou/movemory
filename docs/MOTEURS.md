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
| ✅ **Composant maison** : `react-native-svg` + `react-native-gesture-handler` + `reanimated` | — | toutes | Un seul code, contrôle total du rendu (style, flèches, animations « Duolingo »). ~1 à 2 semaines. |
| react-native-chessboard | MIT | iOS/Android (web partiel) | Démarrage rapide, peu maintenu, personnalisation limitée. |
| chessground (Lichess) | GPL-3 | web (mobile via WebView) | Excellent, mais GPL et WebView sur mobile. |
| react-chessboard | MIT | web seulement | Ne couvre pas le natif. |

Pièces : jeux SVG libres (ex. « cburnett », CC BY-SA, ou un jeu dessiné pour l'app).

## 3. Moteur d'analyse (Stockfish)

Utile **uniquement** pour l'analyse des parties importées et la génération de problèmes ;
la révision des ouvertures n'a **pas besoin de moteur** (le répertoire donne la réponse).

| Option | Où | Coût | Notes |
|---|---|---|---|
| ✅ **Lichess Cloud Eval API** | API | gratuit | Évaluations déjà calculées pour des millions de positions : parfait pour les 10-15 premiers coups. |
| ✅ **Stockfish natif sur serveur** (worker) | serveur | ~5-20 €/mois | Analyse des parties importées en tâche de fond, profondeur 18-20. Pas d'impact sur la batterie. |
| Stockfish WASM dans l'app | client | gratuit | Hors-ligne, mais lourd (~7-40 Mo), batterie, et GPL-3 à respecter si distribué dans l'app. |

⚠️ **Licence** : Stockfish est GPL-3. L'utiliser **côté serveur** n'impose rien sur le code de l'app.
L'embarquer dans l'app oblige à publier ses sources (et pose problème avec l'App Store).

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

## Points à trancher ensemble

1. Code ouvert (GPL possible : chessground, Stockfish embarqué) ou fermé (MIT/BSD uniquement) ?
2. Échiquier maison (recommandé) ou bibliothèque existante pour aller plus vite ?
3. Analyse des parties : serveur (recommandé) ou sur l'appareil ?
4. Hors-ligne complet dès le MVP ?
