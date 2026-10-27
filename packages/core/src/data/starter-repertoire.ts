import type { RepertoireLine } from '../types';

/** Petit répertoire de démo, en attendant l'import de la base d'ouvertures Lichess (CC0). */
export const STARTER_REPERTOIRE: RepertoireLine[] = [
  {
    id: 'italian-giuoco',
    name: 'Partie italienne – Giuoco Piano',
    eco: 'C50',
    side: 'w',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd3', 'd6', 'O-O', 'O-O', 'Re1', 'a6', 'Bb3', 'Ba7'],
  },
  {
    id: 'italian-two-knights',
    name: 'Partie italienne – Défense des deux cavaliers',
    eco: 'C55',
    side: 'w',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'd3', 'Be7', 'O-O', 'O-O', 'Re1', 'd6', 'c3', 'a6'],
  },
  {
    id: 'vs-sicilian-alapin',
    name: 'Sicilienne Alapin',
    eco: 'B22',
    side: 'w',
    moves: ['e4', 'c5', 'c3', 'd5', 'exd5', 'Qxd5', 'd4', 'Nf6', 'Nf3', 'e6', 'Be2', 'Nc6', 'O-O', 'cxd4'],
  },
  {
    id: 'caro-kann-advance',
    name: 'Caro-Kann – Variante d’avance',
    eco: 'B12',
    side: 'b',
    moves: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'Nf3', 'e6', 'Be2', 'c5', 'Be3', 'Nd7', 'O-O', 'Ne7'],
  },
  {
    id: 'qgd-vs-d4',
    name: 'Gambit dame refusé',
    eco: 'D37',
    side: 'b',
    moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Nf3', 'Be7', 'Bf4', 'O-O', 'e3', 'c5', 'dxc5', 'Bxc5'],
  },
];
