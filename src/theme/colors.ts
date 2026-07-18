import type { ResolvedTheme } from '@/src/types';

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentMuted: string;
  danger: string;
  success: string;
  gaugeTrack: string;
  gaugeFill: string;
  border: string;
  tabBar: string;
  overlay: string;
}

export const darkColors: ThemeColors = {
  background: '#0B1118',
  backgroundSecondary: '#121A24',
  surface: '#182231',
  text: '#E8F1F8',
  textSecondary: '#8FA3B8',
  accent: '#2DD4BF',
  accentMuted: '#1A4D48',
  danger: '#F87171',
  success: '#34D399',
  gaugeTrack: '#243041',
  gaugeFill: '#2DD4BF',
  border: '#243041',
  tabBar: '#0F1620',
  overlay: 'rgba(11, 17, 24, 0.72)',
};

export const nightColors: ThemeColors = {
  background: '#050303',
  backgroundSecondary: '#120A06',
  surface: '#1A100A',
  text: '#FFB454',
  textSecondary: '#A8733A',
  accent: '#FF8A1F',
  accentMuted: '#4A2A10',
  danger: '#FF6B4A',
  success: '#C48A3A',
  gaugeTrack: '#2A1A10',
  gaugeFill: '#FF8A1F',
  border: '#2A1A10',
  tabBar: '#0A0604',
  overlay: 'rgba(5, 3, 3, 0.8)',
};

export const lightColors: ThemeColors = {
  background: '#F4F7FA',
  backgroundSecondary: '#E8EEF4',
  surface: '#FFFFFF',
  text: '#0F1A24',
  textSecondary: '#5A6B7C',
  accent: '#0D9488',
  accentMuted: '#CCFBF1',
  danger: '#DC2626',
  success: '#059669',
  gaugeTrack: '#D5DEE8',
  gaugeFill: '#0D9488',
  border: '#D5DEE8',
  tabBar: '#FFFFFF',
  overlay: 'rgba(244, 247, 250, 0.8)',
};

export function getThemeColors(theme: ResolvedTheme): ThemeColors {
  if (theme === 'night') return nightColors;
  if (theme === 'light') return lightColors;
  return darkColors;
}

export const fonts = {
  display: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_500Medium',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
} as const;
