import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';

import { headingToCardinal } from '@/src/services/distance';
import { useAppTheme } from '@/src/theme/ThemeProvider';

interface CompassProps {
  heading: number | null;
  size?: number;
}

export function Compass({ heading, size = 140 }: CompassProps) {
  const { colors, fonts } = useAppTheme();
  const spin = useRef(new Animated.Value(0)).current;
  const safe = heading ?? 0;

  useEffect(() => {
    Animated.timing(spin, {
      toValue: safe,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [safe, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '-360deg'],
  });

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.label,
          { color: colors.textSecondary, fontFamily: fonts.bodyMedium },
        ]}>
        Compass
      </Text>
      <View style={{ width: size, height: size }}>
        <Animated.View
          style={{
            width: size,
            height: size,
            transform: [{ rotate }],
          }}>
          <Svg width={size} height={size}>
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              stroke={colors.gaugeTrack}
              strokeWidth={3}
              fill={colors.surface}
            />
            <Line
              x1={cx}
              y1={16}
              x2={cx}
              y2={30}
              stroke={colors.danger}
              strokeWidth={3}
              strokeLinecap="round"
            />
            <Line
              x1={cx}
              y1={size - 30}
              x2={cx}
              y2={size - 16}
              stroke={colors.textSecondary}
              strokeWidth={2}
            />
            <Line
              x1={16}
              y1={cy}
              x2={30}
              y2={cy}
              stroke={colors.textSecondary}
              strokeWidth={2}
            />
            <Line
              x1={size - 30}
              y1={cy}
              x2={size - 16}
              y2={cy}
              stroke={colors.textSecondary}
              strokeWidth={2}
            />
            <Polygon
              points={`${cx},${22} ${cx - 7},${42} ${cx + 7},${42}`}
              fill={colors.accent}
            />
            <Circle cx={cx} cy={cy} r={4} fill={colors.accent} />
          </Svg>
          <Text
            style={[
              styles.n,
              { color: colors.danger, fontFamily: fonts.bodyBold, left: cx - 6 },
            ]}>
            N
          </Text>
        </Animated.View>
      </View>
      <Text
        style={[
          styles.value,
          { color: colors.text, fontFamily: fonts.displayMedium },
        ]}>
        {heading == null ? '—' : `${Math.round(safe)}° ${headingToCardinal(safe)}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  n: {
    position: 'absolute',
    top: 44,
    fontSize: 12,
  },
  value: {
    fontSize: 18,
  },
});
