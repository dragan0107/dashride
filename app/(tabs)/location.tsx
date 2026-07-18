import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { Screen } from '@/src/components/Screen';
import { Button, StatRow } from '@/src/components/ui';
import { useLocationContext } from '@/src/hooks/LocationProvider';
import { headingToCardinal } from '@/src/services/distance';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import {
  formatAltitude,
  formatCoord,
  formatSpeed,
} from '@/src/utils/format';

export default function LocationScreen() {
  const { colors, fonts } = useAppTheme();
  const { point, heading, quality, error, permissionGranted, requestPermission } =
    useLocationContext();
  const units = useSettingsStore((s) => s.units);

  const speed = formatSpeed(point?.speed, units);
  const alt = formatAltitude(point?.altitude, units);

  const qualityLabel =
    quality === 'good'
      ? 'Good'
      : quality === 'weak'
        ? 'Weak'
        : quality === 'searching'
          ? 'Searching'
          : quality === 'denied'
            ? 'Denied'
            : 'Error';

  async function copyCoords() {
    if (!point) return;
    const text = `${formatCoord(point.latitude)}, ${formatCoord(point.longitude)}`;
    await Clipboard.setStringAsync(text);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <Screen>
      <BrandHeader
        title="Location"
        subtitle={
          permissionGranted === false
            ? 'Permission required'
            : error ?? `Signal: ${qualityLabel}`
        }
      />

      {permissionGranted === false ? (
        <Button label="Grant location access" onPress={() => requestPermission()} />
      ) : (
        <View>
          <StatRow
            label="Latitude"
            value={point ? formatCoord(point.latitude) : '—'}
          />
          <StatRow
            label="Longitude"
            value={point ? formatCoord(point.longitude) : '—'}
          />
          <StatRow
            label="Altitude"
            value={
              alt.value == null ? '—' : `${Math.round(alt.value)} ${alt.label}`
            }
          />
          <StatRow
            label="Accuracy"
            value={
              point?.accuracy != null
                ? `±${Math.round(point.accuracy)} m`
                : '—'
            }
          />
          <StatRow
            label="Speed"
            value={`${Math.round(speed.value)} ${speed.label}`}
          />
          <StatRow
            label="Heading"
            value={
              heading == null
                ? '—'
                : `${Math.round(heading)}° ${headingToCardinal(heading)}`
            }
          />
          <StatRow
            label="Last fix"
            value={
              point
                ? new Date(point.timestamp).toLocaleTimeString()
                : '—'
            }
          />

          <View style={styles.actions}>
            <Button
              label="Copy coordinates"
              onPress={copyCoords}
              variant="secondary"
              disabled={!point}
            />
          </View>

          {quality === 'weak' ? (
            <Text
              style={[
                styles.hint,
                { color: colors.accent, fontFamily: fonts.body },
              ]}>
              GPS weak — move outdoors or wait for a better fix. Distance
              tracking ignores noisy points.
            </Text>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: 20,
  },
  hint: {
    marginTop: 16,
    fontSize: 13,
    lineHeight: 18,
  },
});
