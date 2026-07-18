import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { Screen } from '@/src/components/Screen';
import { Button, StatRow } from '@/src/components/ui';
import { useLocationContext } from '@/src/hooks/LocationProvider';
import { headingToCardinal } from '@/src/services/distance';
import {
  weatherCodeEmoji,
  weatherCodeLabel,
} from '@/src/services/weather';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useWeatherStore } from '@/src/store/weatherStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { celsiusToFahrenheit } from '@/src/utils/format';

export default function WeatherScreen() {
  const { colors, fonts } = useAppTheme();
  const { point } = useLocationContext();
  const units = useSettingsStore((s) => s.units);
  const data = useWeatherStore((s) => s.data);
  const loading = useWeatherStore((s) => s.loading);
  const error = useWeatherStore((s) => s.error);
  const refreshWeather = useWeatherStore((s) => s.refresh);

  const temp =
    data == null
      ? null
      : units === 'imperial'
        ? celsiusToFahrenheit(data.temperature)
        : data.temperature;
  const feels =
    data == null
      ? null
      : units === 'imperial'
        ? celsiusToFahrenheit(data.apparentTemperature)
        : data.apparentTemperature;
  const tempUnit = units === 'imperial' ? '°F' : '°C';
  const wind =
    data == null
      ? null
      : units === 'imperial'
        ? data.windSpeed * 0.621371
        : data.windSpeed;
  const windUnit = units === 'imperial' ? 'mph' : 'km/h';

  return (
    <Screen>
      <BrandHeader
        title="Weather"
        subtitle={
          data
            ? `Updated ${new Date(data.fetchedAt).toLocaleTimeString()}`
            : 'Conditions at your position'
        }
      />

      {!point ? (
        <Text
          style={[
            styles.empty,
            { color: colors.textSecondary, fontFamily: fonts.body },
          ]}>
          Waiting for GPS fix to load local weather…
        </Text>
      ) : null}

      {loading && !data ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />
      ) : null}

      {error && !data ? (
        <Text
          style={[
            styles.empty,
            { color: colors.danger, fontFamily: fonts.body },
          ]}>
          {error}
        </Text>
      ) : null}

      {data ? (
        <View>
          <View style={styles.hero}>
            <Text style={styles.emoji}>
              {weatherCodeEmoji(data.weatherCode)}
            </Text>
            <Text
              style={[
                styles.temp,
                { color: colors.text, fontFamily: fonts.display },
              ]}>
              {Math.round(temp!)}
              {tempUnit}
            </Text>
            <Text
              style={[
                styles.condition,
                { color: colors.textSecondary, fontFamily: fonts.bodyMedium },
              ]}>
              {weatherCodeLabel(data.weatherCode)}
            </Text>
          </View>

          <StatRow
            label="Feels like"
            value={`${Math.round(feels!)}${tempUnit}`}
          />
          <StatRow
            label="Wind"
            value={`${Math.round(wind!)} ${windUnit} ${headingToCardinal(data.windDirection)}`}
          />
          <StatRow label="Humidity" value={`${Math.round(data.humidity)}%`} />

          {error ? (
            <Text
              style={[
                styles.cacheNote,
                { color: colors.textSecondary, fontFamily: fonts.body },
              ]}>
              Showing cached weather — {error}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button
          label={loading ? 'Refreshing…' : 'Refresh now'}
          onPress={() => {
            if (point) refreshWeather(point.latitude, point.longitude, true);
          }}
          variant="secondary"
          disabled={!point || loading}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginVertical: 20,
    gap: 4,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  temp: {
    fontSize: 64,
    letterSpacing: -2,
  },
  condition: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  cacheNote: {
    marginTop: 12,
    fontSize: 12,
  },
  actions: {
    marginTop: 24,
  },
});
