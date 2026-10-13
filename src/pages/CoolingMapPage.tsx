import { useState, useRef, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Navigation, Snowflake, Droplets, HeartHandshake, AlertCircle } from 'lucide-react';
import { useI18n } from '@/i18n/context';
import { useResources, useCityRisk } from '@/hooks/useData';
import { useLocationCtx } from '@/context/LocationContext';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { RiskDot } from '@/components/RiskBadge';
import { haversine } from '@/api/client';
import type { ResourceItem, ResourceType } from '@/types/api';
import type { TranslationKey } from '@/i18n/translations';

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const typeConfig: Record<ResourceType, { color: string; icon: typeof Snowflake }> = {
  cooling_center: { color: '#2563eb', icon: Snowflake },
  water_point: { color: '#06b6d4', icon: Droplets },
  assistance: { color: '#8b5cf6', icon: HeartHandshake },
};

function createTypeIcon(type: ResourceType): L.DivIcon {
  const cfg = typeConfig[type];
  return L.divIcon({
    html: `<div style="background:${cfg.color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"></div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

function createCityIcon(level: string): L.DivIcon {
  const colors: Record<string, string> = {
    low: '#22c55e', moderate: '#f59e0b', high: '#f97316', extreme: '#ef4444',
  };
  const c = colors[level] || '#cbd5e1';
  return L.divIcon({
    html: `<div style="background:${c};width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

const typeLabelKey: Record<ResourceType, TranslationKey> = {
  cooling_center: 'map.coolingCenter',
  water_point: 'map.waterPoint',
  assistance: 'map.assistance',
};

const PAKISTAN_CENTER: [number, number] = [30.3753, 69.3451];

function FlyToButton({ target, label }: { target: [number, number] | null; label: string }) {
  const map = useMap();
  if (!target) return null;
  return (
    <button
      onClick={() => map.flyTo(target, 12, { duration: 1.2 })}
      className="absolute top-3 right-3 z-[500] bg-white shadow-md rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
    >
      <Navigation size={16} className="text-blue-600" />
      {label}
    </button>
  );
}

export default function CoolingMapPage() {
  const { t } = useI18n();
  const { location } = useLocationCtx();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [provinceFilter, setProvinceFilter] = useState<string>('');
  const [bbox, setBbox] = useState<string>('');
  const [nearbyList, setNearbyList] = useState<ResourceItem[] | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const { data: resources, loading, error, refetch } = useResources({
    type: typeFilter || undefined,
    province: provinceFilter || undefined,
    q: search || undefined,
    bbox: bbox || undefined,
    limit: 100,
  });

  const { data: cityRisk } = useCityRisk();

  const provinces = useMemo(() => {
    const set = new Set<string>();
    resources?.items.forEach(i => set.add(i.province));
    return Array.from(set).sort();
  }, [resources]);

  const sortedByDistance = useMemo(() => {
    if (!resources?.items) return [];
    return [...resources.items]
      .map(i => ({
        ...i,
        distance_km: i.distance_km ?? Math.round(haversine(location.lat, location.lon, i.lat, i.lon) * 10) / 10,
      }))
      .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
  }, [resources, location.lat, location.lon]);

  function handleNearMe() {
    if (mapRef.current) {
      mapRef.current.flyTo([location.lat, location.lon], 12, { duration: 1.2 });
    }
    setNearbyList(sortedByDistance.slice(0, 5));
  }

  function handleMapMove() {
    if (!mapRef.current) return;
    const b = mapRef.current.getBounds();
    const newBbox = `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`;
    setBbox(newBbox);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{t('map.title')}</h1>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('map.search')}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-blue-400 outline-none"
            aria-label={t('map.search')}
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 outline-none"
          aria-label={t('map.filterType')}
        >
          <option value="">{t('map.allTypes')}</option>
          <option value="cooling_center">{t('map.coolingCenter')}</option>
          <option value="water_point">{t('map.waterPoint')}</option>
          <option value="assistance">{t('map.assistance')}</option>
        </select>
        <select
          value={provinceFilter}
          onChange={e => setProvinceFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 outline-none"
          aria-label={t('map.filterProvince')}
        >
          <option value="">{t('map.allProvinces')}</option>
          {provinces.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Map */}
        <div className="relative h-[500px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          <MapContainer
            center={PAKISTAN_CENTER}
            zoom={5}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            ref={(m) => { if (m) mapRef.current = m; }}
            whenReady={(e) => {
              const map = e.target as L.Map;
              map.on('moveend', handleMapMove);
              handleMapMove();
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Resource markers */}
            {!loading && resources?.items.map(item => (
              <Marker
                key={item.id}
                position={[item.lat, item.lon]}
                icon={createTypeIcon(item.type)}
              >
                <Popup>
                  <div className="min-w-[200px] space-y-1">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{item.type.replace('_', ' ')}</p>
                    <p className="text-xs">{item.address}</p>
                    <p className="text-xs text-gray-500">{item.hours}</p>
                    {item.contact && item.contact !== 'N/A' && <p className="text-xs">{item.contact}</p>}
                    {item.notes && <p className="text-xs text-gray-400 italic">{item.notes}</p>}
                    {item.distance_km != null && (
                      <p className="text-xs text-blue-600 font-medium">{item.distance_km} km</p>
                    )}
                    {!item.verified && (
                      <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-1">
                        {t('common.sampleData')} — {t('common.verifyBeforeVisit')}
                      </p>
                    )}
                    <a
                      href={`https://www.openstreetmap.org/directions?from=&to=${item.lat}%2C${item.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
                    >
                      <Navigation size={12} />
                      {t('common.getDirections')}
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* City risk markers (optional) */}
            {cityRisk?.items.map(city => (
              <Marker
                key={city.id}
                position={[city.lat, city.lon]}
                icon={createCityIcon(city.risk_level)}
              >
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">{city.name}</p>
                    <p className="text-xs">Heat index: {city.heat_index_c}°C</p>
                    <p className="text-xs capitalize">{city.risk_level} risk</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            <FlyToButton target={[location.lat, location.lon]} label={t('map.nearMe')} />
          </MapContainer>

          {loading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <LoadingState />
            </div>
          )}
        </div>

        {/* Sidebar list */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-3">{t('map.legend')}</p>
            <ul className="space-y-2">
              {(Object.keys(typeConfig) as ResourceType[]).map(type => {
                const cfg = typeConfig[type];
                const Icon = cfg.icon;
                return (
                  <li key={type} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-4 h-4 rounded-full" style={{ background: cfg.color }} />
                    <Icon size={14} />
                    {t(typeLabelKey[type])}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Near me button */}
          <button
            onClick={handleNearMe}
            className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <MapPin size={18} />
            {t('map.nearMe')}
          </button>

          {/* Nearby list */}
          {nearbyList ? (
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-900 mb-3">{t('map.closestPlaces')}</p>
              {nearbyList.length > 0 ? (
                <ul className="space-y-3">
                  {nearbyList.map(place => (
                    <li key={place.id} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: typeConfig[place.type].color + '20' }}>
                        {(() => { const Icon = typeConfig[place.type].icon; return <Icon size={16} style={{ color: typeConfig[place.type].color }} />; })()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{place.name}</p>
                        <p className="text-xs text-gray-400">{place.city}</p>
                        {place.distance_km != null && (
                          <p className="text-xs text-blue-600 font-medium">{place.distance_km} km</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">{t('map.noResults')}</p>
              )}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : !loading && resources?.items.length === 0 ? (
            <EmptyState label={t('map.noResults')} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
