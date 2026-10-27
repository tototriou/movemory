import { normalizeFen, playMoves } from './fen';
import type { DrillCard, Level, RepertoireLine } from './types';

/** Nombre de coups de l'utilisateur révisés par ligne selon son niveau. */
export const DEPTH_BY_LEVEL: Record<Level, number> = {
  debutant: 3,
  intermediaire: 5,
  avance: 7,
  expert: 10,
};

export function cardId(fen: string, side: string): string {
  return `${side}|${normalizeFen(fen)}`;
}

/**
 * Transforme un répertoire en cartes de révision.
 * Les lignes qui partagent une position (tronc commun, transpositions) sont fusionnées :
 * une même position ne produit qu'une carte, avec l'union des coups attendus.
 */
export function buildCards(lines: RepertoireLine[], depth: number): DrillCard[] {
  const cards = new Map<string, DrillCard>();

  for (const line of lines) {
    const chess = playMoves([]);
    let userMoves = 0;
    for (const [i, san] of line.moves.entries()) {
      const userTurn = chess.turn() === line.side;
      if (userTurn && userMoves >= depth) break;
      const fen = chess.fen();
      let played: string;
      try {
        played = chess.move(san).san;
      } catch {
        throw new Error(`Ligne "${line.name}" : coup illégal "${san}" au demi-coup ${i + 1}`);
      }
      if (!userTurn) continue;

      userMoves++;
      const id = cardId(fen, line.side);
      const card = cards.get(id) ?? {
        id,
        fen: normalizeFen(fen),
        side: line.side,
        history: line.moves.slice(0, i),
        expected: [],
        ply: userMoves,
        lineIds: [],
        lineNames: [],
      };
      if (!card.expected.includes(played)) card.expected.push(played);
      if (!card.lineIds.includes(line.id)) {
        card.lineIds.push(line.id);
        card.lineNames.push(line.name);
      }
      cards.set(id, card);
    }
  }
  return [...cards.values()];
}
