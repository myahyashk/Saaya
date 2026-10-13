import { Bell, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useI18n } from '@/i18n/context';
import { useNotifications } from '@/context/NotificationContext';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { severityColor } from '@/utils/risk';
import { formatTimeRange } from '@/utils/risk';
import type { NotificationSeverity } from '@/types/api';

const severityIcon: Record<NotificationSeverity, typeof Info> = {
  info: Info,
  warning: AlertCircle,
  danger: AlertTriangle,
};

export default function NotificationsPage() {
  const { t } = useI18n();
  const { data, loading, error, unreadIds, markRead, markAllRead, refresh } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('notifications.title')}</h1>
        <div className="flex items-center gap-3">
          {unreadIds.length > 0 && (
            <>
              <span className="text-sm text-gray-500">
                {unreadIds.length} {t('notifications.unread')}
              </span>
              <button
                onClick={markAllRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Check size={16} />
                {t('notifications.markRead')}
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={refresh} /> : !data || data.items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <EmptyState label={t('notifications.empty')} />
        </div>
      ) : (
        <ul className="space-y-3">
          {data.items.map(item => {
            const isUnread = unreadIds.includes(item.id);
            const Icon = severityIcon[item.severity];
            return (
              <li
                key={item.id}
                className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${
                  isUnread ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.severity === 'danger' ? 'bg-red-50' : item.severity === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
                  }`}>
                    <Icon size={20} className={severityColor(item.severity)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-gray-900">{item.title}</h3>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" aria-label={t('notifications.unread')} />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
                    {item.window && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {formatTimeRange(item.window.start, item.window.end)}
                      </p>
                    )}
                    {isUnread && (
                      <button
                        onClick={() => markRead(item.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center gap-1"
                      >
                        <Check size={14} />
                        {t('notifications.markRead')}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
