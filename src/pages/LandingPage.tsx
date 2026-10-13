import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowRight,
  Baby,
  Bell,
  BriefcaseBusiness,
  CloudSun,
  Droplets,
  ExternalLink,
  HeartPulse,
  Languages,
  MapPinned,
  ShieldCheck,
  Sun,
  ThermometerSun,
  Users,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { DisclaimerBanner } from '@/components/Disclaimer';
import { LoadingState, ErrorState } from '@/components/States';
import { RiskBadge } from '@/components/RiskBadge';
import { useI18n } from '@/i18n/context';
import { useLocationCtx } from '@/context/LocationContext';
import { useMethodology, useResources, useRisk, useWeather } from '@/hooks/useData';
import { formatTimeRange } from '@/utils/risk';
import type { ResourceType } from '@/types/api';
import type { TranslationKey } from '@/i18n/translations';

const resourceColors: Record<ResourceType, string> = {
  cooling_center: '#65b5ff',
  water_point: '#43d7d1',
  assistance: '#f2c76c',
};

const features: { icon: typeof CloudSun; title: TranslationKey; body: TranslationKey; to: string }[] = [
  { icon: CloudSun, title: 'nav.weather', body: 'landing.feature.weather', to: '/weather' },
  { icon: ThermometerSun, title: 'nav.risk', body: 'landing.feature.risk', to: '/risk' },
  { icon: ShieldCheck, title: 'nav.guidance', body: 'landing.feature.guidance', to: '/guidance' },
  { icon: Bell, title: 'nav.notifications', body: 'landing.feature.alerts', to: '/notifications' },
  { icon: MapPinned, title: 'nav.coolingMap', body: 'landing.feature.map', to: '/map' },
  { icon: Languages, title: 'landing.languages', body: 'landing.languagesDesc', to: '/#supported-languages' },
];

export default function LandingPage() {
  const { t } = useI18n();
  const { location } = useLocationCtx();
  const { data: weather, loading: weatherLoading, error: weatherError } = useWeather();
  const { data: risk, loading: riskLoading, error: riskError } = useRisk();
  const { data: resources, loading: resourcesLoading, error: resourcesError, refetch: retryResources } = useResources({ limit: 8 });
  const { data: methodology, loading: methodologyLoading, error: methodologyError, refetch: retryMethodology } = useMethodology();

  const chartData = risk?.hourly.slice(0, 24).map(hour => ({
    timestamp: Date.parse(hour.time),
    heatIndex: hour.heat_index_c,
  })) ?? [];
  const chartStart = chartData[0]?.timestamp ?? 0;
  const chartEnd = chartData[chartData.length - 1]?.timestamp ?? 0;
  const elevatedPeriods = risk?.elevated_periods.filter(period => {
    const start = Date.parse(period.start);
    const end = Date.parse(period.end);
    return start <= chartEnd && end >= chartStart;
  }) ?? [];
  const nextElevated = risk?.elevated_periods[0];

  return (
    <div className="home-page space-y-8 md:space-y-10">
      <section className="home-hero grid gap-6 overflow-hidden rounded-2xl border p-5 sm:p-7 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:p-10">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
            <span className="live-pulse" />
            {location.name}
            <span className="text-slate-500">·</span>
            OpenHack'26 · Health · CL-02
          </div>
          <h2 className="max-w-xl text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-[2.75rem]">
            {t('app.tagline')}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            {t('landing.problem')}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/risk" className="primary-action">
              <ThermometerSun size={18} />
              Check heat risk now
              <ArrowRight size={16} />
            </Link>
            <Link to="/map" className="secondary-action">
              <MapPinned size={18} />
              Find cooling centers
            </Link>
          </div>
        </div>

        <div className="home-live-card relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase text-sky-200/70">{t('risk.currentLevel')}</p>
              <p className="mt-1 text-sm text-slate-300">{weather?.location.name ?? location.name}</p>
            </div>
            {risk && <RiskBadge level={risk.current.risk_level} size="md" />}
          </div>
          {weatherLoading || riskLoading ? (
            <div className="mt-6"><LoadingState label={t('common.loading')} /></div>
          ) : weatherError || riskError ? (
            <div className="mt-5"><ErrorState message={weatherError ?? riskError ?? undefined} /></div>
          ) : weather && risk ? (
            <>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-6xl font-semibold leading-none text-white">{weather.current.temp_c}°</span>
                <span className="pb-1 text-lg text-slate-400">C</span>
                <span className="ms-auto pb-1 text-sm text-slate-300">{weather.current.condition}</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                <LiveReading label={t('weather.feelsLike')} value={`${weather.current.feels_like_c}°C`} icon={ThermometerSun} />
                <LiveReading label={t('risk.heatIndex')} value={`${risk.current.heat_index_c}°C`} icon={Sun} />
              </div>
            </>
          ) : null}
        </div>
      </section>

      <section aria-label="Current conditions" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ThermometerSun} label={t('weather.temperature')} value={weather ? `${weather.current.temp_c}°C` : undefined} loading={weatherLoading} />
        <StatCard icon={Droplets} label={t('weather.humidity')} value={weather ? `${weather.current.humidity}%` : undefined} loading={weatherLoading} />
        <StatCard icon={Sun} label={t('weather.uv')} value={weather ? String(weather.current.uv_index) : undefined} loading={weatherLoading} />
        <StatCard
          icon={ArrowDownRight}
          label={t('risk.nextElevated')}
          value={nextElevated ? formatTimeRange(nextElevated.start, nextElevated.end) : risk ? t('overview.noElevated') : undefined}
          loading={riskLoading}
          tone={nextElevated ? 'risk' : 'normal'}
        />
      </section>

      <section className="surface-panel p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Next 24 hours</p>
            <h2 className="section-title mt-1">{t('risk.timeline')}</h2>
          </div>
          {risk && <RiskBadge level={risk.current.risk_level} size="sm" />}
        </div>
        {riskLoading ? <LoadingState /> : riskError ? <ErrorState message={riskError} /> : chartData.length ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="homeRiskFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#58b9ff" stopOpacity={0.27} />
                    <stop offset="100%" stopColor="#58b9ff" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#26354c" strokeDasharray="3 5" vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tick={{ fill: '#8796ad', fontSize: 11 }}
                  tickFormatter={value => new Date(value).toLocaleTimeString([], { hour: '2-digit' })}
                  minTickGap={30}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: '#8796ad', fontSize: 11 }} unit="°" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#111d30', border: '1px solid #2b3b54', borderRadius: 12, color: '#e5edf8' }}
                  labelFormatter={value => new Date(Number(value)).toLocaleString([], { weekday: 'short', hour: '2-digit' })}
                  formatter={value => [`${Number(value)}°C`, t('risk.heatIndex')]}
                />
                {elevatedPeriods.map((period, index) => (
                  <ReferenceArea
                    key={`${period.start}-${index}`}
                    x1={Date.parse(period.start)}
                    x2={Date.parse(period.end)}
                    fill="#f18b54"
                    fillOpacity={0.13}
                    strokeOpacity={0}
                  />
                ))}
                <Area type="monotone" dataKey="heatIndex" stroke="#63baff" strokeWidth={2.5} fill="url(#homeRiskFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="empty-copy">{t('common.empty')}</p>}
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Saaya</p>
            <h2 className="section-title mt-1">{t('landing.features')}</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {features.map(({ icon: Icon, title, body, to }) => (
            <Link key={title} to={to} className="feature-card group" id={title === 'landing.languages' ? 'supported-languages' : undefined}>
              <div className="feature-icon"><Icon size={20} /></div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-100">{t(title)}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-400">{t(body)}</p>
              </div>
              <ArrowRight className="feature-arrow" size={17} />
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="surface-panel p-5 sm:p-6">
          <p className="eyebrow">Methodology</p>
          <h2 className="section-title mt-1">{t('landing.howWeCalculate')}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <MethodStep number="01" icon={CloudSun} title={t('weather.current')} detail={t('weather.temperature')} />
            <MethodStep number="02" icon={Sun} title={t('risk.heatIndex')} detail={methodology?.formula ?? 'Temperature and humidity'} />
            <MethodStep number="03" icon={ThermometerSun} title={t('risk.currentLevel')} detail={risk?.current.label ?? t('common.loading')} />
          </div>
          {methodologyLoading ? <div className="mt-4"><LoadingState /></div> : methodologyError ? (
            <div className="mt-4"><ErrorState message={methodologyError} onRetry={retryMethodology} /></div>
          ) : methodology && (
            <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-6 text-slate-400">{methodology.summary}</p>
          )}
          <Link to="/risk#methodology" className="inline-link mt-5">
            {t('risk.howCalculated')} <ArrowRight size={15} />
          </Link>
        </div>

        <div className="surface-panel overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
            <div>
              <p className="eyebrow">{location.name}</p>
              <h2 className="section-title mt-1">{t('map.title')}</h2>
            </div>
            <Link to="/map" className="icon-button" aria-label={t('common.viewAll')} title={t('common.viewAll')}>
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="home-map-preview mt-5">
            {resourcesLoading ? <div className="map-skeleton"><LoadingState /></div> : resourcesError ? (
              <div className="map-skeleton"><ErrorState message={resourcesError} onRetry={retryResources} /></div>
            ) : (
              <MapContainer
                key={`${location.lat}-${location.lon}`}
                center={[location.lat, location.lon]}
                zoom={11}
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
                doubleClickZoom={false}
                keyboard={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                {resources?.items.slice(0, 8).map(place => (
                  <CircleMarker
                    key={place.id}
                    center={[place.lat, place.lon]}
                    radius={7}
                    pathOptions={{ color: '#071321', weight: 2, fillColor: resourceColors[place.type], fillOpacity: 1 }}
                  >
                    <Popup>{place.name}</Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <p className="text-xs text-slate-400">{resources?.count ?? 0} community resources nearby</p>
            <Link to="/map" className="inline-link">Open full map <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>

      <section className="surface-panel px-5 py-6 sm:px-7">
        <div className="mb-5">
          <p className="eyebrow">Saaya supports</p>
          <h2 className="section-title mt-1">Who it helps</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Audience icon={BriefcaseBusiness} label={t('guidance.outdoorWorkers')} />
          <Audience icon={HeartPulse} label={t('guidance.olderAdults')} />
          <Audience icon={Baby} label={t('guidance.children')} />
          <Audience icon={Users} label={t('guidance.everyone')} />
        </div>
      </section>

      <section className="home-disclaimer grid gap-5 rounded-2xl border p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="eyebrow">Safety first</p>
          <h2 className="section-title mt-1">{t('disclaimer.title')}</h2>
          <div className="mt-3 max-w-3xl"><DisclaimerBanner /></div>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <a className="source-link" href="https://www.pmd.gov.pk" target="_blank" rel="noopener noreferrer">PMD <ExternalLink size={14} /></a>
          <a className="source-link" href="https://ndma.gov.pk" target="_blank" rel="noopener noreferrer">NDMA <ExternalLink size={14} /></a>
        </div>
      </section>

      <footer className="home-footer flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-xs text-slate-500">
        <span>Saaya · OpenHack'26 · CL-02</span>
        <span>{t('footer.disclaimer')}</span>
        <Link to="/disclaimer" className="text-sky-300 hover:text-white">{t('sidebar.disclaimer')}</Link>
      </footer>
    </div>
  );
}

function LiveReading({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Sun }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="live-reading-icon"><Icon size={16} /></span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  tone = 'normal',
}: {
  icon: typeof Sun;
  label: string;
  value?: string;
  loading: boolean;
  tone?: 'normal' | 'risk';
}) {
  return (
    <div className={`stat-card ${tone === 'risk' ? 'stat-card-risk' : ''}`}>
      <span className="stat-icon"><Icon size={18} /></span>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        {loading ? <div className="skeleton mt-2 h-5 w-24" /> : <p className="mt-1 truncate text-lg font-semibold text-slate-100">{value ?? '—'}</p>}
      </div>
    </div>
  );
}

function MethodStep({ number, icon: Icon, title, detail }: { number: string; icon: typeof Sun; title: string; detail: string }) {
  return (
    <div className="method-step">
      <span className="method-number">{number}</span>
      <span className="method-icon"><Icon size={18} /></span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-100">{title}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{detail}</p>
      </div>
    </div>
  );
}

function Audience({ icon: Icon, label }: { icon: typeof Users; label: string }) {
  return (
    <div className="audience-chip">
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
