// Biometric app lock (fingerprint / Face ID), opt-in from the Profil menu.
// While it's on, the app asks for your fingerprint or face when it opens and when you come back after
// a minute away. The setting (which account turned it on) is ordinary data, so it lives in LOCAL STORAGE
// (not secure storage); the session itself stays in secure storage either way. It belongs to that account:
// after signing out, or for anyone else signing in on this device, it doesn't apply. Android/iOS only.

import * as LocalAuthentication from 'expo-local-authentication';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';

import { useAuthContext } from '@/controllers/AuthProvider';
import { localKeys, localStore } from '@/services/storage';

/** Short trips (camera, photo picker, share sheet) shouldn't lock you out */
const RELOCK_AFTER_MS = 60_000;

interface BiometricContextValue {
  /** The device has a fingerprint / face scanner with something enrolled */
  available: boolean;
  /** "Sidik jari" or "Face ID", for labels */
  label: string;
  enabled: boolean;
  locked: boolean;
  unlock: () => Promise<boolean>;
  /** Drops the lock screen without a scan; only for signing out from it */
  release: () => void;
  /** Turning it on asks for a scan first, so nobody enables a lock they can't open */
  setEnabled: (on: boolean) => Promise<{ error: string | null }>;
}

const BiometricContext = createContext<BiometricContextValue | null>(null);

export function BiometricProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [available, setAvailable] = useState(false);
  const [label, setLabel] = useState('Sidik jari');
  /** Id of the account that turned the lock on */
  const [lockOwner, setLockOwner] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const enabled = available && !!user && lockOwner === user.id;
  const backgroundedAt = useRef<number | null>(null);

  // What the device supports, and whether the lock was turned on before (locks a cold start)
  useEffect(() => {
    if (Platform.OS === 'web') return;
    (async () => {
      const [hardware, enrolled, types, saved] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        LocalAuthentication.supportedAuthenticationTypesAsync(),
        localStore.get<string | null>(localKeys.biometricLock, null),
      ]);
      const usable = hardware && enrolled;
      setAvailable(usable);
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) setLabel('Face ID');
      setLockOwner(saved);
      setLocked(usable && !!saved);
    })();
  }, []);

  // Coming back after a while locks again
  useEffect(() => {
    if (!enabled) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') backgroundedAt.current = Date.now();
      if (state === 'active' && backgroundedAt.current !== null) {
        if (Date.now() - backgroundedAt.current >= RELOCK_AFTER_MS) setLocked(true);
        backgroundedAt.current = null;
      }
    });
    return () => sub.remove();
  }, [enabled]);

  const scan = useCallback(
    async (promptMessage: string) =>
      (await LocalAuthentication.authenticateAsync({ promptMessage, cancelLabel: 'Batal', fallbackLabel: 'Pakai kode sandi' }))
        .success,
    [],
  );

  const unlock = useCallback(async () => {
    const ok = await scan('Buka Creativo');
    if (ok) setLocked(false);
    return ok;
  }, [scan]);

  const release = useCallback(() => setLocked(false), []);

  const setEnabled = useCallback(
    async (on: boolean) => {
      if (!user) return { error: 'Sesi kamu telah berakhir. Silakan masuk kembali.' };
      if (on && !(await scan(`Aktifkan kunci ${label}`))) return { error: 'Verifikasi dibatalkan. Kunci belum diaktifkan.' };
      const owner = on ? user.id : null;
      setLockOwner(owner);
      await (owner ? localStore.set(localKeys.biometricLock, owner) : localStore.remove(localKeys.biometricLock));
      return { error: null };
    },
    [scan, label, user],
  );

  const value = useMemo(
    () => ({ available, label, enabled, locked: locked && enabled, unlock, release, setEnabled }),
    [available, label, enabled, locked, unlock, release, setEnabled],
  );
  return <BiometricContext.Provider value={value}>{children}</BiometricContext.Provider>;
}

export function useBiometric() {
  const ctx = useContext(BiometricContext);
  if (!ctx) throw new Error('useBiometric must be used inside BiometricProvider');
  return ctx;
}
