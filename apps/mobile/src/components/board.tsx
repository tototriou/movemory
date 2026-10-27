import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const GLYPHS: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};
const FILES = 'abcdefgh';

function parseBoard(fen: string): (string | null)[][] {
  return fen
    .split(' ')[0]!
    .split('/')
    .map((rank) => rank.split('').flatMap((c) => (/\d/.test(c) ? Array<null>(Number(c)).fill(null) : [c])));
}

interface BoardProps {
  fen: string;
  orientation: 'w' | 'b';
  /** Appelé avec un coup UCI ("e2e4") quand l'utilisateur tape une case de départ puis d'arrivée. */
  onMove?: (uci: string) => void;
  highlight?: string[];
  size?: number;
}

/** Échiquier minimal sans dépendance (glyphes Unicode) — à remplacer par un rendu SVG + drag & drop. */
export function Board({ fen, orientation, onMove, highlight = [], size = 320 }: BoardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const rows = parseBoard(fen);
  const ranks = orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const files = orientation === 'w' ? ranks : [...ranks];
  const cell = size / 8;

  const tap = (square: string) => {
    if (!onMove) return;
    if (selected && selected !== square) {
      onMove(selected + square);
      setSelected(null);
    } else {
      setSelected(selected === square ? null : square);
    }
  };

  return (
    <View style={{ width: size, height: size }}>
      {ranks.map((r) => (
        <View key={r} style={styles.row}>
          {files.map((f) => {
            const square = `${FILES[orientation === 'w' ? f : 7 - f]}${8 - r}`;
            const piece = rows[r]![orientation === 'w' ? f : 7 - f];
            const dark = (r + (orientation === 'w' ? f : 7 - f)) % 2 === 1;
            const lit = selected === square || highlight.includes(square);
            return (
              <Pressable
                key={square}
                accessibilityLabel={square}
                onPress={() => tap(square)}
                style={[
                  { width: cell, height: cell, backgroundColor: dark ? '#b58863' : '#f0d9b5' },
                  lit && styles.lit,
                ]}>
                <Text style={[styles.piece, { fontSize: cell * 0.75, lineHeight: cell }]}>
                  {piece ? GLYPHS[piece] : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  lit: { backgroundColor: '#f6f669' },
  piece: { textAlign: 'center', color: '#000' },
});
