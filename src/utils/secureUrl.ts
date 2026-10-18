// HTTPS check for the servers that receive the user's token (Week 5 · Protect the Data in Transit).
// A JWT sent over plain http:// can be read by anyone on the same network, so the app only talks to
// its API over https://. A local development server (Supabase CLI on this computer or the Android
// emulator's host) has no certificate, so plain http is allowed for those addresses only.

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '10.0.2.2']);

/** True when the address is the developer's own computer, where http:// is acceptable. */
export function isLocalHost(hostname: string): boolean {
  return LOCAL_HOSTS.has(hostname.toLowerCase());
}

/** True when a request to this URL is encrypted in transit (https://), or goes to a local development server. */
export function isSecureUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'https:' || (protocol === 'http:' && isLocalHost(hostname));
  } catch {
    return false;
  }
}

/** Throws with a clear message when the API address would send tokens without encryption. */
export function assertSecureApiUrl(url: string, name = 'EXPO_PUBLIC_SUPABASE_URL'): void {
  if (!isSecureUrl(url)) {
    throw new Error(
      `${name} harus memakai https:// supaya token login tidak terkirim tanpa enkripsi (sekarang: "${url}"). ` +
        'http:// hanya boleh untuk server lokal (localhost, 127.0.0.1, 10.0.2.2).',
    );
  }
}
