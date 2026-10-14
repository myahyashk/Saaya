import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { HealthResponse } from '@/types/api';
import { api, type ApiRequestError } from '@/api/client';
import { apiConfiguration, setRuntimeMockMode } from '@/api/config';
import { resolveConnectionMode, shouldOfferDemo, type ConnectionMode } from './connectionState';

interface HealthCheckResult {
  finished: boolean;
  ok: boolean;
  checkedAt?: string;
  response?: HealthResponse;
  error?: ApiRequestError;
}

interface ConnectionContextValue {
  mode: ConnectionMode;
  isUsingMockData: boolean;
  shouldOfferDemo: boolean;
  health: HealthCheckResult;
  useDemoData: () => void;
  retryHealthCheck: () => void;
}

const ConnectionContext = createContext<ConnectionContextValue | null>(null);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [userSelectedDemo, setUserSelectedDemo] = useState(false);
  const [healthAttempt, setHealthAttempt] = useState(0);
  const [health, setHealth] = useState<HealthCheckResult>({ finished: false, ok: false });

  useEffect(() => {
    let active = true;
    setHealth({ finished: false, ok: false });
    api.health(true).then(response => {
      if (active) setHealth({ finished: true, ok: response.status === 'ok', checkedAt: response.time, response });
    }).catch(error => {
      if (active) setHealth({ finished: true, ok: false, error: error as ApiRequestError });
    });
    return () => { active = false; };
  }, [healthAttempt]);

  useEffect(() => {
    setRuntimeMockMode(userSelectedDemo ? true : null);
  }, [userSelectedDemo]);

  const useDemoData = useCallback(() => {
    setRuntimeMockMode(true);
    setUserSelectedDemo(true);
  }, []);

  const retryHealthCheck = useCallback(() => setHealthAttempt(attempt => attempt + 1), []);

  const mode = resolveConnectionMode(apiConfiguration.useMock, userSelectedDemo, health.ok);
  const value = useMemo(() => ({
    mode,
    isUsingMockData: mode === 'demo',
    shouldOfferDemo: shouldOfferDemo(mode, health.finished),
    health,
    useDemoData,
    retryHealthCheck,
  }), [mode, health, useDemoData, retryHealthCheck]);

  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>;
}

export function useConnection(): ConnectionContextValue {
  const context = useContext(ConnectionContext);
  if (!context) throw new Error('useConnection must be used within ConnectionProvider');
  return context;
}