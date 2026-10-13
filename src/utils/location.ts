export interface ResolvedLocation {
  lat: number;
  lon: number;
  name: string;
  source: 'geolocation' | 'city';
}

export interface CityOption {
  id: string;
  name: string;
  province: string;
  lat: number;
  lon: number;
  default?: boolean;
}

export function getDefaultCity(cities: CityOption[]): CityOption | null {
  return cities.find(c => c.default) ?? cities[0] ?? null;
}

export function findCityById(cities: CityOption[], id: string): CityOption | null {
  return cities.find(c => c.id === id) ?? null;
}

export function resolveLocation(
  useGeo: boolean,
  geo: { lat: number; lon: number; name: string } | null,
  selectedCity: CityOption | null,
  defaultCity: CityOption | null,
): ResolvedLocation {
  if (useGeo && geo) {
    return { lat: geo.lat, lon: geo.lon, name: geo.name, source: 'geolocation' };
  }
  const city = selectedCity ?? defaultCity;
  if (city) {
    return { lat: city.lat, lon: city.lon, name: city.name, source: 'city' };
  }
  // Ultimate fallback — Khairpur Mirs
  return { lat: 27.5295, lon: 68.7592, name: 'Khairpur Mirs', source: 'city' };
}

export async function requestGeolocation(): Promise<{ lat: number; lon: number } | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 10000, maximumAge: 300000 },
    );
  });
}
