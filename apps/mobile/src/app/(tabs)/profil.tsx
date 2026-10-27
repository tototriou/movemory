import { buildWorld, tileMastered } from '@gambit/core';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameButton } from '@/components/GameButton';
import { Memo } from '@/components/Memo';
import { Column, Stat } from '@/components/ui';
import { COURSE_LABELS, COURSES, type CourseKey } from '@/lib/content';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

/* Profil : statistiques, réglages, crédits. */
export default function ProfilScreen() {
  const store = useStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const keys = Object.keys(COURSES) as CourseKey[];
  const xp = keys.reduce((n, k) => n + store.progress[k].xp, 0);
  const gems = keys.reduce((n, k) => n + store.progress[k].gems, 0);
  const lines = keys.reduce((n, k) => {
    const c = COURSES[k], p = store.progress[k];
    const ids = new Set(c.mondes.flatMap((_, i) => buildWorld(c, i).tiles.filter((t) => tileMastered(p, t)).map((t) => t.id)));
    return n + ids.size;
  }, 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Column>
        <ScrollView contentContainerStyle={[styles.wrap, { paddingTop: insets.top + 16 }]}>
          <View style={styles.hero}>
            <Memo mood="bravo" size={88} />
            <View style={{ flex: 1 }}>
              <Text style={styles.h1}>Mon profil</Text>
              <Text style={styles.text}>{store.streak.days ? `${store.streak.days} jour${store.streak.days > 1 ? 's' : ''} d’affilée, continuez !` : 'Faites une séance aujourd’hui pour lancer votre série.'}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Stat label="XP" value={String(xp)} color={colors.gold} />
            <Stat label="Série" value={String(store.streak.days)} color="#FFB054" />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Stat label="Gemmes" value={String(gems)} color={colors.hint} />
            <Stat label="Lignes sues" value={String(lines)} color={colors.good} />
          </View>

          <Text style={styles.h2}>Réglages</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Mode test</Text>
                <Text style={styles.text}>Débloque tous les mondes, coffres et défis.</Text>
              </View>
              <Switch value={store.unlock} onValueChange={store.setUnlock} trackColor={{ true: colors.accent, false: colors.surface2 }} />
            </View>
            <GameButton variant="ghost" label={`Remettre à zéro : ${COURSE_LABELS[store.course]}`} onPress={store.reset} />
          </View>
          <GameButton label="Crédits et licences" onPress={() => router.push('/credits')} />
        </ScrollView>
      </Column>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 14, paddingBottom: 24 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  h1: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.fg },
  h2: { fontFamily: fonts.display, fontSize: 18, color: colors.fg, marginTop: 6 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontFamily: fonts.display, fontSize: 17, color: colors.fg },
  text: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted },
});
