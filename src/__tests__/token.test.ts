/// <reference types="jest" />
// Week 5 · Secure API. The Sprint 04 checklist, tested against the real mock API (run inside the test):
//   Task 01  login via API → access token (JWT) → stored securely → authentication state
//   Task 02  token read from SecureStore → "Authorization: Bearer <token>" → protected endpoint
//            · test authenticated request (200) and unauthenticated request (401)
//   Task 03  logout deletes the token and ends the session; an old token no longer works
// Plus biometric login, which trades a token kept in SecureStore for a new access token.

import { api, onSessionExpired } from '@/services/api';
import * as auth from '@/services/auth.service';
import { secureKeys, secureStore } from '@/services/storage';
import { describeToken } from '@/services/tokenLog';
import { bearerToken, decodeJwt, isUsableToken, maskToken } from '@/utils/jwt';

import { createTestServer } from '../../server/testing';

const DEMO = { email: 'bagas@creativo.id', password: 'Creativo123' };

let server: ReturnType<typeof createTestServer>;

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

beforeEach(async () => {
  server = createTestServer();
  globalThis.fetch = server.fetch as unknown as typeof fetch;
  await secureStore.remove(secureKeys.accessToken);
});

afterEach(() => server.cleanup());

async function login() {
  const result = await auth.login(DEMO.email, DEMO.password);
  if (!result.session) throw new Error(result.error);
  return result.session.token;
}

describe('Task 01 · Implement token authentication', () => {
  it('POST /auth/login mengembalikan access token berbentuk JWT (header.payload.signature)', async () => {
    const token = await login();
    expect(server.requests[0]).toEqual({ method: 'POST', path: '/auth/login', authorization: null });

    const jwt = decodeJwt(token)!;
    expect(token.split('.')).toHaveLength(3);
    expect(jwt.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(jwt.payload).toMatchObject({ email: DEMO.email, name: 'Bagas Pratama', role: 'user' });
    // Valid for an hour
    expect(jwt.payload.exp! - jwt.payload.iat!).toBe(3600);
  });

  it('token disimpan di SecureStore dengan kunci "access_token" dan bisa dibaca kembali', async () => {
    const token = await login();
    expect(await secureStore.get('access_token')).toBe(token);
    expect(isUsableToken(token, server.clock.now)).toBe(true);
  });
});

describe('Task 02 · Attach token to API request', () => {
  it('interceptor: token dibaca dari SecureStore lalu dikirim sebagai Authorization: Bearer', async () => {
    const token = await login();
    const result = await api<{ posts: unknown[] }>('/posts');

    expect(result.error).toBeNull();
    expect(result.data?.posts.length).toBeGreaterThan(0);
    const sent = server.requests.at(-1)!;
    expect(sent.path).toBe('/posts');
    expect(bearerToken(sent.authorization)).toBe(token);
  });

  it('test authenticated request: dengan token → 200 dan data protected', async () => {
    await login();
    const me = await api<{ user: { email: string } }>('/auth/me');
    expect(me.data?.user.email).toBe(DEMO.email);
  });

  it('test unauthenticated request: tanpa token → 401, data tidak diberikan', async () => {
    const result = await api('/posts');
    expect(result.data).toBeNull();
    expect(result.error).toMatchObject({ kind: 'unauthorized', status: 401, code: 'token_missing' });
    expect(server.requests.at(-1)!.authorization).toBeNull();
  });

  it('token yang diubah (payload dipalsukan) ditolak karena tanda tangannya tidak cocok', async () => {
    const token = await login();
    const [header, , signature] = token.split('.');
    const fake = btoa(JSON.stringify({ sub: 'orang-lain', role: 'admin', exp: 9999999999 })).replace(/=+$/, '');
    await secureStore.set(secureKeys.accessToken, `${header}.${fake}.${signature}`);

    expect((await api('/auth/me')).error).toMatchObject({ status: 401, code: 'token_invalid' });
  });

  it('token kedaluwarsa (lewat 1 jam) ditolak, dan aplikasi diberi tahu sesinya berakhir', async () => {
    await login();
    const expired = jest.fn();
    const stop = onSessionExpired(expired);

    server.clock.now += 3601 * 1000;
    const result = await api('/posts');
    stop();

    expect(result.error).toMatchObject({ status: 401, code: 'token_expired' });
    expect(expired).toHaveBeenCalledWith('Sesi kamu telah berakhir. Silakan masuk kembali.');
  });

  it('request publik (login, daftar) tidak membawa token', async () => {
    await login();
    await auth.register('Dina', 'dina@creativo.id', 'Creativo123');
    expect(server.requests.at(-1)).toEqual({ method: 'POST', path: '/auth/register', authorization: null });
  });
});

describe('Task 03 · Protect the session', () => {
  it('logout: token dihapus dari SecureStore, request berikutnya tanpa token dan ditolak', async () => {
    await login();
    await auth.logout();

    expect(server.requests.at(-1)).toMatchObject({ method: 'POST', path: '/auth/logout' });
    expect(await secureStore.get('access_token')).toBeNull();
    expect((await api('/posts')).error?.status).toBe(401);
  });

  it('login lagi menghasilkan token baru (jti berbeda)', async () => {
    const first = await login();
    await auth.logout();
    const second = await login();
    expect(second).not.toBe(first);
    expect(decodeJwt(second)!.payload.jti).not.toBe(decodeJwt(first)!.payload.jti);
  });

  it('reset kata sandi membuat semua token lama tidak berlaku', async () => {
    const old = await login();
    server.clock.now += 2000;
    await auth.requestPasswordReset(DEMO.email);
    // The mock API prints the code in its terminal instead of emailing it
    const code = server.logs.join('\n').match(/Kode reset kata sandi untuk \S+: (\d{6})/)![1];
    const wrongCode = code === '000000' ? '111111' : '000000';
    expect((await auth.resetPassword(DEMO.email, wrongCode, 'SandiBaru123')).error).toMatch(/Kode reset salah/);
    expect((await auth.resetPassword(DEMO.email, code, 'SandiBaru123')).error).toBeNull();

    await secureStore.set(secureKeys.accessToken, old);
    expect((await api('/auth/me')).error).toMatchObject({ status: 401, code: 'token_revoked' });
    expect((await auth.login(DEMO.email, DEMO.password)).error).toBe('Email/username atau kata sandi salah.');
    expect((await auth.login(DEMO.email, 'SandiBaru123')).error).toBeNull();
  });
});

describe('Login biometrik', () => {
  it('aktifkan: token biometrik dari API; login biometrik menukarnya dengan access token baru', async () => {
    await login();
    const created = await auth.createBiometricToken();
    expect(created.error).toBeNull();
    await auth.logout();

    const result = await auth.loginWithBiometricToken(created.token!);
    expect(result.error).toBeNull();
    expect(result.session?.profile.email).toBe(DEMO.email);
    expect(await secureStore.get('access_token')).toBe(result.session!.token);
  });

  it('token biometrik yang sudah dicabut ditolak (401)', async () => {
    await login();
    const { token } = await auth.createBiometricToken();
    await auth.revokeBiometricToken(token!);
    const result = await auth.loginWithBiometricToken(token!);
    expect(result.session).toBeNull();
    expect(result.error).toMatch(/Login biometrik tidak berlaku lagi/);
  });
});

describe('Token di log development', () => {
  it('token selalu disamarkan: hanya awal dan akhir yang terlihat', async () => {
    const token = await login();
    expect(maskToken(token)).toBe(`${token.slice(0, 10)}…${token.slice(-6)}`);
    expect(describeToken(token, server.clock.now)).toMatch(/^Bearer eyJhbGciOi…\S{6} \(JWT HS256 · berlaku 60 menit lagi\)$/);
  });
});
