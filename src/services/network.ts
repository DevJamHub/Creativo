// Connection check (Week 6 · Offline Handling), with expo-network.
// Before a request the app asks the phone whether it has a connection at all: without one it shows the
// offline state right away instead of waiting for the request to fail. After a failed request it asks
// again, to tell "no internet" apart from "the server didn't answer".

import * as Network from 'expo-network';

/** False only when the phone clearly has no connection (Wi-Fi and mobile data off, airplane mode). */
export async function hasConnection(): Promise<boolean> {
  try {
    return (await Network.getNetworkStateAsync()).isConnected !== false;
  } catch {
    return true; // can't tell: let the request try
  }
}

/**
 * False when there is no connection, or the connection has no internet. Only asked after a request
 * failed: the Creativo server runs on the local Wi-Fi, which works even without internet.
 */
export async function hasInternet(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    return state.isConnected !== false && state.isInternetReachable !== false;
  } catch {
    return true;
  }
}

export const useNetworkState = Network.useNetworkState;
