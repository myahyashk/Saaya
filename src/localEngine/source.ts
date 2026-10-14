export type DataSource = 'api' | 'local';

const endpointSources = new Map<string, DataSource>();
const sourceListeners = new Set<() => void>();
const endpointListeners = new Map<string, Set<() => void>>();
const recoveryChecks = new Map<string, () => Promise<unknown>>();
const recoveryTimers = new Map<string, ReturnType<typeof setInterval>>();

function notifySourceChange(endpoint: string): void {
  sourceListeners.forEach(listener => listener());
  endpointListeners.get(endpoint)?.forEach(listener => listener());
}

export function setEndpointSource(endpoint: string, source: DataSource): void {
  if (endpointSources.get(endpoint) === source) return;
  endpointSources.set(endpoint, source);
  notifySourceChange(endpoint);
}

export function getEndpointSources(): Record<string, DataSource> {
  return Object.fromEntries(endpointSources);
}

export function getEndpointSource(endpoint: string): DataSource | undefined {
  return endpointSources.get(endpoint);
}

export function isLocalEngineActive(): boolean {
  return Array.from(endpointSources.values()).includes('local');
}

export function subscribeDataSources(listener: () => void): () => void {
  sourceListeners.add(listener);
  return () => sourceListeners.delete(listener);
}

export function subscribeEndpointSource(endpoint: string, listener: () => void): () => void {
  const listeners = endpointListeners.get(endpoint) ?? new Set<() => void>();
  listeners.add(listener);
  endpointListeners.set(endpoint, listeners);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) endpointListeners.delete(endpoint);
  };
}

export function registerRecoveryCheck(endpoint: string, check: () => Promise<unknown>): void {
  recoveryChecks.set(endpoint, check);
  if (recoveryTimers.has(endpoint)) return;
  recoveryTimers.set(endpoint, setInterval(() => {
    void retryEndpoint(endpoint);
  }, 60_000));
}

export async function retryEndpoint(endpoint: string): Promise<boolean> {
  const check = recoveryChecks.get(endpoint);
  if (!check) return false;
  try {
    await check();
    setEndpointSource(endpoint, 'api');
    const timer = recoveryTimers.get(endpoint);
    if (timer) clearInterval(timer);
    recoveryTimers.delete(endpoint);
    recoveryChecks.delete(endpoint);
    return true;
  } catch {
    return false;
  }
}

export async function withLocalFallback<T>(options: {
  endpoint: string;
  requestApi: () => Promise<T>;
  requestLocal: () => T | Promise<T>;
  forceLocal?: boolean;
}): Promise<T> {
  if (options.forceLocal) {
    setEndpointSource(options.endpoint, 'local');
    return options.requestLocal();
  }

  try {
    const response = await options.requestApi();
    setEndpointSource(options.endpoint, 'api');
    return response;
  } catch {
    setEndpointSource(options.endpoint, 'local');
    registerRecoveryCheck(options.endpoint, options.requestApi);
    return options.requestLocal();
  }
}