import { Outlet } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { FooterDisclaimer } from '@/components/Disclaimer';
import { useI18n } from '@/i18n/context';
import { useNotifications } from '@/context/NotificationContext';
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
  const { dir } = useI18n();

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
        <main id="main-content" className="saaya-content mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
        <FooterDisclaimer />
      </div>
    </div>
  );
}
