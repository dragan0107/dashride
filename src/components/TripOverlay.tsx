import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { formatDuration } from '@/src/services/distance';
import {
  getTripElapsedMs,
  useTripStore,
} from '@/src/store/tripStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { formatDistance } from '@/src/utils/format';

export function TripOverlay() {
  const { colors, fonts } = useAppTheme();
  const router = useRouter();
  const units = useSettingsStore((s) => s.units);
  const trip = useTripStore();
  const [now, setNow] = useState(Date.now());

  const visible = trip.status === 'active' || trip.status === 'paused';

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [visible]);

  if (!visible) return null;

  const elapsed = getTripElapsedMs(trip, now);
  const distance = formatDistance(trip.distanceMeters, units);
  const recording = trip.status === 'active';

  return (
    <Pressable
      onPress={() => router.push('/trip')}
      accessibilityRole="button"
      accessibilityLabel={`Trip ${recording ? 'recording' : 'paused'}: ${distance.text} ${distance.label}, ${formatDuration(elapsed)}`}
      style={({ pressed }) => [
        styles.strip,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={styles.status}>
        <View
          style={[
            styles.dot,
            { backgroundColor: recording ? colors.danger : colors.textSecondary },
          ]}
        />
        <Text
          style={[
            styles.statusLabel,
            {
              color: recording ? colors.danger : colors.textSecondary,
              fontFamily: fonts.bodyBold,
            },
          ]}>
          {recording ? 'REC' : 'PAUSED'}
        </Text>
      </View>

      <View style={styles.stat}>
        <Text
          style={[
            styles.value,
            { color: colors.text, fontFamily: fonts.display },
          ]}>
          {distance.text}
        </Text>
        <Text
          style={[
            styles.unit,
            { color: colors.textSecondary, fontFamily: fonts.bodyMedium },
          ]}>
          {distance.label}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.stat}>
        <Text
          style={[
            styles.value,
            { color: colors.text, fontFamily: fonts.display },
          ]}>
          {formatDuration(elapsed)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 11,
    letterSpacing: 1,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: 18,
    letterSpacing: -0.3,
  },
  unit: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 18,
  },
});
