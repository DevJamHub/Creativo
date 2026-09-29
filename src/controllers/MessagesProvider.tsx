// Inbox state for the signed-in user: conversations and how many messages are unread.
// New messages arrive live; the Teman tab shows a dot while anything is unread.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuthContext } from '@/controllers/AuthProvider';
import type { Conversation } from '@/models/message';
import * as messages from '@/services/messages.service';

function useMessagesStore() {
  const { user } = useAuthContext();
  const userId = user?.id;
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const load = () =>
      messages.fetchConversations().then((result) => {
        if (active && result.data) setConversations(result.data);
      });
    load();
    const unsubscribe = messages.subscribeToIncoming(userId, `inbox:${userId}`, load);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [userId]);

  const refresh = useCallback(async () => {
    const result = await messages.fetchConversations();
    if (result.data) setConversations(result.data);
  }, []);

  /** Called by an open chat: clears its unread count right away. */
  const markRead = useCallback((otherId: string) => {
    setConversations((cur) => cur.map((c) => (c.other_id === otherId ? { ...c, unread: 0 } : c)));
  }, []);

  const unreadTotal = useMemo(() => conversations.reduce((n, c) => n + c.unread, 0), [conversations]);

  return useMemo(() => ({ conversations, unreadTotal, refresh, markRead }), [conversations, unreadTotal, refresh, markRead]);
}

type MessagesContextValue = ReturnType<typeof useMessagesStore>;

const MessagesContext = createContext<MessagesContextValue | null>(null);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const store = useMessagesStore();
  return <MessagesContext.Provider value={store}>{children}</MessagesContext.Provider>;
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error('useMessages must be used inside <MessagesProvider>');
  return ctx;
}
