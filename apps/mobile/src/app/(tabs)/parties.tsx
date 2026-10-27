import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameButton } from '@/components/GameButton';
import { Memo } from '@/components/Memo';
import { Column } from '@/components/ui';
import { colors, fonts } from '@/lib/theme';

const STEPS = [
  ['1', 'Votre pseudo Chess.com', 'Rien d’autre : pas de mot de passe, les parties sont publiques.'],
  ['2', 'Analyse sur votre téléphone', 'Stockfish repère où vous avez quitté votre répertoire, même hors-ligne.'],
  ['3', 'Des exercices sur mesure', 'Chaque écart devient une position à rejouer dans vos séances.'],
];

/* Mes parties : import Chess.com (à venir). */
export default function PartiesScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Column>
        <ScrollView contentContainerStyle={[styles.wrap, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.h1}>Mes parties</Text>
          <View style={styles.hero}>
            <Memo mood="reflechit" size={96} />
            <Text style={styles.heroText}>Bientôt, je pourrai regarder vos vraies parties et vous montrer où votre ouverture a déraillé.</Text>
          </View>
          {STEPS.map(([n, title, text]) => (
            <View key={n} style={styles.step}>
              <Text style={styles.num}>{n}</Text>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.text}>{text}</Text>
              </View>
            </View>
          ))}
          <GameButton variant="cta" label="Connecter Chess.com" disabled />
          <Text style={[styles.text, { textAlign: 'center' }]}>En préparation. Movemory n’est pas affilié à Chess.com.</Text>
        </ScrollView>
      </Column>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 14, paddingBottom: 24 },
  h1: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.fg },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, padding: 14 },
  heroText: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 15, lineHeight: 21, color: colors.fg },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: colors.surface, borderRadius: 16, padding: 14 },
  num: { width: 30, height: 30, borderRadius: 15, textAlign: 'center', lineHeight: 30, fontFamily: fonts.displayBold, fontSize: 16, color: '#3A2A05', backgroundColor: colors.gold, overflow: 'hidden' },
  title: { fontFamily: fonts.display, fontSize: 17, color: colors.fg },
  text: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted },
});
