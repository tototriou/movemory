import { Chess } from 'chess.js';
import { toCanonicalSan } from './fen';
import { seededRandom, shuffle } from './rng';
import { isDue, newReviewState, type ReviewState } from './scheduler';
import type { DrillCard } from './types';

export interface Exercise {
  card: DrillCard;
  /** Carte jamais vue : on montre la ligne avant de demander le coup (phase d'apprentissage). */
  isNew: boolean;
}

export interface SessionOptions {
  now?: Date;
  /** Graine du quiz (ex. "userId:2026-10-27"). */
  seed?: string;
  maxReviews?: number;
  maxNew?: number;
}

/**
 * Compose la session du jour : d'abord les cartes en retard (les erreurs passées reviennent ici),
 * puis quelques nouvelles cartes, dans l'ordre des lignes (on apprend le 1er coup avant le 5e).
 */
export function buildDailySession(
  cards: DrillCard[],
  states: Record<string, ReviewState | undefined>,
  { now = new Date(), seed = now.toISOString().slice(0, 10), maxReviews = 15, maxNew = 5 }: SessionOptions = {},
): Exercise[] {
  const rand = seededRandom(seed);
  const due = cards
    .filter((c) => states[c.id] && isDue(states[c.id]!, now))
    .sort((a, b) => states[a.id]!.due.getTime() - states[b.id]!.due.getTime())
    .slice(0, maxReviews);
  const fresh = cards
    .filter((c) => !states[c.id])
    .sort((a, b) => a.ply - b.ply)
    .slice(0, maxNew);

  return [
    ...fresh.map((card) => ({ card, isNew: true })),
    ...shuffle(due, rand).map((card) => ({ card, isNew: false })),
  ];
}

/** Indice : la case de départ de la pièce à jouer (l'utilisateur doit encore trouver où elle va). */
export function hintSquare(card: DrillCard): string {
  const chess = new Chess(`${card.fen} 0 1`);
  return chess.move(card.expected[0]!).from;
}

export function checkMove(card: DrillCard, input: string): { correct: boolean; san: string | null } {
  const san = toCanonicalSan(card.fen, input);
  return { correct: san !== null && card.expected.includes(san), san };
}

export function initialStates(cards: DrillCard[], now = new Date()): Record<string, ReviewState> {
  return Object.fromEntries(cards.map((c) => [c.id, newReviewState(now)]));
}
