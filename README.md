# Gambit ♟️ *(nom de code)*

**Le Duolingo des ouvertures d'échecs.** Chaque jour, une courte séance sur l'échiquier : on joue le bon coup de *ses* ouvertures,
avec de la répétition espacée : une position ratée revient plus souvent jusqu'à être maîtrisée.

On ne joue pas contre d'autres joueurs : on **révise**, de façon passive et régulière (5 minutes par jour).

## Ce qui nous différencie de chess.com

| | chess.com | Gambit |
|---|---|---|
| Cœur de l'app | Jouer des parties | Réviser son répertoire |
| Ouvertures | Cours / explorateur | Séance quotidienne sur l'échiquier + répétition espacée (FSRS) |
| Profondeur | Fixe | 3 → 10 coups selon le niveau |
| Ses propres parties | Analyse ponctuelle | Les écarts au répertoire deviennent des exercices |

## Structure

```
apps/mobile       App Expo (iOS, Android et web avec une seule base de code)
packages/core     Moteur de révision : répertoire → cartes, répétition espacée, import de parties (testé)
supabase/         Schéma de base de données (Postgres)
data/             Base d'ouvertures Lichess (CC0), générée par `pnpm openings:import`
docs/             Plan produit, choix techniques, maquette
```

## Démarrer

```bash
pnpm install
pnpm test          # tests du moteur
pnpm web           # app dans le navigateur
pnpm dev           # app mobile (Expo Go / émulateur)
```

## Documentation

- [docs/PLAN.md](docs/PLAN.md) — vision, fonctionnalités, feuille de route
- [docs/MOTEURS.md](docs/MOTEURS.md) — moteurs et bibliothèques : options et recommandations
