import { createEmptyCard, fsrs, Rating, type Card, type Grade } from 'ts-fsrs';

export type ReviewState = Card;
export { Rating };

const engine = fsrs({ enable_fuzz: false });

export function newReviewState(now: Date = new Date()): ReviewState {
  return createEmptyCard(now);
}

export interface AnswerOutcome {
  correct: boolean;
  /** Temps de réponse en millisecondes. */
  timeMs: number;
  /** L'utilisateur a demandé un indice. */
  usedHint?: boolean;
}

/** Convertit une réponse de quiz en note FSRS : une erreur = "Again", la carte reviendra vite. */
export function gradeAnswer({ correct, timeMs, usedHint }: AnswerOutcome): Grade {
  if (!correct) return Rating.Again;
  if (usedHint || timeMs > 20_000) return Rating.Hard;
  if (timeMs < 4_000) return Rating.Easy;
  return Rating.Good;
}

export function review(state: ReviewState, outcome: AnswerOutcome, now: Date = new Date()): ReviewState {
  return engine.next(state, now, gradeAnswer(outcome)).card;
}

export function isDue(state: ReviewState, now: Date = new Date()): boolean {
  return state.due.getTime() <= now.getTime();
}
