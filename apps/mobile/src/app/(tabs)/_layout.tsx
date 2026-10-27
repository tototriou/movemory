import { TabList, Tabs, TabSlot, TabTrigger, type TabListProps, type TabTriggerSlotProps } from 'expo-router/ui';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { GameButton } from '@/components/GameButton';
import { Icons } from '@/components/ui';
import { usePlay } from '@/lib/play';
import { colors, fonts } from '@/lib/theme';

/* Menu principal, toujours visible en bas des écrans (sauf pendant une séance) ; au centre, ▶ lance la révision. */
const ICONS: Record<string, (c: string) => ReactNode> = {
  index: (c) => <Path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" stroke={c} />,
  repertoire: (c) => <><Path d="M4 5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2z" stroke={c} /><Path d="M4 20a2 2 0 0 0 2 1h14v-3" stroke={c} /></>,
  parties: (c) => <Path d="M4 6h16M4 12h16M4 18h10" stroke={c} />,
  profil: (c) => <><Circle cx="12" cy="8" r="4" stroke={c} /><Path d="M4 21a8 8 0 0 1 16 0" stroke={c} /></>,
};

type TabButtonProps = TabTriggerSlotProps & { icon: string; label: string };
function TabButton({ icon, label, isFocused, ref, ...props }: TabButtonProps) {
  // les types d'expo-router/ui déclarent une ref vers le composant View plutôt que vers son instance
  return (
    <Pressable ref={ref as never} {...props} accessibilityRole="tab" accessibilityState={{ selected: !!isFocused }} accessibilityLabel={label} style={styles.tab}>
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        {ICONS[icon]!(isFocused ? colors.accent : colors.muted)}
      </Svg>
      <Text style={[styles.label, isFocused && { color: colors.fg }]}>{label}</Text>
    </Pressable>
  );
}

/** Gros bouton central : la prochaine étape du monde (séance, coffre, défi final, monde suivant). */
function PlayButton() {
  const { label, play, ring } = usePlay();
  const R = 37, C = 2 * Math.PI * R;
  return (
    <View style={styles.playCol}>
      <View style={styles.playWrap}>
        <Svg width={84} height={84} style={StyleSheet.absoluteFill}>
          <Circle cx={42} cy={42} r={R} stroke={colors.surface2} strokeWidth={6} fill={colors.bg2} />
          <Circle cx={42} cy={42} r={R} stroke={colors.gold} strokeWidth={6} fill="none" strokeLinecap="round"
            strokeDasharray={`${C * ring} ${C}`} transform="rotate(-90 42 42)" />
        </Svg>
        <GameButton variant="cta" round={66} icon={Icons.play('#fff', 32)} label={label} onPress={play} testID="play" />
      </View>
      <Text style={[styles.label, { color: colors.gold }]} numberOfLines={1} testID="play-label">{label}</Text>
    </View>
  );
}

function Bar({ children, style: _style, ...props }: TabListProps) {
  const insets = useSafeAreaInsets();
  return (
    <View {...props} style={[styles.bar, { paddingBottom: Math.max(12, insets.bottom + 4) }]} accessibilityRole="tablist" accessibilityLabel="Navigation principale">
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs style={{ flex: 1, backgroundColor: colors.bg }}>
      <TabSlot style={{ flex: 1 }} />
      {/* les onglets doivent être enfants directs de la liste pour qu'expo-router/ui les trouve */}
      <TabList asChild>
        <Bar>
          <TabTrigger name="index" href="/" asChild><TabButton icon="index" label="Accueil" /></TabTrigger>
          <TabTrigger name="repertoire" href="/repertoire" asChild><TabButton icon="repertoire" label="Répertoire" /></TabTrigger>
          <PlayButton />
          <TabTrigger name="parties" href="/parties" asChild><TabButton icon="parties" label="Parties" /></TabTrigger>
          <TabTrigger name="profil" href="/profil" asChild><TabButton icon="profil" label="Profil" /></TabTrigger>
        </Bar>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.bg2, borderTopWidth: 1, borderTopColor: colors.surface2, paddingTop: 10, paddingHorizontal: 6 },
  inner: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', width: '100%', maxWidth: 480, alignSelf: 'center' },
  playCol: { alignItems: 'center', gap: 3, width: 90, marginTop: -40 },
  playWrap: { width: 84, height: 84, alignItems: 'center', justifyContent: 'center' },
  tab: { alignItems: 'center', gap: 3, minWidth: 60, paddingVertical: 2 },
  label: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.muted },
});
