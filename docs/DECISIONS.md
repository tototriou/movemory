# Décisions prises

| Sujet | Décision | Conséquence |
|---|---|---|
| Format des exercices | Échiquier jouable uniquement, pas de QCM | Indice → surligne la pièce ; Solution → flèche |
| Explications | **Chaque coup est expliqué** (coup adverse *et* bon coup, en cas de réussite comme d'erreur) | Chaque ligne du répertoire porte un texte « pourquoi » par coup, traduit |
| Licence | **Code fermé** | Aucune dépendance GPL embarquée dans l'app (ni Stockfish, ni chessground, ni chessops) |
| Échiquier | Composant maison (SVG + gestes + animations) | Meilleur rendu, aucune contrainte de licence |
| Hors-ligne | **Primordial** | Toute la logique tourne sur l'appareil, stockage local (SQLite), synchro plus tard |
| Analyse des parties | En local pour l'instant | Voir MOTEURS.md § 3 (moteur sous licence permissive) |
| Langues | **Multilingue dès le départ** | Voir ci-dessous |
| Nom | « Movemory » envisagé | movemory.com déjà pris ; .app / .fr / .net / .io libres au 27/10/2026 |

## Système de traduction (i18n)

- **i18next + react-i18next + expo-localization** : langue du téléphone détectée, modifiable dans le profil.
- Fichiers par langue : `packages/i18n/locales/{fr,en,es,de,…}.json`, clés hiérarchiques (`session.hint`, `feedback.wrong`…),
  pluriels et variables au format ICU (`{{count}} positions`).
- **Aucun texte en dur dans les écrans** (règle de lint `i18next/no-literal-string`).
- **Notation des coups localisée** : le moteur manipule la SAN anglaise, l'affichage traduit les lettres des pièces
  (FR : R D T F C · EN : K Q R B N · DE : K D T L S · ES : R D T A C).
- **Contenu pédagogique** (explications des coups, noms d'ouvertures) séparé des textes d'interface :
  `content/<langue>/<ouverture>.json`, clé = position (FEN) + coup → traduisible ligne par ligne.
- Le français est la langue source ; l'anglais est obligatoire avant le lancement.
