import { Outlet } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { FooterDisclaimer } from '@/components/Disclaimer';
import { useI18n } from '@/i18n/context';
import { useNotifications } from '@/context/NotificationContext';
import { useConnection } from '@/context/ConnectionContext';
import { useRisk } from '@/hooks/useData';
import { formatTimeRange } from '@/utils/risk';

function AlertTicker() {
  const { data } = useNotifications();
  const { data: risk } = useRisk();

  const tickerItems = useMemo(() => {
    const items: string[] = [];
    if (data?.active_alert) {
      items.push(`${data.active_alert.title}: ${data.active_alert.body}`);
    }
    if (risk?.elevated_periods?.[0]) {
      const next = risk.elevated_periods[0];
      items.push(`Next elevated-risk window: ${formatTimeRange(next.start, next.end)}`);
    }
    return items;
  }, [data, risk]);

  if (!tickerItems.length) return null;

  return (
    <div className="ticker-wrap" aria-live="polite" aria-label="Heat alerts">
      <div className="ticker-track">
        {[...tickerItems, ...tickerItems].map((item, index) => (
          <div key={`${item}-${index}`} className="ticker-item">
            <AlertTriangle size={14} />
            <span>{item}</span>
            <ChevronRight size={14} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { pathname } = useLocation();
  const { dir, t } = useI18n();
  const { shouldOfferDemo, useDemoData, retryHealthCheck } = useConnection();

  useEffect(() => setSidebarOpen(false), [pathname]);

  return (
    <div className="saaya-shell flex min-h-screen" dir={dir}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onExpand={() => setSidebarCollapsed(false)}
      />
      <div className="saaya-workspace flex min-h-screen min-w-0 flex-1 flex-col">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onToggleSidebar={() => setSidebarCollapsed(value => !value)}
          sidebarCollapsed={sidebarCollapsed}
        />
        <AlertTicker />
        {shouldOfferDemo && (
          <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 pt-4 md:px-8" role="status">
            <p className="text-sm text-amber-200">{t('connection.serverUnavailable')}</p>
            <div className="flex gap-2">
              <button onClick={retryHealthCheck} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)] hover:bg-white/5">
                {t('common.retry')}
              </button>
              <button onClick={useDemoData} className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400">
                {t('connection.useDemo')}
              </button>
            </div>
          </div>
        )}
        <main id="main-content" className="saaya-content mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
        <FooterDisclaimer />
      </div>
    </div>
  );
}
