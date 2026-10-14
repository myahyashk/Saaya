export interface ApiEnvironment {
  VITE_API_BASE_URL?: string;
  VITE_API_USE_PROXY?: string;
  VITE_USE_MOCK?: string;
}

export interface ApiConfiguration {
  baseUrl: string;
  useProxy: boolean;
  useMock: boolean;
}

export function parseBooleanFlag(value?: string): boolean {
  return value?.trim().toLowerCase() === 'true';
}

export function normalizeApiBaseUrl(value?: string): string {
  return (value?.trim() || 'http://localhost:8000').replace(/\/+$/, '');
}

export function createApiConfiguration(env: ApiEnvironment = {}): ApiConfiguration {
  return {
    baseUrl: normalizeApiBaseUrl(env.VITE_API_BASE_URL),
    useProxy: env.VITE_API_USE_PROXY === undefined || parseBooleanFlag(env.VITE_API_USE_PROXY),
    useMock: parseBooleanFlag(env.VITE_USE_MOCK),
  };
}

const viteEnv = (import.meta as ImportMeta & { env?: ApiEnvironment }).env ?? {};

export const apiConfiguration = createApiConfiguration(viteEnv);

let runtimeMockOverride: boolean | null = null;

export function isMockModeEnabled(): boolean {
  return runtimeMockOverride ?? apiConfiguration.useMock;
}

export function setRuntimeMockMode(enabled: boolean | null): void {
  runtimeMockOverride = enabled;
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return apiConfiguration.useProxy
    ? normalizedPath
    : `${apiConfiguration.baseUrl}${normalizedPath}`;
}