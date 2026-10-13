import { useI18n } from '@/i18n/context';
import { useGuidance } from '@/hooks/useData';
import { RiskBadge } from '@/components/RiskBadge';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import type { GuidanceIcon, Audience } from '@/types/api';
import type { TranslationKey } from '@/i18n/translations';
import {
  Droplets, Umbrella, Clock, Shirt, Sun, AlertTriangle, Info,
} from 'lucide-react';

const guidanceIconMap: Record<GuidanceIcon, typeof Droplets> = {
  water: Droplets,
  shade: Umbrella,
  clock: Clock,
  clothing: Shirt,
  sun: Sun,
  alert: AlertTriangle,
};

const audienceOrder: Audience[] = ['everyone', 'outdoor_workers', 'older_adults', 'children'];

const audienceLabelKey: Record<Audience, TranslationKey> = {
  everyone: 'guidance.everyone',
  outdoor_workers: 'guidance.outdoorWorkers',
  older_adults: 'guidance.olderAdults',
  children: 'guidance.children',
};

const audienceColor: Record<Audience, string> = {
  everyone: 'bg-blue-50 border-blue-200',
  outdoor_workers: 'bg-orange-50 border-orange-200',
  older_adults: 'bg-purple-50 border-purple-200',
  children: 'bg-green-50 border-green-200',
};

export default function GuidancePage() {
  const { t } = useI18n();
  const { data: guidance, loading, error, refetch } = useGuidance();

  if (loading) return <div className="space-y-6"><h1 className="text-2xl font-bold">{t('guidance.title')}</h1><LoadingState /></div>;
  if (error) return <div className="space-y-6"><h1 className="text-2xl font-bold">{t('guidance.title')}</h1><ErrorState message={error} onRetry={refetch} /></div>;
  if (!guidance || guidance.items.length === 0) return <div className="space-y-6"><h1 className="text-2xl font-bold">{t('guidance.title')}</h1><EmptyState /></div>;

  const grouped: Record<Audience, typeof guidance.items> = {
    everyone: [],
    outdoor_workers: [],
    older_ads: [],
    children: [],
  } as any;

  // Properly initialize all audiences
  const allAudiences: Record<string, typeof guidance.items> = {};
  for (const aud of audienceOrder) allAudiences[aud] = [];
  for (const item of guidance.items) {
    if (allAudiences[item.audience]) allAudiences[item.audience].push(item);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('guidance.title')}</h1>
        <RiskBadge level={guidance.risk_level} size="md" />
      </div>

      {audienceOrder.map(audience => {
        const items = allAudiences[audience];
        if (!items || items.length === 0) return null;
        return (
          <section key={audience} className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">{t(audienceLabelKey[audience])}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {items.map(item => {
                const Icon = guidanceIconMap[item.icon];
                return (
                  <div key={item.id} className={`rounded-xl border p-5 ${audienceColor[audience]}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <Icon size={20} className="text-gray-700" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-900">{guidance.disclaimer}</p>
      </div>
    </div>
  );
}
