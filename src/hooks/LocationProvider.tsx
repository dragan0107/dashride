import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { useLiveLocation, type GpsQuality } from '@/src/hooks/useLiveLocation';
import { useWeatherSync } from '@/src/hooks/useWeather';
import {
  dispatchLocationToTrip,
  startBackgroundUpdates,
} from '@/src/services/locationTask';
import { useTripStore } from '@/src/store/tripStore';
import type { GeoPoint } from '@/src/types';

interface LocationContextValue {
  point: GeoPoint | null;
  heading: number | null;
  satellites: number | null;
  quality: GpsQuality;
  error: string | null;
  permissionGranted: boolean | null;
  requestPermission: () => Promise<boolean>;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const live = useLiveLocation(true);
  const tripStatus = useTripStore((s) => s.status);
  const hydrated = useTripStore((s) => s.hydrated);

  useWeatherSync(live.point?.latitude, live.point?.longitude);

  useEffect(() => {
    if (live.point && tripStatus === 'active') {
      dispatchLocationToTrip(live.point);
    }
  }, [live.point, tripStatus]);

  // Re-attach background tracking at root (not only Trip tab) after cold-start
  // recovery stops any leftover FGS. Only start while foregrounded.
  useEffect(() => {
    if (!hydrated || tripStatus !== 'active') return;
    if (AppState.currentState !== 'active') return;

    startBackgroundUpdates().catch(() => undefined);

    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active' && useTripStore.getState().status === 'active') {
        startBackgroundUpdates().catch(() => undefined);
      }
    });
    return () => sub.remove();
  }, [hydrated, tripStatus]);

  return (
    <LocationContext.Provider value={live}>{children}</LocationContext.Provider>
  );
}

export function useLocationContext(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocationContext must be used within LocationProvider');
  }
  return ctx;
}
