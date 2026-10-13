// API contract types for Saaya backend
// Base URL from VITE_API_BASE_URL, default http://localhost:8000

export type RiskLevel = 'low' | 'moderate' | 'high' | 'extreme';
export type Lang = 'en' | 'ur' | 'sd';
export type ResourceType = 'cooling_center' | 'water_point' | 'assistance';
export type NotificationType = 'daily' | 'alert';
export type NotificationSeverity = 'info' | 'warning' | 'danger';
export type Audience = 'everyone' | 'outdoor_workers' | 'older_adults' | 'children';
export type GuidanceIcon = 'water' | 'shade' | 'clock' | 'clothing' | 'sun' | 'alert';

export interface LocationItem {
  id: string;
  name: string;
  province: string;
  lat: number;
  lon: number;
  default?: boolean;
}

export interface LocationInfo {
  name: string;
  lat: number;
  lon: number;
  timezone?: string;
}

export interface HealthResponse {
  status: string;
  demo_mode: boolean;
  time: string;
}

export interface LocationsResponse {
  items: LocationItem[];
}

export interface CurrentWeather {
  time: string;
  temp_c: number;
  feels_like_c: number;
  humidity: number;
  wind_kph: number;
  uv_index: number;
  condition: string;
  weather_code: number;
}

export interface HourlyWeather {
  time: string;
  temp_c: number;
  feels_like_c: number;
  humidity: number;
  uv_index: number;
}

export interface DailyWeather {
  date: string;
  temp_max_c: number;
  temp_min_c: number;
  uv_index_max: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherResponse {
  location: LocationInfo;
  generated_at: string;
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
}

export interface RiskCurrent {
  heat_index_c: number;
  risk_level: RiskLevel;
  label: string;
  drivers: string[];
}

export interface HourlyRisk {
  time: string;
  heat_index_c: number;
  risk_level: RiskLevel;
}

export interface ElevatedPeriod {
  start: string;
  end: string;
  peak_heat_index_c: number;
  risk_level: RiskLevel;
}

export interface RiskResponse {
  location: LocationInfo;
  generated_at: string;
  current: RiskCurrent;
  hourly: HourlyRisk[];
  elevated_periods: ElevatedPeriod[];
}

export interface GuidanceItem {
  id: string;
  audience: Audience;
  icon: GuidanceIcon;
  title: string;
  body: string;
}

export interface GuidanceResponse {
  risk_level: RiskLevel;
  lang: Lang;
  items: GuidanceItem[];
  disclaimer: string;
}

export interface AlertWindow {
  start: string;
  end: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  body: string;
  created_at: string;
  window?: AlertWindow;
  actions?: string[];
}

export interface NotificationsResponse {
  items: NotificationItem[];
  active_alert: NotificationItem | null;
}

export interface ResourceItem {
  id: string;
  name: string;
  type: ResourceType;
  lat: number;
  lon: number;
  address: string;
  city: string;
  province: string;
  hours: string;
  contact: string;
  notes: string;
  verified: boolean;
  distance_km?: number;
}

export interface ResourcesResponse {
  count: number;
  items: ResourceItem[];
}

export interface CityRisk {
  id: string;
  name: string;
  lat: number;
  lon: number;
  risk_level: RiskLevel;
  heat_index_c: number;
}

export interface CitiesRiskResponse {
  items: CityRisk[];
}

export interface MethodologyThreshold {
  level: RiskLevel;
  range: string;
}

export interface MethodologySource {
  name: string;
  url: string;
}

export interface MethodologyResponse {
  title: string;
  summary: string;
  formula: string;
  thresholds: MethodologyThreshold[];
  sources: MethodologySource[];
  disclaimer: string;
}

export interface ApiError {
  error: string;
}
