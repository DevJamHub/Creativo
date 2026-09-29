// Shared feed state: every post, the public profiles of their authors, and which posts you liked.
// One store keeps Beranda, Feed, Profil and the post screens in sync after an upload, edit, like,
// comment or delete.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuthContext } from '@/controllers/AuthProvider';
import type { LocalImage, Post } from '@/models/post';
import type { PublicProfile } from '@/models/profile';
import * as postsApi from '@/services/posts.service';

type LoadState = 'loading' | 'ready' | 'error';

const fetchAll = (userId: string) =>
  Promise.all([postsApi.fetchPosts(), postsApi.fetchPublicProfiles(), postsApi.fetchLikedPostIds(userId)]);
type FetchResults = Awaited<ReturnType<typeof fetchAll>>;

function usePostsStore() {
  const { user } = useAuthContext();
  const userId = user?.id;

  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Record<string, PublicProfile>>({});
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState<{ userId: string; state: Exclude<LoadState, 'loading'> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Still loading until the data in memory was fetched for the user who is signed in now
  const state: LoadState = !loaded || loaded.userId !== userId ? 'loading' : loaded.state;

  const apply = useCallback((userId: string, [postsResult, profilesResult, likedResult]: FetchResults) => {
    if (postsResult.error !== null || profilesResult.error !== null) {
      setError(postsResult.error ?? profilesResult.error);
      // A failed refresh keeps what is already on screen
      setLoaded((cur) => (cur?.userId === userId && cur.state === 'ready' ? cur : { userId, state: 'error' }));
      return;
    }
    setPosts(postsResult.data);
    setProfiles(Object.fromEntries(profilesResult.data.map((p) => [p.id, p])));
    // Hearts are a nice-to-have: if they fail to load the feed still shows, just unfilled
    setLikedIds(new Set(likedResult.data ?? []));
    setError(null);
    setLoaded({ userId, state: 'ready' });
  }, []);

  // Load whenever the signed-in user changes; a late answer for a previous user is dropped
  useEffect(() => {
    if (!userId) return;
    let active = true;
    fetchAll(userId).then((results) => {
      if (active) apply(userId, results);
    });
    return () => {
      active = false;
    };
  }, [userId, apply]);

  const load = useCallback(async () => {
    if (userId) apply(userId, await fetchAll(userId));
  }, [userId, apply]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const create = useCallback(
    async (images: LocalImage[], caption: string) => {
      if (!userId) return { error: 'Sesi kamu telah berakhir. Silakan masuk kembali.' };
      const result = await postsApi.createPost(userId, images, caption);
      if (result.error !== null) return { error: result.error };
      setPosts((cur) => [result.data, ...cur]);
      // A first post can come before our own card is in the list (e.g. right after onboarding)
      if (!profiles[userId]) load();
      return { error: null };
    },
    [userId, profiles, load],
  );

  const editCaption = useCallback(async (postId: string, caption: string) => {
    const result = await postsApi.updateCaption(postId, caption);
    if (result.error !== null) return { error: result.error };
    setPosts((cur) => cur.map((p) => (p.id === postId ? { ...p, ...result.data } : p)));
    return { error: null };
  }, []);

  const remove = useCallback(async (post: Post) => {
    const result = await postsApi.deletePost(post);
    if (result.error !== null) return { error: result.error };
    setPosts((cur) => cur.filter((p) => p.id !== post.id));
    return { error: null };
  }, []);

  const setCount = useCallback((postId: string, field: 'like_count' | 'comment_count', delta: number) => {
    setPosts((cur) => cur.map((p) => (p.id === postId ? { ...p, [field]: Math.max(0, p[field] + delta) } : p)));
  }, []);

  /** Optimistic: the heart and count change right away and roll back if the request fails. */
  const toggleLike = useCallback(
    async (postId: string) => {
      if (!userId) return { error: 'Sesi kamu telah berakhir. Silakan masuk kembali.' };
      const liked = likedIds.has(postId);
      const flip = (like: boolean) => {
        setLikedIds((cur) => {
          const next = new Set(cur);
          if (like) next.add(postId);
          else next.delete(postId);
          return next;
        });
        setCount(postId, 'like_count', like ? 1 : -1);
      };

      flip(!liked);
      const result = liked ? await postsApi.unlikePost(postId, userId) : await postsApi.likePost(postId, userId);
      if (result.error !== null) {
        flip(liked);
        return { error: result.error };
      }
      return { error: null };
    },
    [userId, likedIds, setCount],
  );

  /** Keeps "Lihat semua N komentar" right after commenting on the comments screen. */
  const adjustCommentCount = useCallback((postId: string, delta: number) => setCount(postId, 'comment_count', delta), [setCount]);

  return useMemo(
    () => ({
      posts,
      profiles,
      likedIds,
      state,
      error,
      refreshing,
      refresh,
      create,
      editCaption,
      remove,
      toggleLike,
      adjustCommentCount,
    }),
    [posts, profiles, likedIds, state, error, refreshing, refresh, create, editCaption, remove, toggleLike, adjustCommentCount],
  );
}

type PostsContextValue = ReturnType<typeof usePostsStore>;

const PostsContext = createContext<PostsContextValue | null>(null);

export function PostsProvider({ children }: { children: ReactNode }) {
  const store = usePostsStore();
  return <PostsContext.Provider value={store}>{children}</PostsContext.Provider>;
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used inside <PostsProvider>');
  return ctx;
}

export function usePost(id: string | undefined) {
  const { posts, profiles } = usePosts();
  const post = posts.find((p) => p.id === id);
  return { post, author: post ? profiles[post.author_id] : undefined };
}
