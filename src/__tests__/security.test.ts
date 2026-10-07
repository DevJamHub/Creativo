/// <reference types="jest" />
// Security test cases (Week 3 · Task 03): the same five scenarios as the security test matrix.
//   1. Credential benar  → LOGIN_SUCCESS     2. Credential salah → LOGIN_FAILED
//   3. Input kosong      → VALIDATION_ERROR  4. Logout           → SESSION_CLEARED
//   5. Data sensitif     → PROTECTED
// Supabase is mocked, so these run offline with `npm test`. Try the same scenarios by hand in the app too.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthApiError } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

import { signInWithEmail, signOut } from '@/services/auth.service';
import { localKeys, localStore, secureSessionStorage } from '@/services/storage';
import { supabase } from '@/services/supabase';
import { emailError, passwordError } from '@/utils/validation';

// Mock factories run before imports, so they load modules with require()
/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// The device's Keychain / Keystore, kept in memory for the test
jest.mock('expo-secure-store', () => {
  const vault = new Map<string, string>();
  return {
    setItemAsync: jest.fn(async (key: string, value: string) => void vault.set(key, value)),
    getItemAsync: jest.fn(async (key: string) => vault.get(key) ?? null),
    deleteItemAsync: jest.fn(async (key: string) => void vault.delete(key)),
  };
});

jest.mock('expo-crypto', () => ({
  getRandomBytes: (n: number) => new Uint8Array(require('crypto').randomBytes(n)),
}));

/* eslint-enable @typescript-eslint/no-require-imports */

jest.mock('@/services/supabase', () => ({
  supabase: { auth: { signInWithPassword: jest.fn(), signOut: jest.fn() } },
}));

const auth = supabase.auth as unknown as { signInWithPassword: jest.Mock; signOut: jest.Mock };

const SESSION_KEY = 'sb-test-auth-token';
const session = JSON.stringify({
  access_token: 'eyJhbGciOiJIUzI1NiJ9.rahasia-access-token',
  refresh_token: 'rahasia-refresh-token',
  user: { email: 'pengguna@creativo.id' },
});

// friendlyAuthError logs the raw error in development; keep the test output readable
beforeAll(() => jest.spyOn(console, 'warn').mockImplementation(() => {}));

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

describe('1. Credential benar → LOGIN_SUCCESS', () => {
  it('masuk tanpa error', async () => {
    auth.signInWithPassword.mockResolvedValue({ data: {}, error: null });
    const result = await signInWithEmail('pengguna@creativo.id', 'katasandi123');
    expect(result.error).toBeNull();
  });
});

describe('2. Credential salah → LOGIN_FAILED', () => {
  it('ditolak dengan pesan yang jelas', async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: new AuthApiError('Invalid login credentials', 400, 'invalid_credentials'),
    });
    const result = await signInWithEmail('pengguna@creativo.id', 'salah');
    expect(result.error).toBe('Email atau kata sandi salah.');
  });

  it('tidak membocorkan informasi: tidak bilang email atau kata sandi yang salah, dan tanpa detail teknis', async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: new AuthApiError('Invalid login credentials', 400, 'invalid_credentials'),
    });
    const { error } = await signInWithEmail('pengguna@creativo.id', 'salah');
    expect(error).not.toMatch(/invalid|credentials|400/i);
  });
});

describe('3. Input kosong → VALIDATION_ERROR', () => {
  it('email kosong ditolak sebelum dikirim ke server', () => {
    expect(emailError('')).toBe('Email wajib diisi.');
    expect(emailError('bukan-email')).toBe('Masukkan alamat email yang valid.');
  });

  it('kata sandi kosong ditolak sebelum dikirim ke server', () => {
    expect(passwordError('')).toBe('Kata sandi wajib diisi.');
  });

  it('input yang benar lolos validasi', () => {
    expect(emailError('pengguna@creativo.id')).toBeUndefined();
    expect(passwordError('katasandi123')).toBeUndefined();
  });
});

describe('4. Logout → SESSION_CLEARED', () => {
  it('memanggil logout Supabase', async () => {
    auth.signOut.mockResolvedValue({ error: null });
    expect((await signOut()).error).toBeNull();
    expect(auth.signOut).toHaveBeenCalled();
  });

  it('menghapus sesi dari AsyncStorage dan kuncinya dari SecureStore', async () => {
    await secureSessionStorage.setItem(SESSION_KEY, session);
    await secureSessionStorage.removeItem(SESSION_KEY);

    expect(await AsyncStorage.getItem(SESSION_KEY)).toBeNull();
    expect(await SecureStore.getItemAsync(SESSION_KEY)).toBeNull();
    expect(await secureSessionStorage.getItem(SESSION_KEY)).toBeNull();
  });
});

describe('5. Data sensitif → PROTECTED', () => {
  it('token tidak tersimpan sebagai teks biasa', async () => {
    await secureSessionStorage.setItem(SESSION_KEY, session);
    const stored = (await AsyncStorage.getItem(SESSION_KEY))!;

    expect(stored).not.toContain('rahasia');
    expect(stored).not.toContain('pengguna@creativo.id');
    expect(stored).toMatch(/^[0-9a-f]+$/); // only ciphertext
  });

  it('kunci enkripsi disimpan di SecureStore (Keychain / Keystore), bukan di AsyncStorage', async () => {
    await secureSessionStorage.setItem(SESSION_KEY, session);
    const key = await SecureStore.getItemAsync(SESSION_KEY);

    expect(key).toMatch(/^[0-9a-f]{64}$/); // 256-bit AES key
    expect(await AsyncStorage.getItem(SESSION_KEY)).not.toContain(key!);
  });

  it('data dapat dibaca kembali oleh aplikasi', async () => {
    await secureSessionStorage.setItem(SESSION_KEY, session);
    expect(await secureSessionStorage.getItem(SESSION_KEY)).toBe(session);
  });

  it('tanpa kunci dari SecureStore, data tidak bisa dibuka', async () => {
    await secureSessionStorage.setItem(SESSION_KEY, session);
    await SecureStore.deleteItemAsync(SESSION_KEY);
    expect(await secureSessionStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('sesi lama yang masih teks biasa dienkripsi otomatis, tanpa membuat pengguna logout', async () => {
    await AsyncStorage.setItem(SESSION_KEY, session);
    expect(await secureSessionStorage.getItem(SESSION_KEY)).toBe(session);
    expect(await AsyncStorage.getItem(SESSION_KEY)).not.toContain('rahasia');
  });
});

describe('Data biasa → local storage', () => {
  it('preferensi disimpan dan dibaca kembali', async () => {
    await localStore.set(localKeys.feedView, 'following');
    expect(await localStore.get(localKeys.feedView, 'forYou')).toBe('following');
    expect(await AsyncStorage.getItem('creativo.feedView')).toBe('"following"');
  });

  it('memakai nilai default kalau belum ada yang disimpan', async () => {
    expect(await localStore.get<string | null>(localKeys.biometricLock, null)).toBeNull();
  });
});
