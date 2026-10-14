export const DEFAULT_MAP_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
export const OSM_FALLBACK_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const MAP_TILE_ATTRIBUTION = '© OpenStreetMap contributors © CARTO';

export function resolveMapTileUrl(value?: string): string {
  return value?.trim() || DEFAULT_MAP_TILE_URL;
}

const viteEnv = (import.meta as ImportMeta & { env?: { VITE_MAP_TILE_URL?: string } }).env ?? {};

export const MAP_TILE_URL = resolveMapTileUrl(viteEnv.VITE_MAP_TILE_URL);