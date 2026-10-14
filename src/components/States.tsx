import { AlertCircle, Inbox } from 'lucide-react';
import { useI18n } from '@/i18n/context';
import { useConnection } from '@/context/ConnectionContext';
import { HttpError, NetworkError, ShapeError } from '@/api/client';

export function LoadingState({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <div className="loading-state" role="status" aria-label={label ?? t('common.loading')} aria-live="polite">
      <span className="skeleton h-4 w-2/5" />
      <span className="skeleton h-4 w-3/4" />
      <span className="skeleton h-4 w-1/2" />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string | Error; onRetry?: () => void }) {
  const { t } = useI18n();
  const { useDemoData } = useConnection();
  const retry = onRetry ?? (() => window.location.reload());
  const detail = message instanceof NetworkError
    ? t('connection.cannotReach').replace('{url}', message.url)
    : message instanceof HttpError
      ? t('connection.httpError').replace('{status}', String(message.status)).replace('{message}', message.message)
      : message instanceof ShapeError
        ? t('connection.shapeError')
        : message instanceof Error
          ? message.message
          : message ?? t('common.error');

  return (
    <div className="flex flex-col items-center justify-center py-12 text-red-500" role="alert">
      <AlertCircle className="mb-3" size={32} />
      <p className="text-sm mb-3 text-center">{detail}</p>
      {message instanceof NetworkError && <p className="mb-4 max-w-xl text-center text-xs text-[var(--muted)]">{t('connection.causes')}</p>}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={retry}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {t('common.retry')}
        </button>
        {message instanceof NetworkError && (
          <button
            onClick={useDemoData}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:bg-white/5 transition-colors"
          >
            {t('connection.useDemo')}
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <Inbox className="mb-3" size={32} />
      <p className="text-sm">{label ?? t('common.empty')}</p>
    </div>
  );
}
