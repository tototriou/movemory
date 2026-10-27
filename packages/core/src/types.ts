export type Side = 'w' | 'b';

/** Une ligne de répertoire : une suite de coups SAN depuis la position initiale. */
export interface RepertoireLine {
  id: string;
  /** Nom lisible, ex. "Sicilienne Najdorf". */
  name: string;
  eco?: string;
  /** Camp joué par l'utilisateur dans cette ligne. */
  side: Side;
  /** Coups en notation SAN, ex. ["e4", "c5", "Nf3", "d6"]. */
  moves: string[];
}

/**
 * Une carte de révision = une position où c'est à l'utilisateur de jouer,
 * avec le ou les coups attendus par son répertoire.
 */
export interface DrillCard {
  /** Identifiant stable : dérivé de la position et du camp. */
  id: string;
  /** FEN normalisée (sans compteurs de coups). */
  fen: string;
  side: Side;
  /** Coups SAN joués pour arriver à cette position (pour l'animation d'intro). */
  history: string[];
  /** Coups SAN acceptés comme bonne réponse. */
  expected: string[];
  /** Numéro du coup de l'utilisateur dans la ligne (1 = premier coup). */
  ply: number;
  lineIds: string[];
  lineNames: string[];
}

export type Level = 'debutant' | 'intermediaire' | 'avance' | 'expert';
