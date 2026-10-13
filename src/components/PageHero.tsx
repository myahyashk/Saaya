import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RiskBadge } from './RiskBadge';
import type { RiskLevel } from '@/types/api';

interface PageHeroProps {
  title: string;
  description: string;
  status?: string;
  value?: string;
  valueLabel?: string;
  riskLevel?: RiskLevel;
  actions?: Array<{ label: string; to: string; variant?: 'primary' | 'secondary' }>;
  children?: ReactNode;
}

export function PageHero({
  title,
  description,
  status,
  value,
  valueLabel,
  riskLevel,
  actions,
  children,
}: PageHeroProps) {
  return (
    <section className="page-hero" data-risk={riskLevel ?? 'low'}>
      <div className="page-hero-grid">
        <div className="page-hero-copy">
          {status && <div className="status-chip">{status}</div>}
          <h1>{title}</h1>
          <p>{description}</p>
          {actions && actions.length > 0 && (
            <div className="page-hero-actions">
              {actions.map(action => (
                <Link key={action.label} to={action.to} className={action.variant === 'secondary' ? 'secondary-action' : 'primary-action'}>
                  {action.label}
                  <ArrowRight size={16} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="hero-panel">
          {value && (
            <>
              <div className="d-flex flex items-center justify-between gap-3">
                <span className="hero-metric-label">{valueLabel ?? 'Live reading'}</span>
                {riskLevel && <RiskBadge level={riskLevel} size="sm" />}
              </div>
              <div className="hero-metric mt-3">
                <strong>{value}</strong>
              </div>
            </>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
