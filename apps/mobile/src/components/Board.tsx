import { Chess, type Square } from 'chess.js';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Polygon, SvgXml } from 'react-native-svg';

import { PIECES } from './pieces';
import { colors, fonts } from '@/lib/theme';

const FILES = 'abcdefgh';
export interface BoardArrow { from: string; to: string; color: string }
export interface BoardFloat { id: number; sq: string; text: string }

interface Props {
  fen: string;
  orientation: 'w' | 'b';
  size: number;
  /** Dernier coup joué : surligné, et la pièce arrivée glisse depuis sa case de départ quand `moveId` change. */
  last?: { from: string; to: string } | null;
  moveId?: number;
  arrow?: BoardArrow | null;
  hint?: string | null;
  good?: string | null;
  interactive: boolean;
  onMove?: (from: string, to: string) => void;
  /** Change de valeur pour faire trembler l'échiquier (mauvais coup). */
  shakeKey?: number;
  floats?: BoardFloat[];
}

/* Échiquier jouable : toucher une pièce puis une case, ou glisser-déposer. Fonctionne pareil sur mobile et web. */
export function Board(p: Props) {
  const sq = p.size / 8;
  const flip = p.orientation === 'b';
  const xy = (s: string) => { const f = FILES.indexOf(s[0]!), r = 8 - Number(s[1]); return flip ? [7 - f, 7 - r] : [f, r]; };
  const squareAt = (x: number, y: number) => {
    const fx = Math.floor(x / sq), ry = Math.floor(y / sq);
    if (fx < 0 || fx > 7 || ry < 0 || ry > 7) return null;
    return flip ? FILES[7 - fx]! + (ry + 1) : FILES[fx]! + (8 - ry);
  };

  const game = useMemo(() => new Chess(p.fen), [p.fen]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const dragPos = useRef(new Animated.ValueXY()).current;
  useEffect(() => { setSelected(null); }, [p.fen, p.interactive]);

  const targets = useMemo(() => {
    if (!selected) return { dots: [] as string[], caps: [] as string[] };
    const ms = game.moves({ square: selected as Square, verbose: true });
    return { dots: ms.filter((m) => !m.captured).map((m) => m.to as string), caps: ms.filter((m) => m.captured).map((m) => m.to as string) };
  }, [game, selected]);

  // Le PanResponder est créé une fois : il lit l'état courant via cette référence.
  const live = useRef({ p, game, selected, squareAt, xy, sq });
  live.current = { p, game, selected, squareAt, xy, sq };
  const start = useRef<{ x: number; y: number; sq: string | null }>({ x: 0, y: 0, sq: null });

  const tryMove = (from: string, to: string) => {
    const { game: g, p: props } = live.current;
    setSelected(null);
    try { new Chess(g.fen()).move({ from, to, promotion: 'q' }); } catch { return; }
    props.onMove?.(from, to);
  };

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => live.current.p.interactive,
    onMoveShouldSetPanResponder: () => live.current.p.interactive,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (e) => {
      const { game: g, selected: sel, squareAt: at, xy: toXY, sq: s } = live.current;
      const { locationX: x, locationY: y } = e.nativeEvent;
      const target = at(x, y);
      start.current = { x, y, sq: null };
      if (!target) return;
      const piece = g.get(target as Square);
      const own = !!piece && piece.color === g.turn();
      if (sel && sel !== target && !own) { tryMove(sel, target); return; }
      if (own) {
        setSelected(target);
        const [cx, cy] = toXY(target);
        dragPos.setValue({ x: cx! * s, y: cy! * s });
        start.current = { x, y, sq: target };
      } else setSelected(null);
    },
    onPanResponderMove: (_, g) => {
      const { sq: from } = start.current; if (!from) return;
      if (Math.abs(g.dx) + Math.abs(g.dy) < 6) return;
      const { sq: s } = live.current;
      setDragging(from);
      dragPos.setValue({ x: start.current.x + g.dx - s / 2, y: start.current.y + g.dy - s / 2 });
    },
    onPanResponderRelease: (_, g) => {
      const { sq: from, x, y } = start.current; start.current.sq = null;
      setDragging(null);
      if (!from || Math.abs(g.dx) + Math.abs(g.dy) < 6) return;
      const to = live.current.squareAt(x + g.dx, y + g.dy);
      if (to && to !== from) tryMove(from, to);
    },
    onPanResponderTerminate: () => { start.current.sq = null; setDragging(null); },
  })).current;

  const shake = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!p.shakeKey) return;
    shake.setValue(0);
    Animated.sequence([-8, 7, -5, 3, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 70, useNativeDriver: false }))).start();
  }, [p.shakeKey, shake]);

  const squares = [];
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const f = flip ? 7 - x : x, r = flip ? 7 - y : y; const name = FILES[f]! + (8 - r);
    const dark = (r + f) % 2 === 1;
    let bg = dark ? colors.sqDark : colors.sqLight;
    if (p.last && (p.last.from === name || p.last.to === name)) bg = dark ? '#C7A94A' : '#F3E08A';
    if (selected === name) bg = '#F6D365';
    if (p.good === name) bg = dark ? '#5DBB7A' : '#B8E6C4';
    squares.push(
      <View key={name} style={{ position: 'absolute', left: x * sq, top: y * sq, width: sq, height: sq, backgroundColor: bg }}>
        {x === 0 && <Text style={[styles.coord, { left: 3, top: 1, color: dark ? colors.sqLight : '#56769A' }]}>{8 - r}</Text>}
        {y === 7 && <Text style={[styles.coord, { right: 3, bottom: 0, color: dark ? colors.sqLight : '#56769A' }]}>{FILES[f]}</Text>}
        {targets.dots.includes(name) && <View style={[styles.dot, { width: sq * 0.28, height: sq * 0.28, borderRadius: sq }]} />}
        {targets.caps.includes(name) && <View style={[styles.cap, { borderRadius: sq, borderWidth: sq * 0.08 }]} />}
        {p.hint === name && <HintRing />}
      </View>,
    );
  }

  const pieces = [];
  for (const row of game.board()) for (const pc of row) if (pc) {
    const [x, y] = xy(pc.square);
    const arriving = p.last && p.last.to === pc.square ? xy(p.last.from) : null;
    pieces.push(
      <Piece key={pc.square + pc.color + pc.type} code={pc.color + pc.type.toUpperCase()} size={sq} x={x! * sq} y={y! * sq}
        from={arriving ? [arriving[0]! * sq, arriving[1]! * sq] : null} animKey={arriving ? p.moveId ?? 0 : 0}
        hidden={dragging === pc.square} />,
    );
  }

  return (
    <Animated.View testID="chessboard" style={[styles.board, { width: p.size, height: p.size, transform: [{ translateX: shake }] }]} {...pan.panHandlers}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>{squares}</View>
      {p.arrow && <ArrowLayer arrow={p.arrow} xy={xy} size={p.size} />}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>{pieces}</View>
      {dragging && (
        <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: sq, height: sq, transform: dragPos.getTranslateTransform() }}>
          <SvgXml xml={PIECES[(() => { const pc = game.get(dragging as Square)!; return pc.color + pc.type.toUpperCase(); })()]!} width={sq * 1.15} height={sq * 1.15} style={{ marginLeft: -sq * 0.075, marginTop: -sq * 0.15 }} />
        </Animated.View>
      )}
      {p.floats?.map((f) => { const [x, y] = xy(f.sq); return <XpFloat key={f.id} text={f.text} left={x! * sq} top={y! * sq} />; })}
    </Animated.View>
  );
}

const Piece = memo(function Piece({ code, size, x, y, from, animKey, hidden }: {
  code: string; size: number; x: number; y: number; from: number[] | null; animKey: number; hidden: boolean;
}) {
  const off = useRef(new Animated.ValueXY()).current;
  useEffect(() => {
    if (!from || !animKey) return;
    off.setValue({ x: from[0]! - x, y: from[1]! - y });
    Animated.timing(off, { toValue: { x: 0, y: 0 }, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animKey]);
  return (
    <Animated.View style={{ position: 'absolute', left: x, top: y, width: size, height: size, opacity: hidden ? 0.25 : 1, transform: off.getTranslateTransform() }}>
      <SvgXml xml={PIECES[code]!} width={size} height={size} />
    </Animated.View>
  );
});

function ArrowLayer({ arrow, xy, size }: { arrow: BoardArrow; xy: (s: string) => number[]; size: number }) {
  const c = (s: string) => { const [x, y] = xy(s); return [x! * 100 + 50, y! * 100 + 50]; };
  const [x1, y1] = c(arrow.from), [x2, y2] = c(arrow.to);
  const len = Math.hypot(x2! - x1!, y2! - y1!), ux = (x2! - x1!) / len, uy = (y2! - y1!) / len;
  const bx = x2! - ux * 42, by = y2! - uy * 42;
  return (
    <Svg pointerEvents="none" width={size} height={size} viewBox="0 0 800 800" style={StyleSheet.absoluteFill}>
      <Line x1={x1} y1={y1} x2={bx} y2={by} stroke={arrow.color} strokeWidth={20} strokeLinecap="round" opacity={0.85} />
      <Polygon points={`${x2},${y2} ${bx - uy * 30},${by + ux * 30} ${bx + uy * 30},${by - ux * 30}`} fill={arrow.color} opacity={0.85} />
    </Svg>
  );
}

function HintRing() {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 600, useNativeDriver: false }),
      Animated.timing(v, { toValue: 0, duration: 600, useNativeDriver: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [v]);
  return <Animated.View style={[styles.hint, { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] }) }] }]} />;
}

function XpFloat({ text, left, top }: { text: string; left: number; top: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: false }).start(); }, [v]);
  return (
    <Animated.Text pointerEvents="none" style={[styles.xp, { left, top,
      opacity: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
      transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [8, -50] }) }] }]}>{text}</Animated.Text>
  );
}

const styles = StyleSheet.create({
  board: { borderRadius: 8, overflow: 'hidden', alignSelf: 'center', userSelect: 'none', borderBottomWidth: 0, shadowColor: '#000', shadowOpacity: 0.5, shadowOffset: { width: 0, height: 6 }, shadowRadius: 0, elevation: 4 },
  coord: { position: 'absolute', fontSize: 10, fontFamily: fonts.display },
  dot: { position: 'absolute', left: '36%', top: '36%', backgroundColor: 'rgba(20,18,28,0.28)' },
  cap: { position: 'absolute', left: '4%', top: '4%', right: '4%', bottom: '4%', borderColor: 'rgba(20,18,28,0.28)' },
  hint: { position: 'absolute', left: '6%', top: '6%', right: '6%', bottom: '6%', borderRadius: 999, borderWidth: 4, borderColor: colors.hint },
  xp: { position: 'absolute', width: 120, fontFamily: fonts.displayBold, fontSize: 22, color: colors.gold, textShadowColor: '#6B4E0A', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 0 },
});
