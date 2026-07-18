/**
 * Phone GNSS APIs (expo-location / iOS) do not expose raw satellite counts.
 * Derive a stable estimate from horizontal accuracy for dashboard display.
 */
export function estimateSatelliteCount(accuracyMeters: number | null): number | null {
  if (accuracyMeters == null) return null;
  if (accuracyMeters <= 4) return 12;
  if (accuracyMeters <= 8) return 11;
  if (accuracyMeters <= 12) return 10;
  if (accuracyMeters <= 18) return 9;
  if (accuracyMeters <= 25) return 8;
  if (accuracyMeters <= 35) return 7;
  if (accuracyMeters <= 50) return 6;
  if (accuracyMeters <= 80) return 5;
  return 4;
}
