import { WeatherInfo } from '../types';
import { api } from './api';

export const WEATHER_UNAVAILABLE: WeatherInfo = {
  temp: NaN,
  condition: 'Weather unavailable',
  location: '',
  isLive: false,
  severity: 0,
  stale: false,
  available: false,
};

/** Live weather for a station via our API (Open-Meteo behind a 10-min cache). Never faked. */
export async function fetchStationWeather(code: string, stationName: string): Promise<WeatherInfo> {
  try {
    const w = await api.weather(code);
    const vis = w.visibility_flag === 'fog' ? 'Fog' : w.visibility_flag === 'reduced' ? 'Reduced visibility' : 'Clear';
    const rain = w.precipitation_mm >= 0.2 ? ', rain' : '';
    const temp = Math.round(w.temperature_c);
    return {
      temp,
      condition: `${vis}${rain}, ${temp}°C`,
      location: w.place_name || stationName,
      isLive: w.is_live && !w.stale,
      severity: w.severity_index,
      stale: w.stale,
      available: true,
    };
  } catch {
    return { ...WEATHER_UNAVAILABLE, location: stationName };
  }
}
