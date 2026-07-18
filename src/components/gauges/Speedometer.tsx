import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useAppTheme } from '@/src/theme/ThemeProvider';

interface SpeedometerProps {
  speed: number;
  unitLabel: string;
  maxSpeed?: number;
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polar(cx, cy, r, endAngle);
  const end = polar(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function Speedometer({
  speed,
  unitLabel,
  maxSpeed = 180,
}: SpeedometerProps) {
  const { colors, fonts } = useAppTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(1, Math.max(0, speed / maxSpeed)),
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [speed, maxSpeed, anim]);

  const size = 280;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 135;
  const sweep = 270;
  const progress = Math.min(1, Math.max(0, speed / maxSpeed));
  const endAngle = startAngle + sweep * progress;

  const display = Number.isFinite(speed) ? Math.round(speed) : 0;

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        <Path
          d={describeArc(cx, cy, r, startAngle, startAngle + sweep)}
          stroke={colors.gaugeTrack}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
        />
        {progress > 0.002 ? (
          <Path
            d={describeArc(cx, cy, r, startAngle, endAngle)}
            stroke={colors.gaugeFill}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
          />
        ) : null}
        <Circle cx={cx} cy={cy} r={r - 28} fill={colors.backgroundSecondary} />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text
          style={[
            styles.value,
            { color: colors.text, fontFamily: fonts.display },
          ]}>
          {display}
        </Text>
        <Text
          style={[
            styles.unit,
            { color: colors.textSecondary, fontFamily: fonts.bodyMedium },
          ]}>
          {unitLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 72,
    letterSpacing: -2,
    lineHeight: 78,
  },
  unit: {
    fontSize: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});
