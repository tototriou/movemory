import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Board } from '@/components/Board';
import { GameButton } from '@/components/GameButton';
import { Memo } from '@/components/Memo';
import { Column, Icons, Pop, Rich, Sheet, Stat } from '@/components/ui';
import { COURSES } from '@/lib/content';
import { moveLabel } from '@/lib/notation';
import { createRunner, initialUI, type EndData, type Runner, type SessionUI } from '@/lib/runner';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

/* Séance : une dizaine de questions sur l'échiquier, Memo commente, puis bilan et retour à la carte. */
export default function SessionScreen() {
  const { boss } = useLocalSearchParams<{ boss?: string }>();
  const isBoss = boss === '1';
  const store = useStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [ui, setUi] = useState<SessionUI>(() => initialUI(isBoss));
  const runner = useRef<Runner | null>(null);

  useEffect(() => {
    const exit = () => (router.canGoBack() ? router.back() : router.replace('/'));
    const r = createRunner({
      course: COURSES[store.course], boss: isBoss, store, exit,
      set: (patch) => setUi((u) => ({ ...u, ...(typeof patch === 'function' ? patch(u) : patch) })),
    });
    runner.current = r;
    r.start();
    if (Platform.OS === 'web') (globalThis as { __movemoryTest?: () => unknown }).__movemoryTest = () => r.peek();
    return () => r.stop();
    // une séance par montage de l'écran
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const boardSize = Math.max(240, Math.min(Math.min(width, 480) - 32, 420, height - insets.top - insets.bottom - 330));
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (ui.end) return <EndView end={ui.end} onClose={back} />;

  const side = runner.current?.orientation ?? COURSES[store.course].camp;
  const yourTurn = ui.canPlay && ui.history.length % 2 === (side === 'w' ? 0 : 1);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Column>
        <ScrollView contentContainerStyle={[styles.wrap, { paddingTop: insets.top + 10, paddingBottom: Math.max(20, insets.bottom + 10) }]} scrollEnabled={!ui.canPlay}>
          <View style={styles.top}>
            <Pressable onPress={() => runner.current?.quit()} accessibilityRole="button" accessibilityLabel="Quitter la séance" style={styles.iconBtn}>{Icons.close(colors.muted)}</Pressable>
            <MiniTrack frac={ui.frac} />
            <Combo n={ui.combo} />
          </View>

          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>{ui.eyebrow}</Text>
              <Text style={styles.name} numberOfLines={1}>{ui.title}</Text>
            </View>
            {!!ui.pill && <Text style={[styles.pill, ui.punish && styles.pillPunish]}>{ui.punish ? '⚔ ' : ''}{ui.pill}</Text>}
          </View>

          <View style={styles.coach}>
            <Memo mood={ui.say.mood} size={70} />
            {!!ui.say.text && (
              <Pop k={ui.say.id} style={styles.bubble}>
                <Text style={styles.who}>Memo</Text>
                <Rich text={ui.say.text} style={styles.bubbleText} />
              </Pop>
            )}
          </View>

          <View>
            <Board fen={ui.fen} orientation={side} size={boardSize} last={ui.last} moveId={ui.moveId} arrow={ui.arrow} hint={ui.hint} good={ui.good}
              interactive={ui.canPlay && !ui.sheet} onMove={(f, t) => runner.current?.onMove(f, t)} shakeKey={ui.shake} floats={ui.floats} />
          </View>

          <View style={styles.moves} accessibilityLabel="Coups joués">
            {ui.history.map((san, i) => (
              <Text key={i} style={[styles.move, ui.highlightLast && i === ui.history.length - 1 && styles.moveCur]}>{moveLabel(i, san)}</Text>
            ))}
            {yourTurn && <Text style={[styles.move, { color: colors.gold }]}>{moveLabel(ui.history.length, '?')}</Text>}
          </View>

          <View style={styles.actions}>
            <GameButton label="Indice" icon={Icons.bulb(colors.gold)} onPress={() => runner.current?.hint()} disabled={ui.boss} style={{ flex: 1 }} />
            <GameButton label="Solution" icon={Icons.eye(colors.hint)} onPress={() => runner.current?.solution()} disabled={ui.boss} style={{ flex: 1 }} />
          </View>
        </ScrollView>
      </Column>
      {ui.sheet && <View style={styles.sheetHost}><Sheet spec={ui.sheet} /></View>}
    </View>
  );
}

/** Avancée de Memo sur le chemin du monde, en miniature. */
function MiniTrack({ frac }: { frac: number }) {
  const v = useRef(new Animated.Value(frac)).current;
  useEffect(() => { Animated.timing(v, { toValue: frac, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: false }).start(); }, [frac, v]);
  const pct = v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.track} accessibilityRole="progressbar" accessibilityLabel="Avancée de Memo sur le chemin du monde">
      <Animated.View style={[styles.trackFill, { width: pct }]} />
      <Animated.View style={[styles.trackMemo, { left: pct }]}><Memo size={34} /></Animated.View>
    </View>
  );
}

function Combo({ n }: { n: number }) {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (n < 2) return;
    Animated.sequence([
      Animated.timing(v, { toValue: 1.5, duration: 200, useNativeDriver: false }),
      Animated.timing(v, { toValue: 1, duration: 300, useNativeDriver: false }),
    ]).start();
  }, [n, v]);
  return <Animated.Text style={[styles.combo, { transform: [{ scale: v }] }]} accessibilityLabel={`Combo ${n}`}>x{n}</Animated.Text>;
}

function EndView({ end, onClose }: { end: EndData; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, overflow: 'hidden' }}>
      {end.party && <Confetti />}
      <Column style={[styles.end, { paddingTop: insets.top + 40, paddingBottom: Math.max(24, insets.bottom + 12) }]}>
        <Pop k="end"><Memo mood="bravo" size={140} /></Pop>
        <Text style={styles.h1} testID="end-title">{end.title}</Text>
        {!!end.text && <Text style={styles.p}>{end.text}</Text>}
        <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch' }}>
          <Stat label="XP" value={`+${end.xp}`} color={colors.gold} />
          <Stat label="Précision" value={`${end.acc} %`} color={colors.good} />
          <Stat label="Erreurs" value={String(end.errors)} color={end.errors ? colors.bad : colors.fg} />
        </View>
        {end.pathPct !== null && (
          <View style={styles.mastery}>
            <Text style={styles.masteryTitle}>Chemin du monde</Text>
            <View style={styles.segBar}><View style={{ width: `${end.pathPct}%`, height: '100%', backgroundColor: colors.gold }} /></View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.masteryText}>Avancée</Text><Text style={styles.masteryText}>{end.pathPct} %</Text>
            </View>
          </View>
        )}
        <View style={{ flex: 1 }} />
        <GameButton variant="cta" label="Voir la carte" onPress={onClose} style={{ alignSelf: 'stretch' }} testID="end-continue" />
      </Column>
    </View>
  );
}

function Confetti() {
  const { height } = useWindowDimensions();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: false }));
    loop.start();
    return () => loop.stop();
  }, [v]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: 12 }, (_, i) => {
        const shift = (i * 0.37) % 1;
        const y = v.interpolate({ inputRange: [0, 1 - shift, 1 - shift + 0.0001, 1], outputRange: [shift * height, height, -20, shift * height - 20] });
        return (
          <Animated.View key={i} style={{ position: 'absolute', left: `${6 + i * 8}%`, width: 9, height: 14, borderRadius: 2,
            backgroundColor: ['#FFC94A', '#3DDC84', '#8FD3FF', '#F0605D', '#A78BFA'][i % 5],
            transform: [{ translateY: y }, { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${360 + i * 30}deg`] }) }] }} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, gap: 12, paddingHorizontal: 16 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 14, borderRadius: 999, backgroundColor: '#5A3A24', borderWidth: 3, borderColor: '#3A2416' },
  trackFill: { height: '100%', borderRadius: 999, backgroundColor: colors.gold },
  trackMemo: { position: 'absolute', top: -14, marginLeft: -17 },
  combo: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.gold, minWidth: 40, textAlign: 'right' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted },
  name: { fontFamily: fonts.display, fontSize: 20, color: colors.fg },
  pill: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.fg, backgroundColor: colors.surface2, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, overflow: 'hidden' },
  pillPunish: { backgroundColor: '#4A2430', color: '#FFB4A5' },
  coach: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', minHeight: 86 },
  bubble: { flex: 1, backgroundColor: colors.surface, borderTopLeftRadius: 4, borderTopRightRadius: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  who: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#7EE2A2' },
  bubbleText: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22, color: colors.fg, marginTop: 2 },
  moves: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, rowGap: 4, minHeight: 20 },
  move: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.muted },
  moveCur: { color: colors.fg, backgroundColor: colors.surface2, borderRadius: 6, paddingHorizontal: 6, overflow: 'hidden' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 'auto' },
  sheetHost: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, zIndex: 20, justifyContent: 'flex-end', alignItems: 'center', pointerEvents: 'box-none' },
  end: { alignItems: 'center', gap: 18, paddingHorizontal: 20 },
  h1: { fontFamily: fonts.displayBold, fontSize: 30, color: colors.gold, textAlign: 'center' },
  p: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.muted, textAlign: 'center', maxWidth: 340 },
  mastery: { alignSelf: 'stretch', backgroundColor: colors.surface, borderRadius: 18, padding: 14, gap: 8 },
  masteryTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.fg },
  masteryText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.fg },
  segBar: { height: 14, borderRadius: 999, overflow: 'hidden', backgroundColor: colors.surface2 },
});
