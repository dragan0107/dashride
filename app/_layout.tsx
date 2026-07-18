import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { LocationProvider } from '@/src/hooks/LocationProvider';
import {
  recoverOrphanedLocationUpdates,
} from '@/src/services/locationTask';
import { AppThemeProvider, useAppTheme } from '@/src/theme/ThemeProvider';

// Register background location task as early as possible
import '@/src/services/locationTask';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
  const [locationReady, setLocationReady] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    // Clear stale FGS location tasks before UI mounts — prevents native
    // crash loops after Android kills the app on permission changes.
    void recoverOrphanedLocationUpdates().finally(() => {
      if (cancelled) return;
      setLocationReady(true);
      SplashScreen.hideAsync();
    });
    return () => {
      cancelled = true;
    };
  }, [loaded]);

  if (!loaded || !locationReady) {
    return null;
  }

  return (
    <AppThemeProvider>
      <LocationProvider>
        <RootLayoutNav />
      </LocationProvider>
    </AppThemeProvider>
  );
}

function RootLayoutNav() {
  const { theme, colors } = useAppTheme();

  return (
    <>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
