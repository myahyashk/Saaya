import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import { useI18n } from '@/i18n/context';

export function LoadingState({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400" role="status" aria-live="polite">
      <Loader2 className="animate-spin mb-3" size={32} />
      <p className="text-sm">{label ?? t('common.loading')}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-12 text-red-500" role="alert">
      <AlertCircle className="mb-3" size={32} />
      <p className="text-sm mb-3">{message ?? t('common.error')}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {t('common.retry')}
        </button>
      )}
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
