import { buildWorld, tileMastered, tileSeen, worldProgress, worldUnlocked } from '@gambit/core';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { GameButton } from '@/components/GameButton';
import { Memo } from '@/components/Memo';
import { Column, Icons, Pop, Stat } from '@/components/ui';
import { Sky, WorldMap } from '@/components/WorldMap';
import { COURSE_LABELS, COURSES, type CourseKey } from '@/lib/content';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

/* Accueil : la carte du monde. Memo avance sur le chemin à chaque position apprise, recule à chaque erreur. */
export default function MapScreen() {
  const store = useStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const course = COURSES[store.course];
  const P = store.progress[store.course];
  const wi = Math.min(P.world, course.mondes.length - 1);
  const wm = useMemo(() => buildWorld(course, wi), [course, wi]);
  const { steps, total } = worldProgress(P, wm);
  const chestOpen = !!P.chest[wi], bossDone = !!P.boss[wi];
  const nextWorld = course.mondes[wi + 1];

  const [focused, setFocused] = useState(false);
  useFocusEffect(useCallback(() => { setFocused(true); return () => setFocused(false); }, []));
  const [reward, setReward] = useState(false);

  const openChest = () => {
    if (!chestOpen) store.update((p) => { p.chest[wi] = true; p.gems += 20; });
    setReward(true);
  };
  const setWorld = (w: number) => store.update((p) => { p.world = w; });
  const play = () => {
    if (bossDone && nextWorld) return setWorld(wi + 1);
    if (steps >= total / 2 && !chestOpen) return openChest();
    if (steps >= total && !bossDone) return router.push('/session?boss=1');
    router.push('/session');
  };
  const playLabel = bossDone ? (nextWorld ? `Monde ${wi + 2} débloqué !` : 'Réviser') : steps >= total / 2 && !chestOpen ? 'Ouvrir le coffre' : steps >= total ? 'Défi final' : steps ? 'Continuer' : 'Commencer';
  const mastered = wm.tiles.filter((t) => tileMastered(P, t)).length;
  const started = wm.tiles.filter((t) => tileSeen(P, t) && !tileMastered(P, t)).length;
  const ring = steps / total;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Sky />
      <Column>
        <View style={[styles.hud, { paddingTop: insets.top + 12 }]}>
          <View style={styles.hudTop}>
            <Text style={styles.brand}>Movemory</Text>
            <View style={styles.chip} accessibilityLabel={`Série de ${store.streak.days} jours`}>{Icons.flame('#FFB054')}<Text style={[styles.chipText, { color: '#FFB054' }]}>{store.streak.days}</Text></View>
            <View style={styles.chip} accessibilityLabel={`${P.xp} points d'expérience`}>{Icons.bolt(colors.gold)}<Text style={[styles.chipText, { color: colors.gold }]} testID="xp">{P.xp} XP</Text></View>
            <View style={styles.chip} accessibilityLabel={`${P.gems} gemmes`}>{Icons.gem(colors.hint)}<Text style={[styles.chipText, { color: colors.hint }]}>{P.gems}</Text></View>
            <Pressable onPress={() => router.push('/credits')} accessibilityRole="button" accessibilityLabel="Réglages et crédits" hitSlop={10}>{Icons.info(colors.muted)}</Pressable>
          </View>
          <View style={styles.seg} accessibilityRole="tablist">
            {(Object.keys(COURSES) as CourseKey[]).map((k) => (
              <Pressable key={k} onPress={() => store.setCourse(k)} accessibilityRole="tab" accessibilityState={{ selected: k === store.course }}
                style={[styles.segBtn, k === store.course && styles.segOn]}>
                <Text style={[styles.segText, k === store.course && { color: colors.fg }]}>{COURSE_LABELS[k]}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.worlds}>
            {course.mondes.map((m, i) => {
              const open = worldUnlocked(P, i) || store.unlock;
              return (
                <Pressable key={m.numero} disabled={!open} onPress={() => setWorld(i)} accessibilityRole="button"
                  accessibilityLabel={`Monde ${i + 1}${open ? '' : ', verrouillé'}`} style={[styles.worldChip, i === wi && styles.worldOn, !open && { opacity: 0.5 }]}>
                  <Text style={[styles.worldText, i === wi && { color: colors.fg }]}>{open ? '' : '🔒 '}Monde {i + 1}{P.boss[i] ? ' ✓' : ''}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.worldTitle}>{wm.world.titre} · {wm.world.profondeur} coups · {wm.tiles.length} lignes{started ? ` (${started} en cours)` : ''}</Text>
          <View style={styles.barRow}>
            <View style={styles.bar}><View style={[styles.barFill, { width: `${ring * 100}%` }]} /></View>
            <Text style={styles.barText}>{mastered}/{wm.tiles.length} lignes</Text>
          </View>
        </View>

        <WorldMap key={`${store.course}-${wi}`} steps={steps} total={total} shownFrom={P.shown[wi] ?? steps} active={focused && !reward}
          chestOpen={chestOpen} bossDone={bossDone} unlock={store.unlock}
          onChest={openChest} onGoal={() => router.push('/session?boss=1')}
          onShown={(s) => store.update((p) => { p.shown[wi] = s; })} />

        <View style={[styles.foot, { paddingBottom: Math.max(16, insets.bottom + 8) }]}>
          <Text style={styles.playLabel} testID="play-label">{playLabel}</Text>
          <View style={styles.playWrap}>
            <Svg width={108} height={108} style={StyleSheet.absoluteFill}>
              <Circle cx={54} cy={54} r={50} stroke={colors.surface2} strokeWidth={8} fill="none" />
              <Circle cx={54} cy={54} r={50} stroke={colors.gold} strokeWidth={8} fill="none" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50 * ring} ${2 * Math.PI * 50}`} transform="rotate(-90 54 54)" />
            </Svg>
            <GameButton variant="cta" round={88} icon={Icons.play('#fff')} label={playLabel} onPress={play} testID="play" />
          </View>
        </View>
      </Column>

      {reward && (
        <View style={styles.overlay}>
          <Column style={{ alignItems: 'center', justifyContent: 'center', gap: 18, padding: 20 }}>
            <Pop k="chest"><Memo mood="bravo" size={140} /></Pop>
            <Text style={styles.h1}>Coffre ouvert !</Text>
            <Text style={styles.p}>+20 gemmes. Plus tard, elles serviront à habiller Memo (chapeaux, lunettes, écharpes…).</Text>
            <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch' }}>
              <Stat label="Gemmes" value="+20" color={colors.hint} />
              <Stat label="Total" value={String(P.gems)} />
              <Stat label="Chemin" value={`${Math.round(ring * 100)} %`} />
            </View>
            <GameButton variant="cta" label="Continuer" onPress={() => setReward(false)} style={{ alignSelf: 'stretch' }} />
          </Column>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hud: { marginHorizontal: 10, paddingHorizontal: 12, paddingBottom: 10, backgroundColor: 'rgba(15,13,22,0.9)', borderBottomLeftRadius: 22, borderBottomRightRadius: 22, gap: 10, zIndex: 2 },
  hudTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  brand: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.fg },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chipText: { fontFamily: fonts.display, fontSize: 16 },
  seg: { flexDirection: 'row', gap: 4, backgroundColor: colors.bg2, borderRadius: 12, padding: 4 },
  segBtn: { flex: 1, borderRadius: 9, paddingVertical: 8, alignItems: 'center' },
  segOn: { backgroundColor: colors.surface2 },
  segText: { fontFamily: fonts.display, fontSize: 14, color: colors.muted },
  worlds: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  worldChip: { borderWidth: 2, borderColor: colors.line, backgroundColor: colors.bg2, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  worldOn: { borderColor: colors.gold, backgroundColor: colors.surface2 },
  worldText: { fontFamily: fonts.display, fontSize: 14, color: colors.muted },
  worldTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.muted },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bar: { flex: 1, height: 10, borderRadius: 999, backgroundColor: colors.surface2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999, backgroundColor: colors.gold },
  barText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.muted },
  foot: { alignItems: 'center', gap: 10, paddingTop: 16 },
  playLabel: { fontFamily: fonts.display, fontSize: 15, backgroundColor: '#fff', color: colors.bg, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5, overflow: 'hidden', borderBottomWidth: 4, borderBottomColor: '#C9C3B8' },
  playWrap: { width: 108, height: 108, alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.bg, zIndex: 30 },
  h1: { fontFamily: fonts.displayBold, fontSize: 30, color: colors.gold, textAlign: 'center' },
  p: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.muted, textAlign: 'center', maxWidth: 320 },
});
