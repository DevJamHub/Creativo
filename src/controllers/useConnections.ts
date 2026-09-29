// Followers, following and koneksi (mutual follows) of any user, for their profile and relations list,
// plus the koneksi you have in common with them. Your own follow button updates their lists right away.

import { useEffect, useMemo, useState } from 'react';

import { useAuthContext } from '@/controllers/AuthProvider';
import { useSocial } from '@/controllers/SocialProvider';
import { connectionsOf } from '@/models/relation';
import * as social from '@/services/social.service';

export function useConnections(userId: string | undefined) {
  const { user } = useAuthContext();
  const me = user?.id;
  const { isFollowing, following: myFollowing, followers: myFollowers, connections: myConnections } = useSocial();

  const [loaded, setLoaded] = useState<{ userId: string; followers: string[]; following: string[] } | null>(null);
  const isMe = !!userId && userId === me;

  useEffect(() => {
    if (!userId || isMe) return;
    let active = true;
    social.fetchConnections(userId).then((result) => {
      if (active && result.data) setLoaded({ userId, ...result.data });
    });
    return () => {
      active = false;
    };
  }, [userId, isMe]);

  return useMemo(() => {
    // For yourself, the shared store is already the live source
    if (isMe) return { followers: myFollowers, following: myFollowing, connections: myConnections, mutualConnections: [], loading: false };

    const current = loaded?.userId === userId ? loaded : null;
    if (!current || !me || !userId) return { followers: [], following: [], connections: [], mutualConnections: [], loading: true };

    // Reflect your own follow / unfollow of this person immediately
    const others = current.followers.filter((id) => id !== me);
    const followers = isFollowing(userId) ? [me, ...others] : others;
    const connections = connectionsOf(followers, current.following);
    // "Koneksi bersama": their koneksi who are also yours
    const mine = new Set(myConnections);
    const mutualConnections = connections.filter((id) => mine.has(id));
    return { followers, following: current.following, connections, mutualConnections, loading: false };
  }, [isMe, myFollowers, myFollowing, myConnections, loaded, userId, me, isFollowing]);
}
