/// <reference types="jest" />
// HTTPS rule (Week 5 · Protect the Data in Transit): the token may only travel encrypted.
// Plain http:// is refused, except for a local development server on this computer.

import { assertSecureApiUrl, isLocalHost, isSecureUrl } from '@/utils/secureUrl';

describe('isSecureUrl', () => {
  it.each([
    'https://fmmudgdkyihbyxntutit.supabase.co',
    'https://himalayas.app/jobs/api/search?q=design',
    'http://localhost:54321', // Supabase CLI on this computer
    'http://127.0.0.1:54321',
    'http://10.0.2.2:54321', // the computer as seen from the Android emulator
    'http://[::1]:54321',
  ])('mengizinkan %s', (url) => {
    expect(isSecureUrl(url)).toBe(true);
  });

  it.each([
    'http://fmmudgdkyihbyxntutit.supabase.co', // token would travel unencrypted
    'http://192.168.1.10:54321', // another device on the Wi-Fi: traffic can be read on the network
    'ftp://example.com',
    'bukan alamat',
    '',
  ])('menolak %s', (url) => {
    expect(isSecureUrl(url)).toBe(false);
  });
});

describe('isLocalHost', () => {
  it('tidak membedakan huruf besar/kecil', () => {
    expect(isLocalHost('LOCALHOST')).toBe(true);
  });

  it('nama yang hanya mirip tetap ditolak', () => {
    expect(isLocalHost('localhost.evil.com')).toBe(false);
  });
});

describe('assertSecureApiUrl', () => {
  it('alamat HTTPS lolos tanpa error', () => {
    expect(() => assertSecureApiUrl('https://creativo-test.supabase.co')).not.toThrow();
  });

  it('alamat http:// ditolak dengan pesan yang menjelaskan cara memperbaikinya', () => {
    expect(() => assertSecureApiUrl('http://creativo-test.supabase.co')).toThrow(/harus memakai https:\/\//);
  });
});
