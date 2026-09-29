// Message model: direct messages between two people (the "Pesan" section of Teman).
// Mirrors public.messages and public.my_conversations() in supabase/migrations.

export const MESSAGE_MAX = 2000;

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

/** One row in the inbox: the other person and the latest message with them. */
export interface Conversation {
  other_id: string;
  last_body: string;
  last_at: string;
  last_sender_id: string;
  unread: number;
}
