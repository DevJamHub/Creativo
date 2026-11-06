/// <reference types="jest" />
// Shared test setup: the phone's two storages and its connection, simulated in memory.
// Every test file starts with an empty SecureStore vault and an online phone.

/* eslint-disable @typescript-eslint/no-require-imports -- mock factories run before imports */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// The Keychain / Keystore behind expo-secure-store
jest.mock('expo-secure-store', () => {
  const vault = new Map<string, string>();
  return {
    __vault: vault,
    setItemAsync: jest.fn(async (key: string, value: string) => void vault.set(key, value)),
    getItemAsync: jest.fn(async (key: string) => vault.get(key) ?? null),
    deleteItemAsync: jest.fn(async (key: string) => void vault.delete(key)),
  };
});

// Online unless a test says otherwise
jest.mock('@/services/network', () => ({
  hasConnection: jest.fn(async () => true),
  hasInternet: jest.fn(async () => true),
  useNetworkState: () => ({ isConnected: true }),
}));
