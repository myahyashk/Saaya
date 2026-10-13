import { Link } from 'react-router-dom';
import { ArrowRight, CloudSun, ThermometerSun, ShieldCheck, Bell, MapPinned, ExternalLink, Languages, Sun } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { DisclaimerBanner } from '@/components/Disclaimer';
import { useI18n } from '@/i18n/context';
import { useMethodology } from '@/hooks/useData';
import { LoadingState, ErrorState } from '@/components/States';
import type { TranslationKey } from '@/i18n/translations';

export default function LandingPage() {
  const { t, lang } = useI18n();
  const { data: methodology, loading, error } = useMethodology();

  const features: { icon: typeof CloudSun; key: TranslationKey }[] = [
    { icon: CloudSun, key: 'landing.feature.weather' },
    { icon: ThermometerSun, key: 'landing.feature.risk' },
    { icon: ShieldCheck, key: 'landing.feature.guidance' },
    { icon: Bell, key: 'landing.feature.alerts' },
    { icon: MapPinned, key: 'landing.feature.map' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F1B3D] via-[#1B2A5E] to-[#2541A8]">
      {/* Hero */}
      <header className="max-w-6xl mx-auto px-4 md:px-6 pt-8">
        <nav className="flex items-center justify-between">
          <Logo className="text-white" />
          <Link
            to="/dashboard"
            className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            {t('app.openDashboard')}
            <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      <section className="max-w-4xl mx-auto px-4 md:px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
          <Sun size={18} className="text-amber-400" />
          <span className="text-white/80 text-sm font-medium">OpenHack'26 · Health · CL-02</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          Saaya
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          {t('app.tagline')}
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-blue-500/30"
        >
          {t('app.openDashboard')}
          <ArrowRight size={20} />
        </Link>
      </section>

      {/* Problem */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            {t('landing.problem')}
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t('landing.features')}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                  <Icon size={24} className="text-blue-600" />
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{t(key)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How we calculate risk */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">{t('landing.howWeCalculate')}</h2>
          {loading && <LoadingState />}
          {error && <ErrorState message={error} />}
          {methodology && (
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">{methodology.summary}</p>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Formula</p>
                <p className="text-sm text-gray-800 font-mono">{methodology.formula}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {methodology.thresholds.map(th => {
                  const colors: Record<string, string> = {
                    low: 'bg-green-50 border-green-200 text-green-700',
                    moderate: 'bg-amber-50 border-amber-200 text-amber-700',
                    high: 'bg-orange-50 border-orange-200 text-orange-700',
                    extreme: 'bg-red-50 border-red-200 text-red-700',
                  };
                  return (
                    <div key={th.level} className={`rounded-lg border p-4 text-center ${colors[th.level]}`}>
                      <p className="font-bold capitalize text-sm">{th.level}</p>
                      <p className="text-xs mt-1">{th.range}</p>
                    </div>
                  );
                })}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">{t('disclaimer.officialSources')}</p>
                <div className="flex flex-wrap gap-4">
                  {methodology.sources.map(src => (
                    <a
                      key={src.url}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      {src.name} <ExternalLink size={12} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Languages */}
      <section className="bg-[#0F1B3D] py-16">
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
          <Languages size={40} className="text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">{t('landing.languages')}</h2>
          <p className="text-white/70">{t('landing.languagesDesc')}</p>
          <div className="flex justify-center gap-4 mt-6">
            {['English', 'اردو', 'سنڌي'].map(l => (
              <span key={l} className="bg-white/10 rounded-lg px-4 py-2 text-white text-sm font-medium">
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-white py-12">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <DisclaimerBanner />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A1124] py-8">
        <div className="max-w-5xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo className="text-white" />
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="https://www.pmd.gov.pk" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white flex items-center gap-1">
              PMD <ExternalLink size={12} />
            </a>
            <a href="https://ndma.gov.pk" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white flex items-center gap-1">
              NDMA <ExternalLink size={12} />
            </a>
            <Link to="/disclaimer" className="text-white/60 hover:text-white">
              {t('disclaimer.title')}
            </Link>
            <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
              {t('app.openDashboard')} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
