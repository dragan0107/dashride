import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { Screen } from '@/src/components/Screen';
import { Button, StatRow } from '@/src/components/ui';
import { useTripActions } from '@/src/hooks/useTrip';
import { formatDuration } from '@/src/services/distance';
import {
  getAverageSpeedMps,
  getTripElapsedMs,
  useTripStore,
} from '@/src/store/tripStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { formatDistance, formatSpeed } from '@/src/utils/format';

export default function TripScreen() {
  const { colors, fonts } = useAppTheme();
  const units = useSettingsStore((s) => s.units);
  const trip = useTripStore();
  const { start, pause, resume, stop, reset } = useTripActions();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (trip.status !== 'active' && trip.status !== 'paused') return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [trip.status]);

  const elapsed = getTripElapsedMs(trip, now);
  const avg = formatSpeed(getAverageSpeedMps(trip, now), units);
  const max = formatSpeed(trip.maxSpeedMps, units);
  const distance = formatDistance(trip.distanceMeters, units);

  const statusLabel =
    trip.status === 'idle'
      ? 'Ready'
      : trip.status === 'active'
        ? 'Recording'
        : trip.status === 'paused'
          ? 'Paused'
          : 'Completed';

  return (
    <Screen>
      <BrandHeader title="Trip" subtitle={statusLabel} />

      <View style={styles.hero}>
        <Text
          style={[
            styles.distance,
            { color: colors.text, fontFamily: fonts.display },
          ]}>
          {distance.text}
        </Text>
        <Text
          style={[
            styles.distanceUnit,
            { color: colors.accent, fontFamily: fonts.bodyMedium },
          ]}>
          {distance.label}
        </Text>
      </View>

      <StatRow label="Duration" value={formatDuration(elapsed)} />
      <StatRow
        label="Average speed"
        value={`${Math.round(avg.value)} ${avg.label}`}
      />
      <StatRow
        label="Max speed"
        value={`${Math.round(max.value)} ${max.label}`}
      />

      <View style={styles.actions}>
        {trip.status === 'idle' || trip.status === 'completed' ? (
          <>
            <Button label="Start trip" onPress={start} />
            {trip.status === 'completed' ? (
              <Button label="Reset" onPress={reset} variant="ghost" />
            ) : null}
          </>
        ) : null}

        {trip.status === 'active' ? (
          <View style={styles.row}>
            <Button label="Pause" onPress={pause} variant="secondary" style={styles.flex} />
            <Button label="Stop" onPress={stop} variant="danger" style={styles.flex} />
          </View>
        ) : null}

        {trip.status === 'paused' ? (
          <View style={styles.row}>
            <Button label="Resume" onPress={resume} style={styles.flex} />
            <Button label="Stop" onPress={stop} variant="danger" style={styles.flex} />
          </View>
        ) : null}
      </View>

      <Text
        style={[
          styles.note,
          { color: colors.textSecondary, fontFamily: fonts.body },
        ]}>
        Tracking continues in the background while a trip is active. On Android,
        leave the DashRide notification running and disable battery
        optimizations for best results.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginVertical: 24,
  },
  distance: {
    fontSize: 64,
    letterSpacing: -2,
  },
  distanceUnit: {
    fontSize: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  note: {
    marginTop: 28,
    fontSize: 12,
    lineHeight: 18,
  },
});
