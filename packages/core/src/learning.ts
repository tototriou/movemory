import { Chess } from 'chess.js';
import { normalizeFen } from './fen';
import { shuffle } from './rng';
import type { Side } from './types';

/* Contenu d'une ouverture (content/fr/*.json) : des lignes, regroupées en mondes de profondeur croissante. */
export interface CourseMove {
  san: string;
  /** Explication de Memo. */
  pourquoi: string;
  principes?: string[];
}
export interface CourseLine {
  id: string;
  nom: string;
  coups: CourseMove[];
  /** L'adversaire empêche l'ouverture : il faut jouer autre chose que le coup réflexe. */
  deviation?: boolean;
  /** L'adversaire commet une imprécision à punir. */
  aPunir?: boolean;
  alerte?: string;
  reserve?: boolean;
}
export interface CourseWorld {
  numero: number;
  titre: string;
  /** Nombre de coups de l'utilisateur travaillés sur chaque ligne du monde. */
  profondeur: number;
  lignes: string[];
}
export interface Course {
  id: string;
  nom: string;
  camp: Side;
  /** Nombre de demi-coups déjà joués d'office (1 pour un répertoire 1.e4). */
  debut?: number;
  licence?: string;
  lignes: CourseLine[];
  mondes: CourseWorld[];
}

export interface Tile {
  id: string;
  name: string;
  punish: boolean;
  deviation: boolean;
  alerte: string;
  moves: CourseMove[];
  /** Premier demi-coup où l'utilisateur est interrogé. */
  from: number;
  /** Fin de la tranche travaillée (exclue). */
  to: number;
  /** Positions (clé FEN) où l'utilisateur doit jouer, dans l'ordre de la ligne. */
  cards: string[];
}
export interface WorldModel {
  index: number;
  world: CourseWorld;
  side: Side;
  debut: number;
  tiles: Tile[];
  /** Positions nouvelles dans ce monde : ce sont elles qui font avancer Memo sur le chemin. */
  newCards: string[];
}

export const MAX_LEVEL = 3;
export const SESSION_QUESTIONS = 10;
export const INTRO_START = 5;
/** 0 pas vue · 1 découverte · 2 trouvée de mémoire · 3 maîtrisée (trouvée en partie). */
export const LEVEL_NAMES = ['Pas vue', 'Découverte', 'De mémoire', 'Maîtrisée'] as const;

/** Index du demi-coup qui suit le N-ième coup de l'utilisateur (à partir de `debut`). */
export function sliceEnd(moves: CourseMove[], side: Side, debut: number, depth: number): number {
  const c = new Chess();
  let n = 0;
  for (let i = 0; i < moves.length; i++) {
    if (c.turn() === side && i >= debut && ++n === depth) return i + 1;
    c.move(moves[i]!.san);
  }
  return moves.length;
}

function tileOf(course: Course, line: CourseLine, depth: number): Tile {
  const debut = course.debut ?? 0;
  const to = sliceEnd(line.coups, course.camp, debut, depth);
  const c = new Chess();
  const cards: string[] = [];
  line.coups.forEach((m, i) => {
    if (c.turn() === course.camp && i >= debut && i < to) cards.push(normalizeFen(c.fen()));
    c.move(m.san);
  });
  return {
    id: line.id,
    name: line.nom,
    punish: !!line.aPunir,
    deviation: !!line.deviation,
    alerte: line.alerte ?? '',
    moves: line.coups,
    from: debut,
    to,
    cards,
  };
}

export function buildWorld(course: Course, index: number): WorldModel {
  const tilesFor = (w: number) => {
    const world = course.mondes[w]!;
    return world.lignes.map((id) => {
      const line = course.lignes.find((l) => l.id === id);
      if (!line) throw new Error(`Monde ${world.numero} : ligne inconnue « ${id} »`);
      return tileOf(course, line, world.profondeur);
    });
  };
  const before = new Set<string>();
  for (let i = 0; i < index; i++) tilesFor(i).forEach((t) => t.cards.forEach((k) => before.add(k)));
  const tiles = tilesFor(index);
  const newCards = [...new Set(tiles.flatMap((t) => t.cards))].filter((k) => !before.has(k));
  return { index, world: course.mondes[index]!, side: course.camp, debut: course.debut ?? 0, tiles, newCards };
}

/* ---------- Progression ---------- */
export interface CardState {
  level: number;
  /** Ratée à la séance précédente : reposée en priorité. */
  retry?: boolean;
}
export interface Progress {
  cards: Record<string, CardState>;
  learned: string[];
  chest: Record<number, boolean>;
  boss: Record<number, boolean>;
  /** Dernière position de Memo affichée sur la carte (pour animer son déplacement). */
  shown: Record<number, number>;
  xp: number;
  gems: number;
  world: number;
}
export const emptyProgress = (): Progress => ({ cards: {}, learned: [], chest: {}, boss: {}, shown: {}, xp: 0, gems: 0, world: 0 });

export const cardState = (p: Progress, k: string): CardState => (p.cards[k] ??= { level: 0 });
export const levelOf = (p: Progress, k: string) => p.cards[k]?.level ?? 0;
export const tileSeen = (p: Progress, t: Tile) => p.learned.includes(t.id);
export const tileMastered = (p: Progress, t: Tile) => t.cards.every((k) => levelOf(p, k) >= MAX_LEVEL);
export const worldUnlocked = (p: Progress, index: number) => index === 0 || !!p.boss[index - 1];

/** Avancée sur le chemin : un pas par niveau gagné sur chaque nouvelle position du monde. */
export function worldProgress(p: Progress, wm: WorldModel) {
  const steps = wm.newCards.reduce((n, k) => n + Math.min(levelOf(p, k), MAX_LEVEL), 0);
  return { steps, total: Math.max(1, wm.newCards.length * MAX_LEVEL) };
}

/* ---------- Séance ---------- */
export type Item =
  | { kind: 'pos'; key: string; tile: Tile; ply: number; level: number }
  | { kind: 'partie'; tile: Tile; boss?: boolean };

export interface SessionPlan {
  lines: Tile[];
  newLines: Tile[];
  items: Item[];
  /** Nombre de coups demandés. */
  budget: number;
}

export function plyOf(tile: Tile, key: string): number {
  const c = new Chess();
  for (let i = 0; i < tile.moves.length; i++) {
    if (i >= tile.from && normalizeFen(c.fen()) === key) return i;
    c.move(tile.moves[i]!.san);
  }
  return -1;
}

/**
 * Prépare une séance d'une dizaine de questions (modifie `p.learned` pour les lignes introduites).
 * - première séance d'un monde : 4-5 lignes montrées d'emblée ; ensuite une nouvelle ligne dès que les autres sont presque sues ;
 * - priorité aux erreurs de la séance précédente, puis aux découvertes, puis au reste (de mémoire / en partie) ;
 * - s'il reste peu à apprendre, on complète avec des parties de révision.
 */
export function planSession(p: Progress, wm: WorldModel, rand: () => number = Math.random): SessionPlan {
  const lines = wm.tiles.filter((t) => tileSeen(p, t) && !tileMastered(p, t));
  if (!lines.length && wm.tiles.every((t) => tileSeen(p, t))) lines.push(...wm.tiles);
  const cardsOf = () => [...new Set(lines.flatMap((t) => t.cards))];
  const weak = cardsOf().filter((k) => levelOf(p, k) < 2).length;
  const fresh = wm.tiles.filter((t) => !tileSeen(p, t) && !lines.includes(t));
  const newLines = fresh.slice(0, lines.length === 0 ? INTRO_START : weak <= 2 ? 1 : 0);
  for (const t of newLines) { lines.push(t); if (!p.learned.includes(t.id)) p.learned.push(t.id); }

  const todo: { k: string; t: Tile }[] = [];
  const seen = new Set<string>();
  for (const t of lines) for (const k of t.cards) if (!seen.has(k) && levelOf(p, k) < MAX_LEVEL) { seen.add(k); todo.push({ k, t }); }

  const items: Item[] = [];
  let count = 0;
  const parties = new Set<Tile>();
  const addPos = (x: { k: string; t: Tile }) => { items.push({ kind: 'pos', key: x.k, tile: x.t, ply: plyOf(x.t, x.k), level: levelOf(p, x.k) }); count++; };
  const addPartie = (t: Tile) => { if (!parties.has(t)) { parties.add(t); items.push({ kind: 'partie', tile: t }); count += t.cards.length; } };

  const news = todo.filter((x) => levelOf(p, x.k) === 0)
    .sort((a, b) => lines.indexOf(a.t) - lines.indexOf(b.t) || plyOf(a.t, a.k) - plyOf(b.t, b.k));
  const known = shuffle(todo.filter((x) => levelOf(p, x.k) > 0), rand)
    .sort((a, b) => Number(!p.cards[a.k]?.retry) - Number(!p.cards[b.k]?.retry) || levelOf(p, a.k) - levelOf(p, b.k));

  for (const x of known) if (p.cards[x.k]?.retry && levelOf(p, x.k) < 2 && count < SESSION_QUESTIONS) addPos(x);
  for (const x of news) if (count < SESSION_QUESTIONS || newLines.length >= 2) addPos(x);
  for (const x of known) {
    if (count >= SESSION_QUESTIONS) break;
    if (items.some((i) => i.kind === 'pos' && i.key === x.k)) continue;
    if (levelOf(p, x.k) >= 2) addPartie(lines.find((l) => l.cards.includes(x.k)) ?? x.t);
    else addPos(x);
  }
  for (const t of shuffle(wm.tiles.filter((x) => tileSeen(p, x)), rand)) { if (count >= SESSION_QUESTIONS) break; addPartie(t); }

  // erreurs d'abord, puis découvertes dans l'ordre des lignes, puis le reste mélangé sans deux questions de suite sur la même ligne
  const isRetry = (i: Item) => i.kind === 'pos' && i.level > 0 && !!p.cards[i.key]?.retry;
  const isGuided = (i: Item) => i.kind === 'pos' && i.level === 0;
  const rest = shuffle(items.filter((i) => !isRetry(i) && !isGuided(i)), rand);
  for (let i = 1; i < rest.length; i++) {
    if (rest[i]!.tile === rest[i - 1]!.tile) {
      const j = rest.findIndex((x, n) => n > i && x.tile !== rest[i]!.tile);
      if (j > 0) [rest[i], rest[j]] = [rest[j]!, rest[i]!];
    }
  }
  const ordered = [...items.filter(isRetry), ...items.filter(isGuided), ...rest];
  return { lines, newLines, items: ordered, budget: count };
}

/** Défi final : toutes les lignes du monde, en partie, sans indice ni erreur. */
export function planBoss(wm: WorldModel, rand: () => number = Math.random): SessionPlan {
  const items = shuffle(wm.tiles, rand).map((t): Item => ({ kind: 'partie', tile: t, boss: true }));
  return { lines: wm.tiles, newLines: [], items, budget: wm.tiles.reduce((n, t) => n + t.cards.length, 0) };
}

/**
 * Enregistre une réponse. Bonne réponse sans indice : +1 niveau (« maîtrisée » ne s'obtient qu'en partie).
 * Erreur : -1 niveau (Memo recule d'un pas) et la position sera reposée à la séance suivante.
 */
export function recordAnswer(p: Progress, key: string, a: { correct: boolean; usedHint?: boolean; inGame?: boolean }) {
  const cs = cardState(p, key);
  const before = cs.level;
  if (!a.correct) {
    cs.level = cs.level === 0 ? 0 : Math.max(1, cs.level - 1);
    cs.retry = true;
  } else {
    if (!a.usedHint) { cs.level = Math.min(a.inGame ? MAX_LEVEL : 2, cs.level + 1); cs.retry = false; }
    if (before === 0) cs.level = Math.max(cs.level, 1);
  }
  return { before, after: cs.level };
}
