import { MapPin, Crosshair } from 'lucide-react';
import { useI18n } from '@/i18n/context';
import { useLocationCtx } from '@/context/LocationContext';

export function LocationToggle() {
  const { t } = useI18n();
  const { useGeo, setUseGeo, geoStatus, cities, selectedCityId, setSelectedCityId, refreshGeo } = useLocationCtx();

  return (
    <div className="px-1 space-y-2">
      {/* Toggle */}
      <div className="flex items-center gap-2 text-white/60 text-xs">
        <MapPin size={14} />
        {t('location.activeLocation')}
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <button
          type="button"
          role="switch"
          aria-checked={useGeo}
          onClick={() => setUseGeo(!useGeo)}
          className={`relative w-9 h-5 rounded-full transition-colors ${useGeo ? 'bg-blue-600' : 'bg-white/20'}`}
          aria-label={t('location.useMyLocation')}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              useGeo ? 'left-[18px]' : 'left-0.5'
            }`}
          />
        </button>
        <span className="text-xs text-white/80 flex items-center gap-1">
          <Crosshair size={14} />
          {useGeo
            ? geoStatus === 'detecting'
              ? t('location.detecting')
              : geoStatus === 'denied'
                ? t('location.denied')
                : t('location.useMyLocation')
            : t('location.selectCity')}
        </span>
      </label>

      {/* City picker — visible when geo is off or denied */}
      {(!useGeo || geoStatus === 'denied' || geoStatus === 'detecting') && cities.length > 0 && (
        <select
          value={selectedCityId ?? ''}
          onChange={(e) => setSelectedCityId(e.target.value)}
          className="w-full bg-white/10 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-blue-400 outline-none cursor-pointer"
          aria-label={t('location.selectCity')}
        >
          {cities.map(c => (
            <option key={c.id} value={c.id} className="bg-[#0F1B3D] text-white">
              {c.name} — {c.province}
            </option>
          ))}
        </select>
      )}

      {useGeo && geoStatus === 'granted' && (
        <button
          onClick={refreshGeo}
          className="text-xs text-blue-300 hover:text-blue-200 transition-colors"
        >
          {t('common.refresh')}
        </button>
      )}
    </div>
  );
}
