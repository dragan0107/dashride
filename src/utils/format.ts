import { mpsToKmh, mpsToMph, metersToKm, metersToMiles } from '@/src/services/distance';
import type { Units } from '@/src/types';

export function formatSpeed(mps: number | null | undefined, units: Units): {
  value: number;
  label: string;
} {
  const safe = mps == null || mps < 0 || !Number.isFinite(mps) ? 0 : mps;
  if (units === 'imperial') {
    return { value: mpsToMph(safe), label: 'mph' };
  }
  return { value: mpsToKmh(safe), label: 'km/h' };
}

export function formatDistance(meters: number, units: Units): {
  value: number;
  label: string;
  text: string;
} {
  if (units === 'imperial') {
    const miles = metersToMiles(meters);
    return {
      value: miles,
      label: 'mi',
      text: miles < 10 ? miles.toFixed(2) : miles.toFixed(1),
    };
  }
  const km = metersToKm(meters);
  return {
    value: km,
    label: 'km',
    text: km < 10 ? km.toFixed(2) : km.toFixed(1),
  };
}

export function formatAltitude(
  meters: number | null | undefined,
  units: Units,
): { value: number | null; label: string } {
  if (meters == null || !Number.isFinite(meters)) {
    return { value: null, label: units === 'imperial' ? 'ft' : 'm' };
  }
  if (units === 'imperial') {
    return { value: meters * 3.28084, label: 'ft' };
  }
  return { value: meters, label: 'm' };
}

export function formatCoord(n: number, digits = 6): string {
  return n.toFixed(digits);
}

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}
