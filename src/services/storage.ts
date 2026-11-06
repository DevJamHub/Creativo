// Data kept on the device, in two kinds (Week 3 · Secure the Local Data):
//
//   1. LOCAL STORAGE  (localStore)  ordinary data, not secret: preferences and UI settings
//      (text size, last feed tab, which account turned on biometric login).
//      AsyncStorage on Android/iOS, the browser's localStorage on web.
//
//   2. SECURE STORAGE (secureStore) sensitive data: the access token (JWT) from login and the
//      biometric login token. expo-secure-store encrypts them with the iOS Keychain / Android Keystore:
//        SecureStore.setItemAsync('access_token', token)   save (after login)
//        SecureStore.getItemAsync('access_token')          read (on every API request)
//        SecureStore.deleteItemAsync('access_token')       delete (logout)
//      SecureStore doesn't exist on web; the web build keeps them in localStorage instead.
//
// Passwords are never stored on the device, in either kind.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/* ------------------------------------------------------------------ */
/*  1. LOCAL STORAGE — preferences (not secret)                        */
/* ------------------------------------------------------------------ */

const PREFIX = 'creativo.';

/** Keys of everything Creativo keeps in local storage. */
export const localKeys = {
  /** Last feed tab (Untukmu · Diikuti · Bidangku), so the feed reopens where you left it */
  feedView: 'feedView',
  /** Text size chosen in Pengaturan ('normal' | 'large') */
  textSize: 'textSize',
  /** Name and email of the account that turned on biometric login here, shown on the login screen */
  biometricAccount: 'biometricAccount',
  /** Accounts that were already asked whether to turn on biometric login */
  biometricOffered: 'biometricOffered',
} as const;

export const localStore = {
  async get<T>(key: string, fallback: T): Promise<T> {
    try {
      const raw = await AsyncStorage.getItem(PREFIX + key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback; // storage blocked or corrupt: behave as if nothing was saved
    }
  },
  async set(key: string, value: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (err) {
      if (__DEV__) console.warn('[storage] local save failed', err);
    }
  },
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREFIX + key);
    } catch (err) {
      if (__DEV__) console.warn('[storage] local remove failed', err);
    }
  },
};

/* ------------------------------------------------------------------ */
/*  2. SECURE STORAGE — tokens (secret)                                */
/* ------------------------------------------------------------------ */

/** Keys of everything Creativo keeps in secure storage. */
export const secureKeys = {
  /** JWT from POST /auth/login, sent as "Authorization: Bearer <token>" */
  accessToken: 'access_token',
  /** Long random token from POST /auth/biometric, traded for an access token after a fingerprint / face scan */
  biometricToken: 'biometric_token',
} as const;

const isWeb = Platform.OS === 'web';
// Static web rendering runs in Node, where there is no localStorage
const webStorage = () => (typeof window !== 'undefined' ? window.localStorage : null);

/** Where secure data actually lives on this platform, for labels and logs */
export const secureStorageName = isWeb ? 'localStorage (web)' : 'SecureStore (terenkripsi)';

export const secureStore = {
  /** The stored value, or null when there is none or it can't be read. */
  async get(key: string): Promise<string | null> {
    try {
      return isWeb ? (webStorage()?.getItem(key) ?? null) : await SecureStore.getItemAsync(key);
    } catch (err) {
      if (__DEV__) console.warn('[storage] secure read failed', err);
      return null;
    }
  },
  /** True once the value is saved. */
  async set(key: string, value: string): Promise<boolean> {
    try {
      if (isWeb) webStorage()?.setItem(key, value);
      else await SecureStore.setItemAsync(key, value);
      return true;
    } catch (err) {
      if (__DEV__) console.warn('[storage] secure save failed', err);
      return false;
    }
  },
  async remove(key: string): Promise<void> {
    try {
      if (isWeb) webStorage()?.removeItem(key);
      else await SecureStore.deleteItemAsync(key);
    } catch (err) {
      if (__DEV__) console.warn('[storage] secure delete failed', err);
    }
  },
};
