// Derived data (selectors) built on top of the app state.

import { useApp } from './AppProvider';

import type { ConnectionStatus, Professional } from '@/types';

// Find any professional by id, including the current user ("me")
export function useProfessional(id: string | undefined): Professional | undefined {
  const { state, professionals } = useApp();
  if (!id) return undefined;
  if (id === state.me.id) return state.me;
  return professionals.find((p) => p.id === id);
}

export function useConnectionStatus(id: string): ConnectionStatus {
  const { state } = useApp();
  if (id === state.me.id) return 'none';
  return state.statuses[id] ?? 'none';
}

// Everything the Network tab and suggestion widgets need
export function useNetwork() {
  const { state, professionals } = useApp();

  const byStatus = (status: ConnectionStatus) =>
    professionals.filter((p) => (state.statuses[p.id] ?? 'none') === status);

  const connected = byStatus('connected');
  const connectedIds = new Set(connected.map((p) => p.id));

  // Mutual connections = people in *their* network that are also in *mine*
  const getMutual = (pro: Professional): Professional[] =>
    pro.id === state.me.id ? [] : professionals.filter((p) => pro.connections.includes(p.id) && connectedIds.has(p.id));

  // Suggestions: people I'm not connected to, ranked by mutuals then by my interests
  const suggested = byStatus('none')
    .map((p) => ({ pro: p, mutual: getMutual(p).length, interest: state.interests.includes(p.categoryId) ? 1 : 0 }))
    .sort((a, b) => b.mutual - a.mutual || b.interest - a.interest)
    .map((x) => x.pro);

  return {
    connected,
    incoming: byStatus('incoming'),
    outgoing: byStatus('outgoing'),
    suggested,
    getMutual,
  };
}

// Recommended professionals for Home, based on onboarding interests
export function useRecommended(): Professional[] {
  const { state, professionals } = useApp();
  if (state.interests.length === 0) return professionals.slice(0, 6);
  const matches = professionals.filter((p) => state.interests.includes(p.categoryId));
  const rest = professionals.filter((p) => !state.interests.includes(p.categoryId));
  return [...matches, ...rest].slice(0, 8);
}
