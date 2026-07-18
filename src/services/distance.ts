import type { GeoPoint } from '@/src/types';

const EARTH_RADIUS_M = 6371000;
const MAX_ACCURACY_M = 45;
const MIN_MOVE_M = 4;
const MAX_JUMP_M = 200;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance in meters between two WGS84 points. */
export function haversineMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface DistanceUpdate {
  accepted: boolean;
  addedMeters: number;
  reason?: string;
}

/**
 * Accept a new GPS point for trip distance only when accuracy is good
 * and movement is real (not jitter) and not an impossible jump.
 */
export function evaluateDistancePoint(
  previous: GeoPoint | null,
  next: GeoPoint,
): DistanceUpdate {
  if (next.accuracy != null && next.accuracy > MAX_ACCURACY_M) {
    return { accepted: false, addedMeters: 0, reason: 'poor_accuracy' };
  }

  if (!previous) {
    return { accepted: true, addedMeters: 0 };
  }

  const delta = haversineMeters(previous, next);

  if (delta < MIN_MOVE_M) {
    return { accepted: false, addedMeters: 0, reason: 'jitter' };
  }

  if (delta > MAX_JUMP_M) {
    const dtSec = Math.max(0.001, (next.timestamp - previous.timestamp) / 1000);
    const impliedSpeed = delta / dtSec;
    // ~70 m/s ≈ 250 km/h — reject wild jumps unless plausible for a car
    if (impliedSpeed > 70) {
      return { accepted: false, addedMeters: 0, reason: 'jump' };
    }
  }

  return { accepted: true, addedMeters: delta };
}

export function mpsToKmh(mps: number): number {
  return mps * 3.6;
}

export function mpsToMph(mps: number): number {
  return mps * 2.23693629;
}

export function metersToKm(m: number): number {
  return m / 1000;
}

export function metersToMiles(m: number): number {
  return m / 1609.344;
}

export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function headingToCardinal(heading: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(heading / 45) % 8;
  return dirs[idx];
}
