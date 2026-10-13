import { Link } from 'react-router-dom';
import { Thermometer, Droplets, Wind, Sun, ArrowRight, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/i18n/context';
import { useWeather, useRisk, useGuidance, useResources } from '@/hooks/useData';
import { RiskBadge } from '@/components/RiskBadge';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { riskColor, formatTimeRange } from '@/utils/risk';
import type { GuidanceIcon } from '@/types/api';
import { Droplets as WaterIcon, Umbrella as ShadeIcon, Clock as ClockIcon, Shirt as ClothingIcon, Sun as SunIcon, AlertTriangle as AlertIcon } from 'lucide-react';

const guidanceIconMap: Record<GuidanceIcon, typeof WaterIcon> = {
  water: WaterIcon,
  shade: ShadeIcon,
  clock: ClockIcon,
  clothing: ClothingIcon,
  sun: SunIcon,
  alert: AlertIcon,
};

export default function OverviewPage() {
  const { t } = useI18n();
  const { data: weather, loading: wLoading, error: wError } = useWeather();
  const { data: risk, loading: rLoading, error: rError } = useRisk();
  const { data: guidance, loading: gLoading, error: gError } = useGuidance();
  const { data: resources } = useResources({ limit: 3 });
  const nextElevated = risk?.elevated_periods?.[0] ?? null;
  const topGuidance = guidance?.items?.slice(0, 3) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('overview.title')}</h1>

      {/* Current risk card */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {rLoading ? <LoadingState /> : rError ? <ErrorState message={rError} /> : risk ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">{t('risk.currentLevel')}</p>
              <RiskBadge level={risk.current.risk_level} size="lg" />
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Thermometer size={16} className="text-orange-500" />
                  {t('risk.heatIndex')}: <strong className="text-gray-900">{risk.current.heat_index_c}°C</strong>
                </span>
              </div>
              {risk.current.drivers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {risk.current.drivers.map((d, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1">{d}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : <EmptyState />}
        </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current weather */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{t('overview.currentWeather')}</h2>
            <Link to="/weather" className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-700">
              {t('common.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          {wLoading ? <LoadingState /> : wError ? <ErrorState message={wError} /> : weather ? (
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">{weather.current.temp_c}°</span>
                <span className="text-lg text-gray-400">C</span>
                <span className="ml-auto text-gray-600 text-sm">{weather.current.condition}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Thermometer size={16} className="text-orange-400" />
                  {t('weather.feelsLike')}: <strong>{weather.current.feels_like_c}°C</strong>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Droplets size={16} className="text-blue-400" />
                  {t('weather.humidity')}: <strong>{weather.current.humidity}%</strong>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Wind size={16} className="text-gray-400" />
                  {t('weather.wind')}: <strong>{weather.current.wind_kph} km/h</strong>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Sun size={16} className="text-amber-400" />
                  {t('weather.uv')}: <strong>{weather.current.uv_index}</strong>
                </div>
              </div>
            </div>
          ) : <EmptyState />}
        </section>

        {/* Next elevated risk period */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{t('risk.nextElevated')}</h2>
            <Link to="/risk" className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-700">
              {t('common.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          {rLoading ? <LoadingState /> : nextElevated ? (
            <div className={`rounded-xl p-4 border ${riskColor(nextElevated.risk_level).bg} ${riskColor(nextElevated.risk_level).border}`}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={20} className={riskColor(nextElevated.risk_level).text} />
                <RiskBadge level={nextElevated.risk_level} size="sm" />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <Clock size={16} />
                {formatTimeRange(nextElevated.start, nextElevated.end)}
              </div>
              <p className="text-sm text-gray-600">
                {t('risk.heatIndex')}: <strong>{nextElevated.peak_heat_index_c}°C</strong>
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <Sun size={32} className="mb-2" />
              <p className="text-sm text-center">{t('overview.noElevated')}</p>
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top guidance */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{t('overview.topGuidance')}</h2>
            <Link to="/guidance" className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-700">
              {t('common.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          {gLoading ? <LoadingState /> : gError ? <ErrorState message={gError} /> : topGuidance.length > 0 ? (
            <ul className="space-y-3">
              {topGuidance.map(item => {
                const Icon = guidanceIconMap[item.icon];
                return (
                  <li key={item.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Icon size={18} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : <EmptyState />}
        </section>

        {/* Nearest cooling places */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{t('overview.nearestCooling')}</h2>
            <Link to="/map" className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-700">
              {t('common.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          {resources?.items?.length ? (
            <ul className="space-y-3">
              {resources.items.slice(0, 3).map(place => (
                <li key={place.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <MapPin size={18} className="text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-gray-900">{place.name}</p>
                    <p className="text-xs text-gray-500">{place.city} · {place.type.replace('_', ' ')}</p>
                    {place.distance_km != null && (
                      <p className="text-xs text-blue-600 mt-0.5">{place.distance_km} km</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : <EmptyState label={t('map.noResults')} />}
        </section>
      </div>
    </div>
  );
}
