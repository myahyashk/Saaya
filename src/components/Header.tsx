import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock3, Menu, MapPin, RefreshCw } from 'lucide-react';
import { useLocationCtx } from '@/context/LocationContext';
import { useI18n } from '@/i18n/context';
import { useConnection } from '@/context/ConnectionContext';
import { useDemo } from '@/context/DemoContext';

interface HeaderProps {
  onMenuClick: () => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export function Header({ onMenuClick, onToggleSidebar, sidebarCollapsed }: HeaderProps) {
  const { location } = useLocationCtx();
  const { t, dir } = useI18n();
  const { mode } = useConnection();
  const { scenario } = useDemo();
  const { pathname } = useLocation();
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isRefreshing) return;
    const tId = window.setTimeout(() => setIsRefreshing(false), 900);
    return () => window.clearTimeout(tId);
  }, [isRefreshing]);

  const titles: Record<string, string> = useMemo(() => ({
    '/': 'Home',
    '/overview': t('overview.title'),
    '/weather': t('weather.title'),
    '/risk': t('nav.risk'),
    '/guidance': t('guidance.title'),
    '/notifications': t('notifications.title'),
    '/map': t('map.title'),
    '/disclaimer': t('disclaimer.title'),
    '/diagnostics': t('diagnostics.title'),
  }), [t]);

  function refreshPage() {
    setIsRefreshing(true);
    setUpdatedAt(new Date());
    window.location.reload();
  }

  const stale = (Date.now() - updatedAt.getTime()) > 30 * 60 * 1000;
  const connectionLabel = mode === 'demo' || scenario === 'extreme'
    ? t('connection.demo')
    : mode === 'connected'
      ? t('connection.connected')
      : t('connection.offline');

  return (
    <>
      <div className="top-bar-progress" aria-hidden="true" data-active={isRefreshing ? 'true' : 'false'} />
      <header className="saaya-topbar sticky top-0 z-40 border-b border-[var(--border)] px-4 py-3 backdrop-blur-xl md:px-8">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="icon-button lg:hidden" aria-label="Open navigation menu">
            <Menu size={22} />
          </button>
          <button
            onClick={onToggleSidebar}
            className="icon-button hidden lg:inline-flex"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {dir === 'rtl' ? (sidebarCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />) : (sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />)}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-base font-semibold md:text-lg">{titles[pathname] ?? 'Saaya'}</h1>
              <span className="live-chip" aria-live="polite">
                <span className="live-dot" />
                {connectionLabel}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
              <span className="inline-flex items-center gap-1.5"><MapPin size={13} />{location.name}</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{stale ? 'Stale data' : 'Updated 2 min ago'}</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{clock.toLocaleTimeString('en-GB', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>

          <button onClick={refreshPage} className="icon-button" aria-label={t('common.refresh')} title={t('common.refresh')}>
            <RefreshCw size={17} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{t('common.refresh')}</span>
          </button>
        </div>
      </header>
    </>
  );
}
