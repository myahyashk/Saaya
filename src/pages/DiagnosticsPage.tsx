import { useEffect, useState } from 'react';
import { apiConfiguration } from '@/api/config';
import { getFailedRequests, subscribeFailedRequests, testAllApiEndpoints, type EndpointTestResult, type FailedRequest } from '@/api/client';
import { useConnection } from '@/context/ConnectionContext';
import { useI18n } from '@/i18n/context';

export default function DiagnosticsPage() {
  const { t } = useI18n();
  const { mode, health } = useConnection();
  const [failures, setFailures] = useState<FailedRequest[]>(getFailedRequests);
  const [testResults, setTestResults] = useState<EndpointTestResult[]>([]);
  const [testing, setTesting] = useState(false);

  useEffect(() => subscribeFailedRequests(() => setFailures(getFailedRequests())), []);

  async function testEndpoints() {
    setTesting(true);
    setTestResults(await testAllApiEndpoints());
    setTesting(false);
  }

  const healthLabel = !health.finished
    ? t('common.loading')
    : health.ok
      ? t('connection.connected')
      : t('connection.offline');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title">{t('diagnostics.title')}</h2>
        <button onClick={testEndpoints} disabled={testing} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {testing ? t('diagnostics.testing') : t('diagnostics.testEndpoints')}
        </button>
      </div>

      <section className="surface-panel space-y-3 p-5" aria-label={t('diagnostics.health')}>
        <h3 className="font-semibold">{t('diagnostics.health')}: {healthLabel}</h3>
        <p className="break-all text-sm text-[var(--muted)]">{t('diagnostics.baseUrl')}: {apiConfiguration.baseUrl}</p>
        <p className="text-sm text-[var(--muted)]">{t('diagnostics.mockMode')}: {mode === 'demo' ? t('diagnostics.mockEnabled') : t('diagnostics.mockDisabled')}</p>
        <p className="text-sm text-[var(--muted)]">{t('diagnostics.proxyMode')}: {apiConfiguration.useProxy ? t('diagnostics.proxyEnabled') : t('diagnostics.proxyDisabled')}</p>
        {health.response && <p className="text-sm text-[var(--muted)]">{health.response.status} · {health.response.time}</p>}
        {health.error && <p className="break-all text-sm text-red-300">{health.error.kind}: {health.error.message}</p>}
      </section>

      {testResults.length > 0 && (
        <section className="surface-panel overflow-hidden" aria-label={t('diagnostics.testEndpoints')}>
          <div className="border-b border-[var(--border)] px-5 py-4 font-semibold">{t('diagnostics.testEndpoints')}</div>
          <ul className="divide-y divide-[var(--border)]">
            {testResults.map(result => (
              <li key={result.endpoint} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                <span className="font-mono">{result.endpoint}</span>
                <span className={result.ok ? 'text-emerald-300' : 'text-red-300'}>
                  {result.ok ? t('diagnostics.pass') : `${t('diagnostics.fail')} ${result.status ?? result.errorKind ?? ''}`}
                  {' · '}{result.responseTimeMs} ms
                </span>
                {result.message && <span className="w-full break-all text-xs text-[var(--muted)]">{result.message}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="surface-panel overflow-hidden" aria-label={t('diagnostics.lastFailures')}>
        <h3 className="border-b border-[var(--border)] px-5 py-4 font-semibold">{t('diagnostics.lastFailures')}</h3>
        {failures.length === 0 ? (
          <p className="px-5 py-4 text-sm text-[var(--muted)]">{t('diagnostics.noFailures')}</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {failures.map((failure, index) => (
              <li key={`${failure.time}-${index}`} className="space-y-1 px-5 py-3 text-sm">
                <p className="break-all font-mono">{failure.url}</p>
                <p className="text-xs text-[var(--muted)]">{failure.errorKind} · {failure.status ?? '—'} · {new Date(failure.time).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}