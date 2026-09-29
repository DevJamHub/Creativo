// Social state for the signed-in user: who you follow, who follows you, your koneksi
// (people you follow each other with), and your notifications.
// Following is optimistic; notifications arrive live through Supabase Realtime.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuthContext } from '@/controllers/AuthProvider';
import type { AppNotification } from '@/models/notification';
import { connectionsOf, relationTo, type Relation } from '@/models/relation';
import * as social from '@/services/social.service';

function useSocialStore() {
  const { user } = useAuthContext();
  const userId = user?.id;

  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const loadConnections = useCallback(async (id: string) => {
    const result = await social.fetchConnections(id);
    return result.data;
  }, []);

  const loadNotifications = useCallback(async () => (await social.fetchNotifications()).data, []);

  // Load on sign-in, and keep notifications live while signed in
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const apply = (list: AppNotification[] | null) => {
      if (active && list) setNotifications(list);
    };
    loadConnections(userId).then((data) => {
      if (!active || !data) return;
      setFollowing(data.following);
      setFollowers(data.followers);
    });
    loadNotifications().then(apply);
    const unsubscribe = social.subscribeToNotifications(userId, () => loadNotifications().then(apply));
    return () => {
      active = false;
      unsubscribe();
    };
  }, [userId, loadConnections, loadNotifications]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const [connections, list] = await Promise.all([loadConnections(userId), loadNotifications()]);
    if (connections) {
      setFollowing(connections.following);
      setFollowers(connections.followers);
    }
    if (list) setNotifications(list);
  }, [userId, loadConnections, loadNotifications]);

  const followingSet = useMemo(() => new Set(following), [following]);
  const followerSet = useMemo(() => new Set(followers), [followers]);
  const connections = useMemo(() => connectionsOf(followers, following), [followers, following]);
  const isFollowing = useCallback((id: string) => followingSet.has(id), [followingSet]);
  const relation = useCallback((id: string): Relation => relationTo(id, followingSet, followerSet), [followingSet, followerSet]);

  /** Optimistic follow / unfollow, rolled back if the request fails. */
  const toggleFollow = useCallback(
    async (targetId: string) => {
      if (!userId || targetId === userId) return { error: null };
      const wasFollowing = followingSet.has(targetId);
      const set = (follow: boolean) =>
        setFollowing((cur) => (follow ? [targetId, ...cur.filter((id) => id !== targetId)] : cur.filter((id) => id !== targetId)));

      set(!wasFollowing);
      const result = wasFollowing ? await social.unfollow(userId, targetId) : await social.follow(userId, targetId);
      if (result.error !== null) {
        set(wasFollowing);
        return { error: result.error };
      }
      return { error: null };
    },
    [userId, followingSet],
  );

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read_at).length, [notifications]);

  const markAllRead = useCallback(async () => {
    if (!userId || unreadCount === 0) return;
    const now = new Date().toISOString();
    setNotifications((cur) => cur.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    await social.markAllNotificationsRead(userId);
  }, [userId, unreadCount]);

  return useMemo(
    () => ({
      following,
      followers,
      connections,
      isFollowing,
      relation,
      toggleFollow,
      notifications,
      unreadCount,
      markAllRead,
      refresh,
    }),
    [following, followers, connections, isFollowing, relation, toggleFollow, notifications, unreadCount, markAllRead, refresh],
  );
}

type SocialContextValue = ReturnType<typeof useSocialStore>;

const SocialContext = createContext<SocialContextValue | null>(null);

export function SocialProvider({ children }: { children: ReactNode }) {
  const store = useSocialStore();
  return <SocialContext.Provider value={store}>{children}</SocialContext.Provider>;
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error('useSocial must be used inside <SocialProvider>');
  return ctx;
}
