import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { evaluateDistancePoint } from '@/src/services/distance';
import type { GeoPoint } from '@/src/types';

export const BACKGROUND_LOCATION_TASK = 'DASHRIDE_BACKGROUND_LOCATION';

export function locationObjectToGeoPoint(
  loc: Location.LocationObject,
): GeoPoint {
  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
    altitude: loc.coords.altitude,
    accuracy: loc.coords.accuracy,
    speed: loc.coords.speed != null && loc.coords.speed >= 0 ? loc.coords.speed : null,
    heading:
      loc.coords.heading != null && loc.coords.heading >= 0
        ? loc.coords.heading
        : null,
    timestamp: loc.timestamp,
  };
}

type LocationHandler = (point: GeoPoint) => void;

let foregroundHandler: LocationHandler | null = null;

export function setForegroundLocationHandler(handler: LocationHandler | null) {
  foregroundHandler = handler;
}

export function dispatchLocationToTrip(point: GeoPoint) {
  // Lazy require avoids circular import at module load
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useTripStore } = require('@/src/store/tripStore') as typeof import('@/src/store/tripStore');
  const store = useTripStore.getState();
  if (store.status !== 'active') return;

  const result = evaluateDistancePoint(store.lastPoint, point);
  store.applyLocation(point, result.accepted ? result.addedMeters : 0);
  foregroundHandler?.(point);
}

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('Background location error', error);
    return;
  }

  const locations = (data as { locations?: Location.LocationObject[] })?.locations;
  if (!locations?.length) return;

  for (const loc of locations) {
    dispatchLocationToTrip(locationObjectToGeoPoint(loc));
  }
});

export async function requestForegroundPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === Location.PermissionStatus.GRANTED;
}

export async function requestBackgroundPermission(): Promise<boolean> {
  const fg = await requestForegroundPermission();
  if (!fg) return false;
  const { status } = await Location.requestBackgroundPermissionsAsync();
  return status === Location.PermissionStatus.GRANTED;
}

export async function startBackgroundUpdates(): Promise<void> {
  const started = await Location.hasStartedLocationUpdatesAsync(
    BACKGROUND_LOCATION_TASK,
  );
  if (started) return;

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 2000,
    distanceInterval: 5,
    deferredUpdatesInterval: 5000,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'DashRide',
      notificationBody: 'Tracking your trip in the background',
      notificationColor: '#2DD4BF',
    },
    pausesUpdatesAutomatically: false,
    activityType: Location.ActivityType.AutomotiveNavigation,
  });
}

export async function stopBackgroundUpdates(): Promise<void> {
  const started = await Location.hasStartedLocationUpdatesAsync(
    BACKGROUND_LOCATION_TASK,
  );
  if (started) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
}
