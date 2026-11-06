// Messages service: direct messages, the inbox, read receipts, and checking for new messages.
// All errors come back as friendly Indonesian messages; details are only logged in development.

import type { Conversation, Message } from '@/models/message';
import { api, startPolling, toResult, type Result } from '@/services/api';

/** Your conversations, newest first. */
export async function fetchConversations(): Promise<Result<Conversation[]>> {
  return toResult(await api<{ conversations: Conversation[] }>('/conversations'), (data) => data.conversations);
}

/** The latest messages between you and `otherId`, oldest first. */
export async function fetchThread(otherId: string): Promise<Result<Message[]>> {
  return toResult(await api<{ messages: Message[] }>(`/messages/${otherId}`), (data) => data.messages);
}

export async function sendMessage(otherId: string, body: string): Promise<Result<Message>> {
  const result = await api<{ message: Message }>(`/messages/${otherId}`, { method: 'POST', body: { body: body.trim() } });
  return toResult(result, (data) => data.message);
}

/** Marks everything `otherId` sent you as read. */
export async function markThreadRead(otherId: string): Promise<Result> {
  return toResult(await api(`/messages/${otherId}/read`, { method: 'POST' }), () => undefined);
}

/**
 * Calls `onMessage` for every new message sent to you, checking every `intervalMs`. Returns a stop function.
 * The API hands out a cursor (the number of the newest message it has); the next check asks for anything after it.
 */
export function subscribeToIncoming(onMessage: (message: Message) => void, intervalMs = 5_000): () => void {
  let cursor: number | null = null;
  return startPolling(async () => {
    const query = cursor === null ? '' : `?since=${cursor}`;
    const result = await api<{ messages: Message[]; cursor: number }>(`/inbox/updates${query}`, { poll: true });
    if (result.error) return;
    if (cursor !== null) result.data.messages.forEach(onMessage);
    cursor = result.data.cursor;
  }, intervalMs);
}
