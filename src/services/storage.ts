// Storage on the device, in two kinds:
//
//   1. LOCAL STORAGE  (localStore)          — plain, fast, for non-sensitive app preferences.
//      AsyncStorage on Android/iOS, the browser's localStorage on web.
//
//   2. SECURE STORAGE (secureSessionStorage) — encrypted, for the login session (access + refresh tokens).
//      The session is encrypted with AES-256; the key lives in expo-secure-store (iOS Keychain /
//      Android Keystore) and only the unreadable ciphertext goes to AsyncStorage. SecureStore itself
//      can reject values over ~2 KB, and a Supabase session is bigger, hence the split
//      (Supabase's recommended "LargeSecureStore" pattern). SecureStore has no web version, so on web
//      the session stays in localStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';
import aesjs from 'aes-js';
import { getRandomBytes } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

/* ------------------------------------------------------------------ */
/*  1. LOCAL STORAGE — preferences (not secret)                        */
/* ------------------------------------------------------------------ */

const PREFIX = 'creativo.';

/** Keys of everything Creativo keeps in local storage. */
export const localKeys = {
  /** Last feed tab (Untukmu · Diikuti · Bidangku), so the feed reopens where you left it */
  feedView: 'feedView',
  /** Which account turned on the fingerprint / Face ID app lock (a setting, not a secret) */
  biometricLock: 'biometricLock',
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
/*  2. SECURE STORAGE — the login session (secret)                     */
/* ------------------------------------------------------------------ */

async function encrypt(key: string, value: string): Promise<string> {
  // A fresh random 256-bit key on every save, kept in the Keychain / Keystore
  const encryptionKey = getRandomBytes(32);
  const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
  const encrypted = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
  await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey));
  return aesjs.utils.hex.fromBytes(encrypted);
}

const HEX = /^(?:[0-9a-f]{2})+$/i;

const isJson = (text: string) => {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};

/** The plain text, or null when the data isn't readable with this key. Never throws. */
function decrypt(keyHex: string, value: string): string | null {
  // Not our ciphertext at all, e.g. written by another version of the app
  if (keyHex.length !== 64 || !HEX.test(keyHex) || !HEX.test(value)) return null;
  try {
    const cipher = new aesjs.ModeOfOperation.ctr(aesjs.utils.hex.toBytes(keyHex), new aesjs.Counter(1));
    const text = aesjs.utils.utf8.fromBytes(cipher.decrypt(aesjs.utils.hex.toBytes(value)));
    // Supabase only saves JSON; the wrong key decrypts to garbage instead
    return isJson(text) ? text : null;
  } catch {
    return null;
  }
}

async function write(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, await encrypt(key, value));
}

async function clear(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
  await SecureStore.deleteItemAsync(key);
}

// Supabase can save (e.g. after a token refresh) while it is still reading. Each operation on a key
// waits for the one before it, so a read never sees a new key with old ciphertext and two saves can't cross.
const queues = new Map<string, Promise<unknown>>();

function serialized<T>(key: string, task: () => Promise<T>): Promise<T> {
  const run = (queues.get(key) ?? Promise.resolve()).then(task, task);
  queues.set(key, run.catch(() => {}));
  return run;
}

/** Storage adapter for the Supabase client on Android/iOS (getItem / setItem / removeItem). */
export const secureSessionStorage = {
  getItem(key: string): Promise<string | null> {
    return serialized(key, async () => {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return null;

      const keyHex = await SecureStore.getItemAsync(key);
      const text = keyHex ? decrypt(keyHex, stored) : null;
      if (text !== null) return text;

      // Saved in plain text by an older version of the app: encrypt it now, so nobody gets signed out
      if ((stored.startsWith('{') || stored.startsWith('"')) && isJson(stored)) {
        await write(key, stored);
        return stored;
      }

      // Unreadable (ciphertext without its key, or data left by another app version): remove it.
      // Supabase then sees no session and asks the user to sign in, instead of failing on every read.
      if (__DEV__) console.warn('[storage] unreadable session data removed:', key);
      await clear(key);
      return null;
    });
  },
  setItem(key: string, value: string): Promise<void> {
    return serialized(key, () => write(key, value));
  },
  removeItem(key: string): Promise<void> {
    return serialized(key, () => clear(key));
  },
};
