import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GameButton } from '@/components/GameButton';
import { Memo } from '@/components/Memo';
import { Column, Pop, Stat } from '@/components/ui';
import { usePlay } from '@/lib/play';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

/* Coffre de mi-chemin : 20 gemmes, une seule fois par monde. */
export default function ChestScreen() {
  const store = useStore();
  const router = useRouter();
  const { P, wi, ring } = usePlay();
  const [gained] = useState(() => !store.get().chest[wi]);
  useEffect(() => {
    if (!store.get().chest[wi]) store.update((p) => { p.chest[wi] = true; p.gems += 20; });
  }, [store, wi]);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Column style={{ alignItems: 'center', justifyContent: 'center', gap: 18, padding: 20 }}>
        <Pop k="chest"><Memo mood="bravo" size={140} /></Pop>
        <Text style={styles.h1} testID="end-title">{gained ? 'Coffre ouvert !' : 'Coffre déjà ouvert'}</Text>
        <Text style={styles.p}>{gained ? '+20 gemmes. ' : ''}Plus tard, les gemmes serviront à habiller Memo (chapeaux, lunettes, écharpes…).</Text>
        <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch' }}>
          <Stat label="Gemmes" value={gained ? '+20' : '0'} color={colors.hint} />
          <Stat label="Total" value={String(P.gems)} />
          <Stat label="Chemin" value={`${Math.round(ring * 100)} %`} />
        </View>
        <GameButton variant="cta" label="Continuer" testID="end-continue" style={{ alignSelf: 'stretch' }}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      </Column>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: fonts.displayBold, fontSize: 30, color: colors.gold, textAlign: 'center' },
  p: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.muted, textAlign: 'center', maxWidth: 320 },
});
