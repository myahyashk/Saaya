import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from '@/i18n/context';
import { LocationProvider } from '@/context/LocationContext';
import { DemoProvider } from '@/context/DemoContext';
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

export default function App() {
  return (
    <I18nProvider>
      <DemoProvider>
        <LocationProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/disclaimer" element={<DisclaimerPage />} />
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<OverviewPage />} />
                  <Route path="weather" element={<WeatherPage />} />
                  <Route path="heat-risk" element={<HeatRiskPage />} />
                  <Route path="guidance" element={<GuidancePage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="cooling-map" element={<CoolingMapPage />} />
                </Route>
              </Routes>
              <AlertModal />
              <ToastContainer />
            </BrowserRouter>
          </NotificationProvider>
        </LocationProvider>
      </DemoProvider>
    </I18nProvider>
  );
}
