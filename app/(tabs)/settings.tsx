import * as Linking from 'expo-linking';
import { Platform, StyleSheet, Switch, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { Screen } from '@/src/components/Screen';
import { Button } from '@/src/components/ui';
import {
  requestBackgroundPermission,
  requestForegroundPermission,
} from '@/src/services/locationTask';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import type { ThemePreference, Units } from '@/src/types';

function OptionChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors, fonts } = useAppTheme();
  return (
    <Text
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.accent : colors.surface,
          color: active ? colors.background : colors.text,
          fontFamily: fonts.bodyMedium,
          borderColor: colors.border,
        },
      ]}>
      {label}
    </Text>
  );
}

export default function SettingsScreen() {
  const { colors, fonts } = useAppTheme();
  const themePreference = useSettingsStore((s) => s.themePreference);
  const units = useSettingsStore((s) => s.units);
  const keepAwakeOnDrive = useSettingsStore((s) => s.keepAwakeOnDrive);
  const weatherRefreshMinutes = useSettingsStore((s) => s.weatherRefreshMinutes);
  const setThemePreference = useSettingsStore((s) => s.setThemePreference);
  const setUnits = useSettingsStore((s) => s.setUnits);
  const setKeepAwakeOnDrive = useSettingsStore((s) => s.setKeepAwakeOnDrive);
  const setWeatherRefreshMinutes = useSettingsStore(
    (s) => s.setWeatherRefreshMinutes,
  );

  const themes: ThemePreference[] = ['system', 'dark', 'night'];
  const unitOptions: Units[] = ['metric', 'imperial'];
  const intervals = [10, 15, 30];

  return (
    <Screen>
      <BrandHeader title="Settings" subtitle="Appearance & tracking" />

      <Text
        style={[
          styles.section,
          { color: colors.textSecondary, fontFamily: fonts.bodyMedium },
        ]}>
        Theme
      </Text>
      <View style={styles.row}>
        {themes.map((t) => (
          <OptionChip
            key={t}
            label={t === 'night' ? 'Night' : t[0].toUpperCase() + t.slice(1)}
            active={themePreference === t}
            onPress={() => setThemePreference(t)}
          />
        ))}
      </View>

      <Text
        style={[
          styles.section,
          { color: colors.textSecondary, fontFamily: fonts.bodyMedium },
        ]}>
        Units
      </Text>
      <View style={styles.row}>
        {unitOptions.map((u) => (
          <OptionChip
            key={u}
            label={u === 'metric' ? 'Metric' : 'Imperial'}
            active={units === u}
            onPress={() => setUnits(u)}
          />
        ))}
      </View>

      <Text
        style={[
          styles.section,
          { color: colors.textSecondary, fontFamily: fonts.bodyMedium },
        ]}>
        Weather refresh
      </Text>
      <View style={styles.row}>
        {intervals.map((m) => (
          <OptionChip
            key={m}
            label={`${m} min`}
            active={weatherRefreshMinutes === m}
            onPress={() => setWeatherRefreshMinutes(m)}
          />
        ))}
      </View>

      <View style={[styles.switchRow, { borderColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.switchLabel,
              { color: colors.text, fontFamily: fonts.bodyMedium },
            ]}>
            Keep screen awake on Drive
          </Text>
          <Text
            style={[
              styles.switchHint,
              { color: colors.textSecondary, fontFamily: fonts.body },
            ]}>
            Prevents sleep while viewing the HUD
          </Text>
        </View>
        <Switch
          value={keepAwakeOnDrive}
          onValueChange={setKeepAwakeOnDrive}
          trackColor={{ false: colors.gaugeTrack, true: colors.accentMuted }}
          thumbColor={keepAwakeOnDrive ? colors.accent : colors.textSecondary}
        />
      </View>

      <Text
        style={[
          styles.section,
          { color: colors.textSecondary, fontFamily: fonts.bodyMedium },
        ]}>
        Permissions
      </Text>
      <View style={styles.stack}>
        <Button
          label="Request location (when in use)"
          variant="secondary"
          onPress={() => requestForegroundPermission()}
        />
        <Button
          label="Request always / background location"
          variant="secondary"
          onPress={() => requestBackgroundPermission()}
        />
        <Button
          label="Open system settings"
          variant="ghost"
          onPress={() => Linking.openSettings()}
        />
      </View>

      <Text
        style={[
          styles.help,
          { color: colors.textSecondary, fontFamily: fonts.body },
        ]}>
        {Platform.OS === 'android'
          ? 'For continuous trip tracking, allow “Allow all the time” location access and disable battery optimization for DashRide in system settings.'
          : 'For continuous trip tracking, choose “Always” location access when prompted so DashRide can measure distance with the screen off.'}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  switchLabel: {
    fontSize: 15,
  },
  switchHint: {
    fontSize: 12,
    marginTop: 2,
  },
  stack: {
    gap: 10,
  },
  help: {
    marginTop: 20,
    fontSize: 12,
    lineHeight: 18,
  },
});
