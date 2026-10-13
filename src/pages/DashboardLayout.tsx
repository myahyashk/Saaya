import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { FooterDisclaimer } from '@/components/Disclaimer';
import { useI18n } from '@/i18n/context';

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
        <main id="main-content" className="saaya-content mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
        <FooterDisclaimer />
      </div>
    </div>
  );
}
