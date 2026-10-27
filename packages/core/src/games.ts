import { Chess } from 'chess.js';
import { cardId } from './repertoire';
import type { DrillCard, Side } from './types';

export interface Deviation {
  card: DrillCard;
  /** Coup réellement joué dans la partie. */
  played: string;
  /** Numéro de demi-coup dans la partie. */
  ply: number;
}

/**
 * Compare une partie importée (PGN Lichess / Chess.com) au répertoire de l'utilisateur
 * et renvoie la première position où il s'en est écarté. Pas besoin de moteur :
 * la carte correspondante peut être remise en tête de file de révision.
 */
export function findRepertoireDeviation(pgn: string, userSide: Side, cards: DrillCard[]): Deviation | null {
  const byId = new Map(cards.map((c) => [c.id, c]));
  const game = new Chess();
  game.loadPgn(pgn);
  const moves = game.history();

  const replay = new Chess();
  for (const [ply, san] of moves.entries()) {
    if (replay.turn() === userSide) {
      const card = byId.get(cardId(replay.fen(), userSide));
      if (!card) return null; // sorti du répertoire (par l'adversaire ou au-delà de la profondeur)
      if (!card.expected.includes(san)) return { card, played: san, ply: ply + 1 };
    }
    replay.move(san);
  }
  return null;
}
