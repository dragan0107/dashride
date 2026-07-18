import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/ThemeProvider';

interface AltimeterProps {
  altitudeMeters: number | null;
  unitLabel: string;
  displayValue: number | null;
}

export function Altimeter({
  altitudeMeters,
  unitLabel,
  displayValue,
}: AltimeterProps) {
  const { colors, fonts } = useAppTheme();
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fade.setValue(0.55);
    Animated.timing(fade, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [altitudeMeters, fade]);

  const shown =
    displayValue == null || !Number.isFinite(displayValue)
      ? '—'
      : Math.round(displayValue).toLocaleString();

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.label,
          { color: colors.textSecondary, fontFamily: fonts.bodyMedium },
        ]}>
        Altitude
      </Text>
      <Animated.Text
        style={[
          styles.value,
          {
            color: colors.text,
            fontFamily: fonts.display,
            opacity: fade,
          },
        ]}>
        {shown}
      </Animated.Text>
      <Text
        style={[
          styles.unit,
          { color: colors.accent, fontFamily: fonts.bodyMedium },
        ]}>
        {unitLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 4,
    minWidth: 120,
  },
  label: {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 36,
    letterSpacing: -1,
  },
  unit: {
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
