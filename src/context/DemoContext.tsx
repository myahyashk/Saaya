import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type DemoMode = 'normal' | 'hot' | 'extreme';

interface DemoContextValue {
  demoMode: DemoMode;
  setDemoMode: (mode: DemoMode) => void;
  nextDemoMode: () => void;
  scenario: 'extreme' | undefined;
}

const DemoContext = createContext<DemoContextValue | null>(null);

const DEMO_AVAILABLE = import.meta.env.VITE_DEMO === 'true';
const STORAGE_KEY = 'saaya-demo-mode';

export function DemoProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoModeState] = useState<DemoMode>(() => {
    if (!DEMO_AVAILABLE) return 'normal';
    const stored = localStorage.getItem(STORAGE_KEY) as DemoMode | null;
    return stored === 'hot' || stored === 'extreme' ? stored : 'normal';
  });

  const setDemoMode = useCallback((mode: DemoMode) => {
    setDemoModeState(mode);
    if (DEMO_AVAILABLE) localStorage.setItem(STORAGE_KEY, mode);
  }, []);

  const nextDemoMode = useCallback(() => {
    setDemoModeState(current => {
      const order: DemoMode[] = ['normal', 'hot', 'extreme'];
      const next = order[(order.indexOf(current) + 1) % order.length];
      if (DEMO_AVAILABLE) localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const scenario: 'extreme' | undefined = demoMode === 'extreme' ? 'extreme' : undefined;

  return (
    <DemoContext.Provider value={{ demoMode, setDemoMode, nextDemoMode, scenario }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
}

export function isDemoAvailable(): boolean {
  return DEMO_AVAILABLE;
}
