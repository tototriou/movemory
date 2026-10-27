import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts } from '@/lib/theme';

type Variant = 'cta' | 'gold' | 'ghost' | 'plain';
const SKIN: Record<Variant, { bg: string; edge: string; fg: string }> = {
  cta: { bg: colors.accent, edge: colors.accentEdge, fg: colors.fg },
  gold: { bg: colors.gold, edge: colors.goldEdge, fg: '#3A2A05' },
  ghost: { bg: 'transparent', edge: colors.line, fg: colors.fg },
  plain: { bg: colors.surface2, edge: colors.edge, fg: colors.fg },
};

/* Bouton « 3D » : une tranche plus sombre dessous, qui s'écrase quand on appuie. */
export function GameButton({ label, icon, variant = 'plain', onPress, disabled, style, round, testID }: {
  label?: string; icon?: ReactNode; variant?: Variant; onPress?: () => void; disabled?: boolean;
  style?: StyleProp<ViewStyle>; round?: number; testID?: string;
}) {
  const s = SKIN[variant];
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} testID={testID}
      style={[{ opacity: disabled ? 0.45 : 1 }, style]}>
      {({ pressed }) => (
        <View style={[styles.base, round ? { width: round, height: round, borderRadius: round / 2, paddingHorizontal: 0 } : null,
          { backgroundColor: s.bg, borderBottomColor: s.edge, borderBottomWidth: pressed ? 2 : 5, marginTop: pressed ? 3 : 0 },
          variant === 'ghost' && { borderWidth: 2, borderColor: colors.line }]}>
          {variant !== 'ghost' && <View pointerEvents="none" style={[styles.gloss, round ? { borderRadius: round / 2 } : null]} />}
          {icon}
          {!!label && !round && (
            <Text style={[styles.label, { color: s.fg }, variant === 'cta' && styles.cta]} numberOfLines={1}>{label}</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 18, overflow: 'hidden' },
  gloss: { position: 'absolute', left: 0, right: 0, top: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.13)' },
  label: { fontFamily: fonts.display, fontSize: 18 },
  cta: { textTransform: 'uppercase', letterSpacing: 0.8, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 0 },
});
