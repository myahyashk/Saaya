import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock3, Menu, MapPin, RefreshCw } from 'lucide-react';
import { Bell, CloudSun, House, LayoutDashboard, MapPinned, ShieldCheck, ThermometerSun } from 'lucide-react';
import { useLocationCtx } from '@/context/LocationContext';
import { useI18n } from '@/i18n/context';
import type { TranslationKey } from '@/i18n/translations';

const fallbackItems: { to: string; icon: typeof House; key: TranslationKey | 'Home' }[] = [
  { to: '/', icon: House, key: 'Home' },
  { to: '/overview', icon: LayoutDashboard, key: 'nav.overview' },
  { to: '/weather', icon: CloudSun, key: 'nav.weather' },
  { to: '/risk', icon: ThermometerSun, key: 'nav.risk' },
  { to: '/guidance', icon: ShieldCheck, key: 'nav.guidance' },
  { to: '/notifications', icon: Bell, key: 'nav.notifications' },
  { to: '/map', icon: MapPinned, key: 'nav.coolingMap' },
];

interface HeaderProps {
  onMenuClick: () => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export function Header({ onMenuClick, onToggleSidebar, sidebarCollapsed }: HeaderProps) {
  const { location } = useLocationCtx();
  const { t, dir } = useI18n();
  const { pathname } = useLocation();
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  const titles: Record<string, string> = {
    '/': 'Home',
    '/overview': t('overview.title'),
    '/weather': t('weather.title'),
    '/risk': t('nav.risk'),
    '/guidance': t('guidance.title'),
    '/notifications': t('notifications.title'),
    '/map': t('map.title'),
    '/disclaimer': t('disclaimer.title'),
  };

  function refreshPage() {
    setUpdatedAt(new Date());
    window.location.reload();
  }

  return (
    <header className="saaya-topbar sticky top-0 z-40 flex min-h-16 items-center gap-3 border-b px-4 py-3 md:px-8">
      <button
        onClick={onMenuClick}
        className="icon-button lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>
      <button
        onClick={onToggleSidebar}
        className="icon-button hidden lg:inline-flex"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {dir === 'rtl'
          ? sidebarCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />
          : sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-white md:text-lg">{titles[pathname] ?? 'Saaya'}</h1>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5"><MapPin size={13} />{location.name}</span>
          <span className="hidden items-center gap-1.5 sm:inline-flex"><Clock3 size={13} />Updated {updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
      <div className="flex-1" />
      <button onClick={refreshPage} className="icon-button" aria-label={t('common.refresh')} title={t('common.refresh')}>
        <RefreshCw size={17} />
        <span className="hidden sm:inline">{t('common.refresh')}</span>
      </button>
      <nav className="sidebar-fallback-nav" aria-label="Main navigation">
        {fallbackItems.map(item => {
          const Icon = item.icon;
          const label = item.key === 'Home' ? 'Home' : t(item.key);
          return (
            <NavLink key={item.to} to={item.to} end className={({ isActive }) => isActive ? 'fallback-nav-active' : ''} aria-label={label}>
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}
