import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { FooterDisclaimer } from '@/components/Disclaimer';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    return () => setSidebarOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
        <FooterDisclaimer />
      </div>
    </div>
  );
}
