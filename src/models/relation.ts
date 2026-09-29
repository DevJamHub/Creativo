// Relation model, LinkedIn-style: following someone is one-way; when you follow each other
// you are "Terhubung" (a koneksi).

export type Relation = 'connected' | 'following' | 'follower' | 'none';

export function relationTo(userId: string, following: ReadonlySet<string>, followers: ReadonlySet<string>): Relation {
  const iFollow = following.has(userId);
  const followsMe = followers.has(userId);
  if (iFollow && followsMe) return 'connected';
  if (iFollow) return 'following';
  if (followsMe) return 'follower';
  return 'none';
}

/** Koneksi: people who both follow and are followed by the same user. Keeps the order of `followers`. */
export function connectionsOf(followers: string[], following: string[]): string[] {
  const back = new Set(following);
  return followers.filter((id) => back.has(id));
}
