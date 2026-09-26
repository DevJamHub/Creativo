// Global app state (in-memory, mock only).
// Holds onboarding choices, the current user's editable repository,
// connection statuses and "recently viewed" history.

import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';

import { initialConnectionStatus, initialCurrentUser, professionals } from '@/data/professionals';
import type {
  CategoryId,
  ConnectionStatus,
  ContactInfo,
  ListSectionKey,
  Professional,
} from '@/types';

interface AppState {
  onboarded: boolean;
  interests: CategoryId[];
  me: Professional;
  statuses: Record<string, ConnectionStatus>;
  recentlyViewed: string[];
  recentSearches: string[];
}

type ProfileFields = Pick<
  Professional,
  'name' | 'profession' | 'categoryId' | 'headline' | 'about' | 'location' | 'availability' | 'specializations' | 'yearsOfExperience'
>;

type Action =
  | { type: 'completeOnboarding'; interests: CategoryId[] }
  | { type: 'resetOnboarding' }
  | { type: 'setStatus'; id: string; status: ConnectionStatus }
  | { type: 'viewed'; id: string }
  | { type: 'searched'; query: string }
  | { type: 'clearSearches' }
  | { type: 'updateProfile'; fields: Partial<ProfileFields> }
  | { type: 'updateContact'; contact: ContactInfo }
  | { type: 'addItem'; section: ListSectionKey; item: Professional[ListSectionKey][number] }
  | { type: 'removeItem'; section: ListSectionKey; id: string };

const initialState: AppState = {
  onboarded: false,
  interests: [],
  me: initialCurrentUser,
  statuses: initialConnectionStatus,
  recentlyViewed: [],
  recentSearches: ['Architect', 'React'],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'completeOnboarding':
      return { ...state, onboarded: true, interests: action.interests };
    case 'resetOnboarding':
      return { ...state, onboarded: false };
    case 'setStatus':
      return { ...state, statuses: { ...state.statuses, [action.id]: action.status } };
    case 'viewed':
      // Keep the latest 10 unique profiles, newest first
      return {
        ...state,
        recentlyViewed: [action.id, ...state.recentlyViewed.filter((x) => x !== action.id)].slice(0, 10),
      };
    case 'searched': {
      const q = action.query.trim();
      if (!q) return state;
      return {
        ...state,
        recentSearches: [q, ...state.recentSearches.filter((s) => s.toLowerCase() !== q.toLowerCase())].slice(0, 8),
      };
    }
    case 'clearSearches':
      return { ...state, recentSearches: [] };
    case 'updateProfile':
      return { ...state, me: { ...state.me, ...action.fields } };
    case 'updateContact':
      return { ...state, me: { ...state.me, contact: action.contact } };
    case 'addItem': {
      // New items go to the top of their repository section
      const list = state.me[action.section] as { id: string }[];
      return { ...state, me: { ...state.me, [action.section]: [action.item, ...list] } };
    }
    case 'removeItem': {
      const list = state.me[action.section] as { id: string }[];
      return { ...state, me: { ...state.me, [action.section]: list.filter((i) => i.id !== action.id) } };
    }
    default:
      return state;
  }
}

// --- Context ----------------------------------------------------------------

interface AppContextValue {
  state: AppState;
  professionals: Professional[]; // everyone except the current user
  // actions
  completeOnboarding: (interests: CategoryId[]) => void;
  resetOnboarding: () => void;
  connect: (id: string) => void;
  cancelRequest: (id: string) => void;
  acceptRequest: (id: string) => void;
  declineRequest: (id: string) => void;
  removeConnection: (id: string) => void;
  markViewed: (id: string) => void;
  saveSearch: (query: string) => void;
  clearSearches: () => void;
  updateProfile: (fields: Partial<ProfileFields>) => void;
  updateContact: (contact: ContactInfo) => void;
  addItem: <K extends ListSectionKey>(section: K, item: Professional[K][number]) => void;
  removeItem: (section: ListSectionKey, id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<AppContextValue>(() => {
    const setStatus = (id: string, status: ConnectionStatus) => dispatch({ type: 'setStatus', id, status });
    return {
      state,
      professionals,
      completeOnboarding: (interests) => dispatch({ type: 'completeOnboarding', interests }),
      resetOnboarding: () => dispatch({ type: 'resetOnboarding' }),
      connect: (id) => setStatus(id, 'outgoing'),
      cancelRequest: (id) => setStatus(id, 'none'),
      acceptRequest: (id) => setStatus(id, 'connected'),
      declineRequest: (id) => setStatus(id, 'none'),
      removeConnection: (id) => setStatus(id, 'none'),
      markViewed: (id) => dispatch({ type: 'viewed', id }),
      saveSearch: (query) => dispatch({ type: 'searched', query }),
      clearSearches: () => dispatch({ type: 'clearSearches' }),
      updateProfile: (fields) => dispatch({ type: 'updateProfile', fields }),
      updateContact: (contact) => dispatch({ type: 'updateContact', contact }),
      addItem: (section, item) => dispatch({ type: 'addItem', section, item }),
      removeItem: (section, id) => dispatch({ type: 'removeItem', section, id }),
    };
  }, [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
