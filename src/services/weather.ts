import type { WeatherData } from '@/src/types';

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

interface OpenMeteoCurrent {
  temperature_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  relative_humidity_2m: number;
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrent;
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
  });

  const res = await fetch(`${WEATHER_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Weather request failed (${res.status})`);
  }

  const data = (await res.json()) as OpenMeteoResponse;
  const c = data.current;

  return {
    temperature: c.temperature_2m,
    apparentTemperature: c.apparent_temperature,
    weatherCode: c.weather_code,
    windSpeed: c.wind_speed_10m,
    windDirection: c.wind_direction_10m,
    humidity: c.relative_humidity_2m,
    fetchedAt: Date.now(),
    latitude,
    longitude,
  };
}

/** WMO weather interpretation codes → short label. */
export function weatherCodeLabel(code: number): string {
  if (code === 0) return 'Clear';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export function weatherCodeEmoji(code: number): string {
  if (code === 0 || code === 1) return '☀';
  if (code === 2) return '⛅';
  if (code === 3) return '☁';
  if (code === 45 || code === 48) return '🌫';
  if (code >= 51 && code <= 67) return '🌧';
  if (code >= 71 && code <= 86) return '❄';
  if (code >= 95) return '⛈';
  return '🌤';
}
