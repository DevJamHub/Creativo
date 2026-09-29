// Post model: work a professional shares to the feed (Instagram-style: photos + caption, likes, comments).
// Mirrors public.posts / post_likes / post_comments in supabase/migrations; limits match their checks.

export const MAX_POST_IMAGES = 10;
export const CAPTION_MAX = 2200;
export const COMMENT_MAX = 1000;

export interface Post {
  id: string;
  author_id: string;
  /** Paths inside the "posts" storage bucket; the first one is the cover */
  image_paths: string[];
  caption: string;
  created_at: string;
  updated_at: string;
  /** Counted by the database when the feed loads, then kept up to date locally */
  like_count: number;
  comment_count: number;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  /** The top-level comment this replies to; threads are one level deep like Instagram */
  parent_id: string | null;
  body: string;
  created_at: string;
  like_count: number;
}

/** A top-level comment with its replies, oldest first. */
export interface CommentThread {
  comment: Comment;
  replies: Comment[];
}

export function toThreads(comments: Comment[]): CommentThread[] {
  const threads = comments.filter((c) => !c.parent_id).map((comment) => ({ comment, replies: [] as Comment[] }));
  const byId = new Map(threads.map((t) => [t.comment.id, t]));
  for (const c of comments) if (c.parent_id) byId.get(c.parent_id)?.replies.push(c);
  return threads;
}

/** A photo picked on the device, before it is uploaded. */
export interface LocalImage {
  uri: string;
  mimeType?: string | null;
}

/** True when the caption was changed after posting (shown as "diedit"). */
export const isEdited = (post: Post) =>
  new Date(post.updated_at).getTime() - new Date(post.created_at).getTime() > 1000;
