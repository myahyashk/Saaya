import { useEffect, useRef, useState } from 'react';
import { X, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import { useI18n } from '@/i18n/context';
import { useNotifications } from '@/context/NotificationContext';
import { RiskBadge } from './RiskBadge';
import { formatTimeRange } from '@/utils/risk';
import { Link } from 'react-router-dom';

type AlertButton =
  | { label: string; to: string; icon: typeof ShieldCheck | typeof MapPin }
  | { label: string; action: 'dismiss'; icon: typeof X };

export function AlertModal() {
  const { t } = useI18n();
  const { showAlertModal, activeAlert, dismissAlert } = useNotifications();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const buttons: AlertButton[] = activeAlert
    ? [
        { label: t('alert.viewGuidance'), to: '/guidance', icon: ShieldCheck },
        { label: t('alert.findCooling'), to: '/map', icon: MapPin },
        { label: t('alert.dismiss'), action: 'dismiss', icon: X },
      ]
    : [];

  useEffect(() => {
    if (!showAlertModal) return;
    setFocusedIndex(0);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissAlert();
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
        if (!focusable?.length) return;
        const currentIndex = Array.from(focusable).indexOf(document.activeElement as HTMLElement);
        const nextIndex = (currentIndex + (e.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
        focusable[nextIndex].focus();
        setFocusedIndex(nextIndex);
      }
    };
    document.addEventListener('keydown', handleKey);
    // Focus the dialog
    const timer = setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>('[data-focus-index="0"]')?.focus();
    }, 50);
    return () => {
      document.removeEventListener('keydown', handleKey);
      clearTimeout(timer);
    };
  }, [showAlertModal, dismissAlert, buttons.length]);

  if (!showAlertModal || !activeAlert) return null;

  const window = activeAlert.window;
  const actions = activeAlert.actions ?? [];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) dismissAlert(); }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        aria-describedby="alert-desc"
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]"
      >
        {/* Red header */}
        <div className="bg-red-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={28} aria-hidden="true" />
              <h2 id="alert-title" className="text-xl font-bold">
                {t('alert.title')}
              </h2>
            </div>
            <button
              onClick={dismissAlert}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={t('common.dismiss')}
            >
              <X size={20} />
            </button>
          </div>
          <RiskBadge level="extreme" size="lg" />
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p id="alert-desc" className="text-gray-700 text-sm leading-relaxed">
            {activeAlert.body}
          </p>

          {window && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-xs text-red-600 font-semibold mb-1">{t('alert.timeWindow')}</p>
              <p className="text-sm text-red-900 font-medium">
                {formatTimeRange(window.start, window.end)}
              </p>
            </div>
          )}

          {actions.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-2">{t('alert.topActions')}</p>
              <ol className="space-y-2">
                {actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            {buttons.map((btn, i) => {
              const Icon = btn.icon;
              if (!('to' in btn)) {
                return (
                  <button
                    key={i}
                    onClick={dismissAlert}
                    data-focus-index={i}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                      focusedIndex === i ? 'ring-2 ring-blue-500 bg-gray-100' : 'bg-gray-100 hover:bg-gray-200'
                    } text-gray-700`}
                  >
                    <Icon size={18} />
                    {btn.label}
                  </button>
                );
              }
              return (
                <Link
                  key={i}
                  to={btn.to}
                  onClick={dismissAlert}
                  data-focus-index={i}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                    focusedIndex === i ? 'ring-2 ring-blue-500 ' : ''
                  } bg-blue-600 text-white hover:bg-blue-700`}
                >
                  <Icon size={18} />
                  {btn.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
