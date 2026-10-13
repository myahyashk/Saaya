import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';
import type { WeatherResponse, RiskResponse, GuidanceResponse, MethodologyResponse, ResourcesResponse, CitiesRiskResponse } from '@/types/api';
import { useLocationCtx } from '@/context/LocationContext';
import { useI18n } from '@/i18n/context';
import { useDemo } from '@/context/DemoContext';
import type { Lang } from '@/types/api';

interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useDataFetcher<T>(
  fetcher: (params: { lat: number; lon: number; lang: Lang; scenario?: 'extreme' }) => Promise<T>,
  deps: unknown[]
): DataState<T> {
  const { location } = useLocationCtx();
  const { lang } = useI18n();
  const { scenario } = useDemo();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce(n => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher({ lat: location.lat, lon: location.lon, lang: lang as Lang, scenario })
      .then(result => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.lat, location.lon, lang, scenario, nonce, ...deps]);

  return { data, loading, error, refetch };
}

export function useWeather(): DataState<WeatherResponse> {
  return useDataFetcher<WeatherResponse>(
    (p) => api.weather(p),
    []
  );
}

export function useRisk(): DataState<RiskResponse> {
  return useDataFetcher<RiskResponse>(
    (p) => api.risk(p),
    []
  );
}

export function useGuidance(): DataState<GuidanceResponse> {
  return useDataFetcher<GuidanceResponse>(
    (p) => api.guidance(p),
    []
  );
}

export function useMethodology(): DataState<MethodologyResponse> {
  const { lang } = useI18n();
  const [data, setData] = useState<MethodologyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce(n => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.methodology(lang as Lang)
      .then(res => { if (!cancelled) { setData(res); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err instanceof Error ? err.message : 'Failed'); setLoading(false); } });
    return () => { cancelled = true; };
  }, [lang, nonce]);

  return { data, loading, error, refetch };
}

export function useResources(params: {
  type?: string; province?: string; q?: string; bbox?: string; limit?: number;
}): DataState<ResourcesResponse> {
  const { location } = useLocationCtx();
  const { type, province, q, bbox, limit } = params;
  const [data, setData] = useState<ResourcesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce(n => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.resources({ lat: location.lat, lon: location.lon, type: type as any, province, q, bbox, limit })
      .then(res => { if (!cancelled) { setData(res); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err instanceof Error ? err.message : 'Failed'); setLoading(false); } });
    return () => { cancelled = true; };
  }, [location.lat, location.lon, type, province, q, bbox, limit, nonce]);

  return { data, loading, error, refetch };
}

export function useCityRisk(): DataState<CitiesRiskResponse> {
  const [data, setData] = useState<CitiesRiskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.cities()
      .then(res => { if (!cancelled) { setData(res); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err instanceof Error ? err.message : 'Failed'); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error, refetch: () => {} };
}
