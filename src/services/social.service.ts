// Social service: follows between users, and the notifications the database creates for you.
// All errors come back as friendly Indonesian messages; details are only logged in development.

import type { AppNotification } from '@/models/notification';
import { supabase } from '@/services/supabase';

type Result<T = void> = { data: T; error: null } | { data: null; error: string };

function failure(message: string, err: unknown): { data: null; error: string } {
  if (__DEV__) console.warn('[social]', err);
  return { data: null, error: message };
}

/* ------------------------------------------------------------------ */
/*  Follows                                                            */
/* ------------------------------------------------------------------ */

/** Who follows `userId` (followers) and who `userId` follows (following). */
export async function fetchConnections(userId: string): Promise<Result<{ followers: string[]; following: string[] }>> {
  const [followers, following] = await Promise.all([
    supabase.from('follows').select('follower_id').eq('following_id', userId).order('created_at', { ascending: false }),
    supabase.from('follows').select('following_id').eq('follower_id', userId).order('created_at', { ascending: false }),
  ]);
  const error = followers.error ?? following.error;
  if (error) return failure('Gagal memuat pengikut. Periksa koneksi internet kamu.', error);
  return {
    data: {
      followers: (followers.data ?? []).map((row) => row.follower_id as string),
      following: (following.data ?? []).map((row) => row.following_id as string),
    },
    error: null,
  };
}

export async function follow(followerId: string, followingId: string): Promise<Result> {
  const { error } = await supabase
    .from('follows')
    .upsert({ follower_id: followerId, following_id: followingId }, { ignoreDuplicates: true });
  if (error) return failure('Gagal mengikuti. Silakan coba lagi.', error);
  return { data: undefined, error: null };
}

export async function unfollow(followerId: string, followingId: string): Promise<Result> {
  const { error } = await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId);
  if (error) return failure('Gagal berhenti mengikuti. Silakan coba lagi.', error);
  return { data: undefined, error: null };
}

/* ------------------------------------------------------------------ */
/*  Notifications                                                      */
/* ------------------------------------------------------------------ */

export async function fetchNotifications(): Promise<Result<AppNotification[]>> {
  // RLS only returns the signed-in user's own notifications
  const { data, error } = await supabase
    .from('notifications')
    .select('*, post:posts(image_paths), comment:post_comments(body)')
    .order('created_at', { ascending: false })
    .limit(60)
    .returns<AppNotification[]>();
  if (error) return failure('Gagal memuat notifikasi. Periksa koneksi internet kamu.', error);
  return { data: data ?? [], error: null };
}

export async function markAllNotificationsRead(userId: string): Promise<Result> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', userId)
    .is('read_at', null);
  if (error) return failure('Gagal menandai notifikasi.', error);
  return { data: undefined, error: null };
}

/**
 * Calls `onChange` whenever a notification for `userId` is created. Returns an unsubscribe.
 * (Realtime can't filter deletes, so taken-back notifications disappear on the next refresh.)
 */
export function subscribeToNotifications(userId: string, onChange: () => void): () => void {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}` },
      onChange,
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
