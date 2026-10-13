import type { RiskLevel } from '@/types/api';
import { riskColor } from '@/utils/risk';
import { useI18n } from '@/i18n/context';
import { AlertTriangle, Sun, ThermometerSun, Flame } from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

const riskIcon: Record<RiskLevel, typeof AlertTriangle> = {
  low: Sun,
  moderate: ThermometerSun,
  high: AlertTriangle,
  extreme: Flame,
};

const riskLabelKey: Record<RiskLevel, TranslationKey> = {
  low: 'risk.low',
  moderate: 'risk.moderate',
  high: 'risk.high',
  extreme: 'risk.extreme',
};

export function RiskBadge({ level, size = 'md' }: { level: RiskLevel; size?: 'sm' | 'md' | 'lg' }) {
  const { t } = useI18n();
  const colors = riskColor(level);
  const Icon = riskIcon[level];
  const sizes = {
    sm: { badge: 'px-2 py-0.5 text-xs gap-1', icon: 14 },
    md: { badge: 'px-3 py-1.5 text-sm gap-1.5', icon: 16 },
    lg: { badge: 'px-4 py-2 text-base gap-2', icon: 20 },
  };
  const s = sizes[size];

  return (
    <span className={`inline-flex items-center rounded-full border font-semibold ${colors.bg} ${colors.text} ${colors.border} ${s.badge}`}>
      <Icon size={s.icon} aria-hidden="true" />
      {t(riskLabelKey[level])}
    </span>
  );
}

export function RiskDot({ level }: { level: RiskLevel }) {
  const colors = riskColor(level);
  return <span className={`inline-block w-3 h-3 rounded-full ${colors.solid}`} aria-hidden="true" />;
}
