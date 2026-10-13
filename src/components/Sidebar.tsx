import { Link, NavLink } from 'react-router-dom';
import { Bell, CloudSun, Flame, House, Info, Languages, LayoutDashboard, MapPinned, MapPin, ShieldCheck, ThermometerSun, X } from 'lucide-react';
import { Logo } from './Logo';
import { useI18n } from '@/i18n/context';
import { useLocationCtx } from '@/context/LocationContext';
import { useNotifications } from '@/context/NotificationContext';
import { isDemoAvailable, useDemo } from '@/context/DemoContext';
import { LocationToggle } from './LocationToggle';
import type { TranslationKey } from '@/i18n/translations';

interface NavItem {
  to: string;
  icon: typeof House;
  labelKey: TranslationKey | 'Home';
}

const navItems: NavItem[] = [
  { to: '/', icon: House, labelKey: 'Home' },
  { to: '/overview', icon: LayoutDashboard, labelKey: 'nav.overview' },
  { to: '/weather', icon: CloudSun, labelKey: 'nav.weather' },
  { to: '/risk', icon: ThermometerSun, labelKey: 'nav.risk' },
  { to: '/guidance', icon: ShieldCheck, labelKey: 'nav.guidance' },
  { to: '/notifications', icon: Bell, labelKey: 'nav.notifications' },
  { to: '/map', icon: MapPinned, labelKey: 'nav.coolingMap' },
];

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onExpand: () => void;
}

export function Sidebar({ open, collapsed, onClose, onExpand }: SidebarProps) {
  const { t, dir } = useI18n();
  const { location } = useLocationCtx();
  const { unreadIds } = useNotifications();
  const { demoMode, nextDemoMode } = useDemo();
  const demoAvailable = isDemoAvailable();
  const hiddenDrawerPosition = dir === 'rtl' ? 'translate-x-full' : '-translate-x-full';
  const demoLabel = demoMode === 'normal' ? 'Normal day' : demoMode === 'hot' ? 'Hot day' : 'Extreme heat day';

  return (
    <>
      {open && <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`saaya-sidebar fixed inset-y-0 z-[70] flex w-[288px] flex-col overflow-y-auto transition-[transform,width] duration-300 lg:sticky lg:top-0 lg:h-screen ${dir === 'rtl' ? 'right-0' : 'left-0'} ${open ? 'translate-x-0' : `${hiddenDrawerPosition} lg:translate-x-0`} ${collapsed ? 'lg:w-[86px]' : 'lg:w-[272px]'}`}
        aria-label="Sidebar navigation"
      >
        <div className={`flex min-h-[76px] items-center border-b border-[var(--border)] ${collapsed ? 'justify-center px-3' : 'justify-between px-5'}`}>
          <Link to="/" onClick={onClose} aria-label="Saaya home">
            <Logo className="text-[var(--text)]" showText={!collapsed} />
          </Link>
          <button onClick={onClose} className="icon-button lg:hidden" aria-label={t('common.close')}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
          {navItems.map(item => {
            const Icon = item.icon;
            const label = item.labelKey === 'Home' ? 'Home' : t(item.labelKey);
            const isNotifications = item.to === '/notifications';

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                title={collapsed ? label : undefined}
                aria-label={label}
                className={({ isActive }) =>
                  `sidebar-link ${collapsed ? 'justify-center px-0' : ''} ${isActive ? 'sidebar-link-active' : ''}`
                }
              >
                <Icon size={19} aria-hidden="true" />
                {!collapsed && <span className="flex-1">{label}</span>}
                {isNotifications && unreadIds.length > 0 && (
                  <span className={`unread-badge ${collapsed ? 'absolute -right-1 -top-1' : ''}`}>{unreadIds.length}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-[var(--border)] px-3 py-4">
          {demoAvailable && (
            <button
              type="button"
              onClick={nextDemoMode}
              className={`demo-toggle ${collapsed ? 'justify-center' : ''}`}
              aria-label={`Demo mode: ${demoLabel}`}
              title={demoLabel}
            >
              <Flame size={14} className={demoMode === 'extreme' ? 'text-[var(--sun-amber)]' : 'text-[var(--primary)]'} />
              {!collapsed && <span>{demoLabel}</span>}
            </button>
          )}

          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <button className="icon-button" onClick={onExpand} title={location.name} aria-label={`${t('location.activeLocation')}: ${location.name}`}>
                <MapPin size={18} />
              </button>
              <button className="icon-button" onClick={onExpand} title={t('language.label')} aria-label={t('language.label')}>
                <Languages size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="px-2 pb-1">
                <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                  <MapPin size={14} />
                  {t('location.activeLocation')}
                </div>
                <p className="max-w-full truncate ps-5 text-sm font-semibold text-[var(--text)]">{location.name}</p>
              </div>
              <LocationToggle />
              <LanguageSwitcher />
            </>
          )}

          <Link
            to="/disclaimer"
            onClick={onClose}
            title={collapsed ? t('sidebar.disclaimer') : undefined}
            aria-label={t('sidebar.disclaimer')}
            className={`sidebar-disclaimer ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <Info size={16} />
            {!collapsed && t('sidebar.disclaimer')}
          </Link>
        </div>
      </aside>
    </>
  );
}

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  const langs: { code: 'en' | 'ur' | 'sd'; labelKey: TranslationKey }[] = [
    { code: 'en', labelKey: 'language.en' },
    { code: 'ur', labelKey: 'language.ur' },
    { code: 'sd', labelKey: 'language.sd' },
  ];

  return (
    <div className="px-1">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
        <Languages size={14} />
        {t('language.label')}
      </div>
      <div className="flex gap-1 rounded-xl bg-white/5 p-1">
        {langs.map(l => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`min-h-9 flex-1 rounded-lg text-xs font-medium transition-colors ${
              lang === l.code ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted)] hover:text-white'
            }`}
            aria-pressed={lang === l.code}
          >
            {t(l.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
