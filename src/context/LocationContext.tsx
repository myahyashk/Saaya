import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Lang, LocationItem } from '@/types/api';
import { api } from '@/api/client';
import { resolveLocation, requestGeolocation, getDefaultCity, findCityById, type ResolvedLocation } from '@/utils/location';

interface LocationContextValue {
  location: ResolvedLocation;
  useGeo: boolean;
  geoStatus: 'idle' | 'detecting' | 'granted' | 'denied';
  cities: LocationItem[];
  selectedCityId: string | null;
  setUseGeo: (on: boolean) => void;
  setSelectedCityId: (id: string) => void;
  refreshGeo: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

const CITY_KEY = 'saaya-selected-city';
const GEO_KEY = 'saaya-use-geo';

export function LocationProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<LocationItem[]>([]);
  const [selectedCityId, setSelectedCityIdState] = useState<string | null>(() => localStorage.getItem(CITY_KEY));
  const [useGeo, setUseGeoState] = useState<boolean>(() => localStorage.getItem(GEO_KEY) === 'true');
  const [geo, setGeo] = useState<{ lat: number; lon: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'detecting' | 'granted' | 'denied'>('idle');

  useEffect(() => {
    api.locations().then(res => {
      setCities(res.items);
    }).catch(() => { /* keep empty; fallback handles it */ });
  }, []);

  const doGeolocation = useCallback(async () => {
    setGeoStatus('detecting');
    const result = await requestGeolocation();
    if (result) {
      setGeo(result);
      setGeoStatus('granted');
    } else {
      setGeo(null);
      setGeoStatus('denied');
    }
  }, []);

  useEffect(() => {
    if (useGeo) {
      doGeolocation();
    } else {
      setGeo(null);
      setGeoStatus('idle');
    }
  }, [useGeo, doGeolocation]);

  const setUseGeo = useCallback((on: boolean) => {
    setUseGeoState(on);
    localStorage.setItem(GEO_KEY, String(on));
  }, []);

  const setSelectedCityId = useCallback((id: string) => {
    setSelectedCityIdState(id);
    localStorage.setItem(CITY_KEY, id);
  }, []);

  const refreshGeo = useCallback(() => {
    if (useGeo) doGeolocation();
  }, [useGeo, doGeolocation]);

  const citiesAsOptions = cities.map(c => ({ id: c.id, name: c.name, province: c.province, lat: c.lat, lon: c.lon, default: c.default }));
  const defaultCity = getDefaultCity(citiesAsOptions);
  const selectedCity = selectedCityId ? findCityById(citiesAsOptions, selectedCityId) : null;

  const geoWithName = geo ? { ...geo, name: 'My location' } : null;

  const location = resolveLocation(useGeo, geoWithName, selectedCity, defaultCity);

  return (
    <LocationContext.Provider value={{ location, useGeo, geoStatus, cities, selectedCityId, setUseGeo, setSelectedCityId, refreshGeo }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationCtx(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationCtx must be used within LocationProvider');
  return ctx;
}
