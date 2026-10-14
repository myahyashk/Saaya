import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import type { NotificationsResponse, NotificationItem, Lang } from '@/types/api';
import { api } from '@/api/client';
import { useLocationCtx } from './LocationContext';
import { useI18n } from '@/i18n/context';
import { useDemo } from './DemoContext';
import { useConnection } from './ConnectionContext';
import { toastFromNotification } from '@/components/Toast';
import {
  shouldShowAlertModal,
  loadDismissedAlerts,
  saveDismissedAlerts,
  markAlertDismissed,
  isAlertDismissed,
} from '@/utils/risk';

interface NotificationContextValue {
  data: NotificationsResponse | null;
  loading: boolean;
  error: Error | null;
  unreadIds: string[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  activeAlert: NotificationItem | null;
  showAlertModal: boolean;
  dismissAlert: () => void;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const READ_KEY = 'saaya-read-notifications';
const TOASTED_KEY = 'saaya-toasted-notifications';
const POLL_INTERVAL = 5 * 60 * 1000;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { location } = useLocationCtx();
  const { lang } = useI18n();
  const { scenario } = useDemo();
  const { isUsingMockData } = useConnection();
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(READ_KEY) || '[]'); } catch { return []; }
  });
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>(() => loadDismissedAlerts());
  const [showAlertModal, setShowAlertModal] = useState(false);
  const lastAlertIdRef = useRef<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.notifications({
        lat: location.lat,
        lon: location.lon,
        lang: lang as Lang,
        scenario,
      });
      setData(res);

      let toastedIds: string[] = [];
      try { toastedIds = JSON.parse(localStorage.getItem(TOASTED_KEY) || '[]'); } catch { /* ignore invalid stored data */ }
      const incomingItems = [...res.items, ...(res.active_alert ? [res.active_alert] : [])];
      const uniqueItems = incomingItems.filter((item, index) => incomingItems.findIndex(candidate => candidate.id === item.id) === index);
      const newItems = uniqueItems.filter(item => !toastedIds.includes(item.id));
      newItems.forEach(item => {
        toastFromNotification(item);
        if (item.type === 'alert' && 'Notification' in window && Notification.permission === 'granted') {
          try { new Notification(item.title, { body: item.body }); } catch { /* ignore browser notification errors */ }
        }
      });
      if (newItems.length > 0) {
        try { localStorage.setItem(TOASTED_KEY, JSON.stringify([...toastedIds, ...newItems.map(item => item.id)])); } catch { /* ignore storage errors */ }
      }

      // Handle alert modal
      if (shouldShowAlertModal(res.active_alert)) {
        const alertId = res.active_alert!.id;
        if (!isAlertDismissed(alertId, dismissedAlerts)) {
          if (lastAlertIdRef.current !== alertId) {
            setShowAlertModal(true);
            lastAlertIdRef.current = alertId;
          }
        }
      } else {
        setShowAlertModal(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  }, [location.lat, location.lon, lang, scenario, dismissedAlerts]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, isUsingMockData]);

  // Poll every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications, isUsingMockData]);

  const markRead = useCallback((id: string) => {
    setReadIds(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem(READ_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    if (!data) return;
    const allIds = data.items.map(i => i.id);
    setReadIds(prev => {
      const next = Array.from(new Set([...prev, ...allIds]));
      localStorage.setItem(READ_KEY, JSON.stringify(next));
      return next;
    });
  }, [data]);

  const dismissAlert = useCallback(() => {
    if (data?.active_alert) {
      const updated = markAlertDismissed(data.active_alert.id, dismissedAlerts);
      setDismissedAlerts(updated);
      saveDismissedAlerts(updated);
    }
    setShowAlertModal(false);
  }, [data, dismissedAlerts]);

  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadIds = data ? data.items.filter(i => !readIds.includes(i.id)).map(i => i.id) : [];

  return (
    <NotificationContext.Provider value={{
      data, loading, error, unreadIds, markRead, markAllRead,
      activeAlert: data?.active_alert ?? null, showAlertModal, dismissAlert, refresh,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
