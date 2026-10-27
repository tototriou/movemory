import { useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameButton } from '@/components/GameButton';
import { Memo } from '@/components/Memo';
import { Column, Icons } from '@/components/ui';
import { COURSE_LABELS } from '@/lib/content';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

const CREDITS: { title: string; text: string; url: string }[] = [
  { title: 'Movemory', text: 'Code source libre sous licence GPL-3.0.', url: 'https://github.com/tototriou/movemory' },
  { title: 'Explications de Memo', text: 'Adaptées de Wikibooks — Chess Opening Theory, sous licence CC BY-SA 4.0.', url: 'https://en.wikibooks.org/wiki/Chess_Opening_Theory' },
  { title: 'Noms des ouvertures', text: 'lichess-org/chess-openings (CC0).', url: 'https://github.com/lichess-org/chess-openings' },
  { title: 'Vérification des lignes', text: 'Stockfish (GPL-3.0).', url: 'https://stockfishchess.org' },
  { title: 'Pièces', text: '« cburnett » de Colin M.L. Burnett (GPLv2+).', url: 'https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces' },
  { title: 'Règles des échecs', text: 'chess.js (BSD-2).', url: 'https://github.com/jhlywa/chess.js' },
  { title: 'Polices', text: 'Fredoka et Nunito (SIL Open Font License).', url: 'https://fonts.google.com' },
];

export default function Credits() {
  const store = useStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Column>
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top + 10, paddingBottom: insets.bottom + 24, gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} accessibilityRole="button" accessibilityLabel="Retour" style={{ padding: 8 }}>{Icons.close(colors.muted)}</Pressable>
            <Text style={styles.h1}>Réglages et crédits</Text>
          </View>

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

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Memo mood="content" size={64} />
            <Text style={[styles.text, { flex: 1 }]}>Movemory est gratuit et libre. Merci à celles et ceux qui partagent leurs connaissances et leurs outils !</Text>
          </View>
          {CREDITS.map((c) => (
            <Pressable key={c.title} onPress={() => Linking.openURL(c.url)} accessibilityRole="link" style={styles.card}>
              <Text style={styles.title}>{c.title}</Text>
              <Text style={styles.text}>{c.text}</Text>
            </Pressable>
          ))}
          <Text style={[styles.text, { fontSize: 12 }]}>Movemory et Memo sont les noms et la mascotte du projet. Movemory n'est pas affilié à Chess.com ni à Lichess.</Text>
        </ScrollView>
      </Column>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.fg },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontFamily: fonts.display, fontSize: 17, color: colors.fg },
  text: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted },
});
