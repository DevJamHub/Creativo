// One conversation: load it, receive new messages live, send, and mark what you've seen as read.

import { useCallback, useEffect, useState } from 'react';

import { useAuthContext } from '@/controllers/AuthProvider';
import { useMessages } from '@/controllers/MessagesProvider';
import type { Message } from '@/models/message';
import * as messages from '@/services/messages.service';

export function useChat(otherId: string | undefined) {
  const { user } = useAuthContext();
  const me = user?.id;
  const { markRead, refresh } = useMessages();

  const [thread, setThread] = useState<Message[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!me || !otherId) return;
    let active = true;

    messages.fetchThread(me, otherId).then((result) => {
      if (!active) return;
      setThread(result.data ?? []);
      setError(result.error);
      setLoadedFor(otherId);
    });
    messages.markThreadRead(me, otherId).then(() => markRead(otherId));

    // Live: only messages from the person this chat is with
    const unsubscribe = messages.subscribeToIncoming(me, `chat:${me}:${otherId}`, (message) => {
      if (!active || message.sender_id !== otherId) return;
      setThread((cur) => (cur.some((m) => m.id === message.id) ? cur : [...cur, message]));
      messages.markThreadRead(me, otherId).then(() => markRead(otherId));
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [me, otherId, markRead]);

  const send = useCallback(
    async (body: string) => {
      if (!me || !otherId || !body.trim() || sending) return false;
      setSending(true);
      const result = await messages.sendMessage(me, otherId, body);
      setSending(false);
      if (result.error !== null) {
        setError(result.error);
        return false;
      }
      setError(null);
      setThread((cur) => [...cur, result.data]);
      refresh(); // move this conversation to the top of the inbox
      return true;
    },
    [me, otherId, sending, refresh],
  );

  return { thread, loading: loadedFor !== otherId, error, sending, send };
}
