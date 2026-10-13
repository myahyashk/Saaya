import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface DemoContextValue {
  extremeMode: boolean;
  setExtremeMode: (on: boolean) => void;
  scenario: 'extreme' | undefined;
}

const DemoContext = createContext<DemoContextValue | null>(null);

const DEMO_AVAILABLE = import.meta.env.VITE_DEMO === 'true';

export function DemoProvider({ children }: { children: ReactNode }) {
  const [extremeMode, setExtremeModeState] = useState<boolean>(() => {
    if (!DEMO_AVAILABLE) return false;
    return localStorage.getItem('saaya-extreme-demo') === 'true';
  });

  const setExtremeMode = useCallback((on: boolean) => {
    setExtremeModeState(on);
    if (DEMO_AVAILABLE) localStorage.setItem('saaya-extreme-demo', String(on));
  }, []);

  const scenario: 'extreme' | undefined = extremeMode ? 'extreme' : undefined;

  return (
    <DemoContext.Provider value={{ extremeMode, setExtremeMode, scenario }}>
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
