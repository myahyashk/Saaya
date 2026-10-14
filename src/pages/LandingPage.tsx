import { ArrowRight, Baby, Bell, BriefcaseBusiness, CloudSun, Droplets, ExternalLink, HeartPulse, Languages, MapPinned, ShieldCheck, Sun, ThermometerSun, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { PageHero } from '@/components/PageHero';
import { RiskBadge } from '@/components/RiskBadge';
import { LoadingState, ErrorState } from '@/components/States';
import { useI18n } from '@/i18n/context';
import { useLocationCtx } from '@/context/LocationContext';
import { useResources, useRisk, useWeather } from '@/hooks/useData';
import { formatTimeRange } from '@/utils/risk';
import type { ResourceType } from '@/types/api';

const resourceColors: Record<ResourceType, string> = {
  cooling_center: '#65b5ff',
  water_point: '#43d7d1',
  assistance: '#f2c76c',
};

export default function LandingPage() {
  const { t } = useI18n();
  const { location } = useLocationCtx();
  const { data: weather, loading: weatherLoading, error: weatherError } = useWeather();
  const { data: risk, loading: riskLoading, error: riskError } = useRisk();
  const { data: resources, loading: resourcesLoading, error: resourcesError } = useResources({ limit: 8 });

  const nextElevated = risk?.elevated_periods?.[0];

  return (
    <div className="page-shell">
      <PageHero
        title={t('app.tagline')}
        description={t('landing.problem')}
        status={location.name}
        value={weather ? `${weather.current.temp_c}°C` : undefined}
        valueLabel={t('weather.temperature')}
        riskLevel={risk?.current.risk_level ?? 'moderate'}
        actions={[
          { label: 'Check heat risk now', to: '/risk', variant: 'primary' },
          { label: 'Find cooling centers', to: '/map', variant: 'secondary' },
        ]}
      >
        <div className="mt-4 space-y-3">
          {weatherLoading || riskLoading ? (
            <LoadingState />
          ) : weatherError || riskError ? (
            <ErrorState message={weatherError ?? riskError ?? undefined} />
          ) : weather && risk ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-[var(--text-muted)]">{weather.current.condition}</span>
                <RiskBadge level={risk.current.risk_level} size="sm" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label={t('weather.feelsLike')} value={`${weather.current.feels_like_c}°C`} icon={ThermometerSun} />
                <Metric label={t('risk.heatIndex')} value={`${risk.current.heat_index_c}°C`} icon={Sun} />
              </div>
            </>
          ) : null}
        </div>
      </PageHero>

      <section className="section-grid two">
        <div className="data-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">{t('weather.temperature')}</p>
              <h2 className="section-title">{t('overview.currentWeather')}</h2>
            </div>
            <Link to="/weather" className="inline-link">
              {t('common.viewAll')} <ArrowRight size={15} />
            </Link>
          </div>
          {weatherLoading ? <LoadingState /> : weatherError ? <ErrorState message={weatherError} /> : weather ? (
            <>
              <div className="hero-metric">
                <strong>{weather.current.temp_c}°</strong>
                <span>C</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-[var(--text-muted)]">
                <div className="flex items-center gap-2"><Droplets size={16} /> {weather.current.humidity}%</div>
                <div className="flex items-center gap-2"><Sun size={16} /> UV {weather.current.uv_index}</div>
              </div>
            </>
          ) : null}
        </div>

        <div className="data-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">{t('risk.nextElevated')}</p>
              <h2 className="section-title">{t('overview.nearestCooling')}</h2>
            </div>
            <Link to="/map" className="inline-link">
              {t('common.viewAll')} <ArrowRight size={15} />
            </Link>
          </div>
          {nextElevated ? (
            <>
              <div className="flex items-center gap-2">
                <MapPinned size={18} className="text-[var(--primary)]" />
                <span className="font-semibold">{formatTimeRange(nextElevated.start, nextElevated.end)}</span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">{t('risk.heatIndex')}: {nextElevated.peak_heat_index_c}°C</p>
            </>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">{t('overview.noElevated')}</p>
          )}
        </div>
      </section>

      <section className="surface-panel">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Saaya</p>
            <h2 className="section-title">{t('landing.features')}</h2>
          </div>
        </div>
        <div className="section-grid three">
          <FeatureCard icon={CloudSun} title={t('nav.weather')} body={t('landing.feature.weather')} to="/weather" />
          <FeatureCard icon={ThermometerSun} title={t('nav.risk')} body={t('landing.feature.risk')} to="/risk" />
          <FeatureCard icon={ShieldCheck} title={t('nav.guidance')} body={t('landing.feature.guidance')} to="/guidance" />
          <FeatureCard icon={Bell} title={t('nav.notifications')} body={t('landing.feature.alerts')} to="/notifications" />
          <FeatureCard icon={MapPinned} title={t('nav.coolingMap')} body={t('landing.feature.map')} to="/map" />
          <FeatureCard icon={Languages} title={t('landing.languages')} body={t('landing.languagesDesc')} to="/#supported-languages" />
        </div>
      </section>

      <section className="section-grid two">
        <div className="surface-panel">
          <div className="card-header">
            <div>
              <p className="eyebrow">{location.name}</p>
              <h2 className="section-title">{t('map.title')}</h2>
            </div>
          </div>
          <div className="mt-3 h-[260px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[#0a1422]">
            {resourcesLoading ? <div className="h-full p-4"><LoadingState /></div> : resourcesError ? <div className="h-full p-4"><ErrorState message={resourcesError} /></div> : (
              <MapContainer center={[location.lat, location.lon]} zoom={9} scrollWheelZoom={false} dragging={false} zoomControl={false} doubleClickZoom={false} keyboard={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                {resources?.items.slice(0, 8).map(place => (
                  <CircleMarker key={place.id} center={[place.lat, place.lon]} radius={7} pathOptions={{ color: '#071321', weight: 2, fillColor: resourceColors[place.type], fillOpacity: 1 }}>
                    <Popup>{place.name}</Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>

        <div className="surface-panel">
          <div className="card-header">
            <div>
              <p className="eyebrow">Saaya</p>
              <h2 className="section-title">Who it helps</h2>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <AudienceCard icon={BriefcaseBusiness} label={t('guidance.outdoorWorkers')} />
            <AudienceCard icon={HeartPulse} label={t('guidance.olderAdults')} />
            <AudienceCard icon={Baby} label={t('guidance.children')} />
            <AudienceCard icon={Users} label={t('guidance.everyone')} />
          </div>
        </div>
      </section>

      <section className="saaya-alert-panel rounded-2xl border p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Safety first</p>
            <h2 className="section-title">{t('disclaimer.title')}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="https://www.pmd.gov.pk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:text-[var(--accent-blue)]">
              PMD <ExternalLink size={14} />
            </a>
            <a href="https://ndma.gov.pk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:text-[var(--accent-blue)]">
              NDMA <ExternalLink size={14} />
            </a>
          </div>
        </div>
        <p className="mt-4 text-sm text-[var(--text-muted)]">{t('footer.safetyText')}</p>
      </section>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof ThermometerSun }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-white/3 px-3 py-2.5">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]"><Icon size={16} /></span>
      <div>
        <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">{label}</div>
        <div className="text-sm font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body, to }: { icon: typeof CloudSun; title: string; body: string; to: string }) {
  return (
    <Link to={to} className="feature-card group flex items-start gap-3 rounded-2xl p-4">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]"><Icon size={18} /></div>
      <div className="flex-1">
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{body}</p>
      </div>
      <ArrowRight size={16} className="mt-1 text-[var(--muted)] transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

function AudienceCard({ icon: Icon, label }: { icon: typeof Users; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/3 p-4">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]"><Icon size={18} /></span>
      <span className="font-medium text-white">{label}</span>
    </div>
  );
}
