import { AlertTriangle, Info } from 'lucide-react';
import { useI18n } from '@/i18n/context';
import { useRisk, useMethodology } from '@/hooks/useData';
import { RiskBadge } from '@/components/RiskBadge';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { riskColor, isElevated, formatTimeRange, formatHour } from '@/utils/risk';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, Cell,
} from 'recharts';
import { ExternalLink } from 'lucide-react';

export default function HeatRiskPage() {
  const { t } = useI18n();
  const { data: risk, loading, error, refetch } = useRisk();
  const { data: methodology } = useMethodology();

  if (loading) return <div className="space-y-6"><h1 className="text-2xl font-bold">{t('risk.currentLevel')}</h1><LoadingState /></div>;
  if (error) return <div className="space-y-6"><h1 className="text-2xl font-bold">{t('risk.currentLevel')}</h1><ErrorState message={error} onRetry={refetch} /></div>;
  if (!risk) return <div className="space-y-6"><h1 className="text-2xl font-bold">{t('risk.currentLevel')}</h1><EmptyState /></div>;

  const chartData = risk.hourly.map(h => ({
    time: formatHour(h.time),
    heatIndex: h.heat_index_c,
    level: h.risk_level,
    elevated: isElevated(h.risk_level),
  }));

  const barColor = (level: string) => {
    switch (level) {
      case 'low': return '#22c55e';
      case 'moderate': return '#f59e0b';
      case 'high': return '#f97316';
      case 'extreme': return '#ef4444';
      default: return '#cbd5e1';
    }
  };

  const colors = riskColor(risk.current.risk_level);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('nav.risk')}</h1>

      {/* Current risk card */}
      <section className={`rounded-2xl shadow-sm border p-6 ${colors.bg} ${colors.border}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">{t('risk.currentLevel')}</p>
            <RiskBadge level={risk.current.risk_level} size="lg" />
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {risk.current.heat_index_c}°C
              <span className="text-sm font-normal text-gray-500 ml-2">{t('risk.heatIndex')}</span>
            </p>
          </div>
          <div className="md:w-64">
            <p className="text-sm text-gray-500 mb-2">{t('risk.drivers')}</p>
            <ul className="space-y-1.5">
              {risk.current.drivers.map((d, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <AlertTriangle size={14} className={colors.text} />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Hourly risk timeline */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">{t('risk.timeline')}</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} interval={3} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} unit="°" />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                labelStyle={{ color: '#374151' }}
                formatter={(value: number) => [`${value}°C`, t('risk.heatIndex')]}
              />
              <Bar dataKey="heatIndex" radius={[3, 3, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={barColor(entry.level)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Elevated periods list */}
        {risk.elevated_periods.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold text-gray-700">{t('risk.elevatedPeriods')}</p>
            {risk.elevated_periods.map((period, i) => {
              const pc = riskColor(period.risk_level);
              return (
                <div key={i} className={`flex items-center gap-3 rounded-lg px-4 py-2.5 border ${pc.bg} ${pc.border}`}>
                  <RiskBadge level={period.risk_level} size="sm" />
                  <span className="text-sm text-gray-700">{formatTimeRange(period.start, period.end)}</span>
                  <span className="ml-auto text-sm text-gray-500">peak {period.peak_heat_index_c}°C</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* How this is calculated */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Info size={18} className="text-blue-600" />
          {t('risk.howCalculated')}
        </h2>
        {methodology ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">{methodology.summary}</p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs font-semibold text-gray-400 mb-1 uppercase">Formula</p>
              <p className="text-sm font-mono text-gray-800">{methodology.formula}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {methodology.thresholds.map(th => {
                const c = riskColor(th.level);
                return (
                  <div key={th.level} className={`rounded-lg border p-3 text-center ${c.bg} ${c.border}`}>
                    <p className={`font-bold text-sm capitalize ${c.text}`}>{th.level}</p>
                    <p className="text-xs text-gray-500 mt-1">{th.range}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 italic">{methodology.disclaimer}</p>
            <div className="flex flex-wrap gap-3">
              {methodology.sources.map(src => (
                <a key={src.url} href={src.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                  {src.name} <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </div>
        ) : (
          <LoadingState />
        )}
      </section>
    </div>
  );
}
