export type ConnectionMode = 'connected' | 'offline' | 'demo';

export function resolveConnectionMode(
  configuredDemo: boolean,
  userSelectedDemo: boolean,
  healthCheckPassed: boolean,
): ConnectionMode {
  if (configuredDemo || userSelectedDemo) return 'demo';
  return healthCheckPassed ? 'connected' : 'offline';
}

export function shouldOfferDemo(mode: ConnectionMode, healthCheckFinished: boolean): boolean {
  return mode === 'offline' && healthCheckFinished;
}