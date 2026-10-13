import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { DisclaimerBanner } from '@/components/Disclaimer';
import { useI18n } from '@/i18n/context';

export default function DisclaimerPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">{t('disclaimer.title')}</h1>
        <Link to="/overview" className="inline-link">
          <ArrowLeft size={16} /> {t('common.back')}
        </Link>
      </div>

        <DisclaimerBanner />

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('disclaimer.officialSources')}</h2>
          <ul className="space-y-3">
            <li>
              <a
                href="https://www.pmd.gov.pk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                Pakistan Meteorological Department (PMD)
                <ExternalLink size={16} />
              </a>
            </li>
            <li>
              <a
                href="https://ndma.gov.pk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                National Disaster Management Authority (NDMA)
                <ExternalLink size={16} />
              </a>
            </li>
            <li>
              <a
                href="https://www.who.int/health-topics/heat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                WHO — Heat and Health
                <ExternalLink size={16} />
              </a>
            </li>
          </ul>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Emergency</h2>
          <p className="text-red-800 text-sm">
            In a medical emergency, call <strong>1122</strong> immediately.
          </p>
        </div>

    </div>
  );
}
