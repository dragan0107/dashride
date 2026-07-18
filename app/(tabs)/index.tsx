import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { Altimeter } from '@/src/components/gauges/Altimeter';
import { Compass } from '@/src/components/gauges/Compass';
import { Speedometer } from '@/src/components/gauges/Speedometer';
import { BrandHeader } from '@/src/components/BrandHeader';
import { SatelliteBadge } from '@/src/components/SatelliteBadge';
import { Screen } from '@/src/components/Screen';
import { useLocationContext } from '@/src/hooks/LocationProvider';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { formatAltitude, formatSpeed } from '@/src/utils/format';

export default function DriveScreen() {
  const { colors, fonts } = useAppTheme();
  const {
    point,
    heading,
    satellites,
    quality,
    error,
    permissionGranted,
    requestPermission,
    placeLine,
  } = useLocationContext();
  const units = useSettingsStore((s) => s.units);
  const keepAwake = useSettingsStore((s) => s.keepAwakeOnDrive);

  useEffect(() => {
    if (keepAwake) {
      activateKeepAwakeAsync('dashride-drive').catch(() => undefined);
      return () => {
        deactivateKeepAwake('dashride-drive');
      };
    }
    return undefined;
  }, [keepAwake]);

  const speed = formatSpeed(point?.speed, units);
  const alt = formatAltitude(point?.altitude, units);

  const statusText =
    permissionGranted === false
      ? 'Location permission needed'
      : quality === 'searching'
        ? 'Searching for GPS…'
        : quality === 'weak'
          ? 'GPS weak — accuracy limited'
          : quality === 'good'
            ? (placeLine ?? 'GPS locked')
            : error ?? 'GPS unavailable';

  return (
    <Screen>
      <View style={styles.topRow}>
        <View style={styles.headerGrow}>
          <BrandHeader title="Drive" subtitle={statusText} />
        </View>
        <SatelliteBadge count={satellites} quality={quality} />
      </View>

      {permissionGranted === false ? (
        <View style={styles.permission}>
          <Text
            style={[
              styles.permissionText,
              { color: colors.textSecondary, fontFamily: fonts.body },
            ]}>
            DashRide needs location access for speed, heading, and trip tracking.
          </Text>
          <Text
            onPress={() => requestPermission()}
            style={[
              styles.link,
              { color: colors.accent, fontFamily: fonts.bodyBold },
            ]}>
            Grant permission
          </Text>
        </View>
      ) : null}

      <View style={styles.gauge}>
        <Speedometer speed={speed.value} unitLabel={speed.label} />
      </View>

      <View style={styles.row}>
        <Compass heading={heading} />
        <Altimeter
          altitudeMeters={point?.altitude ?? null}
          displayValue={alt.value}
          unitLabel={alt.label}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  headerGrow: {
    flex: 1,
  },
  gauge: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  permission: {
    marginBottom: 12,
    gap: 8,
  },
  permissionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    fontSize: 15,
  },
});
