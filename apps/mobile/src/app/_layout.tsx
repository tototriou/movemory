import { Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

import { StoreProvider, useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Root() {
  const [fontsLoaded, fontError] = useFonts({ Fredoka_600SemiBold, Fredoka_700Bold, Nunito_700Bold, Nunito_800ExtraBold });
  const { ready } = useStore();
  const go = (fontsLoaded || !!fontError) && ready;
  useEffect(() => { if (go) SplashScreen.hideAsync().catch(() => {}); }, [go]);
  if (!go) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade' }} />
    </>
  );
}

export default function Layout() {
  return (
    <StoreProvider>
      <Root />
    </StoreProvider>
  );
}
