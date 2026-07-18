import { useEffect, useRef, useState } from 'react';

import { haversineMeters } from '@/src/services/distance';
import {
  formatPlaceLine,
  formatPlacePrimary,
  formatPlaceSecondary,
  reverseGeocode,
} from '@/src/services/geocode';
import type { GeoPoint, PlaceInfo } from '@/src/types';

/** Re-resolve place only after meaningful movement (geocoding is costly). */
const MIN_GEOCODE_MOVE_M = 400;

export function usePlaceName(point: GeoPoint | null) {
  const [place, setPlace] = useState<PlaceInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastGeocodedRef = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const inFlightRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!point) return;

    const last = lastGeocodedRef.current;
    if (last && haversineMeters(last, point) < MIN_GEOCODE_MOVE_M) return;
    if (inFlightRef.current) return;

    const requestId = ++requestIdRef.current;
    const { latitude, longitude } = point;
    let cancelled = false;

    async function run() {
      inFlightRef.current = true;
      setLoading(true);
      setError(null);
      try {
        const result = await reverseGeocode(latitude, longitude);
        if (cancelled || requestId !== requestIdRef.current) return;
        lastGeocodedRef.current = { latitude, longitude };
        setPlace(result);
        if (!result) {
          setError('Place name unavailable');
        }
      } catch (e) {
        if (cancelled || requestId !== requestIdRef.current) return;
        setError(e instanceof Error ? e.message : 'Geocoding failed');
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoading(false);
        }
        inFlightRef.current = false;
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [point]);

  return {
    place,
    loading,
    error,
    primary: place ? formatPlacePrimary(place) : null,
    secondary: place ? formatPlaceSecondary(place) : null,
    line: place ? formatPlaceLine(place) : null,
  };
}
