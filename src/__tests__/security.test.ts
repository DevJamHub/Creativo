/// <reference types="jest" />
// Week 3 · Task 03 — Validate the Security. The five scenarios of the security test matrix:
//   1. Credential benar → LOGIN_SUCCESS      2. Credential salah → LOGIN_FAILED
//   3. Input kosong     → VALIDATION_ERROR   4. Logout           → SESSION_CLEARED
//   5. Data sensitif    → PROTECTED
// The app's own services talk to the real mock API (server/app.js), run inside the test on a copy of
// the seed, so `npm test` needs no server and no network. SecureStore and AsyncStorage are simulated.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import * as auth from '@/services/auth.service';
import { localKeys, localStore, secureKeys } from '@/services/storage';
import { emailError, fullNameError, identifierError, newPasswordError, passwordError } from '@/utils/validation';

import { createTestServer } from '../../server/testing';

const vault = (SecureStore as unknown as { __vault: Map<string, string> }).__vault;
const DEMO = { email: 'rina@creativo.id', username: 'rinakartika', password: 'Creativo123' };

let server: ReturnType<typeof createTestServer>;

beforeAll(() => {
  // The token flow is logged in development; keep the test output readable
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

beforeEach(async () => {
  server = createTestServer();
  globalThis.fetch = server.fetch as unknown as typeof fetch;
  vault.clear();
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

afterEach(() => server.cleanup());

describe('1. Credential benar → LOGIN_SUCCESS', () => {
  it('email + kata sandi benar: masuk, token diterima dan disimpan di SecureStore', async () => {
    const result = await auth.login(DEMO.email, DEMO.password);

    expect(result.error).toBeNull();
    expect(result.session?.profile.email).toBe(DEMO.email);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('access_token', result.session!.token);
    expect(await auth.storedAccessToken()).toBe(result.session!.token);
  });

  it('username juga bisa dipakai untuk masuk (Email atau Username)', async () => {
    const result = await auth.login(DEMO.username, DEMO.password);
    expect(result.error).toBeNull();
    expect(result.session?.profile.username).toBe(DEMO.username);
  });

  it('akun baru: daftar dulu, lalu masuk dengan akun itu', async () => {
    expect((await auth.register('Sigit Uji', 'sigit.uji@creativo.id', 'Rahasia123')).error).toBeNull();
    // Signing up does not log in by itself
    expect(await auth.storedAccessToken()).toBeNull();

    const result = await auth.login('sigit.uji@creativo.id', 'Rahasia123');
    expect(result.error).toBeNull();
    expect(result.session?.profile).toMatchObject({ full_name: 'Sigit Uji', username: 'sigit.uji', onboarded_at: null });
  });
});

describe('2. Credential salah → LOGIN_FAILED', () => {
  it('kata sandi salah: ditolak dengan pesan yang jelas, tidak ada token tersimpan', async () => {
    const result = await auth.login(DEMO.email, 'SalahBanget1');
    expect(result.session).toBeNull();
    expect(result.error).toBe('Email/username atau kata sandi salah.');
    expect(vault.has(secureKeys.accessToken)).toBe(false);
  });

  it('email yang tidak terdaftar mendapat pesan yang sama persis (tidak membocorkan akun mana yang ada)', async () => {
    const unknown = await auth.login('tidak.ada@creativo.id', DEMO.password);
    const wrong = await auth.login(DEMO.email, 'SalahBanget1');
    expect(unknown.error).toBe(wrong.error);
  });

  it('5 kali salah berturut-turut: akun dikunci sementara (429), lalu bisa lagi setelah 1 menit', async () => {
    for (let i = 0; i < 5; i++) await auth.login(DEMO.email, `Salah${i}xyz`);
    const locked = await auth.login(DEMO.email, DEMO.password);
    expect(locked.error).toMatch(/Terlalu banyak percobaan/);

    server.clock.now += 61_000;
    expect((await auth.login(DEMO.email, DEMO.password)).error).toBeNull();
  });
});

describe('3. Input kosong → VALIDATION_ERROR', () => {
  it('validasi di aplikasi menangkap input kosong sebelum ada request', () => {
    expect(identifierError('')).toBe('Email atau username wajib diisi.');
    expect(passwordError('')).toBe('Kata sandi wajib diisi.');
    expect(identifierError('rina@')).toBe('Masukkan alamat email yang valid.');
    expect(identifierError(DEMO.username)).toBeUndefined();
  });

  it('aturan daftar: nama, email, dan kata sandi minimal 8 karakter berisi huruf dan angka', () => {
    expect(fullNameError('  ')).toBe('Nama lengkap wajib diisi.');
    expect(emailError('bukan-email')).toBe('Masukkan alamat email yang valid.');
    expect(newPasswordError('pendek1')).toBe('Kata sandi minimal 8 karakter.');
    expect(newPasswordError('hanyahuruf')).toBe('Kata sandi harus berisi huruf dan angka.');
    expect(newPasswordError('Creativo123')).toBeUndefined();
  });

  it('server juga menolak input kosong (400), seandainya validasi aplikasi dilewati', async () => {
    const result = await auth.login('', '');
    expect(result.error).toBe('Email/username dan kata sandi wajib diisi.');
    expect(server.requests.at(-1)).toMatchObject({ method: 'POST', path: '/auth/login' });
  });

  it('daftar dengan email yang sudah terdaftar atau kata sandi lemah ditolak', async () => {
    expect((await auth.register('Rina Lagi', DEMO.email, 'Creativo123')).error).toBe('Email ini sudah terdaftar. Silakan masuk.');
    expect((await auth.register('Budi', 'budi@creativo.id', '12345678')).error).toBe('Kata sandi harus berisi huruf dan angka.');
  });
});

describe('4. Logout → SESSION_CLEARED', () => {
  it('token dihapus dari SecureStore dan dicabut di server', async () => {
    const { session } = await auth.login(DEMO.email, DEMO.password);
    const token = session!.token;

    await auth.logout();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token');
    expect(await auth.storedAccessToken()).toBeNull();
    // A copy of the old token is useless now
    const reused = await server.fetch('http://test/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    expect(reused.status).toBe(401);
    expect(await reused.json()).toMatchObject({ code: 'token_revoked' });
  });

  it('server tidak bisa dihubungi saat logout: token di perangkat tetap dihapus', async () => {
    await auth.login(DEMO.email, DEMO.password);
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    await auth.logout();
    expect(await auth.storedAccessToken()).toBeNull();
  });
});

describe('5. Data sensitif → PROTECTED', () => {
  it('kata sandi disimpan sebagai hash scrypt di users.json, tidak pernah sebagai teks biasa', async () => {
    await auth.register('Sigit Uji', 'sigit.uji@creativo.id', 'RahasiaSekali9');
    const file = server.readUsersFile();
    expect(file).not.toContain('RahasiaSekali9');
    expect(file).not.toContain(DEMO.password);
    const users = JSON.parse(file) as { email: string; password_hash: string }[];
    expect(users.find((u) => u.email === 'sigit.uji@creativo.id')?.password_hash).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  });

  it('respons API tidak pernah berisi hash kata sandi', async () => {
    const { session } = await auth.login(DEMO.email, DEMO.password);
    expect(JSON.stringify(session)).not.toMatch(/password|biometric_tokens/);
    const profiles = await server.fetch('http://test/profiles', { headers: { Authorization: `Bearer ${session!.token}` } });
    expect(JSON.stringify(await profiles.json())).not.toMatch(/password|@creativo\.id/);
  });

  it('token hanya di SecureStore; AsyncStorage hanya berisi data biasa', async () => {
    await auth.login(DEMO.email, DEMO.password);
    await localStore.set(localKeys.textSize, 'large');

    const local = await AsyncStorage.multiGet(await AsyncStorage.getAllKeys());
    expect(local).toEqual([['creativo.textSize', '"large"']]);
    expect(JSON.stringify(local)).not.toMatch(/eyJ|Creativo123/);
    expect([...vault.keys()]).toEqual(['access_token']);
  });
});
