import type { ElevatedPeriod, Lang, RiskLevel, RiskResponse } from '@/types/api';
import type { EngineLocation, Scenario } from './weather';
import { generateWeather } from './weather';

const LEVEL_LABELS: Record<Lang, Record<RiskLevel, string>> = {
  en: { low: 'Low', moderate: 'Moderate', high: 'High', extreme: 'Extreme' },
  ur: { low: 'کم', moderate: 'درمیانہ', high: 'زیادہ', extreme: 'انتہائی' },
  sd: { low: 'گھٽ', moderate: 'وچولو', high: 'وڌيڪ', extreme: 'تمام' },
};

export function heatIndexC(tempC: number, relativeHumidity: number): number {
  const tempF = tempC * 9 / 5 + 32;
  const humidity = relativeHumidity;
  if (tempF < 80) return tempC;

  let indexF = -42.379 + 2.04901523 * tempF + 10.14333127 * humidity -
    0.22475541 * tempF * humidity - 0.00683783 * tempF * tempF -
    0.05481717 * humidity * humidity + 0.00122874 * tempF * tempF * humidity +
    0.00085282 * tempF * humidity * humidity - 0.00000199 * tempF * tempF * humidity * humidity;

  if (humidity < 13 && tempF >= 80 && tempF <= 112) {
    indexF -= ((13 - humidity) / 4) * Math.sqrt((17 - Math.abs(tempF - 95)) / 17);
  } else if (humidity > 85 && tempF >= 80 && tempF <= 87) {
    indexF += ((humidity - 85) / 10) * ((87 - tempF) / 5);
  }
  return Math.round(((indexF - 32) * 5 / 9) * 10) / 10;
}

export function riskLevelForHeatIndex(heatIndex: number): RiskLevel {
  if (heatIndex >= 51.7) return 'extreme';
  if (heatIndex >= 39.4) return 'high';
  if (heatIndex >= 32.2) return 'moderate';
  return 'low';
}

function collectDrivers(tempC: number, humidity: number, uvIndex: number, hourlyTemps: number[]): string[] {
  const drivers: string[] = [];
  if (tempC >= 35) drivers.push('High temperature');
  if (humidity >= 65) drivers.push('High humidity');
  if (uvIndex >= 8) drivers.push('Strong UV');
  const hotNight = hourlyTemps.some((temp, index) => index >= 0 && index < 6 && temp >= 30);
  if (hotNight) drivers.push('Hot night');
  return drivers;
}

function mergeElevatedPeriods(hourly: RiskResponse['hourly']): ElevatedPeriod[] {
  const periods: ElevatedPeriod[] = [];
  let active: ElevatedPeriod | null = null;

  hourly.forEach((item, index) => {
    if (item.risk_level !== 'high' && item.risk_level !== 'extreme') {
      if (active) periods.push(active);
      active = null;
      return;
    }
    if (!active) {
      const start = new Date(item.time);
      active = {
        start: item.time,
        end: new Date(start.getTime() + 60 * 60 * 1000).toISOString().replace('Z', '+00:00'),
        peak_heat_index_c: item.heat_index_c,
        risk_level: item.risk_level,
      };
    } else {
      active.end = new Date(new Date(item.time).getTime() + 60 * 60 * 1000).toISOString().replace('Z', '+00:00');
      active.peak_heat_index_c = Math.max(active.peak_heat_index_c, item.heat_index_c);
      if (item.risk_level === 'extreme') active.risk_level = 'extreme';
    }
    if (index === hourly.length - 1 && active) periods.push(active);
  });
  return periods;
}

export function generateRisk(
  location: EngineLocation,
  lang: Lang,
  scenario: Scenario = 'normal',
  now = new Date(),
): RiskResponse {
  const weather = generateWeather(location, scenario, now);
  const hourly = weather.hourly.map(hour => {
    const index = heatIndexC(hour.temp_c, hour.humidity);
    return { time: hour.time, heat_index_c: index, risk_level: riskLevelForHeatIndex(index) };
  });
  const currentIndex = heatIndexC(weather.current.temp_c, weather.current.humidity);
  const currentLevel = riskLevelForHeatIndex(currentIndex);
  return {
    location: weather.location,
    generated_at: weather.generated_at,
    current: {
      heat_index_c: currentIndex,
      risk_level: currentLevel,
      label: LEVEL_LABELS[lang][currentLevel],
      drivers: collectDrivers(weather.current.temp_c, weather.current.humidity, weather.current.uv_index,
        weather.hourly.slice(0, 6).map(hour => hour.temp_c)),
    },
    hourly,
    elevated_periods: mergeElevatedPeriods(hourly),
  };
}