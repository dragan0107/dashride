import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { PermissionsAndroid, Platform } from 'react-native';

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
  try {
    if (error) {
      console.warn('Background location error', error);
      return;
    }

    const locations = (data as { locations?: Location.LocationObject[] })
      ?.locations;
    if (!locations?.length) return;

    for (const loc of locations) {
      dispatchLocationToTrip(locationObjectToGeoPoint(loc));
    }
  } catch (e) {
    console.warn('Background location task failed', e);
  }
});

async function ensureNotificationPermission(): Promise<void> {
  if (Platform.OS !== 'android' || Platform.Version < 33) return;
  try {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  } catch {
    // Non-fatal: FGS notification may be silent without it
  }
}

/** Check-before-request: re-calling request* when already granted can hang on Android. */
export async function requestForegroundPermission(): Promise<boolean> {
  try {
    const current = await Location.getForegroundPermissionsAsync();
    if (current.status === Location.PermissionStatus.GRANTED) return true;
    if (!current.canAskAgain) return false;

    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === Location.PermissionStatus.GRANTED;
  } catch (e) {
    console.warn('Foreground location permission failed', e);
    return false;
  }
}

export async function requestBackgroundPermission(): Promise<boolean> {
  try {
    const fg = await requestForegroundPermission();
    if (!fg) return false;

    const current = await Location.getBackgroundPermissionsAsync();
    if (current.status === Location.PermissionStatus.GRANTED) return true;

    // Android 11+: this opens system settings; process may be killed on return.
    const { status } = await Location.requestBackgroundPermissionsAsync();
    return status === Location.PermissionStatus.GRANTED;
  } catch (e) {
    console.warn('Background location permission failed', e);
    return false;
  }
}

/**
 * Always stop native location updates on cold start.
 * After Android kills the process on a permission change, a leftover
 * foreground-service registration is a common crash-on-launch loop;
 * active trips re-attach from JS once the UI is foregrounded.
 */
export async function recoverOrphanedLocationUpdates(): Promise<void> {
  try {
    const started = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK,
    );
    if (!started) return;
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  } catch (e) {
    console.warn('Failed to recover orphaned location updates', e);
    try {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    } catch {
      // ignore
    }
  }
}

export async function startBackgroundUpdates(): Promise<void> {
  const fg = await Location.getForegroundPermissionsAsync();
  if (fg.status !== Location.PermissionStatus.GRANTED) {
    throw new Error('Foreground location permission is required');
  }

  const bg = await Location.getBackgroundPermissionsAsync();
  if (bg.status !== Location.PermissionStatus.GRANTED) {
    throw new Error('Background location permission is required');
  }

  await ensureNotificationPermission();

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
  try {
    const started = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK,
    );
    if (started) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
  } catch (e) {
    console.warn('Failed to stop background location updates', e);
  }
}
