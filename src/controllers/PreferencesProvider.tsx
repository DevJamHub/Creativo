// Display preferences from Pengaturan. They are ordinary data (not secret), so they live in
// LOCAL storage (AsyncStorage), unlike the login token which lives in secure storage.
// Text size scales every AppText, for people who find the default text small (Week 2 · readable text).

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { localKeys, localStore } from '@/services/storage';

export type TextSize = 'normal' | 'large';

const TEXT_SCALE: Record<TextSize, number> = { normal: 1, large: 1.15 };

interface PreferencesContextValue {
  textSize: TextSize;
  textScale: number;
  setTextSize: (size: TextSize) => void;
}

// Outside the provider (e.g. in tests) text keeps its normal size
const PreferencesContext = createContext<PreferencesContextValue>({ textSize: 'normal', textScale: 1, setTextSize: () => {} });

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [textSize, setSize] = useState<TextSize>('normal');

  useEffect(() => {
    localStore.get<TextSize>(localKeys.textSize, 'normal').then((saved) => setSize(saved === 'large' ? 'large' : 'normal'));
  }, []);

  const setTextSize = useCallback((size: TextSize) => {
    setSize(size);
    localStore.set(localKeys.textSize, size);
  }, []);

  const value = useMemo(() => ({ textSize, textScale: TEXT_SCALE[textSize], setTextSize }), [textSize, setTextSize]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
