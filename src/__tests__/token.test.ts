/// <reference types="jest" />
// Token tests (Week 5 · Secure API): the three points of the assignment.
//   1. Login → JWT diterima, lalu disimpan aman (SecureStore)
//   2. Token dipakai di setiap endpoint (login · menu Feed · logout); request tanpa token / token palsu ditolak
//   3. Logout → token dihapus dari perangkat & dicabut di server; login berikutnya dapat token baru
// A real Supabase client runs against a small fake Supabase server (fetch is mocked) that follows the same
// rules as Creativo's project: posts are only readable `to authenticated` (RLS), and a forged or expired
// JWT gets 401. So these run offline with `npm test`.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

import { secureSessionStorage } from '@/services/storage';
import { describeToken, loggedFetch } from '@/services/tokenLog';
import { bearerToken, decodeJwt, maskToken, secondsLeft } from '@/utils/jwt';

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

/* ------------------------------------------------------------------ */
/*  Fake Supabase server                                               */
/* ------------------------------------------------------------------ */

const SUPABASE_URL = 'https://creativo-test.supabase.co';
const PUBLIC_KEY = 'sb_publishable_creativo_test_key'; // the app's public key: not a JWT, not a user token
const STORAGE_KEY = 'sb-creativo-test-auth-token';
const USER = { id: 'user-1', email: 'pengguna@creativo.id', password: 'rahasia123' };
const SIGNATURE = 'tanda-tangan-server'; // only the server can make this (it holds the secret key)

const b64url = (value: object) => {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const makeJwt = (claims: object, signature = SIGNATURE) =>
  `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(claims)}.${signature}`;
const nowSeconds = () => Math.floor(Date.now() / 1000);

interface SeenRequest {
  method: string;
  path: string;
  search: string;
  authorization: string | null;
}

let seen: SeenRequest[];
let issued: number;
let refreshTokens: Map<string, string>; // refresh token → session id (deleted when revoked)
let offline: boolean;

// Supabase Auth names the error `code` only when it sends this API version header, like the real server
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'X-Supabase-Api-Version': '2024-01-01' },
  });

function newSession(): Response {
  issued += 1;
  const sessionId = `sesi-${issued}`;
  const refreshToken = `refresh-${issued}`;
  refreshTokens.set(refreshToken, sessionId);
  const iat = nowSeconds();
  return json(200, {
    access_token: makeJwt({ sub: USER.id, role: 'authenticated', email: USER.email, iat, exp: iat + 3600, session_id: sessionId }),
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: iat + 3600,
    refresh_token: refreshToken,
    user: { id: USER.id, aud: 'authenticated', role: 'authenticated', email: USER.email, app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' },
  });
}

async function fakeSupabase(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (offline) throw new TypeError('Network request failed');
  const url = new URL(String(input));
  const authorization = new Headers(init?.headers).get('Authorization');
  seen.push({ method: init?.method ?? 'GET', path: url.pathname, search: url.search, authorization });

  const token = bearerToken(authorization);
  const jwt = token ? decodeJwt(token) : null;
  // A JWT the server signed and that hasn't expired. The public key (not a JWT) means "anonymous".
  const validJwt = !!jwt && jwt.signature === SIGNATURE && (secondsLeft(jwt.payload) ?? 0) > 0;

  switch (url.pathname) {
    case '/auth/v1/token': {
      const body = JSON.parse(String(init?.body));
      if (url.searchParams.get('grant_type') === 'refresh_token') {
        return refreshTokens.has(body.refresh_token)
          ? (refreshTokens.delete(body.refresh_token), newSession())
          : json(400, { code: 'refresh_token_not_found', msg: 'Invalid Refresh Token: Refresh Token Not Found' });
      }
      return body.email === USER.email && body.password === USER.password
        ? newSession()
        : json(400, { code: 'invalid_credentials', msg: 'Invalid login credentials' });
    }
    case '/rest/v1/posts':
      if (jwt && !validJwt) return json(401, { code: 'PGRST301', message: 'JWT expired or invalid' });
      // RLS "Signed-in users can read posts ... to authenticated": anonymous requests see no rows
      return json(200, validJwt ? [{ id: 'post-1', caption: 'Karya pertama' }] : []);
    case '/auth/v1/logout': {
      if (!validJwt) return json(401, { code: 'bad_jwt', msg: 'invalid JWT' });
      // scope=global: every refresh token of the user is revoked
      for (const [refresh] of refreshTokens) refreshTokens.delete(refresh);
      return new Response(null, { status: 204 });
    }
  }
  return json(404, { message: 'not found' });
}

/* ------------------------------------------------------------------ */
/*  The app's client setup: secure storage + loggedFetch               */
/* ------------------------------------------------------------------ */

let client: SupabaseClient;
let logs: string[];

const signIn = (password = USER.password) => client.auth.signInWithPassword({ email: USER.email, password });
const lastRequest = (path: string) => [...seen].reverse().find((r) => r.path === path);

beforeAll(() => {
  // Supabase warns about several clients in one process; one per test is intended here
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

beforeEach(async () => {
  seen = [];
  issued = 0;
  refreshTokens = new Map();
  offline = false;
  logs = [];
  jest.spyOn(console, 'log').mockImplementation((...args: unknown[]) => void logs.push(args.join(' ')));
  globalThis.fetch = jest.fn(fakeSupabase) as unknown as typeof fetch;
  await AsyncStorage.clear();

  client = createClient(SUPABASE_URL, PUBLIC_KEY, {
    auth: { storage: secureSessionStorage, storageKey: STORAGE_KEY, autoRefreshToken: false, persistSession: true, detectSessionInUrl: false },
    global: { fetch: loggedFetch },
  });
});

afterEach(() => (console.log as jest.Mock).mockRestore());

/* ------------------------------------------------------------------ */

describe('1. Login → dapat JWT token', () => {
  it('email + password dikirim ke API login, server membalas access token berformat JWT', async () => {
    const { data, error } = await signIn();
    expect(error).toBeNull();

    const login = lastRequest('/auth/v1/token');
    expect(login).toMatchObject({ method: 'POST', search: '?grant_type=password' });

    const jwt = decodeJwt(data.session!.access_token);
    expect(jwt?.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(jwt?.payload).toMatchObject({ sub: USER.id, role: 'authenticated', email: USER.email });
    expect(secondsLeft(jwt!.payload)).toBeGreaterThan(3500); // berlaku ±1 jam
  });

  it('token disimpan aman: AsyncStorage hanya berisi ciphertext, kuncinya di SecureStore', async () => {
    const { data } = await signIn();
    const token = data.session!.access_token;

    expect(await AsyncStorage.getItem(STORAGE_KEY)).not.toContain(token);
    expect(await SecureStore.getItemAsync(STORAGE_KEY)).toMatch(/^[0-9a-f]{64}$/);
    expect(await secureSessionStorage.getItem(STORAGE_KEY)).toContain(token);
  });

  it('password salah → tidak dapat token, tidak ada yang disimpan', async () => {
    const { data, error } = await signIn('salah');
    expect(error?.code).toBe('invalid_credentials');
    expect(data.session).toBeNull();
    expect(await AsyncStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe('2. Token dipakai setiap mengakses endpoint (login · menu · logout)', () => {
  it('login dikirim dengan kunci publik aplikasi, bukan token pengguna (token belum ada)', async () => {
    await signIn();
    const login = lastRequest('/auth/v1/token')!;
    expect(login.authorization).toBe(`Bearer ${PUBLIC_KEY}`);
    expect(decodeJwt(PUBLIC_KEY)).toBeNull();
  });

  it('menu Feed: GET /rest/v1/posts membawa Authorization: Bearer <JWT pengguna> dan data diterima', async () => {
    const { data: auth } = await signIn();
    const { data, error } = await client.from('posts').select('*');

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(lastRequest('/rest/v1/posts')!.authorization).toBe(`Bearer ${auth.session!.access_token}`);
  });

  it('logout: POST /auth/v1/logout juga membawa JWT pengguna', async () => {
    const { data: auth } = await signIn();
    await client.auth.signOut({ scope: 'global' });

    expect(lastRequest('/auth/v1/logout')).toMatchObject({
      method: 'POST',
      search: '?scope=global',
      authorization: `Bearer ${auth.session!.access_token}`,
    });
  });

  it('tanpa login (tanpa token): data yang dilindungi tidak diberikan', async () => {
    const { data } = await client.from('posts').select('*');
    expect(lastRequest('/rest/v1/posts')!.authorization).toBe(`Bearer ${PUBLIC_KEY}`);
    expect(data).toEqual([]);
  });

  it('token palsu (tanda tangan salah) ditolak dengan 401', async () => {
    const forged = makeJwt({ sub: USER.id, role: 'authenticated', exp: nowSeconds() + 3600 }, 'tanda-tangan-palsu');
    const { error, status } = await client.from('posts').select('*').setHeader('Authorization', `Bearer ${forged}`);
    expect(status).toBe(401);
    expect(error).not.toBeNull();
  });

  it('token kedaluwarsa ditolak dengan 401', async () => {
    const expired = makeJwt({ sub: USER.id, role: 'authenticated', exp: nowSeconds() - 60 });
    const { status } = await client.from('posts').select('*').setHeader('Authorization', `Bearer ${expired}`);
    expect(status).toBe(401);
  });
});

describe('3. Logout → token dihapus & diganti token baru', () => {
  it('token dihapus dari perangkat (AsyncStorage dan SecureStore), sesi kosong', async () => {
    await signIn();
    const { error } = await client.auth.signOut({ scope: 'global' });

    expect(error).toBeNull();
    expect(await AsyncStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(await SecureStore.getItemAsync(STORAGE_KEY)).toBeNull();
    expect((await client.auth.getSession()).data.session).toBeNull();
  });

  it('refresh token lama dicabut server: sesi lama tidak bisa dihidupkan lagi', async () => {
    const { data } = await signIn();
    const oldRefresh = data.session!.refresh_token;
    await client.auth.signOut({ scope: 'global' });

    const { error } = await client.auth.refreshSession({ refresh_token: oldRefresh });
    expect(error?.code).toBe('refresh_token_not_found');
  });

  it('login berikutnya mendapat token baru (token di-refresh)', async () => {
    const first = (await signIn()).data.session!.access_token;
    await client.auth.signOut({ scope: 'global' });
    const second = (await signIn()).data.session!.access_token;

    expect(second).not.toBe(first);
    expect(decodeJwt(second)!.payload.session_id).not.toBe(decodeJwt(first)!.payload.session_id);
  });

  it('setelah logout, request ke menu tidak lagi membawa token pengguna', async () => {
    await signIn();
    await client.auth.signOut({ scope: 'global' });
    const { data } = await client.from('posts').select('*');

    expect(lastRequest('/rest/v1/posts')!.authorization).toBe(`Bearer ${PUBLIC_KEY}`);
    expect(data).toEqual([]);
  });

  it('tanpa koneksi pun logout tetap menghapus token dari perangkat', async () => {
    await signIn();
    offline = true;
    await client.auth.signOut({ scope: 'global' });

    expect(await AsyncStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(await SecureStore.getItemAsync(STORAGE_KEY)).toBeNull();
  });
});

describe('Log konsol untuk demo', () => {
  it('setiap request dicatat beserta jenis tokennya, dan token tidak pernah tampil utuh', async () => {
    const { data } = await signIn();
    const token = data.session!.access_token;
    await client.from('posts').select('*');
    await client.auth.signOut({ scope: 'global' });

    const output = logs.join('\n');
    expect(output).toMatch(/\[api\] POST \/auth\/v1\/token\?grant_type=password → 200 \(\d+ ms\) · Bearer sb_publish… \(kunci publik/);
    expect(output).toMatch(/\[api\] GET \/rest\/v1\/posts\S* → 200 \(\d+ ms\) · Bearer eyJhbGciOi…\S{6} \(JWT HS256 · role authenticated · berlaku 60 menit lagi\)/);
    expect(output).toMatch(/\[api\] POST \/auth\/v1\/logout\?scope=global → 204 \(\d+ ms\) · Bearer eyJhbGciOi…\S{6} \(JWT/);
    expect(output).not.toContain(token);
    expect(output).not.toContain(PUBLIC_KEY);
  });

  it('server tidak bisa dihubungi: alasannya dicatat, dan percobaan ulang yang sama hanya dicatat sekali', async () => {
    const refresh = () =>
      loggedFetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', headers: { Authorization: `Bearer ${PUBLIC_KEY}` } });
    await loggedFetch(`${SUPABASE_URL}/rest/v1/posts`); // starts from a successful request

    offline = true;
    for (let i = 0; i < 3; i++) await expect(refresh()).rejects.toThrow('Network request failed');
    const failures = () => logs.filter((line) => line.includes('gagal'));
    expect(failures()).toHaveLength(1);
    expect(failures()[0]).toContain('POST /auth/v1/token?grant_type=refresh_token → gagal, server tidak bisa dihubungi (Network request failed)');

    // Once a request succeeds again, a new failure is logged again
    offline = false;
    await loggedFetch(`${SUPABASE_URL}/rest/v1/posts`);
    offline = true;
    await expect(refresh()).rejects.toThrow();
    expect(failures()).toHaveLength(2);
  });

  it('describeToken membedakan JWT pengguna, kunci publik, token kedaluwarsa, dan tanpa token', () => {
    const now = Date.now();
    expect(describeToken(null)).toBe('tanpa token');
    expect(describeToken(PUBLIC_KEY)).toContain('kunci publik aplikasi');
    expect(describeToken(makeJwt({ role: 'authenticated', exp: nowSeconds() + 600 }), now)).toContain('role authenticated · berlaku 10 menit lagi');
    expect(describeToken(makeJwt({ role: 'authenticated', exp: nowSeconds() - 1 }), now)).toContain('KEDALUWARSA');
  });
});

describe('Helper JWT', () => {
  it('decodeJwt membaca header.payload.signature, termasuk nama dengan huruf non-ASCII', () => {
    const jwt = decodeJwt(makeJwt({ sub: '1', name: 'Rénata Sörensen' }));
    expect(jwt).toEqual({ header: { alg: 'HS256', typ: 'JWT' }, payload: { sub: '1', name: 'Rénata Sörensen' }, signature: SIGNATURE });
  });

  it.each(['', 'abc', 'a.b', 'a..c', 'x.!!!.y', PUBLIC_KEY, `${b64url([1, 2])}.${b64url({})}.sig`])(
    'bukan JWT → null: %p',
    (text) => expect(decodeJwt(text)).toBeNull(),
  );

  it('maskToken menampilkan 10 karakter pertama + 6 terakhir, tidak pernah utuh', () => {
    const token = makeJwt({ sub: USER.id, role: 'authenticated' }, 'signature-ABC123');
    expect(maskToken(token)).toBe('eyJhbGciOi…ABC123');
    expect(maskToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')).toBe('eyJhbGciOi…'); // short: no tail
    expect(maskToken('pendek')).toBe('***');
  });

  it('dua JWT dari server yang sama terlihat berbeda setelah disamarkan (header-nya selalu sama)', () => {
    const first = makeJwt({ sub: USER.id, session_id: 'sesi-1' }, 'tanda-tangan-AAA111');
    const second = makeJwt({ sub: USER.id, session_id: 'sesi-2' }, 'tanda-tangan-BBB222');
    expect(first.slice(0, 10)).toBe(second.slice(0, 10));
    expect(maskToken(first)).not.toBe(maskToken(second));
  });

  it('bearerToken mengambil token dari header Authorization', () => {
    expect(bearerToken('Bearer abc.def.ghi')).toBe('abc.def.ghi');
    expect(bearerToken('Basic dXNlcjpwYXNz')).toBeNull();
    expect(bearerToken(null)).toBeNull();
  });
});
