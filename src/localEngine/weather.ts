import type { CurrentWeather, DailyWeather, HourlyWeather, LocationInfo, WeatherResponse } from '@/types/api';

export type Scenario = 'normal' | 'hot' | 'extreme';

export interface EngineLocation {
  lat: number;
  lon: number;
  name?: string;
}

const HOUR_MS = 60 * 60 * 1000;
const PAKISTAN_OFFSET_MS = 5 * HOUR_MS;

function pakistanParts(date: Date): { year: number; month: number; day: number; hour: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hourCycle: 'h23',
  }).formatToParts(date);
  const read = (type: string) => Number(parts.find(part => part.type === type)?.value ?? 0);
  return { year: read('year'), month: read('month'), day: read('day'), hour: read('hour') };
}

function pkIso(date: Date): string {
  return `${new Date(date.getTime() + PAKISTAN_OFFSET_MS).toISOString().slice(0, 19)}+05:00`;
}

function pkHourDate(date: Date): Date {
  const parts = pakistanParts(date);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour) - PAKISTAN_OFFSET_MS);
}

function pkDate(year: number, month: number, day: number, hour: number): Date {
  return new Date(Date.UTC(year, month - 1, day, hour) - PAKISTAN_OFFSET_MS);
}

function hashNumber(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function noise(location: EngineLocation, timestamp: number, channel: string): number {
  const key = `${location.lat.toFixed(3)}:${location.lon.toFixed(3)}:${timestamp}:${channel}`;
  return hashNumber(key) * 2 - 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function seasonalMeanC(location: EngineLocation, month: number): number {
  const seasonal = 27 + 9 * Math.cos(((month - 7) * Math.PI) / 6);
  const latitudeAdjustment = (27 - location.lat) * 0.16;
  const southernHeat = location.lat < 29 ? 1.2 : 0;
  return seasonal + latitudeAdjustment + southernHeat;
}

function temperatureAt(location: EngineLocation, date: Date, scenario: Scenario): number {
  const { month, hour } = pakistanParts(date);
  const boost = scenario === 'extreme' ? 10 : scenario === 'hot' ? 4 : 0;
  const dailyCurve = 6.2 * Math.cos(((hour - 15) * Math.PI) / 12);
  const variation = noise(location, date.getTime(), 'temp') * 0.65;
  return Math.round((seasonalMeanC(location, month) + dailyCurve + boost + variation) * 10) / 10;
}

function humidityAt(location: EngineLocation, date: Date, tempC: number): number {
  const humidity = 83 - Math.max(0, tempC - 18) * 1.25 + (location.lat > 30 ? 3 : 0) +
    noise(location, date.getTime(), 'humidity') * 4;
  return Math.round(clamp(humidity, 18, 92));
}

function uvAt(location: EngineLocation, date: Date, month: number): number {
  const { hour } = pakistanParts(date);
  const daylight = Math.sin(((hour - 6) / 13) * Math.PI);
  const seasonalStrength = 7.4 + 1.8 * Math.cos(((month - 6) * Math.PI) / 6);
  const latitudeStrength = clamp(1 + (30 - location.lat) * 0.012, 0.78, 1.12);
  return Math.round(clamp(daylight, 0, 1) * seasonalStrength * latitudeStrength * 10) / 10;
}

function windAt(location: EngineLocation, date: Date): number {
  return Math.round(clamp(9 + noise(location, date.getTime(), 'wind') * 7 + Math.abs(location.lon % 4), 3, 28) * 10) / 10;
}

function hourOf(date: Date): number {
  return pakistanParts(date).hour;
}

function makeHourly(location: EngineLocation, start: Date, count: number, scenario: Scenario): HourlyWeather[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start.getTime() + index * HOUR_MS);
    const temp = temperatureAt(location, date, scenario);
    const { month } = pakistanParts(date);
    return {
      time: pkIso(date),
      temp_c: temp,
      feels_like_c: Math.round((temp + Math.max(0, humidityAt(location, date, temp) - 45) * 0.045 + 1.2) * 10) / 10,
      humidity: humidityAt(location, date, temp),
      uv_index: uvAt(location, date, month),
    };
  });
}

function makeDaily(location: EngineLocation, start: Date, scenario: Scenario): DailyWeather[] {
  const parts = pakistanParts(start);
  const firstDay = pkDate(parts.year, parts.month, parts.day, 0);
  return Array.from({ length: 7 }, (_, index) => {
    const dayStart = new Date(firstDay.getTime() + index * 24 * HOUR_MS);
    const dayParts = pakistanParts(dayStart);
    const dawn = pkDate(dayParts.year, dayParts.month, dayParts.day, 5);
    const afternoon = pkDate(dayParts.year, dayParts.month, dayParts.day, 15);
    const minC = temperatureAt(location, dawn, scenario);
    const maxC = temperatureAt(location, afternoon, scenario);
    const { month } = dayParts;
    return {
      date: `${dayParts.year}-${String(month).padStart(2, '0')}-${String(dayParts.day).padStart(2, '0')}`,
      temp_max_c: Math.round(maxC * 10) / 10,
      temp_min_c: Math.round(minC * 10) / 10,
      uv_index_max: Math.round(uvAt(location, afternoon, month) * 10) / 10,
      sunrise: pkIso(pkDate(dayParts.year, month, dayParts.day, 6)),
      sunset: pkIso(pkDate(dayParts.year, month, dayParts.day, 18)),
    };
  });
}

export function generateWeather(
  location: EngineLocation,
  scenario: Scenario = 'normal',
  now = new Date(),
): WeatherResponse {
  const hour = pkHourDate(now);
  const hourly = makeHourly(location, hour, 48, scenario);
  const daily = makeDaily(location, hour, scenario);
  const currentHour = hourly[0];
  const currentDate = new Date(now);
  const daylight = hourOf(currentDate) >= 6 && hourOf(currentDate) < 18;
  const cloudSample = hashNumber(`${location.lat.toFixed(3)}:${location.lon.toFixed(3)}:${pakistanParts(now).month}:cloud`);
  const condition = !daylight ? 'Clear night' : cloudSample > 0.72 ? 'Partly cloudy' : cloudSample > 0.92 ? 'Cloudy' : 'Clear';
  const weatherCode = condition === 'Clear' || condition === 'Clear night' ? 0 : condition === 'Partly cloudy' ? 2 : 3;
  const current: CurrentWeather = {
    time: pkIso(now),
    temp_c: currentHour.temp_c,
    feels_like_c: currentHour.feels_like_c,
    humidity: currentHour.humidity,
    wind_kph: windAt(location, hour),
    uv_index: uvAt(location, now, pakistanParts(now).month),
    condition,
    weather_code: weatherCode,
  };
  const locationInfo: LocationInfo = {
    name: location.name || 'Selected location',
    lat: location.lat,
    lon: location.lon,
    timezone: 'Asia/Karachi',
  };
  return { location: locationInfo, generated_at: pkIso(now), current, hourly, daily };
}