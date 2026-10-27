import { describe, expect, it } from 'vitest';
import italienne from '../../../content/fr/italienne.json';
import noirs from '../../../content/fr/repertoire-noirs.json';
import {
  buildWorld, emptyProgress, INTRO_START, levelOf, MAX_LEVEL, planBoss, planSession, recordAnswer,
  seededRandom, SESSION_QUESTIONS, tileMastered, worldProgress, type Course, type Item, type Progress,
} from './index';

const course = italienne as Course;
const rand = () => seededRandom('test');

/** Joue toute une séance en répondant juste partout (sauf `fail`). */
function play(p: Progress, items: Item[], wm = buildWorld(course, p.world), fail = new Set<string>()) {
  for (const it of items) {
    const keys = it.kind === 'pos' ? [it.key] : it.tile.cards;
    for (const k of keys) recordAnswer(p, k, { correct: !fail.has(k), inGame: it.kind === 'partie' });
  }
  return wm;
}

describe('mondes', () => {
  it('chaque monde travaille toutes ses lignes à la même profondeur', () => {
    for (const c of [course, noirs as Course]) {
      c.mondes.forEach((w, i) => {
        for (const t of buildWorld(c, i).tiles) expect(t.cards).toHaveLength(w.profondeur);
      });
    }
  });

  it("les positions des mondes précédents ne comptent pas sur le chemin", () => {
    const w1 = buildWorld(course, 0), w2 = buildWorld(course, 1);
    expect(w2.newCards.some((k) => w1.newCards.includes(k))).toBe(false);
    expect(w2.newCards.length).toBeGreaterThan(0);
  });
});

describe('séances', () => {
  it("la première séance montre d'emblée 4-5 lignes", () => {
    const p = emptyProgress(); const wm = buildWorld(course, 0);
    const s = planSession(p, wm, rand());
    expect(s.newLines).toHaveLength(Math.min(INTRO_START, wm.tiles.length));
    expect(s.items.every((i) => i.kind === 'pos' && i.level === 0)).toBe(true);
  });

  it("une dizaine de questions ensuite, et une erreur revient en tête de la séance suivante", () => {
    const p = emptyProgress(); const wm = buildWorld(course, 0);
    play(p, planSession(p, wm, rand()).items);
    const s2 = planSession(p, wm, rand());
    expect(s2.budget).toBeGreaterThanOrEqual(SESSION_QUESTIONS);
    const first = s2.items[0]!;
    const failed = first.kind === 'pos' ? first.key : first.tile.cards[0]!;
    recordAnswer(p, failed, { correct: false });
    const s3 = planSession(p, wm, rand());
    expect(s3.items[0]).toMatchObject({ kind: 'pos', key: failed });
  });

  it('Memo avance quand on réussit et recule quand on se trompe', () => {
    const p = emptyProgress(); const wm = buildWorld(course, 0);
    play(p, planSession(p, wm, rand()).items);
    const before = worldProgress(p, wm).steps;
    const k = wm.newCards.find((x) => levelOf(p, x) === 1)!;
    recordAnswer(p, k, { correct: true });
    expect(worldProgress(p, wm).steps).toBe(before + 1);
    recordAnswer(p, k, { correct: false });
    expect(worldProgress(p, wm).steps).toBe(before);
  });

  it('« maîtrisée » ne s’obtient qu’en partie, et un indice ne fait pas progresser', () => {
    const p = emptyProgress(); const k = 'x';
    recordAnswer(p, k, { correct: true });
    recordAnswer(p, k, { correct: true });
    recordAnswer(p, k, { correct: true });
    expect(levelOf(p, k)).toBe(2);
    recordAnswer(p, k, { correct: true, inGame: true, usedHint: true });
    expect(levelOf(p, k)).toBe(2);
    recordAnswer(p, k, { correct: true, inGame: true });
    expect(levelOf(p, k)).toBe(MAX_LEVEL);
  });

  it('en jouant juste, on arrive au bout du chemin puis au défi final', () => {
    const p = emptyProgress(); const wm = buildWorld(course, 0);
    for (let i = 0; i < 30 && !wm.tiles.every((t) => tileMastered(p, t)); i++) play(p, planSession(p, wm, rand()).items);
    const { steps, total } = worldProgress(p, wm);
    expect(steps).toBe(total);
    const boss = planBoss(wm, rand());
    expect(boss.items).toHaveLength(wm.tiles.length);
  });
});
