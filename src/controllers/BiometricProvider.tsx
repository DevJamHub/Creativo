// Biometric login state (fingerprint / Face ID) for the login screen and Keamanan.
//   support   what this phone has (sensor, something enrolled, fingerprint and/or face)
//   account   who turned biometric login on here: their name shows on the login screen
//   signIn    scan → biometric token from SecureStore → POST /auth/biometric/login → logged in
//   enable    (logged in) scan → token from the API → SecureStore
// See services/biometric.service.ts for what is stored where.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert, Platform } from 'react-native';

import { useAuthContext } from '@/controllers/AuthProvider';
import type { Profile } from '@/models/profile';
import * as auth from '@/services/auth.service';
import * as biometric from '@/services/biometric.service';
import type { BiometricAccount, BiometricKind, BiometricSupport } from '@/services/biometric.service';

type ActionResult = { error: string | null };

interface BiometricContextValue {
  support: BiometricSupport;
  /** The phone can scan right now (sensor + a fingerprint or face enrolled) */
  available: boolean;
  /** "Sidik Jari" or "Face ID": the kind this phone uses, for labels */
  label: string;
  account: BiometricAccount | null;
  /** Biometric login is on for the account that is logged in now */
  enabledForMe: boolean;
  scanning: boolean;
  signIn: (kind?: BiometricKind) => Promise<ActionResult>;
  enable: () => Promise<ActionResult>;
  disable: () => Promise<ActionResult>;
  /** After a password login: ask once whether to turn it on */
  offerAfterLogin: (profile: Profile) => void;
}

const BiometricContext = createContext<BiometricContextValue | null>(null);

export function BiometricProvider({ children }: { children: ReactNode }) {
  const { user, profile, acceptSession } = useAuthContext();
  const [support, setSupport] = useState<BiometricSupport>({ hardware: false, enrolled: false, kinds: [] });
  const [account, setAccount] = useState<BiometricAccount | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    biometric.getBiometricSupport().then(setSupport);
    biometric.getBiometricAccount().then(setAccount);
  }, []);

  const available = support.hardware && support.enrolled;
  const label = biometric.biometricLabel(support.kinds.includes('face') && !support.kinds.includes('fingerprint') ? 'face' : support.kinds[0] ?? 'fingerprint');
  const enabledForMe = !!user && account?.userId === user.id;

  const signIn = useCallback(
    async (kind?: BiometricKind): Promise<ActionResult> => {
      if (!available) return { error: 'Biometrik belum diatur di HP ini. Daftarkan sidik jari atau wajah di pengaturan HP.' };
      const stored = await biometric.getBiometricAccount();
      const token = await biometric.getBiometricToken();
      if (!stored || !token) {
        return { error: 'Login biometrik belum aktif. Masuk dengan email dan kata sandi dulu, lalu aktifkan di Profil → Keamanan.' };
      }

      setScanning(true);
      try {
        const scan = await biometric.scanBiometric(`Masuk sebagai ${stored.name} dengan ${biometric.biometricLabel(kind ?? 'fingerprint')}`);
        if (!scan.ok) return { error: scan.error };
        const result = await auth.loginWithBiometricToken(token);
        if (result.session) {
          acceptSession(result.session);
          return { error: null };
        }
        // Turned off on the server, or the password was reset: password login only from now on
        if (result.code === 'biometric_invalid') {
          await biometric.clearBiometricLogin();
          setAccount(null);
        }
        return { error: result.error };
      } finally {
        setScanning(false);
      }
    },
    [available, acceptSession],
  );

  const enable = useCallback(async (): Promise<ActionResult> => {
    if (!user || !profile) return { error: 'Sesi kamu telah berakhir. Silakan masuk kembali.' };
    if (!available) return { error: 'Biometrik belum diatur di HP ini. Daftarkan sidik jari atau wajah di pengaturan HP.' };
    // A scan first, so nobody turns on a login they can't open
    const scan = await biometric.scanBiometric(`Aktifkan login dengan ${label}`);
    if (!scan.ok) return { error: scan.error };

    const created = await auth.createBiometricToken();
    if (created.error !== null) return { error: created.error };
    // One account per device: if another account had it on, this replaces it
    const next = { userId: user.id, name: profile.full_name || profile.username, email: profile.email ?? user.email };
    if (!(await biometric.saveBiometricLogin(next, created.token))) return { error: 'Token biometrik tidak dapat disimpan di perangkat ini.' };
    setAccount(next);
    return { error: null };
  }, [user, profile, available, label]);

  const disable = useCallback(async (): Promise<ActionResult> => {
    const token = await biometric.getBiometricToken();
    if (token) await auth.revokeBiometricToken(token);
    await biometric.clearBiometricLogin();
    setAccount(null);
    return { error: null };
  }, []);

  const offerAfterLogin = useCallback(
    (loggedIn: Profile) => {
      if (!available || Platform.OS === 'web') return;
      (async () => {
        const current = await biometric.getBiometricAccount();
        if (current?.userId === loggedIn.id || !(await biometric.shouldOfferBiometric(loggedIn.id))) return;
        await biometric.markBiometricOffered(loggedIn.id);
        Alert.alert(`Masuk lebih cepat dengan ${label}?`, `Lain kali cukup pakai ${label.toLowerCase()} tanpa mengetik kata sandi.`, [
          { text: 'Nanti', style: 'cancel' },
          {
            text: 'Aktifkan',
            onPress: async () => {
              const result = await enable();
              if (result.error) Alert.alert('Login biometrik belum aktif', result.error);
            },
          },
        ]);
      })();
    },
    [available, label, enable],
  );

  const value = useMemo(
    () => ({ support, available, label, account, enabledForMe, scanning, signIn, enable, disable, offerAfterLogin }),
    [support, available, label, account, enabledForMe, scanning, signIn, enable, disable, offerAfterLogin],
  );
  return <BiometricContext.Provider value={value}>{children}</BiometricContext.Provider>;
}

export function useBiometric() {
  const ctx = useContext(BiometricContext);
  if (!ctx) throw new Error('useBiometric must be used inside BiometricProvider');
  return ctx;
}
