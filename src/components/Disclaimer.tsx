import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useI18n } from '@/i18n/context';

export function DisclaimerBanner() {
  const { t } = useI18n();
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-900 text-sm">
      <p className="font-semibold mb-1">{t('disclaimer.title')}</p>
      <p>{t('disclaimer.full')}</p>
    </div>
  );
}

export function FooterDisclaimer() {
  const { t } = useI18n();
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50 px-4 py-4">
      <div className="max-w-5xl mx-auto space-y-2">
        <p className="text-xs text-gray-500">
          {t('footer.disclaimer')}
        </p>
        <div className="flex flex-wrap gap-4 text-xs">
          <span className="text-gray-400">{t('footer.officialSources')}:</span>
          <a href="https://www.pmd.gov.pk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
            PMD <ExternalLink size={12} />
          </a>
          <a href="https://ndma.gov.pk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
            NDMA <ExternalLink size={12} />
          </a>
          <Link to="/disclaimer" className="text-blue-600 hover:text-blue-700">
            {t('disclaimer.title')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
