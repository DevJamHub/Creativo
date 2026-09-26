// Supabase client for Creativo.
// Uses AsyncStorage for persistent sessions on native and localStorage on web.
// Only the public anon key is exposed here — never the service-role key.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in.',
  );
}

const isWeb = Platform.OS === 'web';
// Static web rendering runs in Node where there is no window/localStorage
const isServer = isWeb && typeof window === 'undefined';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isWeb ? undefined : AsyncStorage,
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    // On web the OAuth provider redirects back with ?code=..., which Supabase picks up itself.
    // On native the code is exchanged manually (see src/lib/auth.ts).
    detectSessionInUrl: isWeb,
    flowType: 'pkce',
  },
});

// Only refresh tokens while the app is in the foreground (native)
if (!isWeb) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
