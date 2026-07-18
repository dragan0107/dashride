export type ThemePreference = 'system' | 'dark' | 'night';
export type Units = 'metric' | 'imperial';
export type TripStatus = 'idle' | 'active' | 'paused' | 'completed';
export type ResolvedTheme = 'light' | 'dark' | 'night';

export interface GeoPoint {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

/** Human-readable place from reverse geocoding. */
export interface PlaceInfo {
  name: string | null;
  street: string | null;
  streetNumber: string | null;
  city: string | null;
  district: string | null;
  subregion: string | null;
  region: string | null;
  country: string | null;
  isoCountryCode: string | null;
  postalCode: string | null;
  formattedAddress: string | null;
}

export interface TripSnapshot {
  status: TripStatus;
  distanceMeters: number;
  startedAt: number | null;
  pausedAt: number | null;
  totalPausedMs: number;
  maxSpeedMps: number;
  lastPoint: GeoPoint | null;
}

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  fetchedAt: number;
  latitude: number;
  longitude: number;
}

export interface SettingsState {
  themePreference: ThemePreference;
  units: Units;
  keepAwakeOnDrive: boolean;
  weatherRefreshMinutes: number;
}
