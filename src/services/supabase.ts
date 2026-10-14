// Supabase client for Creativo.
// The session is kept in SECURE STORAGE on native (encrypted, key in Keychain/Keystore — see storage.ts)
// and in localStorage on web, where SecureStore doesn't exist.
// Only the public anon key is exposed here — never the service-role key.
// Once signed in, every request carries the user's JWT as `Authorization: Bearer <token>` (added by
// Supabase); `loggedFetch` shows those requests in the development console (see tokenLog.ts).

import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { secureSessionStorage } from '@/services/storage';
import { loggedFetch } from '@/services/tokenLog';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in.',
  );
}

/** Where the session (access + refresh token) is saved on the device — Supabase's default name, made explicit */
export const SESSION_STORAGE_KEY = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;

const isWeb = Platform.OS === 'web';
// Static web rendering runs in Node where there is no window/localStorage
const isServer = isWeb && typeof window === 'undefined';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isWeb ? undefined : secureSessionStorage,
    storageKey: SESSION_STORAGE_KEY,
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    // On web the OAuth provider redirects back with ?code=..., which Supabase picks up itself.
    // On native the code is exchanged manually (see src/services/auth.service.ts).
    detectSessionInUrl: isWeb,
    flowType: 'pkce',
  },
  global: { fetch: loggedFetch },
});

// Only refresh tokens while the app is in the foreground (native)
if (!isWeb) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
