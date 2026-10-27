import {
  buildWorld, levelOf, normalizeFen, planBoss, planSession, plyOf, recordAnswer, tileMastered, worldProgress,
  MAX_LEVEL, type Course, type CourseMove, type Item, type Progress,
} from '@gambit/core';
import { Chess, type Move } from 'chess.js';

import type { BoardArrow, BoardFloat } from '@/components/Board';
import type { Mood } from '@/components/Memo';
import type { SheetSpec } from '@/components/ui';
import { fr, moveLabel as label } from './notation';

/* Déroulé d'une séance (portage du prototype validé) : une dizaine de questions, puis retour à la carte.
   Découverte (flèche + explication) → de mémoire (explication seulement en cas d'erreur) → en partie (ligne au hasard).
   Une erreur fait reculer Memo d'un pas ; la position est reposée en premier à la séance suivante. */

export interface EndData { title: string; text: string; xp: number; acc: number; errors: number; pathPct: number | null; party: boolean }
export interface SessionUI {
  fen: string;
  last: { from: string; to: string } | null;
  moveId: number;
  arrow: BoardArrow | null;
  hint: string | null;
  good: string | null;
  canPlay: boolean;
  shake: number;
  floats: BoardFloat[];
  say: { text: string; mood: Mood; id: number };
  eyebrow: string;
  title: string;
  pill: string;
  punish: boolean;
  combo: number;
  frac: number;
  history: string[];
  highlightLast: boolean;
  sheet: SheetSpec | null;
  end: EndData | null;
  boss: boolean;
}

export interface RunnerEnv {
  course: Course;
  boss: boolean;
  store: { get: () => Progress; save: (p: Progress) => void; markPlayed: () => void };
  set: (patch: Partial<SessionUI> | ((ui: SessionUI) => Partial<SessionUI>)) => void;
  exit: () => void;
}

const BLUE = '#3E86C8', GREEN = '#3DDC84';
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]!;
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export function initialUI(boss: boolean): SessionUI {
  return {
    fen: new Chess().fen(), last: null, moveId: 0, arrow: null, hint: null, good: null, canPlay: false, shake: 0, floats: [],
    say: { text: '', mood: 'content', id: 0 }, eyebrow: '', title: '', pill: '', punish: false, combo: 0, frac: 0,
    history: [], highlightLast: false, sheet: null, end: null, boss,
  };
}

export function createRunner({ course, boss, store, set, exit }: RunnerEnv) {
  let alive = true;
  const P = store.get();
  const wi = Math.min(P.world, course.mondes.length - 1);
  const wm = buildWorld(course, wi);
  const side = wm.side;
  const who = side === 'w' ? 'Les Noirs' : 'Les Blancs';
  let game = new Chess();
  let moveId = 0, floatId = 0, sayId = 0, shake = 0;

  const plan = boss ? planBoss(wm) : planSession(P, wm);
  if (!boss) store.save(P); // planSession enregistre les lignes introduites
  const S = {
    queue: [...plan.items], budget: plan.budget, newLines: plan.newLines,
    item: null as Item | null, from: 0, to: 0,
    combo: 0, correct: 0, errors: 0, xp: 0, asked: 0, lastOpp: '',
    stepsBefore: worldProgress(P, wm).steps,
    masteredBefore: new Set(wm.tiles.filter((t) => tileMastered(P, t)).map((t) => t.id)),
    q: null as null | { ply: number; move: CourseMove; key: string; level: number; usedHint: boolean },
    onUser: null as null | ((m: Move) => void),
  };

  const wait = (ms: number) => new Promise<boolean>((r) => setTimeout(() => r(alive), ms));
  const frac = () => { const { steps, total } = worldProgress(P, wm); return Math.min(1, steps / total); };
  const commit = () => { store.save(P); set({ frac: frac() }); };
  const say = (text: string, mood: Mood = 'content') => set({ say: { text, mood, id: ++sayId } });
  const show = (m: Move | null, highlightLast = true) =>
    set({ fen: game.fen(), history: game.history(), highlightLast, last: m ? { from: m.from, to: m.to } : null, moveId: m ? ++moveId : moveId });
  const play = (san: string) => { const m = game.move(san); show(m); return m; };
  const doShake = () => set({ shake: ++shake });
  const solutionOf = (san: string) => new Chess(game.fen()).move(san);

  async function nextItem(): Promise<void> {
    if (!alive) return;
    set({ frac: frac() });
    const it = S.queue.shift();
    if (!it) return end();
    S.item = it; game = new Chess(); S.lastOpp = '';
    set({ arrow: null, hint: null, good: null, punish: it.tile.punish, canPlay: false });
    show(null, false);
    if (it.kind === 'partie') {
      set({ title: it.boss ? 'Défi final' : 'En partie' });
      say(it.boss ? 'Défi final : pas d’indice, pas d’erreur !' : 'En partie : je choisis une ouverture au hasard. À vous de la reconnaître !', 'reflechit');
      S.from = wm.debut; S.to = it.tile.to;
      if (!(await wait(650))) return;
      return playOn();
    }
    set({ title: `${it.level === 0 ? 'Découverte' : 'De mémoire'} · ${it.tile.name}` });
    const firstNew = Math.min(...it.tile.cards.filter((k) => levelOf(P, k) === 0).map((k) => plyOf(it.tile, k)));
    if (it.level === 0 && S.newLines.includes(it.tile) && it.ply === firstNew) {
      say(`Nouvelle ligne : **${it.tile.name}**. ${it.tile.alerte ? it.tile.alerte + ' ' : ''}Je vous la montre.`);
      if (!(await wait(1300))) return;
    }
    // mise en place rapide de la position, puis la question
    S.from = it.ply; S.to = it.ply + 1;
    for (let i = 0; i < it.ply; i++) {
      if (!(await wait(i < wm.debut ? 120 : 200))) return;
      play(it.tile.moves[i]!.san);
    }
    playOn();
  }

  async function playOn(): Promise<void> {
    const it = S.item!; const ply = game.history().length;
    if (ply >= S.to) return nextItem();
    const move = it.tile.moves[ply]!;
    if (game.turn() !== side || ply < S.from) {
      if (!(await wait(ply < S.from ? 220 : 600))) return;
      play(move.san);
      S.lastOpp = `${who} jouent **${label(ply, move.san)}**. ${move.pourquoi}`;
      if (it.kind === 'partie' && game.history().length < S.to) say(`${who} jouent **${label(ply, move.san)}**. À vous !`, 'reflechit');
      return playOn();
    }
    ask(ply, move);
  }

  function ask(ply: number, move: CourseMove) {
    const it = S.item!;
    const level = it.kind === 'partie' ? 2 : it.level;
    S.asked++;
    S.q = { ply, move, key: normalizeFen(game.fen()), level, usedHint: false };
    set({ pill: `Question ${Math.min(S.asked, S.budget)}/${S.budget}` });
    if (level === 0) {
      const mv = solutionOf(move.san);
      set({ arrow: { from: mv.from, to: mv.to, color: BLUE } });
      say(`${S.lastOpp ? S.lastOpp + '\n' : ''}Nouveau coup : jouez **${label(ply, move.san)}** (flèche bleue).`);
    } else if (it.kind !== 'partie') {
      const prev = ply > 0 ? `${who} ont joué **${label(ply - 1, game.history()[ply - 1]!)}**. ` : '';
      say(`${prev}À vous, de mémoire ! (besoin d'aide ? Indice)`, 'reflechit');
    }
    S.onUser = answer;
    set({ canPlay: true, highlightLast: true });
  }

  function answer(m: Move) {
    const { ply, move, key, level, usedHint } = S.q!; const it = S.item!;
    S.onUser = null;
    set({ canPlay: false, arrow: null, hint: null });
    if (m.san !== move.san) {
      S.errors++; S.combo = 0; set({ combo: 0 });
      const fell = levelOf(P, key) > 1;
      recordAnswer(P, key, { correct: false });
      commit(); doShake();
      const good = solutionOf(move.san);
      setTimeout(() => alive && set({ arrow: { from: good.from, to: good.to, color: GREEN } }), 400);
      if (it.kind === 'partie' && it.boss) {
        return set({ sheet: {
          bad: true, title: 'Défi raté', mood: 'oups',
          text: `**Memo :** ici, c'était **${label(ply, move.san)}**. ${move.pourquoi}`,
          note: 'Pour valider le monde, il faut zéro erreur. Révisez encore un peu, puis retentez le défi.',
          buttons: [{ label: 'Retour à la carte', onPress: () => { P.xp += S.xp; store.save(P); store.markPlayed(); exit(); }, testID: 'sheet-ok' }],
        } });
      }
      return set({ sheet: {
        bad: true, title: 'Pas votre ligne !', mood: 'oups',
        text: `**Memo :** ${fr(m.san)} n'est pas le coup prévu. Ici on joue **${label(ply, move.san)}** : ${lower(move.pourquoi)}`,
        note: `${fell ? 'Memo recule d’un pas. ' : ''}Cette position vous sera reposée à la prochaine séance.`,
        buttons: [{ label: 'Rejouer le bon coup', onPress: () => { set({ sheet: null }); retry(); }, testID: 'sheet-ok' }],
      } });
    }
    const played = play(m.san);
    S.correct++; S.combo++;
    const { before, after } = recordAnswer(P, key, { correct: true, usedHint, inGame: it.kind === 'partie' });
    commit();
    const gain = level === 0 ? 5 : 10 + level * 2 + Math.min(S.combo, 5);
    S.xp += gain;
    const f = { id: ++floatId, sq: played.to, text: `+${gain} XP` };
    set((ui) => ({ combo: S.combo, floats: [...ui.floats.slice(-3), f] }));
    if (level === 0) {
      return set({ sheet: {
        bad: false, title: 'C’est noté !', mood: 'bravo', text: `**Memo :** ${move.pourquoi}`,
        buttons: [{ label: 'Continuer', onPress: () => { set({ sheet: null }); playOn(); }, testID: 'sheet-ok' }],
      } });
    }
    set({ good: played.to });
    say((after === MAX_LEVEL && before < MAX_LEVEL ? 'Maîtrisée ! ⭐ ' : pick(['Bien joué ! ', 'Exact ! ', 'Parfait ! ', 'Oui ! '])) + (after > before ? 'Memo avance d’un pas.' : ''), 'bravo');
    setTimeout(() => { if (!alive) return; set({ good: null }); playOn(); }, 800);
  }

  function retry() {
    const { ply, move } = S.q!;
    const good = solutionOf(move.san);
    set({ arrow: { from: good.from, to: good.to, color: GREEN }, canPlay: true });
    say(`Jouez **${label(ply, move.san)}** pour continuer.`);
    S.onUser = (m) => {
      if (m.san !== move.san) return doShake();
      S.onUser = null;
      set({ canPlay: false, arrow: null });
      play(m.san);
      playOn();
    };
  }

  function end() {
    set({ canPlay: false });
    const won = boss && S.errors === 0;
    if (won) { P.boss[wi] = true; S.xp += 100; P.gems += 50; }
    P.xp += S.xp;
    store.save(P); store.markPlayed();
    const acc = S.correct + S.errors ? Math.round((S.correct / (S.correct + S.errors)) * 100) : 100;
    const newly = wm.tiles.filter((t) => tileMastered(P, t) && !S.masteredBefore.has(t.id));
    const { steps, total } = worldProgress(P, wm);
    const moved = steps - S.stepsBefore;
    const next = course.mondes[wi + 1];
    const title = boss ? (won ? `Monde ${wi + 1} terminé !` : 'Défi terminé')
      : newly.length ? (newly.length > 1 ? `${newly.length} lignes maîtrisées !` : 'Ligne maîtrisée !') : 'Séance terminée !';
    const text = boss
      ? (won ? (next ? `Vos ${wm.world.profondeur} coups sur les ${wm.tiles.length} lignes sont acquis. Monde ${wi + 2} débloqué : ${next.profondeur} coups, ${next.lignes.length} lignes.` : 'Vous avez terminé tous les mondes de ce répertoire !') : '')
      : newly.length ? `${newly.map((t) => t.name).join(', ')} : Memo avance sur la carte ! Elles reviendront de temps en temps pour ne pas les oublier.`
      : `${moved > 0 ? `Memo a avancé de ${moved} pas sur le chemin.` : moved < 0 ? `Memo a reculé de ${-moved} pas : on rattrape ça à la prochaine séance !` : 'Memo n’a pas bougé cette fois.'}${S.errors ? ' Vos erreurs vous seront reposées à la prochaine séance.' : ''}`;
    set({ end: { title, text, xp: S.xp, acc, errors: S.errors, pathPct: boss ? null : Math.round((steps / total) * 100), party: won || newly.length > 0 } });
  }

  return {
    start() {
      set({ eyebrow: boss ? `Monde ${wi + 1} · défi final · sans indice` : `Monde ${wi + 1} · ${side === 'w' ? 'Blancs' : 'Noirs'}`, frac: frac() });
      if (!S.queue.length) return end();
      nextItem();
    },
    stop() { alive = false; },
    quit() { alive = false; if (S.xp) { P.xp += S.xp; store.save(P); } exit(); },
    orientation: side,
    onMove(from: string, to: string) {
      if (!S.onUser) return;
      let m: Move;
      try { m = new Chess(game.fen()).move({ from, to, promotion: 'q' }); } catch { return; }
      S.onUser(m);
    },
    hint() {
      if (!S.onUser || !S.q || boss) return;
      S.q.usedHint = true;
      set({ hint: solutionOf(S.q.move.san).from });
      say('Indice : cette pièce-là. Où doit-elle aller ?');
    },
    solution() {
      if (!S.onUser || !S.q || boss) return;
      S.q.usedHint = true;
      const mv = solutionOf(S.q.move.san);
      set({ arrow: { from: mv.from, to: mv.to, color: BLUE } });
      say(`La solution : **${label(S.q.ply, S.q.move.san)}**. ${S.q.move.pourquoi}`);
    },
    /** Accroche de test (navigateur headless) : le coup attendu dans la position actuelle. */
    peek() {
      if (!S.onUser || !S.q || !S.item) return null;
      const m = solutionOf(S.q.move.san);
      const alt = new Chess(game.fen()).moves({ verbose: true }).find((x) => x.san !== m.san);
      return { from: m.from, to: m.to, alt: alt && { from: alt.from, to: alt.to }, mode: S.item.kind === 'partie' ? 'partie' : ['guidé', 'seul'][S.item.level], line: S.item.tile.id, boss, world: wi + 1 };
    },
  };
}
export type Runner = ReturnType<typeof createRunner>;
