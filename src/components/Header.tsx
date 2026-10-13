import { Menu, MapPin } from 'lucide-react';
import { useLocationCtx } from '@/context/LocationContext';
import { useI18n } from '@/i18n/context';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { location } = useLocationCtx();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>
      <div className="flex items-center gap-2 text-gray-600">
        <MapPin size={18} className="text-blue-600" />
        <span className="text-sm font-semibold text-gray-900">{location.name}</span>
      </div>
      <div className="flex-1" />
      <div className="text-xs text-gray-400 hidden sm:block">
        {t('app.tagline')}
      </div>
    </header>
  );
}
