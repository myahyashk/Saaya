import resourcesJson from './resources.json';
import type {
  CitiesRiskResponse,
  CityRisk,
  GuidanceResponse,
  HealthResponse,
  Lang,
  LocationItem,
  LocationsResponse,
  MethodologyResponse,
  NotificationsResponse,
  ResourceItem,
  ResourceType,
  RiskLevel,
  WeatherResponse,
} from '@/types/api';
import { generateGuidance } from './guidance';
import { generateRisk, riskLevelForHeatIndex } from './risk';
import { generateWeather, type EngineLocation, type Scenario } from './weather';

export type { EngineLocation, Scenario } from './weather';

const CITY_LIST: LocationItem[] = [
  { id: 'khairpur', name: 'Khairpur Mirs', province: 'Sindh', lat: 27.5295, lon: 68.7592, default: true },
  { id: 'karachi', name: 'Karachi', province: 'Sindh', lat: 24.8607, lon: 67.0011 },
  { id: 'hyderabad', name: 'Hyderabad', province: 'Sindh', lat: 25.3964, lon: 68.3775 },
  { id: 'sukkur', name: 'Sukkur', province: 'Sindh', lat: 27.7052, lon: 68.8465 },
  { id: 'lahore', name: 'Lahore', province: 'Punjab', lat: 31.5204, lon: 74.3587 },
  { id: 'multan', name: 'Multan', province: 'Punjab', lat: 30.1575, lon: 71.5249 },
  { id: 'faisalabad', name: 'Faisalabad', province: 'Punjab', lat: 31.4504, lon: 73.1350 },
  { id: 'islamabad', name: 'Islamabad', province: 'Islamabad Capital Territory', lat: 33.6844, lon: 73.0479 },
  { id: 'quetta', name: 'Quetta', province: 'Balochistan', lat: 30.1798, lon: 66.9750 },
  { id: 'gwadar', name: 'Gwadar', province: 'Balochistan', lat: 25.1264, lon: 62.3225 },
  { id: 'peshawar', name: 'Peshawar', province: 'Khyber Pakhtunkhwa', lat: 34.0151, lon: 71.5249 },
  { id: 'mingora', name: 'Mingora', province: 'Khyber Pakhtunkhwa', lat: 34.7717, lon: 72.3602 },
  { id: 'gilgit', name: 'Gilgit', province: 'Gilgit-Baltistan', lat: 35.9208, lon: 74.3144 },
  { id: 'skardu', name: 'Skardu', province: 'Gilgit-Baltistan', lat: 35.2971, lon: 75.6333 },
  { id: 'muzaffarabad', name: 'Muzaffarabad', province: 'Azad Jammu and Kashmir', lat: 34.3700, lon: 73.4700 },
];

const METHOD_TEXT: Record<Lang, { title: string; summary: string; disclaimer: string }> = {
  en: {
    title: 'How we calculate heat risk',
    summary: 'Saaya estimates heat risk with the National Weather Service Rothfusz heat-index regression, combining air temperature and relative humidity. Risk bands shown here are Saaya thresholds, not official warnings.',
    disclaimer: 'Local weather and resource entries are synthetic sample data and are not official forecasts or verified facilities.',
  },
  ur: {
    title: 'ہم گرمی کا خطرہ کیسے شمار کرتے ہیں',
    summary: 'سایا نیشنل ویدر سروس کے روتھفسز ہیٹ انڈیکس طریقے سے ہوا کے درجہ حرارت اور نمی کو ملا کر گرمی کا اندازہ کرتا ہے۔ یہ سایا کی سطحیں ہیں، سرکاری وارننگ نہیں۔',
    disclaimer: 'مقامی موسم اور وسائل کا ڈیٹا نمونہ ہے، سرکاری پیش گوئی یا تصدیق شدہ سہولت نہیں۔',
  },
  sd: {
    title: 'اسان گرمي جو خطرو ڪيئن ڳڻيون ٿا',
    summary: 'سايا نيشنل ويدر سروس جي روٿفسز هيٽ انڊيڪس طريقي سان هوا جي گرمي ۽ نمي گڏ ڪري گرمي جو اندازو لڳائي ٿو. هي سايا جون سطحون آهن، سرڪاري تنبيهه نه.',
    disclaimer: 'مقامي موسم ۽ وسيلن جو ڊيٽا نمونو آهي؛ سرڪاري اڳڪٿي يا تصديق ٿيل سهولت ناهي.',
  },
};

const resources = resourcesJson as ResourceItem[];

export function getLocalLocations(): LocationsResponse {
  return { items: CITY_LIST.map(city => ({ ...city })) };
}

export function resolveEngineLocation(params: { lat: number; lon: number; locationName?: string }): EngineLocation {
  const nearest = CITY_LIST.reduce((best, city) => {
    const d = (city.lat - params.lat) ** 2 + (city.lon - params.lon) ** 2;
    return d < best.distance ? { city, distance: d } : best;
  }, { city: CITY_LIST[0], distance: Number.POSITIVE_INFINITY }).city;
  const sameCity = (nearest.lat - params.lat) ** 2 + (nearest.lon - params.lon) ** 2 < 0.0025;
  return { lat: params.lat, lon: params.lon, name: params.locationName || (sameCity ? nearest.name : 'Selected location') };
}

export function generateLocalWeather(location: EngineLocation, scenario: Scenario, now?: Date): WeatherResponse {
  return generateWeather(location, scenario, now);
}

export function generateLocalRisk(location: EngineLocation, lang: Lang, scenario: Scenario, now?: Date) {
  return generateRisk(location, lang, scenario, now);
}

export function generateLocalGuidance(location: EngineLocation, lang: Lang, scenario: Scenario, now?: Date): GuidanceResponse {
  const risk = generateRisk(location, lang, scenario, now);
  return generateGuidance(risk.current.risk_level, risk.current.drivers, lang);
}

function pakistanDate(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function generateLocalNotifications(
  location: EngineLocation,
  lang: Lang,
  scenario: Scenario,
  now = new Date(),
): NotificationsResponse {
  const risk = generateRisk(location, lang, scenario, now);
  const today = pakistanDate(now);
  const city = slug(location.name || `${location.lat.toFixed(2)}-${location.lon.toFixed(2)}`);
  const activeHours = risk.hourly.slice(0, 13).filter(hour => hour.risk_level === 'high' || hour.risk_level === 'extreme');
  const maxActive = activeHours.reduce<RiskLevel>((level, hour) =>
    hour.risk_level === 'extreme' ? 'extreme' : level === 'extreme' ? level : 'high', 'low');
  const dailyItem = {
    id: `daily-${city}-${today}`,
    type: 'daily' as const,
    severity: 'info' as const,
    title: lang === 'ur' ? `روزانہ گرمی اپڈیٹ — ${location.name}` : lang === 'sd' ? `روزانو گرمي اپڊيٽ — ${location.name}` : `Daily heat update — ${location.name}`,
    body: lang === 'ur' ? `آج کا خطرہ ${risk.current.label} ہے۔ باہر جاتے وقت احتیاط کریں۔` : lang === 'sd' ? `اڄ جو خطرو ${risk.current.label} آهي. ٻاهر ويندي احتياط ڪريو.` : `Today's heat risk is ${risk.current.label}. Take care when outdoors.`,
    created_at: risk.generated_at,
  };

  if (activeHours.length === 0) return { items: [dailyItem], active_alert: null };
  const alertLevel = maxActive;
  const first = activeHours[0];
  const last = activeHours[activeHours.length - 1];
  const alert = {
    id: `alert-${city}-${today}-${alertLevel}`,
    type: 'alert' as const,
    severity: 'danger' as const,
    title: lang === 'ur' ? 'گرمی کے خطرے کی وارننگ' : lang === 'sd' ? 'گرمي جي خطري جي تنبيهه' : `${alertLevel === 'extreme' ? 'Extreme' : 'High'} heat warning`,
    body: lang === 'ur' ? 'اگلے گھنٹوں میں شدید گرمی متوقع ہے۔ پانی پئیں اور سایہ تلاش کریں۔' : lang === 'sd' ? 'ايندڙ ڪلاڪن ۾ سخت گرمي جو امڪان آهي. پاڻي پيئو ۽ ڇانوَ ڳوليو.' : 'High heat is expected in the coming hours. Drink water and find shade.',
    created_at: risk.generated_at,
    window: {
      start: first.time,
      end: new Date(new Date(last.time).getTime() + 60 * 60 * 1000).toISOString(),
    },
    actions: lang === 'ur'
      ? ['ٹھنڈی جگہ پر جائیں', 'پانی پئیں', 'بزرگوں کی خبر لیں']
      : lang === 'sd'
        ? ['ٿڌي جاءِ تي وڃو', 'پاڻي پيئو', 'وڏڙن جي خبر وٺو']
        : ['Move to a cooler place', 'Drink water regularly', 'Check on older adults'],
  };
  return { items: [dailyItem, alert], active_alert: alert };
}

export function generateLocalResources(params: {
  lat?: number; lon?: number; radius_km?: number; type?: ResourceType; province?: string;
  q?: string; bbox?: string; limit?: number;
}) {
  let items = resources.map(resource => ({ ...resource }));
  if (params.type) items = items.filter(item => item.type === params.type);
  if (params.province) items = items.filter(item => item.province === params.province);
  if (params.q?.trim()) {
    const query = params.q.trim().toLowerCase();
    items = items.filter(item => [item.name, item.city, item.province, item.address].some(value => value.toLowerCase().includes(query)));
  }
  if (params.bbox) {
    const [minLon, minLat, maxLon, maxLat] = params.bbox.split(',').map(Number);
    if ([minLon, minLat, maxLon, maxLat].every(Number.isFinite)) {
      items = items.filter(item => item.lon >= minLon && item.lon <= maxLon && item.lat >= minLat && item.lat <= maxLat);
    }
  }
  if (params.lat !== undefined && params.lon !== undefined) {
    items = items.map(item => ({ ...item, distance_km: haversine(params.lat!, params.lon!, item.lat, item.lon) }));
    if (params.radius_km !== undefined) items = items.filter(item => (item.distance_km ?? 0) <= params.radius_km!);
    items.sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
  }
  if (params.limit !== undefined) items = items.slice(0, Math.max(0, params.limit));
  return { count: items.length, items };
}

export function generateLocalCitiesRisk(lang: Lang, scenario: Scenario, now?: Date): CitiesRiskResponse {
  const items: CityRisk[] = CITY_LIST.map(city => {
    const risk = generateRisk({ lat: city.lat, lon: city.lon, name: city.name }, lang, scenario, now);
    return {
      id: city.id,
      name: city.name,
      lat: city.lat,
      lon: city.lon,
      risk_level: risk.current.risk_level,
      heat_index_c: risk.current.heat_index_c,
    };
  });
  return { items };
}

export function generateLocalMethodology(lang: Lang): MethodologyResponse {
  const text = METHOD_TEXT[lang];
  return {
    title: text.title,
    summary: text.summary,
    formula: 'NWS Rothfusz Heat Index regression; values below 80°F use air temperature.',
    thresholds: [
      { level: 'low', range: '< 32.2°C' },
      { level: 'moderate', range: '32.2–39.3°C' },
      { level: 'high', range: '39.4–51.6°C' },
      { level: 'extreme', range: '≥ 51.7°C' },
    ],
    sources: [
      { name: 'US National Weather Service - Heat Index', url: 'https://www.weather.gov/safety/heat-index' },
      { name: 'Pakistan Meteorological Department', url: 'https://www.pmd.gov.pk' },
    ],
    disclaimer: text.disclaimer,
  };
}

export function localHealth(now = new Date()): HealthResponse {
  return { status: 'ok', time: now.toISOString() };
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const radians = Math.PI / 180;
  const dLat = (lat2 - lat1) * radians;
  const dLon = (lon2 - lon1) * radians;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * radians) * Math.cos(lat2 * radians) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}