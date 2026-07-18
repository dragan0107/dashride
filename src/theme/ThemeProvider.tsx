import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useSettingsStore } from '@/src/store/settingsStore';
import {
  fonts,
  getThemeColors,
  type ThemeColors,
} from '@/src/theme/colors';
import type { ResolvedTheme } from '@/src/types';

interface ThemeContextValue {
  theme: ResolvedTheme;
  colors: ThemeColors;
  fonts: typeof fonts;
  isNight: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const system = useSystemColorScheme();
  const preference = useSettingsStore((s) => s.themePreference);

  const theme: ResolvedTheme = useMemo(() => {
    if (preference === 'night') return 'night';
    if (preference === 'dark') return 'dark';
    // system
    return system === 'light' ? 'light' : 'dark';
  }, [preference, system]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      colors: getThemeColors(theme),
      fonts,
      isNight: theme === 'night',
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return ctx;
}
