import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from '@/i18n/context';
import { LocationProvider } from '@/context/LocationContext';
import { DemoProvider } from '@/context/DemoContext';
import { ConnectionProvider } from '@/context/ConnectionContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { AlertModal } from '@/components/AlertModal';
import { ToastContainer } from '@/components/Toast';
import LandingPage from '@/pages/LandingPage';
import DisclaimerPage from '@/pages/DisclaimerPage';
import DashboardLayout from '@/pages/DashboardLayout';
import OverviewPage from '@/pages/OverviewPage';
import WeatherPage from '@/pages/WeatherPage';
import HeatRiskPage from '@/pages/HeatRiskPage';
import GuidancePage from '@/pages/GuidancePage';
import NotificationsPage from '@/pages/NotificationsPage';
import CoolingMapPage from '@/pages/CoolingMapPage';
import DiagnosticsPage from '@/pages/DiagnosticsPage';

export default function App() {
  return (
    <I18nProvider>
      <ConnectionProvider>
        <DemoProvider>
          <LocationProvider>
            <NotificationProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<DashboardLayout />}>
                  <Route index element={<LandingPage />} />
                  <Route path="overview" element={<OverviewPage />} />
                  <Route path="weather" element={<WeatherPage />} />
                  <Route path="risk" element={<HeatRiskPage />} />
                  <Route path="guidance" element={<GuidancePage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="map" element={<CoolingMapPage />} />
                  <Route path="disclaimer" element={<DisclaimerPage />} />
                  <Route path="diagnostics" element={<DiagnosticsPage />} />
                </Route>
              </Routes>
              <AlertModal />
              <ToastContainer />
            </BrowserRouter>
            </NotificationProvider>
          </LocationProvider>
        </DemoProvider>
      </ConnectionProvider>
    </I18nProvider>
  );
}
