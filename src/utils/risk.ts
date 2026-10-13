import type { RiskLevel, NotificationSeverity, NotificationItem } from '@/types/api';

export function isElevated(level: RiskLevel): boolean {
  return level === 'high' || level === 'extreme';
}

export function riskColor(level: RiskLevel): { bg: string; text: string; border: string; solid: string } {
  switch (level) {
    case 'low':
      return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', solid: 'bg-green-500' };
    case 'moderate':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', solid: 'bg-amber-500' };
    case 'high':
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', solid: 'bg-orange-500' };
    case 'extreme':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', solid: 'bg-red-500' };
  }
}

export function severityColor(sev: NotificationSeverity): string {
  switch (sev) {
    case 'info': return 'text-blue-600';
    case 'warning': return 'text-amber-600';
    case 'danger': return 'text-red-600';
  }
}

export function shouldShowAlertModal(activeAlert: NotificationItem | null): boolean {
  return activeAlert !== null && activeAlert.severity === 'danger';
}

export function dedupeKey(alert: NotificationItem): string {
  return alert.id;
}

export function isAlertDismissed(alertId: string, dismissed: string[]): boolean {
  return dismissed.includes(alertId);
}

export function markAlertDismissed(alertId: string, dismissed: string[]): string[] {
  if (dismissed.includes(alertId)) return dismissed;
  return [...dismissed, alertId];
}

const DISMISSED_KEY = 'saaya-dismissed-alerts';

export function loadDismissedAlerts(): string[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveDismissedAlerts(ids: string[]): void {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
  } catch { /* ignore */ }
}

export function formatTimeRange(start: string, end: string): string {
  try {
    const s = new Date(start);
    const e = new Date(end);
    const fmt = (d: Date) =>
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${fmt(s)} to ${fmt(e)}`;
  } catch {
    return `${start} to ${end}`;
  }
}

export function formatHour(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return iso;
  }
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
}
