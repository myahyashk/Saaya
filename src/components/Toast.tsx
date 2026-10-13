import { useEffect, useState } from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import type { NotificationItem } from '@/types/api';

interface ToastData {
  id: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'danger';
}

let toastQueue: ToastData[] = [];
let listeners: ((toasts: ToastData[]) => void)[] = [];

export function showToast(toast: ToastData) {
  toastQueue = [...toastQueue, toast];
  listeners.forEach(l => l(toastQueue));
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== toast.id);
    listeners.forEach(l => l(toastQueue));
  }, 5000);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const listener = (newToasts: ToastData[]) => setToasts([...newToasts]);
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }, []);

  const icon = { info: Info, warning: AlertTriangle, danger: AlertTriangle };
  const color = {
    info: 'bg-blue-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-600',
  };

  return (
    <div className="fixed bottom-4 right-4 z-[8000] flex flex-col gap-2 max-w-sm" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map(toast => {
        const Icon = icon[toast.severity];
        return (
          <div key={toast.id} className={`flex items-start gap-3 ${color[toast.severity]} text-white rounded-lg shadow-lg px-4 py-3 animate-[slideIn_0.3s_ease-out]`}>
            <Icon size={20} className="flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-semibold text-sm">{toast.title}</p>
              <p className="text-xs opacity-90 mt-0.5">{toast.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function toastFromNotification(item: NotificationItem) {
  if (item.severity === 'danger') return; // danger alerts show modal, not toast
  showToast({
    id: item.id,
    title: item.title,
    body: item.body,
    severity: item.severity,
  });
}
