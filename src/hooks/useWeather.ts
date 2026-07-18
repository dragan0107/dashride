import { useEffect } from 'react';

import { useSettingsStore } from '@/src/store/settingsStore';
import { useTripStore } from '@/src/store/tripStore';
import { useWeatherStore } from '@/src/store/weatherStore';

export function useWeatherSync(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
) {
  const refresh = useWeatherStore((s) => s.refresh);
  const maybeRefresh = useWeatherStore((s) => s.maybeRefresh);
  const data = useWeatherStore((s) => s.data);
  const loading = useWeatherStore((s) => s.loading);
  const error = useWeatherStore((s) => s.error);
  const intervalMinutes = useSettingsStore((s) => s.weatherRefreshMinutes);
  const tripStatus = useTripStore((s) => s.status);
  const trackingActive = tripStatus === 'active';

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    maybeRefresh(latitude, longitude, intervalMinutes, trackingActive);

    const id = setInterval(
      () => {
        maybeRefresh(latitude, longitude, intervalMinutes, trackingActive);
      },
      Math.max(60_000, intervalMinutes * 60_000),
    );

    return () => clearInterval(id);
  }, [
    latitude,
    longitude,
    intervalMinutes,
    trackingActive,
    maybeRefresh,
  ]);

  return {
    data,
    loading,
    error,
    refresh: () => {
      if (latitude == null || longitude == null) return Promise.resolve();
      return refresh(latitude, longitude, true);
    },
  };
}
