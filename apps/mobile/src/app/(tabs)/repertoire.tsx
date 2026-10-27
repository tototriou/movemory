import { buildWorld, levelOf, MAX_LEVEL, tileMastered, worldUnlocked, type Tile } from '@gambit/core';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Column, CourseSwitch } from '@/components/ui';
import { COURSES } from '@/lib/content';
import { fr } from '@/lib/notation';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

/** « 1.e4 e5 2.Cf3 Cc6 3.Fc4 » : la tranche de la ligne travaillée dans le monde. */
const movesText = (t: Tile) => t.moves.slice(0, t.to).map((m, i) => (i % 2 === 0 ? `${i / 2 + 1}.${fr(m.san)}` : fr(m.san))).join(' ');

/* Mon répertoire : chaque monde, ses lignes et leur maîtrise. */
export default function RepertoireScreen() {
  const store = useStore();
  const insets = useSafeAreaInsets();
  const course = COURSES[store.course];
  const P = store.progress[store.course];
  const worlds = useMemo(() => course.mondes.map((_, i) => buildWorld(course, i)), [course]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Column>
        <ScrollView contentContainerStyle={[styles.wrap, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.h1}>Mon répertoire</Text>
          <CourseSwitch />
          <Text style={styles.intro}>{course.nom} · {course.lignes.filter((l) => !l.reserve).length} lignes, réparties en {course.mondes.length} mondes de plus en plus profonds.</Text>

          {worlds.map((wm) => {
            const open = worldUnlocked(P, wm.index) || store.unlock;
            const done = wm.tiles.filter((t) => tileMastered(P, t)).length;
            return (
              <View key={wm.index} style={[styles.world, !open && { opacity: 0.55 }]}>
                <View style={styles.worldHead}>
                  <Text style={styles.worldTitle}>{open ? '' : '🔒 '}Monde {wm.index + 1} · {wm.world.titre}{P.boss[wm.index] ? ' ✓' : ''}</Text>
                  <Text style={styles.worldMeta}>{wm.world.profondeur} coups · {done}/{wm.tiles.length}</Text>
                </View>
                {wm.tiles.map((t) => {
                  const pts = t.cards.reduce((n, k) => n + Math.min(levelOf(P, k), MAX_LEVEL), 0);
                  const pct = Math.round((pts / Math.max(1, t.cards.length * MAX_LEVEL)) * 100);
                  const mastered = t.cards.filter((k) => levelOf(P, k) >= MAX_LEVEL).length;
                  return (
                    <View key={t.id} style={styles.line}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.lineName}>{t.name}</Text>
                          <Text style={styles.lineMoves}>{movesText(t)}</Text>
                        </View>
                        {t.punish ? <Text style={[styles.tag, styles.tagPunish]}>⚔ à punir</Text>
                          : t.deviation ? <Text style={styles.tag}>↪ déviation</Text> : null}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={styles.bar}><View style={[styles.barFill, { width: `${pct}%`, backgroundColor: pct === 100 ? colors.good : colors.gold }]} /></View>
                        <Text style={styles.pct}>{pct} %</Text>
                      </View>
                      <Text style={styles.count}>{mastered}/{t.cards.length} coups maîtrisés</Text>
                    </View>
                  );
                })}
              </View>
            );
          })}

          <View style={styles.add}>
            <Text style={styles.addText}>＋ Ajouter une ouverture</Text>
            <Text style={styles.addSoon}>Bientôt : le catalogue des ouvertures</Text>
          </View>
        </ScrollView>
      </Column>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 14, paddingBottom: 24 },
  h1: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.fg },
  intro: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted },
  world: { gap: 8 },
  worldHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginTop: 4 },
  worldTitle: { fontFamily: fonts.display, fontSize: 17, color: colors.fg, flexShrink: 1 },
  worldMeta: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.gold },
  line: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, gap: 8, borderBottomWidth: 4, borderBottomColor: colors.edge },
  lineName: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.fg },
  lineMoves: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2 },
  tag: { fontFamily: fonts.bodyBold, fontSize: 12, color: '#E6E4EE', backgroundColor: colors.surface2, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, overflow: 'hidden' },
  tagPunish: { backgroundColor: '#4A2430', color: '#FFB4A5' },
  bar: { flex: 1, height: 10, borderRadius: 999, backgroundColor: colors.surface2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  pct: { fontFamily: fonts.bodyBold, fontSize: 13, color: '#E6E4EE', minWidth: 42, textAlign: 'right' },
  count: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.muted },
  add: { alignItems: 'center', gap: 2, borderWidth: 2, borderStyle: 'dashed', borderColor: '#57536B', borderRadius: 16, padding: 13, marginTop: 4 },
  addText: { fontFamily: fonts.bodyBold, fontSize: 16, color: '#E6E4EE' },
  addSoon: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
});
