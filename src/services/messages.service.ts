// Messages service: direct messages, the inbox, read receipts and live delivery.
// All errors come back as friendly Indonesian messages; details are only logged in development.

import type { Conversation, Message } from '@/models/message';
import { supabase } from '@/services/supabase';

type Result<T = void> = { data: T; error: null } | { data: null; error: string };

function failure(message: string, err: unknown): { data: null; error: string } {
  if (__DEV__) console.warn('[messages]', err);
  return { data: null, error: message };
}

/** Your conversations, newest first. */
export async function fetchConversations(): Promise<Result<Conversation[]>> {
  const { data, error } = await supabase.rpc('my_conversations');
  if (error) return failure('Gagal memuat pesan. Periksa koneksi internet kamu.', error);
  const rows = ((data as Conversation[] | null) ?? []).map((c) => ({ ...c, unread: Number(c.unread) }));
  return { data: rows.sort((a, b) => b.last_at.localeCompare(a.last_at)), error: null };
}

/** The latest messages between you and `otherId`, oldest first. */
export async function fetchThread(me: string, otherId: string): Promise<Result<Message[]>> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${me},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${me})`)
    .order('created_at', { ascending: false })
    .limit(200)
    .returns<Message[]>();
  if (error) return failure('Gagal memuat percakapan. Periksa koneksi internet kamu.', error);
  return { data: (data ?? []).reverse(), error: null };
}

export async function sendMessage(me: string, otherId: string, body: string): Promise<Result<Message>> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: me, recipient_id: otherId, body: body.trim() })
    .select()
    .single<Message>();
  if (error) return failure('Pesan gagal terkirim. Silakan coba lagi.', error);
  return { data, error: null };
}

/** Marks everything `otherId` sent you as read. */
export async function markThreadRead(me: string, otherId: string): Promise<Result> {
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', me)
    .eq('sender_id', otherId)
    .is('read_at', null);
  if (error) return failure('Gagal menandai pesan.', error);
  return { data: undefined, error: null };
}

/** Calls `onMessage` for every new message sent to `me`. Returns an unsubscribe. */
export function subscribeToIncoming(me: string, channelName: string, onMessage: (message: Message) => void): () => void {
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${me}` },
      (payload) => onMessage(payload.new as Message),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
