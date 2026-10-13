import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, CloudSun, ThermometerSun, ShieldCheck, Bell, MapPinned, Info, MapPin, Languages } from 'lucide-react';
import { Logo } from './Logo';
import { useI18n } from '@/i18n/context';
import { useLocationCtx } from '@/context/LocationContext';
import { useNotifications } from '@/context/NotificationContext';
import { useDemo, isDemoAvailable } from '@/context/DemoContext';
import { LocationToggle } from './LocationToggle';
import { X, Flame } from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  labelKey: TranslationKey;
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.overview' },
  { to: '/dashboard/weather', icon: CloudSun, labelKey: 'nav.weather' },
  { to: '/dashboard/heat-risk', icon: ThermometerSun, labelKey: 'nav.risk' },
  { to: '/dashboard/guidance', icon: ShieldCheck, labelKey: 'nav.guidance' },
  { to: '/dashboard/notifications', icon: Bell, labelKey: 'nav.notifications' },
  { to: '/dashboard/cooling-map', icon: MapPinned, labelKey: 'nav.coolingMap' },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const { location } = useLocationCtx();
  const { unreadIds } = useNotifications();
  const { extremeMode, setExtremeMode } = useDemo();
  const demoAvailable = isDemoAvailable();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-[#0F1B3D] text-white flex flex-col z-[70] transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } sidebar-scroll overflow-y-auto`}
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <Link to="/" onClick={onClose}>
            <Logo className="text-white" />
          </Link>
          <button
            onClick={onClose}
            className="md:hidden text-white/70 hover:text-white p-1"
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Active location */}
        <div className="px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <MapPin size={14} />
            {t('location.activeLocation')}
          </div>
          <p className="text-sm font-semibold mt-0.5">{location.name}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = item.to === '/dashboard/notifications';
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={onClose}
                className={({ isActive: active }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'bg-blue-600 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={20} aria-hidden="true" />
                <span className="flex-1">{t(item.labelKey)}</span>
                {isActive && unreadIds.length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                    {unreadIds.length}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="px-3 py-4 border-t border-white/10 space-y-3">
          {demoAvailable && (
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <button
                type="button"
                role="switch"
                aria-checked={extremeMode}
                onClick={() => setExtremeMode(!extremeMode)}
                className={`relative w-9 h-5 rounded-full transition-colors ${extremeMode ? 'bg-red-500' : 'bg-white/20'}`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    extremeMode ? 'left-[18px]' : 'left-0.5'
                  }`}
                />
              </button>
              <span className="text-xs text-white/80 flex items-center gap-1">
                <Flame size={14} className="text-orange-400" />
                {t('demo.extremeMode')}
              </span>
            </label>
          )}

          <LocationToggle />
          <LanguageSwitcher />

          <Link
            to="/disclaimer"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            <Info size={16} />
            {t('sidebar.disclaimer')}
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
      <div className="flex items-center gap-1.5 text-white/60 text-xs mb-1.5">
        <Languages size={14} />
        {t('language.label')}
      </div>
      <div className="flex gap-1 bg-white/5 rounded-lg p-1">
        {langs.map(l => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
              lang === l.code ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'
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
