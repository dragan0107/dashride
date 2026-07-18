import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { SettingsState, ThemePreference, Units } from '@/src/types';

interface SettingsStore extends SettingsState {
  setThemePreference: (themePreference: ThemePreference) => void;
  setUnits: (units: Units) => void;
  setKeepAwakeOnDrive: (keepAwakeOnDrive: boolean) => void;
  setWeatherRefreshMinutes: (minutes: number) => void;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      themePreference: 'dark',
      units: 'metric',
      keepAwakeOnDrive: true,
      weatherRefreshMinutes: 15,
      hydrated: false,
      setThemePreference: (themePreference) => set({ themePreference }),
      setUnits: (units) => set({ units }),
      setKeepAwakeOnDrive: (keepAwakeOnDrive) => set({ keepAwakeOnDrive }),
      setWeatherRefreshMinutes: (weatherRefreshMinutes) =>
        set({ weatherRefreshMinutes }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'dashride-settings',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        themePreference: state.themePreference,
        units: state.units,
        keepAwakeOnDrive: state.keepAwakeOnDrive,
        weatherRefreshMinutes: state.weatherRefreshMinutes,
      }),
    },
  ),
);
