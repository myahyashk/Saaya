import { describe, it, expect } from 'vitest';
import type { NotificationItem } from '@/types/api';
import { isElevated, shouldShowAlertModal, isAlertDismissed, markAlertDismissed, dedupeKey, formatTimeRange } from '@/utils/risk';
import { resolveLocation, getDefaultCity, findCityById } from '@/utils/location';
import type { CityOption } from '@/utils/location';

const cities: CityOption[] = [
  { id: 'khairpur', name: 'Khairpur Mirs', province: 'Sindh', lat: 27.5, lon: 68.7, default: true },
  { id: 'karachi', name: 'Karachi', province: 'Sindh', lat: 24.8, lon: 67.0 },
];

describe('isElevated', () => {
  it('returns true for high and extreme', () => {
    expect(isElevated('high')).toBe(true);
    expect(isElevated('extreme')).toBe(true);
  });
  it('returns false for low and moderate', () => {
    expect(isElevated('low')).toBe(false);
    expect(isElevated('moderate')).toBe(false);
  });
});

describe('shouldShowAlertModal', () => {
  it('returns true when active alert is danger', () => {
    const alert: NotificationItem = {
      id: 'a1', type: 'alert', severity: 'danger',
      title: 'T', body: 'B', created_at: '2026-06-12T06:00:00+05:00',
    };
    expect(shouldShowAlertModal(alert)).toBe(true);
  });
  it('returns false when severity is warning', () => {
    const alert: NotificationItem = {
      id: 'a2', type: 'alert', severity: 'warning',
      title: 'T', body: 'B', created_at: '2026-06-12T06:00:00+05:00',
    };
    expect(shouldShowAlertModal(alert)).toBe(false);
  });
  it('returns false when alert is null', () => {
    expect(shouldShowAlertModal(null)).toBe(false);
  });
});

describe('alert deduplication', () => {
  it('isAlertDismissed checks by id', () => {
    expect(isAlertDismissed('x', ['a', 'x', 'b'])).toBe(true);
    expect(isAlertDismissed('z', ['a', 'b'])).toBe(false);
  });
  it('markAlertDismissed adds only once', () => {
    expect(markAlertDismissed('x', [])).toEqual(['x']);
    expect(markAlertDismissed('x', ['x'])).toEqual(['x']);
  });
  it('dedupeKey returns the id', () => {
    const alert: NotificationItem = {
      id: 'abc', type: 'alert', severity: 'danger',
      title: '', body: '', created_at: '',
    };
    expect(dedupeKey(alert)).toBe('abc');
  });
});

describe('formatTimeRange', () => {
  it('formats a time range', () => {
    const result = formatTimeRange('2026-06-12T12:00:00+05:00', '2026-06-12T17:00:00+05:00');
    expect(result).toMatch(/12:00.*17:00/);
  });
});

describe('resolveLocation', () => {
  it('uses geolocation when enabled and available', () => {
    const result = resolveLocation(true, { lat: 25, lon: 65, name: 'My Location' }, null, cities[0]);
    expect(result.source).toBe('geolocation');
    expect(result.lat).toBe(25);
  });
  it('falls back to selected city when geo is off', () => {
    const result = resolveLocation(false, { lat: 25, lon: 65, name: 'X' }, cities[1], cities[0]);
    expect(result.source).toBe('city');
    expect(result.name).toBe('Karachi');
  });
  it('falls back to default city when no city selected', () => {
    const result = resolveLocation(false, null, null, cities[0]);
    expect(result.name).toBe('Khairpur Mirs');
  });
  it('falls back to hard-coded Khairpur when nothing is available', () => {
    const result = resolveLocation(false, null, null, null);
    expect(result.lat).toBe(27.5295);
    expect(result.name).toBe('Khairpur Mirs');
  });
  it('falls back to city when geo is on but geo is null', () => {
    const result = resolveLocation(true, null, cities[1], cities[0]);
    expect(result.source).toBe('city');
    expect(result.name).toBe('Karachi');
  });
});

describe('getDefaultCity', () => {
  it('returns the city with default=true', () => {
    expect(getDefaultCity(cities)?.id).toBe('khairpur');
  });
  it('returns first city if none is default', () => {
    expect(getDefaultCity([{ id: 'x', name: 'X', province: 'P', lat: 0, lon: 0 }])?.id).toBe('x');
  });
  it('returns null for empty array', () => {
    expect(getDefaultCity([])).toBeNull();
  });
});

describe('findCityById', () => {
  it('finds by id', () => {
    expect(findCityById(cities, 'karachi')?.name).toBe('Karachi');
  });
  it('returns null for unknown id', () => {
    expect(findCityById(cities, 'zzz')).toBeNull();
  });
});
