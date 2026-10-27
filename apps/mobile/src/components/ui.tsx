import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameButton } from './GameButton';
import { Memo, type Mood } from './Memo';
import { colors, fonts } from '@/lib/theme';

/** Texte avec **gras** (les coups dans les explications de Memo). */
export function Rich({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  return (
    <Text style={style}>
      {text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
        part.startsWith('**') ? <Text key={i} style={{ fontFamily: fonts.bodyBold, color: colors.fg }}>{part.slice(2, -2)}</Text> : part)}
    </Text>
  );
}

/** Colonne centrée (480 px max sur le web, comme l'app mobile). */
export function Column({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[{ flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center' }, style]}>{children}</View>;
}

export interface SheetSpec {
  bad: boolean; title: string; text: string; note?: string; mood: Mood;
  buttons: { label: string; variant?: 'cta' | 'plain'; onPress: () => void; testID?: string }[];
}

/* Retour après un coup : fond neutre, seul le liseré du haut et la pastille sont colorés. */
export function Sheet({ spec }: { spec: SheetSpec }) {
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(1)).current;
  useEffect(() => { y.setValue(1); Animated.spring(y, { toValue: 0, friction: 7, tension: 70, useNativeDriver: false }).start(); }, [spec, y]);
  const tint = spec.bad ? colors.bad : colors.good;
  return (
    <Animated.View accessibilityLiveRegion="polite" style={[styles.sheet, { borderTopColor: tint, paddingBottom: Math.max(22, insets.bottom + 12),
      transform: [{ translateY: y.interpolate({ inputRange: [0, 1], outputRange: [0, 400] }) }] }]}>
      <View style={styles.sheetMemo}><Memo mood={spec.mood} size={90} /></View>
      <View style={styles.sheetHead}>
        <View style={[styles.badge, { backgroundColor: tint }]}>
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path d={spec.bad ? 'M6 6l12 12M18 6 6 18' : 'M5 12.5l4.5 4.5L19 7.5'} fill="none" stroke={spec.bad ? '#fff' : '#08331A'} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
        <Text style={styles.sheetTitle}>{spec.title}</Text>
      </View>
      <Rich text={spec.text} style={styles.sheetText} />
      {!!spec.note && <Text style={styles.sheetNote}>{spec.note}</Text>}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {spec.buttons.map((b) => <GameButton key={b.label} label={b.label} variant={b.variant ?? 'cta'} onPress={b.onPress} style={{ flex: 1 }} testID={b.testID} />)}
      </View>
    </Animated.View>
  );
}

/** Petite apparition (bulles, Memo de fin de séance). */
export function Pop({ k, children, style }: { k: string | number; children: ReactNode; style?: object }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { v.setValue(0); Animated.timing(v, { toValue: 1, duration: 350, easing: Easing.out(Easing.back(1.5)), useNativeDriver: false }).start(); }, [k, v]);
  return <Animated.View style={[style, { opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }] }]}>{children}</Animated.View>;
}

export function Stat({ label, value, color = colors.fg }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

export const Icons = {
  flame: (c: string) => <Svg width={20} height={20} viewBox="0 0 24 24"><Path d="M12.5 2c.6 3.6 5.5 5.6 5.5 11a6 6 0 0 1-12 0c0-2.6 1.3-4.4 2.6-5.4.1 2 1.1 3.3 2.4 3.6-.6-3.3.1-6.6 1.5-9.2z" fill={c} /></Svg>,
  bolt: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24"><Path d="M13.5 2 4 14h7l-1.5 8L19 10h-7z" fill={c} /></Svg>,
  gem: (c: string) => <Svg width={18} height={18} viewBox="0 0 24 24"><Path d="M6 3h12l4 6-10 12L2 9z" fill={c} /></Svg>,
  play: (c: string) => <Svg width={40} height={40} viewBox="0 0 24 24"><Path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill={c} /></Svg>,
  close: (c: string) => <Svg width={26} height={26} viewBox="0 0 24 24"><Path d="M6 6l12 12M18 6 6 18" fill="none" stroke={c} strokeWidth={2.8} strokeLinecap="round" /></Svg>,
  bulb: (c: string) => <Svg width={20} height={20} viewBox="0 0 24 24"><Path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /></Svg>,
  eye: (c: string) => <Svg width={20} height={20} viewBox="0 0 24 24"><Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="12" cy="12" r="3" fill="none" stroke={c} strokeWidth={2.2} /></Svg>,
  info: (c: string) => <Svg width={22} height={22} viewBox="0 0 24 24"><Circle cx="12" cy="12" r="9" fill="none" stroke={c} strokeWidth={2.2} /><Path d="M12 11v6M12 7.5v.5" stroke={c} strokeWidth={2.4} strokeLinecap="round" /></Svg>,
};

const styles = StyleSheet.create({
  sheet: { width: '100%', maxWidth: 480, backgroundColor: colors.surface, borderTopWidth: 4, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, gap: 10, shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 30, shadowOffset: { width: 0, height: -12 }, elevation: 12 },
  sheetMemo: { position: 'absolute', right: 12, top: -78 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 90 },
  badge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { fontFamily: fonts.display, fontSize: 21, color: colors.fg, flexShrink: 1 },
  sheetText: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.fg },
  stat: { flex: 1, borderWidth: 2, borderColor: colors.line, borderRadius: 16, overflow: 'hidden', alignItems: 'stretch' },
  statLabel: { fontFamily: fonts.bodyBold, fontSize: 12, textTransform: 'uppercase', textAlign: 'center', paddingVertical: 4, backgroundColor: colors.surface2, color: colors.muted },
  statValue: { fontFamily: fonts.displayBold, fontSize: 24, textAlign: 'center', paddingVertical: 10 },
  sheetNote: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
});
