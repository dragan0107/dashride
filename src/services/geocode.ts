import * as Location from 'expo-location';
import { Platform } from 'react-native';

import type { PlaceInfo } from '@/src/types';

export function placeFromGeocodedAddress(
  address: Location.LocationGeocodedAddress,
): PlaceInfo {
  return {
    name: address.name,
    street: address.street,
    streetNumber: address.streetNumber,
    city: address.city,
    district: address.district,
    subregion: address.subregion,
    region: address.region,
    country: address.country,
    isoCountryCode: address.isoCountryCode,
    postalCode: address.postalCode,
    formattedAddress: address.formattedAddress,
  };
}

/** Reverse-geocode lat/lng to a postal address. Null on web or when unresolved. */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<PlaceInfo | null> {
  if (Platform.OS === 'web') return null;

  const results = await Location.reverseGeocodeAsync({ latitude, longitude });
  const first = results[0];
  if (!first) return null;
  return placeFromGeocodedAddress(first);
}

function uniqueNonEmpty(parts: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    const trimmed = part?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

/** Short locality label, e.g. "Novi Sad" or "Preševo". */
export function formatPlacePrimary(place: PlaceInfo): string | null {
  if (place.city?.trim()) return place.city.trim();
  if (place.district?.trim()) return place.district.trim();
  if (place.subregion?.trim()) return place.subregion.trim();
  if (place.name?.trim()) return place.name.trim();
  return null;
}

/** Region + country, e.g. "Vojvodina, Serbia". */
export function formatPlaceSecondary(place: PlaceInfo): string | null {
  const parts = uniqueNonEmpty([place.region, place.country]);
  const primary = formatPlacePrimary(place);
  return (
    parts.filter((p) => p.toLowerCase() !== primary?.toLowerCase()).join(', ') ||
    null
  );
}

/** One-line place for subtitles, e.g. "Novi Sad · Serbia". */
export function formatPlaceLine(place: PlaceInfo): string | null {
  if (place.formattedAddress?.trim()) {
    // Prefer a compact locality line over a long formatted address
    const primary = formatPlacePrimary(place);
    const secondary = formatPlaceSecondary(place);
    if (primary && secondary) return `${primary} · ${secondary}`;
    if (primary) return primary;
    return place.formattedAddress.trim();
  }

  const street = uniqueNonEmpty([
    [place.streetNumber, place.street].filter(Boolean).join(' ') || null,
  ])[0];
  const primary = formatPlacePrimary(place);
  const secondary = formatPlaceSecondary(place);

  const parts = uniqueNonEmpty([street, primary, secondary]);
  return parts.length ? parts.join(' · ') : null;
}
