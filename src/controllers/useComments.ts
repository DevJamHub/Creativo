// Comments of one post: load threads, comment, reply, like and delete.
// Keeps the post's comment count in the feed in sync.

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuthContext } from '@/controllers/AuthProvider';
import { usePosts } from '@/controllers/PostsProvider';
import { toThreads, type Comment } from '@/models/post';
import * as postsApi from '@/services/posts.service';

export function useComments(postId: string | undefined) {
  const { user } = useAuthContext();
  const userId = user?.id;
  const { adjustCommentCount } = usePosts();

  const [comments, setComments] = useState<Comment[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!postId || !userId) return;
    let active = true;
    postsApi.fetchComments(postId, userId).then((result) => {
      if (!active) return;
      setComments(result.data?.comments ?? []);
      setLikedIds(new Set(result.data?.likedIds ?? []));
      setError(result.error);
      setLoadedFor(postId);
    });
    return () => {
      active = false;
    };
  }, [postId, userId]);

  const threads = useMemo(() => toThreads(comments), [comments]);

  /** Sends a comment, or a reply when `parentId` is given. Returns true once it's saved. */
  const send = useCallback(
    async (body: string, parentId: string | null = null) => {
      if (!postId || !userId || !body.trim() || sending) return false;
      setSending(true);
      const result = await postsApi.addComment(postId, userId, body, parentId);
      setSending(false);
      if (result.error !== null) {
        setError(result.error);
        return false;
      }
      setError(null);
      setComments((cur) => [...cur, result.data]);
      adjustCommentCount(postId, 1);
      return true;
    },
    [postId, userId, sending, adjustCommentCount],
  );

  /** Deleting a top-level comment also deletes its replies (the database cascades). */
  const remove = useCallback(
    async (comment: Comment) => {
      const result = await postsApi.deleteComment(comment.id);
      if (result.error !== null) {
        setError(result.error);
        return;
      }
      const gone = comments.filter((c) => c.id === comment.id || c.parent_id === comment.id).length;
      setComments((cur) => cur.filter((c) => c.id !== comment.id && c.parent_id !== comment.id));
      adjustCommentCount(comment.post_id, -gone);
    },
    [comments, adjustCommentCount],
  );

  /** Optimistic like/unlike, rolled back if the request fails. */
  const toggleLike = useCallback(
    async (comment: Comment) => {
      if (!userId) return;
      const liked = likedIds.has(comment.id);
      const flip = (like: boolean) => {
        setLikedIds((cur) => {
          const next = new Set(cur);
          if (like) next.add(comment.id);
          else next.delete(comment.id);
          return next;
        });
        setComments((cur) =>
          cur.map((c) => (c.id === comment.id ? { ...c, like_count: Math.max(0, c.like_count + (like ? 1 : -1)) } : c)),
        );
      };

      flip(!liked);
      const result = liked
        ? await postsApi.unlikeComment(comment.id, userId)
        : await postsApi.likeComment(comment.id, userId);
      if (result.error !== null) {
        flip(liked);
        setError(result.error);
      }
    },
    [userId, likedIds],
  );

  return { threads, likedIds, loading: loadedFor !== postId, error, sending, send, remove, toggleLike };
}
