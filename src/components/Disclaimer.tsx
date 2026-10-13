import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useI18n } from '@/i18n/context';

export function DisclaimerBanner() {
  const { t } = useI18n();
  return (
    <div className="saaya-alert-panel rounded-2xl border px-4 py-3 text-sm">
      <p className="mb-1 font-semibold">{t('disclaimer.title')}</p>
      <p>{t('disclaimer.full')}</p>
    </div>
  );
}

export function FooterDisclaimer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)]/70 px-4 py-6 backdrop-blur-sm md:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{t('footer.aboutTitle')}</h3>
          <p className="text-sm leading-6 text-[var(--text-muted)]">{t('footer.aboutText')}</p>
          <p className="text-xs text-[var(--muted)]">{t('footer.aboutBuild')}</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{t('footer.teamTitle')}</h3>
          <p className="text-sm text-[var(--text-muted)]">{t('footer.teamFrontend')}</p>
          <p className="text-sm text-[var(--text-muted)]">{t('footer.teamBackend')}</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{t('footer.safetyTitle')}</h3>
          <p className="text-sm leading-6 text-[var(--text-muted)]">{t('footer.safetyText')}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <a href="https://www.pmd.gov.pk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--primary)] hover:text-[var(--accent-blue)]">
              Pakistan Meteorological Department <ExternalLink size={12} />
            </a>
            <a href="https://ndma.gov.pk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--primary)] hover:text-[var(--accent-blue)]">
              NDMA <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-3 border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
        <p>© {year} Saaya</p>
        <Link to="/disclaimer" className="text-[var(--primary)] hover:text-[var(--accent-blue)]">{t('disclaimer.title')}</Link>
      </div>
    </footer>
  );
}
