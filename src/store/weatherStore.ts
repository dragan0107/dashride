import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { haversineMeters } from '@/src/services/distance';
import { fetchWeather } from '@/src/services/weather';
import type { WeatherData } from '@/src/types';

const MOVE_REFRESH_M = 2000;

interface WeatherStore {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  lastFetchAt: number | null;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  refresh: (latitude: number, longitude: number, force?: boolean) => Promise<void>;
  maybeRefresh: (
    latitude: number,
    longitude: number,
    intervalMinutes: number,
    trackingActive: boolean,
  ) => Promise<void>;
}

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set, get) => ({
      data: null,
      loading: false,
      error: null,
      lastFetchAt: null,
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),

      refresh: async (latitude, longitude, force = false) => {
        const { loading } = get();
        if (loading && !force) return;

        set({ loading: true, error: null });
        try {
          const data = await fetchWeather(latitude, longitude);
          set({
            data,
            loading: false,
            lastFetchAt: data.fetchedAt,
            error: null,
          });
        } catch (e) {
          set({
            loading: false,
            error: e instanceof Error ? e.message : 'Weather unavailable',
          });
        }
      },

      maybeRefresh: async (latitude, longitude, intervalMinutes, trackingActive) => {
        const { data, lastFetchAt, loading } = get();
        if (loading) return;

        const intervalMs = intervalMinutes * 60 * 1000;
        const now = Date.now();
        const stale =
          !lastFetchAt || now - lastFetchAt >= intervalMs || !data;

        let movedFar = false;
        if (data) {
          movedFar =
            haversineMeters(
              { latitude: data.latitude, longitude: data.longitude },
              { latitude, longitude },
            ) >= MOVE_REFRESH_M;
        }

        if (stale || (trackingActive && movedFar)) {
          await get().refresh(latitude, longitude);
        }
      },
    }),
    {
      name: 'dashride-weather',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        data: state.data,
        lastFetchAt: state.lastFetchAt,
      }),
    },
  ),
);
