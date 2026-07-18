import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  locationObjectToGeoPoint,
  requestForegroundPermission,
} from '@/src/services/locationTask';
import type { GeoPoint } from '@/src/types';
import { estimateSatelliteCount } from '@/src/utils/satellites';

export type GpsQuality = 'searching' | 'weak' | 'good' | 'denied' | 'error';

function qualityFromAccuracy(accuracy: number | null): GpsQuality {
  if (accuracy == null) return 'searching';
  if (accuracy > 45) return 'weak';
  return 'good';
}

function magnetometerToHeading(x: number, y: number): number {
  let angle = (Math.atan2(y, x) * 180) / Math.PI;
  angle = 90 - angle;
  if (angle < 0) angle += 360;
  return angle % 360;
}

export function useLiveLocation(enabled = true) {
  const [point, setPoint] = useState<GeoPoint | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [satellites, setSatellites] = useState<number | null>(null);
  const [quality, setQuality] = useState<GpsQuality>('searching');
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null,
  );
  const hasCourseHeading = useRef(false);

  const requestPermission = useCallback(async () => {
    try {
      const ok = await requestForegroundPermission();
      setPermissionGranted(ok);
      if (!ok) {
        setQuality('denied');
        setError('Location permission is required for DashRide.');
      }
      return ok;
    } catch (e) {
      setPermissionGranted(false);
      setQuality('error');
      setError(e instanceof Error ? e.message : 'Permission error');
      return false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let watchSub: Location.LocationSubscription | null = null;
    let headingSub: Location.LocationSubscription | null = null;
    let magSub: { remove: () => void } | null = null;

    async function start() {
      const ok = await requestPermission();
      if (!ok || cancelled) return;

      watchSub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => {
          const geo = locationObjectToGeoPoint(loc);
          setPoint(geo);
          setQuality(qualityFromAccuracy(geo.accuracy));
          setSatellites(estimateSatelliteCount(geo.accuracy));
          setError(null);
          if (geo.heading != null) {
            hasCourseHeading.current = true;
            setHeading(geo.heading);
          }
        },
      );

      try {
        headingSub = await Location.watchHeadingAsync((h) => {
          if (h.trueHeading >= 0) {
            hasCourseHeading.current = true;
            setHeading(h.trueHeading);
          } else if (h.magHeading >= 0) {
            hasCourseHeading.current = true;
            setHeading(h.magHeading);
          }
        });
      } catch {
        // fall through to magnetometer
      }

      try {
        Magnetometer.setUpdateInterval(250);
        magSub = Magnetometer.addListener(({ x, y }) => {
          if (hasCourseHeading.current) return;
          setHeading(magnetometerToHeading(x, y));
        });
      } catch {
        // Magnetometer unavailable on this device
      }
    }

    start();

    return () => {
      cancelled = true;
      watchSub?.remove();
      headingSub?.remove();
      magSub?.remove();
    };
  }, [enabled, requestPermission]);

  return {
    point,
    heading,
    satellites,
    quality,
    error,
    permissionGranted,
    requestPermission,
  };
}
