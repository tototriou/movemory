import { describe, expect, it } from 'vitest';
import {
  buildCards,
  buildDailySession,
  checkMove,
  DEPTH_BY_LEVEL,
  findRepertoireDeviation,
  hintSquare,
  isDue,
  newReviewState,
  review,
  STARTER_REPERTOIRE,
  type RepertoireLine,
} from './index';

const italian = STARTER_REPERTOIRE.filter((l) => l.id.startsWith('italian'));

describe('buildCards', () => {
  it('limite le nombre de coups selon le niveau', () => {
    const [line] = italian as [RepertoireLine];
    expect(buildCards([line], DEPTH_BY_LEVEL.debutant)).toHaveLength(3);
    expect(buildCards([line], DEPTH_BY_LEVEL.avance)).toHaveLength(7);
  });

  it('fusionne le tronc commun et liste les deux suites possibles', () => {
    const cards = buildCards(italian, 5);
    const afterBc4 = cards.filter((c) => c.ply === 4);
    // 4e coup : c3 contre ...Bc5, d3 contre ...Nf6 → deux positions distinctes
    expect(afterBc4.map((c) => c.expected[0]).sort()).toEqual(['c3', 'd3']);
    const first = cards.find((c) => c.ply === 1)!;
    expect(first.expected).toEqual(['e4']);
    expect(first.lineIds).toHaveLength(2);
  });

  it('gère les répertoires avec les noirs', () => {
    const caro = STARTER_REPERTOIRE.find((l) => l.id === 'caro-kann-advance')!;
    const cards = buildCards([caro], 3);
    expect(cards.map((c) => c.expected[0])).toEqual(['c6', 'd5', 'Bf5']);
  });

  it('signale un coup illégal dans une ligne', () => {
    expect(() => buildCards([{ id: 'x', name: 'Bad', side: 'w', moves: ['e4', 'e5', 'Ke3'] }], 5)).toThrow(/illégal/);
  });
});

describe('checkMove', () => {
  const [card] = buildCards(italian, 1);
  it('accepte SAN et UCI', () => {
    expect(checkMove(card!, 'e4').correct).toBe(true);
    expect(checkMove(card!, 'e2e4').correct).toBe(true);
    expect(checkMove(card!, 'd4')).toEqual({ correct: false, san: 'd4' });
    expect(checkMove(card!, 'Ke5').san).toBeNull();
  });
});

describe('répétition espacée', () => {
  const now = new Date('2026-10-27T08:00:00Z');
  it('une erreur fait revenir la carte plus tôt qu’une bonne réponse', () => {
    const s = newReviewState(now);
    const wrong = review(s, { correct: false, timeMs: 5000 }, now);
    const right = review(s, { correct: true, timeMs: 5000 }, now);
    expect(wrong.due.getTime()).toBeLessThan(right.due.getTime());
  });

  it('le quiz du jour mêle révisions dues et nouvelles cartes, de façon déterministe', () => {
    const cards = buildCards(STARTER_REPERTOIRE, 5);
    const states = { [cards[3]!.id]: review(newReviewState(now), { correct: false, timeMs: 1 }, now) };
    const later = new Date(now.getTime() + 60 * 60 * 1000);
    expect(isDue(states[cards[3]!.id]!, later)).toBe(true);

    const a = buildDailySession(cards, states, { now: later, seed: 'u1:2026-10-27', maxNew: 3 });
    const b = buildDailySession(cards, states, { now: later, seed: 'u1:2026-10-27', maxNew: 3 });
    expect(a).toEqual(b);
    expect(a.filter((e) => !e.isNew).map((e) => e.card.id)).toEqual([cards[3]!.id]);
    expect(a.filter((e) => e.isNew)).toHaveLength(3);
  });

  it('donne la case de départ comme indice', () => {
    const [first] = buildCards(STARTER_REPERTOIRE, 1);
    expect(hintSquare(first!)).toBe('e2');
  });
});

describe('import de parties', () => {
  const cards = buildCards(STARTER_REPERTOIRE, 7);
  it('trouve où le joueur a quitté son répertoire', () => {
    const pgn = '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3 Nf6 5. O-O *';
    const dev = findRepertoireDeviation(pgn, 'w', cards);
    expect(dev).toMatchObject({ played: 'd3', ply: 7 });
    expect(dev!.card.expected).toEqual(['c3']);
  });

  it('ne signale rien si c’est l’adversaire qui sort du répertoire', () => {
    expect(findRepertoireDeviation('1. e4 e6 2. d4 d5 *', 'w', cards)).toBeNull();
  });
});
