import { tileMastered, tileSeen, worldUnlocked } from '@gambit/core';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Column, CourseSwitch, Icons } from '@/components/ui';
import { Sky, WorldMap } from '@/components/WorldMap';
import { COURSES } from '@/lib/content';
import { usePlay } from '@/lib/play';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

/* Accueil : la carte du monde. Memo avance sur le chemin à chaque position apprise, recule à chaque erreur. */
export default function MapScreen() {
  const store = useStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { P, wi, wm, steps, total, chestOpen, bossDone, ring } = usePlay();
  const course = COURSES[store.course];

  const [focused, setFocused] = useState(false);
  useFocusEffect(useCallback(() => { setFocused(true); return () => setFocused(false); }, []));
  const setWorld = (w: number) => store.update((p) => { p.world = w; });
  const mastered = wm.tiles.filter((t) => tileMastered(P, t)).length;
  const started = wm.tiles.filter((t) => tileSeen(P, t) && !tileMastered(P, t)).length;

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
          </View>
          <CourseSwitch />
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

        <WorldMap key={`${store.course}-${wi}`} steps={steps} total={total} shownFrom={P.shown[wi] ?? steps} active={focused}
          chestOpen={chestOpen} bossDone={bossDone} unlock={store.unlock}
          onChest={() => router.push('/coffre')} onGoal={() => router.push('/session?boss=1')}
          onShown={(s) => store.update((p) => { p.shown[wi] = s; })} />

      </Column>

    </View>
  );
}

const styles = StyleSheet.create({
  hud: { marginHorizontal: 10, paddingHorizontal: 12, paddingBottom: 10, backgroundColor: 'rgba(15,13,22,0.9)', borderBottomLeftRadius: 22, borderBottomRightRadius: 22, gap: 10, zIndex: 2 },
  hudTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  brand: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.fg },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chipText: { fontFamily: fonts.display, fontSize: 16 },
  worlds: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  worldChip: { borderWidth: 2, borderColor: colors.line, backgroundColor: colors.bg2, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  worldOn: { borderColor: colors.gold, backgroundColor: colors.surface2 },
  worldText: { fontFamily: fonts.display, fontSize: 14, color: colors.muted },
  worldTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.muted },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bar: { flex: 1, height: 10, borderRadius: 999, backgroundColor: colors.surface2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999, backgroundColor: colors.gold },
  barText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.muted },
});
