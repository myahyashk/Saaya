import { useState } from 'react';
import { TileLayer } from 'react-leaflet';
import { MAP_TILE_ATTRIBUTION, MAP_TILE_URL, OSM_FALLBACK_TILE_URL } from '@/config/mapTiles';

export function ResilientMapTiles({ onTileError }: { onTileError?: () => void }) {
  const [usingFallback, setUsingFallback] = useState(false);

  return (
    <TileLayer
      key={usingFallback ? 'osm-fallback' : 'primary'}
      url={usingFallback ? OSM_FALLBACK_TILE_URL : MAP_TILE_URL}
      subdomains={usingFallback ? 'abc' : 'abcd'}
      maxZoom={19}
      attribution={MAP_TILE_ATTRIBUTION}
      eventHandlers={{
        tileerror: () => {
          onTileError?.();
          if (!usingFallback) setUsingFallback(true);
        },
      }}
    />
  );
}