/**
 * Télécharge la base d'ouvertures Lichess (licence CC0) et la convertit en
 * lignes de répertoire réutilisables : data/openings.json.
 * Source : https://github.com/lichess-org/chess-openings
 *
 * Usage : pnpm openings:import
 */
import { writeFile } from 'node:fs/promises';
import { Chess } from 'chess.js';

const BASE = 'https://raw.githubusercontent.com/lichess-org/chess-openings/master';

interface Opening {
  eco: string;
  name: string;
  moves: string[];
}

async function main() {
  const openings: Opening[] = [];
  for (const file of ['a', 'b', 'c', 'd', 'e']) {
    const res = await fetch(`${BASE}/${file}.tsv`);
    if (!res.ok) throw new Error(`${file}.tsv : HTTP ${res.status}`);
    const [, ...rows] = (await res.text()).trim().split('\n');
    for (const row of rows) {
      const [eco, name, pgn] = row.split('\t');
      const chess = new Chess();
      chess.loadPgn(pgn!);
      openings.push({ eco: eco!, name: name!, moves: chess.history() });
    }
  }
  const out = new URL('../../../data/openings.json', import.meta.url);
  await writeFile(out, JSON.stringify(openings));
  console.log(`${openings.length} ouvertures écrites dans data/openings.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
