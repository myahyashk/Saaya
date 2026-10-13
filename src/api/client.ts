import type {
  HealthResponse,
  LocationsResponse,
  WeatherResponse,
  RiskResponse,
  GuidanceResponse,
  NotificationsResponse,
  ResourcesResponse,
  CitiesRiskResponse,
  MethodologyResponse,
  Lang,
  ResourceType,
} from '@/types/api';
import { mockData } from './mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const DEMO = import.meta.env.VITE_DEMO === 'true';

export interface LocationParams {
  lat: number;
  lon: number;
  lang: Lang;
  scenario?: 'extreme';
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
}

async function apiFetch<T>(path: string, query: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = `${BASE_URL}${path}${buildQuery(query)}`;
  const res = await fetch(url);
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch { /* ignore parse error */ }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

function isExtremeScenario(params?: { scenario?: 'extreme' }): boolean {
  return DEMO && params?.scenario === 'extreme';
}

export const api = {
  health(): Promise<HealthResponse> {
    if (USE_MOCK) return Promise.resolve(mockData.health());
    return apiFetch<HealthResponse>('/api/health', {});
  },

  locations(): Promise<LocationsResponse> {
    if (USE_MOCK) return Promise.resolve(mockData.locations());
    return apiFetch<LocationsResponse>('/api/locations', {});
  },

  weather(p: LocationParams): Promise<WeatherResponse> {
    const extreme = isExtremeScenario({ scenario: p.scenario });
    if (USE_MOCK || extreme) return Promise.resolve(mockData.weather(extreme || DEMO && p.scenario === 'extreme'));
    const q: Record<string, string | number | boolean | undefined> = {
      lat: p.lat, lon: p.lon, lang: p.lang,
    };
    if (p.scenario) q.scenario = p.scenario;
    return apiFetch<WeatherResponse>('/api/weather', q);
  },

  risk(p: LocationParams): Promise<RiskResponse> {
    const extreme = DEMO && p.scenario === 'extreme';
    if (USE_MOCK) return Promise.resolve(mockData.risk(extreme, p.lang));
    const q: Record<string, string | number | boolean | undefined> = {
      lat: p.lat, lon: p.lon, lang: p.lang,
    };
    if (p.scenario) q.scenario = p.scenario;
    return apiFetch<RiskResponse>('/api/risk', q);
  },

  guidance(p: LocationParams): Promise<GuidanceResponse> {
    const extreme = DEMO && p.scenario === 'extreme';
    if (USE_MOCK) return Promise.resolve(mockData.guidance(extreme, p.lang));
    const q: Record<string, string | number | boolean | undefined> = {
      lat: p.lat, lon: p.lon, lang: p.lang,
    };
    if (p.scenario) q.scenario = p.scenario;
    return apiFetch<GuidanceResponse>('/api/guidance', q);
  },

  notifications(p: LocationParams): Promise<NotificationsResponse> {
    const extreme = DEMO && p.scenario === 'extreme';
    if (USE_MOCK) return Promise.resolve(mockData.notifications(extreme, p.lang));
    const q: Record<string, string | number | boolean | undefined> = {
      lat: p.lat, lon: p.lon, lang: p.lang,
    };
    if (p.scenario) q.scenario = p.scenario;
    return apiFetch<NotificationsResponse>('/api/notifications', q);
  },

  resources(p: {
    lat?: number; lon?: number; radius_km?: number; type?: ResourceType; province?: string;
    q?: string; bbox?: string; limit?: number;
  }): Promise<ResourcesResponse> {
    if (USE_MOCK) {
      let items = mockData.resources().items;
      if (p.type) items = items.filter(i => i.type === p.type);
      if (p.province) items = items.filter(i => i.province === p.province);
      if (p.q) {
        const ql = p.q.toLowerCase();
        items = items.filter(i => i.name.toLowerCase().includes(ql) || i.city.toLowerCase().includes(ql) || i.address.toLowerCase().includes(ql));
      }
      if (p.bbox) {
        const [minLon, minLat, maxLon, maxLat] = p.bbox.split(',').map(Number);
        items = items.filter(i => i.lon >= minLon && i.lon <= maxLon && i.lat >= minLat && i.lat <= maxLat);
      }
      if (p.lat != null && p.lon != null) {
        items = items.map(i => ({
          ...i,
          distance_km: Math.round(haversine(p.lat!, p.lon!, i.lat, i.lon) * 10) / 10,
        }));
        if (p.radius_km) items = items.filter(i => (i.distance_km ?? 0) <= p.radius_km!);
      }
      if (p.limit) items = items.slice(0, p.limit);
      return Promise.resolve({ count: items.length, items });
    }
    return apiFetch<ResourcesResponse>('/api/resources', {
      lat: p.lat, lon: p.lon, radius_km: p.radius_km, type: p.type,
      province: p.province, q: p.q, bbox: p.bbox, limit: p.limit,
    });
  },

  cities(): Promise<CitiesRiskResponse> {
    if (USE_MOCK) return Promise.resolve(mockData.cities());
    return apiFetch<CitiesRiskResponse>('/api/risk/cities', {});
  },

  methodology(lang: Lang): Promise<MethodologyResponse> {
    if (USE_MOCK) return Promise.resolve(mockData.methodology(lang));
    return apiFetch<MethodologyResponse>('/api/methodology', { lang });
  },
};

export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
