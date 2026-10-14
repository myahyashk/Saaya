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
import { apiConfiguration, buildApiUrl, isMockModeEnabled } from './config';

const DEMO = import.meta.env.VITE_DEMO === 'true';

export type ApiErrorKind = 'NetworkError' | 'HttpError' | 'ShapeError';

export class NetworkError extends Error {
  readonly kind = 'NetworkError';
  constructor(readonly url: string, readonly causeMessage: string) {
    super(`Cannot reach the Saaya server at ${url}`);
    this.name = 'NetworkError';
  }
}

export class HttpError extends Error {
  readonly kind = 'HttpError';
  constructor(readonly status: number, message: string, readonly url: string) {
    super(message);
    this.name = 'HttpError';
  }
}

export class ShapeError extends Error {
  readonly kind = 'ShapeError';
  constructor(message: string, readonly url: string) {
    super(message);
    this.name = 'ShapeError';
  }
}

export type ApiRequestError = NetworkError | HttpError | ShapeError;

export function classifyApiError(error: unknown): ApiErrorKind {
  if (error instanceof HttpError) return 'HttpError';
  if (error instanceof ShapeError) return 'ShapeError';
  return 'NetworkError';
}

export interface FailedRequest {
  url: string;
  status: number | null;
  errorKind: ApiErrorKind;
  time: string;
}

const failedRequests: FailedRequest[] = [];
const failureListeners = new Set<() => void>();

export function getFailedRequests(): FailedRequest[] {
  return [...failedRequests];
}

export function subscribeFailedRequests(listener: () => void): () => void {
  failureListeners.add(listener);
  return () => failureListeners.delete(listener);
}

function recordFailure(error: ApiRequestError): ApiRequestError {
  failedRequests.unshift({
    url: error.url,
    status: error instanceof HttpError ? error.status : null,
    errorKind: error.kind,
    time: new Date().toISOString(),
  });
  failedRequests.length = Math.min(failedRequests.length, 10);
  failureListeners.forEach(listener => listener());
  if (import.meta.env.DEV) console.error(`[Saaya API] ${error.kind} ${error.url}`, error);
  return error;
}

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

type ShapeGuard = (value: unknown) => boolean;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isRiskLevel(value: unknown): boolean {
  return value === 'low' || value === 'moderate' || value === 'high' || value === 'extreme';
}

function isLocationInfo(value: unknown): boolean {
  return isObject(value) && isString(value.name) && isNumber(value.lat) && isNumber(value.lon);
}

function isNotification(value: unknown): boolean {
  return isObject(value) && isString(value.id) &&
    (value.type === 'daily' || value.type === 'alert') &&
    (value.severity === 'info' || value.severity === 'warning' || value.severity === 'danger') &&
    isString(value.title) && isString(value.body) && isString(value.created_at) &&
    (value.actions === undefined || (Array.isArray(value.actions) && value.actions.every(isString)));
}

const shapeGuards: Record<string, ShapeGuard> = {
  health: value => isObject(value) && value.status === 'ok' && isString(value.time),
  locations: value => isObject(value) && Array.isArray(value.items) && value.items.every(item =>
    isObject(item) && isString(item.id) && isString(item.name) && isString(item.province) &&
    isNumber(item.lat) && isNumber(item.lon) && (item.default === undefined || typeof item.default === 'boolean')),
  weather: value => isObject(value) && isLocationInfo(value.location) && isString(value.generated_at) &&
    isObject(value.current) && isString(value.current.time) && isNumber(value.current.temp_c) &&
    isNumber(value.current.feels_like_c) && isNumber(value.current.humidity) &&
    isNumber(value.current.wind_kph) && isNumber(value.current.uv_index) &&
    isString(value.current.condition) && isNumber(value.current.weather_code) &&
    Array.isArray(value.hourly) && value.hourly.every(item => isObject(item) && isString(item.time) &&
      isNumber(item.temp_c) && isNumber(item.feels_like_c) && isNumber(item.humidity) && isNumber(item.uv_index)) &&
    Array.isArray(value.daily) && value.daily.every(item => isObject(item) && isString(item.date) &&
      isNumber(item.temp_max_c) && isNumber(item.temp_min_c) && isNumber(item.uv_index_max) &&
      isString(item.sunrise) && isString(item.sunset)),
  risk: value => isObject(value) && isLocationInfo(value.location) && isString(value.generated_at) &&
    isObject(value.current) && isNumber(value.current.heat_index_c) && isRiskLevel(value.current.risk_level) &&
    isString(value.current.label) && Array.isArray(value.current.drivers) && value.current.drivers.every(isString) &&
    Array.isArray(value.hourly) && value.hourly.every(item => isObject(item) && isString(item.time) &&
      isNumber(item.heat_index_c) && isRiskLevel(item.risk_level)) &&
    Array.isArray(value.elevated_periods) && value.elevated_periods.every(item => isObject(item) &&
      isString(item.start) && isString(item.end) && isNumber(item.peak_heat_index_c) && isRiskLevel(item.risk_level)),
  guidance: value => isObject(value) && Array.isArray(value.items) && isRiskLevel(value.risk_level) &&
    (value.lang === 'en' || value.lang === 'ur' || value.lang === 'sd') && isString(value.disclaimer) &&
    value.items.every(item => isObject(item) && isString(item.id) && isString(item.audience) &&
      isString(item.icon) && isString(item.title) && isString(item.body)),
  notifications: value => isObject(value) && Array.isArray(value.items) && value.items.every(isNotification) &&
    (value.active_alert === null || isNotification(value.active_alert)),
  resources: value => isObject(value) && isNumber(value.count) && Array.isArray(value.items) &&
    value.items.every(item => isObject(item) && isString(item.id) && isString(item.name) &&
      isString(item.type) && isNumber(item.lat) && isNumber(item.lon) && isString(item.address) &&
      isString(item.city) && isString(item.province) && isString(item.hours) && isString(item.contact) &&
      isString(item.notes) && typeof item.verified === 'boolean' &&
      (item.distance_km === undefined || isNumber(item.distance_km))),
  cities: value => isObject(value) && Array.isArray(value.items) && value.items.every(item => isObject(item) &&
    isString(item.id) && isString(item.name) && isNumber(item.lat) && isNumber(item.lon) &&
    isRiskLevel(item.risk_level) && isNumber(item.heat_index_c)),
  methodology: value => isObject(value) && isString(value.title) && isString(value.summary) &&
    isString(value.formula) && isString(value.disclaimer) && Array.isArray(value.thresholds) &&
    value.thresholds.every(item => isObject(item) && isRiskLevel(item.level) && isString(item.range)) &&
    Array.isArray(value.sources) && value.sources.every(item => isObject(item) && isString(item.name) && isString(item.url)),
};

function fullRequestUrl(url: string): string {
  const origin = typeof window === 'undefined' ? apiConfiguration.baseUrl : window.location.origin;
  return new URL(url, origin).href;
}

async function apiFetch<T>(
  path: string,
  query: Record<string, string | number | boolean | undefined>,
  shape: ShapeGuard,
): Promise<T> {
  const url = `${buildApiUrl(path)}${buildQuery(query)}`;
  const fullUrl = fullRequestUrl(url);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        let message = `Request failed with status ${response.status}`;
        try {
          const errorBody: unknown = await response.json();
          if (isObject(errorBody) && isString(errorBody.error)) message = errorBody.error;
        } catch { /* keep status-based message when the error body is not JSON */ }
        throw new HttpError(response.status, message, fullUrl);
      }

      let body: unknown;
      try {
        body = await response.json();
      } catch (error) {
        if (error instanceof SyntaxError) throw new ShapeError('The server returned invalid JSON.', fullUrl);
        throw error;
      }
      if (!shape(body)) throw new ShapeError('The server response does not match the Saaya API contract.', fullUrl);
      return body as T;
    } catch (error) {
      if (error instanceof HttpError || error instanceof ShapeError) throw recordFailure(error);
      if (attempt === 0) continue;
      const message = error instanceof Error ? error.message : 'Network request failed';
      throw recordFailure(new NetworkError(fullUrl, message));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw recordFailure(new NetworkError(fullUrl, 'Network request failed'));
}

function isExtremeScenario(params?: { scenario?: 'extreme' }): boolean {
  return DEMO && params?.scenario === 'extreme';
}

export const api = {
  health(forceNetwork = false): Promise<HealthResponse> {
    if (isMockModeEnabled() && !forceNetwork) return Promise.resolve(mockData.health());
    return apiFetch<HealthResponse>('/api/health', {}, shapeGuards.health);
  },

  locations(): Promise<LocationsResponse> {
    if (isMockModeEnabled()) return Promise.resolve(mockData.locations());
    return apiFetch<LocationsResponse>('/api/locations', {}, shapeGuards.locations);
  },

  weather(p: LocationParams): Promise<WeatherResponse> {
    const extreme = isExtremeScenario({ scenario: p.scenario });
    if (isMockModeEnabled() || extreme) return Promise.resolve(mockData.weather(extreme || DEMO && p.scenario === 'extreme'));
    const q: Record<string, string | number | boolean | undefined> = {
      lat: p.lat, lon: p.lon, lang: p.lang,
    };
    if (p.scenario) q.scenario = p.scenario;
    return apiFetch<WeatherResponse>('/api/weather', q, shapeGuards.weather);
  },

  risk(p: LocationParams): Promise<RiskResponse> {
    const extreme = DEMO && p.scenario === 'extreme';
    if (isMockModeEnabled()) return Promise.resolve(mockData.risk(extreme, p.lang));
    const q: Record<string, string | number | boolean | undefined> = {
      lat: p.lat, lon: p.lon, lang: p.lang,
    };
    if (p.scenario) q.scenario = p.scenario;
    return apiFetch<RiskResponse>('/api/risk', q, shapeGuards.risk);
  },

  guidance(p: LocationParams): Promise<GuidanceResponse> {
    const extreme = DEMO && p.scenario === 'extreme';
    if (isMockModeEnabled()) return Promise.resolve(mockData.guidance(extreme, p.lang));
    const q: Record<string, string | number | boolean | undefined> = {
      lat: p.lat, lon: p.lon, lang: p.lang,
    };
    if (p.scenario) q.scenario = p.scenario;
    return apiFetch<GuidanceResponse>('/api/guidance', q, shapeGuards.guidance);
  },

  notifications(p: LocationParams): Promise<NotificationsResponse> {
    const extreme = DEMO && p.scenario === 'extreme';
    if (isMockModeEnabled()) return Promise.resolve(mockData.notifications(extreme, p.lang));
    const q: Record<string, string | number | boolean | undefined> = {
      lat: p.lat, lon: p.lon, lang: p.lang,
    };
    if (p.scenario) q.scenario = p.scenario;
    return apiFetch<NotificationsResponse>('/api/notifications', q, shapeGuards.notifications);
  },

  resources(p: {
    lat?: number; lon?: number; radius_km?: number; type?: ResourceType; province?: string;
    q?: string; bbox?: string; limit?: number;
  }): Promise<ResourcesResponse> {
    if (isMockModeEnabled()) {
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
    }, shapeGuards.resources);
  },

  cities(): Promise<CitiesRiskResponse> {
    if (isMockModeEnabled()) return Promise.resolve(mockData.cities());
    return apiFetch<CitiesRiskResponse>('/api/risk/cities', {}, shapeGuards.cities);
  },

  methodology(lang: Lang): Promise<MethodologyResponse> {
    if (isMockModeEnabled()) return Promise.resolve(mockData.methodology(lang));
    return apiFetch<MethodologyResponse>('/api/methodology', { lang }, shapeGuards.methodology);
  },
};

export interface EndpointTestResult {
  endpoint: string;
  ok: boolean;
  responseTimeMs: number;
  status: number | null;
  errorKind?: ApiErrorKind;
  message?: string;
}

export async function testAllApiEndpoints(): Promise<EndpointTestResult[]> {
  const lat = 27.5295;
  const lon = 68.7592;
  const lang = 'en';
  const checks: Array<{ path: string; query: Record<string, string | number | boolean | undefined>; shape: ShapeGuard }> = [
    { path: '/api/health', query: {}, shape: shapeGuards.health },
    { path: '/api/locations', query: {}, shape: shapeGuards.locations },
    { path: '/api/weather', query: { lat, lon, lang }, shape: shapeGuards.weather },
    { path: '/api/risk', query: { lat, lon, lang }, shape: shapeGuards.risk },
    { path: '/api/guidance', query: { lat, lon, lang }, shape: shapeGuards.guidance },
    { path: '/api/notifications', query: { lat, lon, lang }, shape: shapeGuards.notifications },
    { path: '/api/resources', query: { lat, lon, limit: 100 }, shape: shapeGuards.resources },
    { path: '/api/risk/cities', query: {}, shape: shapeGuards.cities },
    { path: '/api/methodology', query: { lang }, shape: shapeGuards.methodology },
  ];

  return Promise.all(checks.map(async check => {
    const startedAt = performance.now();
    try {
      await apiFetch<unknown>(check.path, check.query, check.shape);
      return { endpoint: check.path, ok: true, responseTimeMs: Math.round(performance.now() - startedAt), status: 200 };
    } catch (error) {
      const requestError = error as ApiRequestError;
      return {
        endpoint: check.path,
        ok: false,
        responseTimeMs: Math.round(performance.now() - startedAt),
        status: requestError instanceof HttpError ? requestError.status : null,
        errorKind: requestError.kind,
        message: requestError.message,
      };
    }
  }));
}

export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
