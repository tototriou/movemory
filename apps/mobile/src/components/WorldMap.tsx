import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Polyline, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Memo } from './Memo';
import { colors, fonts } from '@/lib/theme';

/* Chemin sinueux du départ (en bas) à l'arrivée (en haut), échantillonné pour placer Memo à une fraction donnée. */
function buildTrack(W: number, H: number) {
  const rows = 4, top = Math.max(H * 0.13, 64), bottom = H * 0.86, dy = (bottom - top) / rows;
  const pts = Array.from({ length: rows + 1 }, (_, i) => [i % 2 === 0 ? W * 0.26 : W * 0.74, bottom - i * dy] as const);
  let d = `M ${pts[0]![0]} ${pts[0]![1]}`;
  const samples: [number, number][] = [[pts[0]![0], pts[0]![1]]];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]!, [x1, y1] = pts[i]!;
    const c1 = [x0, y0 - dy * 0.55], c2 = [x1, y1 + dy * 0.55];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${x1} ${y1}`;
    for (let k = 1; k <= 40; k++) {
      const t = k / 40, m = 1 - t;
      const bez = (a: number, b: number, c: number, e: number) => m * m * m * a + 3 * m * m * t * b + 3 * m * t * t * c + t * t * t * e;
      samples.push([bez(x0, c1[0]!, c2[0]!, x1), bez(y0, c1[1]!, c2[1]!, y1)]);
    }
  }
  const acc = [0];
  for (let i = 1; i < samples.length; i++) acc.push(acc[i - 1]! + Math.hypot(samples[i]![0] - samples[i - 1]![0], samples[i]![1] - samples[i - 1]![1]));
  const L = acc[acc.length - 1]!;
  /** Point à la fraction u du chemin, et l'indice d'échantillon qui le précède. */
  const at = (u: number): { x: number; y: number; i: number } => {
    const target = Math.max(0, Math.min(1, u)) * L;
    let i = 1; while (i < acc.length - 1 && acc[i]! < target) i++;
    const seg = acc[i]! - acc[i - 1]!, k = seg ? (target - acc[i - 1]!) / seg : 0;
    const [ax, ay] = samples[i - 1]!, [bx, by] = samples[i]!;
    return { x: ax + (bx - ax) * k, y: ay + (by - ay) * k, i };
  };
  const trail = (u: number) => { const p = at(u); return [...samples.slice(0, p.i), [p.x, p.y]].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' '); };
  return { d, at, trail };
}

const STARS = [[12, 18, 1.6], [28, 8, 1.2], [47, 22, 1.8], [64, 12, 1.2], [83, 26, 1.6], [92, 9, 1.2], [8, 42, 1.4], [74, 46, 1.2], [38, 36, 1], [56, 4, 1.3]];

export function WorldMap({ steps, total, shownFrom, active, chestOpen, bossDone, unlock, onChest, onGoal, onShown }: {
  steps: number; total: number;
  /** Dernière position affichée : Memo part de là et avance (ou recule) jusqu'à `steps`. */
  shownFrom: number;
  active: boolean;
  chestOpen: boolean; bossDone: boolean; unlock: boolean;
  onChest: () => void; onGoal: () => void; onShown: (steps: number) => void;
}) {
  const [box, setBox] = useState({ W: 0, H: 0 });
  const t = useMemo(() => (box.W ? buildTrack(box.W, box.H) : null), [box]);
  const f = Math.min(1, steps / total);

  // animation de Memo sur le chemin
  const [u, setU] = useState(shownFrom / total);
  const shownCb = useRef(onShown); shownCb.current = onShown;
  useEffect(() => {
    const a = Math.min(1, shownFrom / total), b = f;
    if (!active || a === b) { setU(active ? b : a); return; }
    let raf = 0; const t0 = Date.now();
    const tick = () => {
      const k = Math.min(1, (Date.now() - t0) / 1400), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      setU(a + (b - a) * e);
      if (k < 1) raf = requestAnimationFrame(tick); else shownCb.current(steps);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, shownFrom, steps, total, f]);

  const bob = useLoop(1500);
  const marks = [{ u: 0.25, kind: 'star' }, { u: 0.5, kind: 'chest' }, { u: 0.75, kind: 'star' }] as const;
  const next = [...marks.map((m) => ({ u: m.u, name: m.kind === 'chest' ? 'le coffre' : 'une étoile' })), { u: 1, name: 'l’arrivée' }].find((m) => f < m.u);
  const pill = bossDone ? 'Monde terminé !' : next ? `Encore ${Math.ceil(next.u * total - steps)} pas jusqu’à ${next.name}` : 'Défi final débloqué !';
  const atEnd = steps >= total;
  const tower = bossDone ? colors.good : atEnd ? colors.gold : '#6E6893';

  return (
    <View style={{ flex: 1 }}>
      <View style={StyleSheet.absoluteFill} onLayout={(e) => setBox({ W: e.nativeEvent.layout.width, H: e.nativeEvent.layout.height })}>
        {t && (
          <>
            <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={box.W} height={box.H}>
              <Path d={t.d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={30} strokeLinecap="round" />
              <Path d={t.d} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={4} strokeLinecap="round" strokeDasharray="1 14" />
              {u > 0.002 && <Polyline points={t.trail(u)} fill="none" stroke={colors.gold} strokeOpacity={0.3} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />}
              {u > 0.002 && <Polyline points={t.trail(u)} fill="none" stroke={colors.gold} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />}
            </Svg>

            <Flag x={t.at(0).x} y={t.at(0).y + 28} label="Départ" />
            {marks.map((m) => {
              const p = t.at(m.u), on = f >= m.u;
              if (m.kind === 'star') return <Badge key={m.u} x={p.x} y={p.y} on={on} size={44}><StarIcon color={on ? '#6B4405' : 'rgba(255,255,255,0.45)'} /></Badge>;
              const ready = (on || unlock) && !chestOpen;
              return (
                <Pressable key={m.u} onPress={onChest} disabled={!(on || unlock)} accessibilityRole="button" testID="chest"
                  accessibilityLabel={`Coffre${chestOpen ? ' (ouvert)' : on ? ' : à ouvrir' : ' : à mi-chemin'}`}
                  style={{ position: 'absolute', left: p.x - 27, top: p.y - 27, opacity: on || unlock ? 1 : 0.55 }}>
                  <Bob active={ready} anim={bob}><Badge on={on} size={54} glow={ready}><ChestIcon open={chestOpen} /></Badge></Bob>
                </Pressable>
              );
            })}
            {(() => {
              const p = t.at(1), ready = (atEnd || unlock) && !bossDone;
              return (
                <Pressable onPress={onGoal} disabled={!(atEnd || unlock)} accessibilityRole="button" accessibilityLabel="Arrivée : défi final" testID="goal"
                  style={{ position: 'absolute', left: p.x - 70, top: p.y - 52, width: 140, alignItems: 'center', opacity: atEnd || unlock || bossDone ? 1 : 0.7 }}>
                  <Bob active={ready} anim={bob}><TowerIcon fill={tower} /></Bob>
                  <Text style={styles.flag}>Arrivée · défi final</Text>
                </Pressable>
              );
            })()}

            {(() => {
              // dans la dernière ligne droite, Memo se range à côté de la tour d'arrivée
              const p = t.at(u), dx = u > 0.9 ? ((u - 0.9) / 0.1) * 62 : 0, dy = u > 0.9 ? ((u - 0.9) / 0.1) * 30 : 0;
              p.x += dx; p.y += dy;
              return (
                <>
                  <View pointerEvents="none" style={[styles.shadow, { left: p.x - 23, top: p.y - 6 }]} />
                  <Animated.View pointerEvents="none" testID="map-memo"
                    style={{ position: 'absolute', left: p.x - 42, top: p.y - 84, transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }] }}>
                    <Memo mood={bossDone ? 'bravo' : 'content'} size={84} />
                  </Animated.View>
                </>
              );
            })()}
          </>
        )}
        <Text style={styles.pill} testID="next-pill">{pill}</Text>
      </View>
    </View>
  );
}

/** Ciel de nuit, lune, étoiles et collines, derrière tout l'écran de la carte. */
export function Sky() {
  const twinkle = useLoop(4000);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#171433" /><Stop offset="0.42" stopColor="#2A2156" /><Stop offset="0.72" stopColor="#4B2E63" /><Stop offset="1" stopColor="#7A4062" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#sky)" />
      </Svg>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) }]}>
        {STARS.map(([x, y, r], i) => (
          <View key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y! * 0.55}%`, width: r! * 2, height: r! * 2, borderRadius: r!, backgroundColor: i === 2 ? '#FFE7A3' : '#fff' }} />
        ))}
      </Animated.View>
      <Svg pointerEvents="none" style={{ position: 'absolute', right: '7%', top: '27%' }} width={90} height={90} viewBox="0 0 90 90">
        <Defs>
          <RadialGradient id="moon" cx="0.35" cy="0.35" r="0.7"><Stop offset="0" stopColor="#FFF6D6" /><Stop offset="1" stopColor="#FFD978" /></RadialGradient>
          <RadialGradient id="halo" cx="0.5" cy="0.5" r="0.5"><Stop offset="0.45" stopColor="#FFD978" stopOpacity="0.4" /><Stop offset="1" stopColor="#FFD978" stopOpacity="0" /></RadialGradient>
        </Defs>
        <Circle cx="45" cy="45" r="45" fill="url(#halo)" />
        <Circle cx="45" cy="45" r="23" fill="url(#moon)" />
      </Svg>
      <Svg pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '46%' }} width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="none">
        <Path d="M0 120 C 60 80, 120 90, 170 120 S 280 70, 400 110 L 400 300 L 0 300 Z" fill="#3A2752" />
        <Path d="M0 180 C 70 140, 150 170, 210 160 S 330 120, 400 165 L 400 300 L 0 300 Z" fill="#2C1F44" />
        <Path d="M0 240 C 90 210, 170 235, 250 220 S 360 205, 400 225 L 400 300 L 0 300 Z" fill="#211836" />
      </Svg>

    </View>
  );
}

/** Valeur qui oscille 0 → 1 → 0 en boucle (balancement, scintillement). */
function useLoop(period: number) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      Animated.timing(v, { toValue: 0, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [v, period]);
  return v;
}

function Bob({ active, anim, children }: { active: boolean; anim: Animated.Value; children: React.ReactNode }) {
  return <Animated.View style={active ? { transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }] } : null}>{children}</Animated.View>;
}

function Flag({ x, y, label }: { x: number; y: number; label: string }) {
  return <Text pointerEvents="none" style={[styles.flag, { position: 'absolute', left: x - 40, top: y - 10, width: 80, textAlign: 'center' }]}>{label}</Text>;
}

function Badge({ x, y, on, size, glow, children }: { x?: number; y?: number; on: boolean; size: number; glow?: boolean; children: React.ReactNode }) {
  return (
    <View pointerEvents={x === undefined ? 'auto' : 'none'} style={[styles.badge, { width: size, height: size, borderRadius: size / 2 },
      x !== undefined && { position: 'absolute', left: x - size / 2, top: y! - size / 2 },
      on && { backgroundColor: colors.gold, borderColor: '#FFF2C2', shadowColor: colors.gold, shadowOpacity: 0.7, shadowRadius: 12 },
      glow && { shadowColor: colors.gold, shadowOpacity: 0.9, shadowRadius: 14, shadowOffset: { width: 0, height: 0 } }]}>
      {children}
    </View>
  );
}

const StarIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24"><Path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill={color} /></Svg>
);
const ChestIcon = ({ open }: { open: boolean }) => (
  <Svg width={34} height={30} viewBox="0 0 24 22">
    <Rect x="2" y="8" width="20" height="12" rx="2" fill="#8B5A2B" />
    <Path d="M2 10V7a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v3z" fill={open ? '#5F3C1A' : '#A86E35'} />
    <Rect x="2" y="10" width="20" height="2.5" fill="#FFC94A" /><Rect x="10" y="9" width="4" height="6" rx="1" fill="#FFF2C2" />
  </Svg>
);
const TowerIcon = ({ fill }: { fill: string }) => (
  <Svg width={58} height={64} viewBox="0 0 40 44">
    <Path d="M8 40h24v-4H8zM11 36h18l-2-14h-14z" fill={fill} />
    <Path d="M9 22h22v-8h-4v4h-4v-4h-6v4h-4v-4H9z" fill={fill} />
    <Rect x="17" y="27" width="6" height="9" rx="3" fill="#1E1B2E" />
    <Path d="M20 2v10" stroke="#fff" strokeWidth={2} /><Path d="M20 2l9 3-9 3z" fill="#F0605D" />
  </Svg>
);

const styles = StyleSheet.create({
  flag: { fontFamily: fonts.display, fontSize: 12, color: colors.fg, backgroundColor: 'rgba(15,13,22,0.8)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  badge: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#2E2A3D', borderWidth: 3, borderColor: 'rgba(255,255,255,0.25)', borderBottomWidth: 6 },
  shadow: { position: 'absolute', width: 46, height: 10, borderRadius: 23, backgroundColor: 'rgba(0,0,0,0.35)' },
  pill: { position: 'absolute', right: 12, top: 6, fontFamily: fonts.bodyBold, fontSize: 13, color: '#FFE7A3', backgroundColor: 'rgba(15,13,22,0.75)', borderWidth: 1, borderColor: 'rgba(255,201,74,0.35)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, overflow: 'hidden' },
});
