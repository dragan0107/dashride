import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/theme/ThemeProvider';

interface ScreenProps {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export function Screen({ children, style, padded = true }: ScreenProps) {
  const { colors, theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const gradient: [string, string, string] =
    theme === 'night'
      ? [colors.background, '#1A0C04', colors.background]
      : theme === 'light'
        ? [colors.background, '#DCE8F0', colors.background]
        : [colors.background, '#0E2A2A', colors.background];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.content,
          padded && {
            paddingTop: insets.top + 8,
            paddingHorizontal: 20,
            paddingBottom: 12,
          },
          style,
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
