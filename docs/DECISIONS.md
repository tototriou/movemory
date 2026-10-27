# Décisions prises

| Sujet | Décision | Conséquence |
|---|---|---|
| Format des exercices | Échiquier jouable uniquement, pas de QCM | Indice → surligne la pièce ; Solution → flèche |
| Explications | **Chaque coup est expliqué** (coup adverse *et* bon coup, en cas de réussite comme d'erreur) | Chaque ligne du répertoire porte un texte « pourquoi » par coup, traduit |
| Licence | **Code ouvert, GPL-3.0** (repo public) | Permet d'embarquer Stockfish (GPL-3) dans l'app. Toute redistribution du code doit rester GPL. |
| Échiquier | Composant maison (SVG + gestes + animations) | Meilleur rendu, aucune contrainte de licence |
| Hors-ligne | **Primordial** | Toute la logique tourne sur l'appareil, stockage local (SQLite), synchro plus tard |
| Analyse des parties | **Stockfish, sur l'appareil** | Hors-ligne, aucun coût serveur pour l'analyse. Voir MOTEURS.md § 3 |
| Contenu pédagogique | **Adapté de Wikibooks « Chess Opening Theory », sous CC BY-SA 4.0** | Textes réécrits dans le ton de Memo, publiés dans le repo (`content/`) sous CC BY-SA 4.0. Mention obligatoire de la source dans l'app |
| Modèle économique | **Freemium** (plus tard) | Finance les serveurs (comptes, synchro) et le contenu. Voir PLAN.md § 5 |
| Plateforme de référence | **Chess.com en priorité**, Lichess mis de côté | Import des parties via l'API publique Chess.com ; pas d'évaluations fournies → moteur local |
| Identité visuelle | Inspirée de l'ergonomie Chess.com, **sans reprendre leurs éléments de marque** | Maquette validée : fond sombre, vert principal, or pour les récompenses, échiquier crème/bleu, police Fredoka |
| Mascotte | **Memo**, un échiquier à lunettes avec bras et jambes | Il guide l'utilisateur et explique chaque coup (4 humeurs : content, réfléchit, bravo, oups) |
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

## Licences : ce qu'il faut afficher dans l'app (écran « À propos / Crédits »)

| Élément | Licence | Mention |
|---|---|---|
| Code de Movemory | GPL-3.0 | Lien vers le code source (repo GitHub public) |
| Stockfish | GPL-3.0 | « Analyse par Stockfish » + lien vers son code |
| Explications des coups | CC BY-SA 4.0 | « Adapté de Wikibooks, Chess Opening Theory (contributeurs de Wikibooks), CC BY-SA 4.0 » + lien vers les pages d'origine + « textes modifiés » |
| Noms d'ouvertures (chess-openings) | CC0 | Facultatif (par courtoisie) |
| Bibliothèques (Expo, React Native, chess.js, ts-fsrs…) | MIT / BSD | Liste des licences open source |
| Polices Fredoka, Nunito | SIL OFL | Liste des licences |

Commercialisation : toutes ces licences autorisent la vente de l'app et d'un abonnement.
Ce qui reste à nous : la marque (Movemory, Memo, logo), à déposer avant le lancement.
