import { Chess } from 'chess.js';

/** FEN sans les compteurs demi-coups / coups : deux transpositions donnent la même clé. */
export function normalizeFen(fen: string): string {
  return fen.split(' ').slice(0, 4).join(' ');
}

/** Rejoue des coups SAN et renvoie la partie, ou lève une erreur sur un coup illégal. */
export function playMoves(moves: string[], startFen?: string): Chess {
  const chess = startFen ? new Chess(startFen) : new Chess();
  for (const san of moves) {
    try {
      chess.move(san);
    } catch {
      throw new Error(`Coup illégal "${san}" après ${chess.history().join(' ') || '(début)'}`);
    }
  }
  return chess;
}

/** Ramène un coup saisi (SAN approximatif ou UCI "e2e4") à sa SAN canonique, ou null si illégal. */
export function toCanonicalSan(fen: string, input: string): string | null {
  const chess = new Chess(fen.split(' ').length === 4 ? `${fen} 0 1` : fen);
  const uci = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(input.trim());
  try {
    const move = uci
      ? chess.move({ from: uci[1]!, to: uci[2]!, promotion: uci[3] })
      : chess.move(input.trim());
    return move.san;
  } catch {
    return null;
  }
}
