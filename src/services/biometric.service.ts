// Biometric login (Week 3 · fingerprint / Face ID) on this device.
//
//   Turn on   (logged in) scan once → the API gives a biometric login token
//             → token in SECURE storage, the account's name/email in LOCAL storage (for the login screen)
//   Log in    (login screen) scan → read the token from SecureStore → POST /auth/biometric/login
//             → a new access token, exactly like a password login
//
// The fingerprint or face itself never leaves the phone: the OS only answers "it matched".
// Logging out keeps biometric login on (that's what it is for); turning it off removes both.
// Android/iOS only. Face ID needs a development build: Expo Go on iOS can't use it.

import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

import { localKeys, localStore, secureKeys, secureStore } from '@/services/storage';

export type BiometricKind = 'fingerprint' | 'face' | 'iris';

export interface BiometricSupport {
  /** The phone has a fingerprint / face sensor */
  hardware: boolean;
  /** …and a fingerprint or face is registered in the phone's settings */
  enrolled: boolean;
  kinds: BiometricKind[];
}

/** The account that turned biometric login on here (ordinary data, no secret). */
export interface BiometricAccount {
  userId: string;
  name: string;
  email: string;
}

const NONE: BiometricSupport = { hardware: false, enrolled: false, kinds: [] };

export const biometricLabel = (kind: BiometricKind) => (kind === 'face' ? 'Face ID' : kind === 'iris' ? 'Iris' : 'Sidik Jari');

export async function getBiometricSupport(): Promise<BiometricSupport> {
  if (Platform.OS === 'web') return NONE;
  try {
    const [hardware, enrolled, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);
    const kinds: BiometricKind[] = [];
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) kinds.push('fingerprint');
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) kinds.push('face');
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) kinds.push('iris');
    return { hardware, enrolled, kinds };
  } catch {
    return NONE;
  }
}

const scanErrors: Partial<Record<string, string>> = {
  user_cancel: 'Verifikasi dibatalkan.',
  system_cancel: 'Verifikasi dibatalkan.',
  app_cancel: 'Verifikasi dibatalkan.',
  not_enrolled: 'Belum ada sidik jari atau wajah yang terdaftar di pengaturan HP ini.',
  passcode_not_set: 'Atur dulu kunci layar (PIN/pola) di pengaturan HP.',
  lockout: 'Terlalu banyak percobaan. Buka kunci HP dengan PIN dulu, lalu coba lagi.',
  not_available: 'Biometrik tidak tersedia di perangkat ini.',
};

/** Shows the system fingerprint / Face ID prompt. */
export async function scanBiometric(promptMessage: string): Promise<{ ok: boolean; error: string | null }> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Batal',
      fallbackLabel: 'Pakai kode sandi HP',
    });
    if (result.success) return { ok: true, error: null };
    return { ok: false, error: scanErrors[result.error] ?? 'Sidik jari atau wajah tidak cocok. Coba lagi.' };
  } catch {
    return { ok: false, error: 'Biometrik tidak tersedia di perangkat ini.' };
  }
}

/* ------------------------------------------------------------------ */
/*  What is stored for biometric login                                 */
/* ------------------------------------------------------------------ */

/** The enrolled account, or null when biometric login is off (or its token is gone). */
export async function getBiometricAccount(): Promise<BiometricAccount | null> {
  const [account, token] = await Promise.all([
    localStore.get<BiometricAccount | null>(localKeys.biometricAccount, null),
    secureStore.get(secureKeys.biometricToken),
  ]);
  return account && token ? account : null;
}

export function getBiometricToken(): Promise<string | null> {
  return secureStore.get(secureKeys.biometricToken);
}

export async function saveBiometricLogin(account: BiometricAccount, token: string): Promise<boolean> {
  if (!(await secureStore.set(secureKeys.biometricToken, token))) return false;
  await localStore.set(localKeys.biometricAccount, account);
  return true;
}

export async function clearBiometricLogin(): Promise<void> {
  await secureStore.remove(secureKeys.biometricToken);
  await localStore.remove(localKeys.biometricAccount);
}

/** Ask once per account after a password login whether to turn biometric login on. */
export async function shouldOfferBiometric(userId: string): Promise<boolean> {
  const asked = await localStore.get<string[]>(localKeys.biometricOffered, []);
  return !asked.includes(userId);
}

export async function markBiometricOffered(userId: string): Promise<void> {
  const asked = await localStore.get<string[]>(localKeys.biometricOffered, []);
  if (!asked.includes(userId)) await localStore.set(localKeys.biometricOffered, [...asked, userId]);
}
