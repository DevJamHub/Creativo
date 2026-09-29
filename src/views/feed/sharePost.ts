// Share a post or a comment through the phone's share sheet, with a link that opens it in Creativo.

import * as Linking from 'expo-linking';
import { Share } from 'react-native';

import type { Comment, Post } from '@/models/post';

/** Returns false when this device can't share (e.g. some desktop browsers). */
export async function sharePost(post: Post, authorName: string): Promise<boolean> {
  const link = Linking.createURL(`/post/${post.id}`);
  const caption = post.caption ? `“${post.caption.slice(0, 140)}${post.caption.length > 140 ? '…' : ''}”\n` : '';
  try {
    await Share.share({ message: `Karya ${authorName} di Creativo\n${caption}${link}` });
    return true;
  } catch {
    return false;
  }
}

/** Shares one comment with a link to the post's comments. Returns false when sharing isn't available. */
export async function shareComment(comment: Comment, authorName: string): Promise<boolean> {
  const link = Linking.createURL(`/post/${comment.post_id}/comments`);
  try {
    await Share.share({ message: `${authorName} berkomentar di Creativo:\n“${comment.body}”\n${link}` });
    return true;
  } catch {
    return false;
  }
}
