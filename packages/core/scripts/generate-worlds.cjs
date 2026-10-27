// Génération automatique des mondes d'une ouverture (prototype).
// Sources : arbre de théorie (data/openings.json, chess-openings CC0) + Stockfish (choix et contrôle des coups).
// Usage : node scripts/generate-worlds.cjs "Partie italienne" w e4 e5 Nf3 Nc6 Bc4
const { spawn } = require('child_process'); const { Chess } = require('chess.js');
const DATA = require(require('path').join(__dirname, '../../../data/openings.json'));
const [name, side, ...D] = process.argv.slice(2); // ex. "Italienne" w e4 e5 Nf3 Nc6 Bc4

// --- arbre de théorie : chaque nœud compte les variantes nommées qui passent par lui
const root = { kids: new Map(), w: 0 };
for (const o of DATA) { let n = root; n.w++; for (const m of o.moves) { if (!n.kids.has(m)) n.kids.set(m, { kids: new Map(), w: 0, name: null }); n = n.kids.get(m); n.w++; } n.name = o.name; }
const nodeAt = (moves) => { let n = root; for (const m of moves) { n = n?.kids.get(m); } return n || null; };

// --- Stockfish
const sf = spawn('node', [require.resolve('stockfish/scripts/cli.js'), 'lite-single']);
let buf = '', waiters = []; sf.stdout.on('data', (x) => { buf += x; const ls = buf.split('\n'); buf = ls.pop(); for (const l of ls) waiters.forEach((w) => w(l)); });
const send = (c) => sf.stdin.write(c + '\n'); const until = (p) => new Promise((r) => { const w = (l) => { if (p(l)) { waiters = waiters.filter((x) => x !== w); r(l); } }; waiters.push(w); });
const cache = new Map();
async function evaluate(moves) { // score du point de vue du camp au trait + meilleur coup (SAN)
  const key = moves.join(' '); if (cache.has(key)) return cache.get(key);
  const c = new Chess(); moves.forEach((m) => c.move(m));
  if (c.isGameOver()) return { s: 0, best: null };
  let s = 0; const w = (l) => { const m = / score (cp|mate) (-?\d+)/.exec(l); if (m) s = m[1] === 'cp' ? +m[2] : (+m[2] > 0 ? 3000 : -3000); };
  waiters.push(w); send('position fen ' + c.fen()); send('go depth 14'); const b = (await until((l) => l.startsWith('bestmove'))).split(' ')[1]; waiters = waiters.filter((x) => x !== w);
  const best = c.move({ from: b.slice(0, 2), to: b.slice(2, 4), promotion: b[4] }).san; const r = { s, best }; cache.set(key, r); return r;
}
const lossOf = async (moves, san) => { const a = await evaluate(moves); const b = await evaluate([...moves, san]); return a.s + b.s; }; // perte en centipions

// --- choix des coups
// Parmi les coups de la théorie assez bons (perte <= tol), on garde :
//  - pour l'utilisateur : le meilleur selon Stockfish (à 15 cp près, le plus étudié) ;
//  - pour l'adversaire : la ligne la plus étudiée (la « réponse principale » de la théorie).
async function theoryMove(moves, tol, preferStudied) {
  const n = nodeAt(moves); const kids = n ? [...n.kids.entries()] : [];
  const ok = []; for (const [san, k] of kids) { const loss = await lossOf(moves, san); if (loss <= tol) ok.push({ san, w: k.w, loss }); }
  if (!ok.length) return null;
  if (preferStudied) return ok.sort((a, b) => b.w - a.w)[0].san;
  const best = Math.min(...ok.map((o) => o.loss));
  return ok.filter((o) => o.loss <= best + 15).sort((a, b) => b.w - a.w)[0].san;
}
async function userMove(moves) { const t = await theoryMove(moves, 40, false); return t ? { san: t, src: 'théorie' } : { san: (await evaluate(moves)).best, src: 'stockfish' }; }
async function oppMain(moves) { return (await theoryMove(moves, 40, true)) || (await evaluate(moves)).best; }
const DEBUT = side === 'w' && D.length ? 1 : 0; // le premier coup de l'ouverture est déjà joué
const isUser = (len) => (len % 2 === 0) === (side === 'w');

async function extend(prefix, depth) { // prolonge jusqu'au N-ième coup de l'utilisateur
  const moves = [...prefix]; let n = moves.filter((_, i) => isUser(i) && i >= DEBUT).length; const src = [];
  while (n < depth) { if (isUser(moves.length)) { const u = await userMove(moves); moves.push(u.san); src.push(u.src); n++; } else moves.push(await oppMain(moves)); }
  return { moves, src };
}

(async () => {
  send('uci'); await until((l) => l === 'uciok');
  // 1. candidats : réponses adverses après la séquence (intérieur) et écarts le long de la séquence (déviations)
  const cands = [];
  for (let i = 0; i <= D.length; i++) {
    if (isUser(i)) continue;
    const pre = D.slice(0, i); const n = nodeAt(pre); if (!n) continue;
    const inside = i === D.length;
    for (const [san, k] of n.kids) {
      if (!inside && san === D[i]) continue;
      const loss = await lossOf(pre, san);
      cands.push({ moves: [...pre, san], type: inside ? 'intérieur' : 'déviation', share: k.w / n.w, w: k.w, loss, name: k.name, ply: i });
    }
  }
  const sound = cands.filter((c) => c.loss <= 80).sort((a, b) => b.share - a.share);
  // coup à punir : une imprécision connue de la théorie, le plus près possible de l'ouverture
  const punish = cands.filter((c) => c.loss >= 90 && c.loss <= 700 && c.w >= 2).sort((a, b) => b.ply - a.ply || b.w - a.w);
  const pickWorld = (width) => {
    const ins = sound.filter((c) => c.type === 'intérieur'), dev = sound.filter((c) => c.type === 'déviation');
    const nIn = Math.ceil((width - 1) / 2), nDev = width - 1 - nIn;
    return [...ins.slice(0, nIn), ...dev.slice(0, nDev), ...punish.slice(0, 1)];
  };
  const fmt = (moves) => { const c = new Chess(); return moves.map((m, i) => (i % 2 === 0 ? `${i / 2 + 1}.` : '') + m).join(' '); };
  for (const [k, width] of [[3, 6], [3, 10], [5, 6]]) {
    console.log(`\n=== ${name} · monde ${k}/${width} : ${k} coups, ${width} lignes ===`);
    for (const c of pickWorld(width)) {
      const { moves, src } = await extend(c.moves, k);
      const tag = c.loss >= 90 ? '⚔ à punir' : c.type === 'déviation' ? '↪ déviation' : '· intérieur';
      console.log(`${tag.padEnd(12)} ${fmt(moves).padEnd(58)} ${src.includes('stockfish') ? '[complété par Stockfish]' : ''}`);
    }
  }
  sf.kill(); process.exit(0);
})();
