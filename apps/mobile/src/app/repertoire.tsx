import { STARTER_REPERTOIRE } from '@gambit/core';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing, TopTabInset } from '@/constants/theme';

// TODO: choix des ouvertures parmi data/openings.json + répertoire perso persisté.
export default function RepertoireScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Mon répertoire</ThemedText>
          {STARTER_REPERTOIRE.map((line) => (
            <ThemedView key={line.id} type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">
                {line.eco} · {line.name} ({line.side === 'w' ? 'Blancs' : 'Noirs'})
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {line.moves.join(' ')}
              </ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: { flex: 1, maxWidth: MaxContentWidth, paddingBottom: BottomTabInset },
  content: { padding: Spacing.four, paddingTop: TopTabInset + Spacing.four, gap: Spacing.three },
  card: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.one },
});
