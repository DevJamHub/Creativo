// Notification model: created by database triggers (see supabase/migrations) when someone
// likes or comments on your post, replies to or likes your comment, or follows you.

import type { IconName } from '@/models/icon';

export type NotificationType = 'like_post' | 'comment' | 'reply' | 'like_comment' | 'follow';

export interface AppNotification {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: NotificationType;
  post_id: string | null;
  comment_id: string | null;
  created_at: string;
  read_at: string | null;
  /** Embedded so the list can show a thumbnail and a quote without extra requests */
  post: { image_paths: string[] } | null;
  comment: { body: string } | null;
}

/** What happened, written after the actor's name: "Sigit menyukai postinganmu." */
export function describeNotification(n: AppNotification): string {
  const quote = n.comment?.body ? `: “${n.comment.body.slice(0, 80)}${n.comment.body.length > 80 ? '…' : ''}”` : '.';
  switch (n.type) {
    case 'like_post':
      return 'menyukai postinganmu.';
    case 'comment':
      return `mengomentari postinganmu${quote}`;
    case 'reply':
      return `membalas komentarmu${quote}`;
    case 'like_comment':
      return `menyukai komentarmu${quote}`;
    case 'follow':
      return 'mulai mengikutimu.';
  }
}

export const notificationIcon: Record<NotificationType, { icon: IconName; color: 'danger' | 'primary' | 'sky' }> = {
  like_post: { icon: 'heart', color: 'danger' },
  like_comment: { icon: 'heart', color: 'danger' },
  comment: { icon: 'chatbubble', color: 'primary' },
  reply: { icon: 'arrow-undo', color: 'primary' },
  follow: { icon: 'person-add', color: 'sky' },
};
