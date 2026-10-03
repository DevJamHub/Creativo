import type { AppNotification } from '@/models/notification';
import { describeNotification } from '@/models/notification';
import type { Comment, Post } from '@/models/post';
import { isEdited, toThreads } from '@/models/post';
import { experienceLabel, getProfession, professions } from '@/models/profession';
import { connectionsOf, relationTo } from '@/models/relation';

describe('relation (LinkedIn-style)', () => {
  const following = new Set(['a', 'b']);
  const followers = new Set(['b', 'c']);

  it('knows connections, following, followers and strangers', () => {
    expect(relationTo('b', following, followers)).toBe('connected');
    expect(relationTo('a', following, followers)).toBe('following');
    expect(relationTo('c', following, followers)).toBe('follower');
    expect(relationTo('z', following, followers)).toBe('none');
  });

  it('lists koneksi in the order of the followers list', () => {
    expect(connectionsOf(['c', 'b', 'a'], ['a', 'b'])).toEqual(['b', 'a']);
    expect(connectionsOf([], ['a'])).toEqual([]);
  });
});

describe('notifications', () => {
  const base: AppNotification = {
    id: 'n1',
    recipient_id: 'me',
    actor_id: 'sigit',
    type: 'like_post',
    post_id: 'p1',
    comment_id: null,
    created_at: '2026-10-03T00:00:00Z',
    read_at: null,
    post: null,
    comment: null,
  };

  it('describes each type in Indonesian', () => {
    expect(describeNotification(base)).toBe('menyukai postinganmu.');
    expect(describeNotification({ ...base, type: 'follow' })).toBe('mulai mengikutimu.');
    expect(describeNotification({ ...base, type: 'comment', comment: { body: 'Keren!' } })).toBe(
      'mengomentari postinganmu: “Keren!”',
    );
    expect(describeNotification({ ...base, type: 'reply' })).toBe('membalas komentarmu.');
  });

  it('shortens long comments to 80 characters', () => {
    const text = describeNotification({ ...base, type: 'like_comment', comment: { body: 'x'.repeat(100) } });
    expect(text).toBe(`menyukai komentarmu: “${'x'.repeat(80)}…”`);
  });
});

describe('posts', () => {
  const comment = (id: string, parent_id: string | null): Comment => ({
    id,
    post_id: 'p1',
    author_id: 'u',
    parent_id,
    body: id,
    created_at: '2026-10-03T00:00:00Z',
    like_count: 0,
  });

  it('groups replies under their top-level comment, one level deep', () => {
    const threads = toThreads([comment('c1', null), comment('r1', 'c1'), comment('c2', null), comment('r2', 'c1')]);
    expect(threads.map((t) => [t.comment.id, t.replies.map((r) => r.id)])).toEqual([
      ['c1', ['r1', 'r2']],
      ['c2', []],
    ]);
  });

  it('marks a post as edited only after a real change', () => {
    const post = { created_at: '2026-10-03T10:00:00.000Z', updated_at: '2026-10-03T10:00:00.500Z' } as Post;
    expect(isEdited(post)).toBe(false);
    expect(isEdited({ ...post, updated_at: '2026-10-03T10:05:00.000Z' })).toBe(true);
  });
});

describe('professions', () => {
  it('finds a profession by id and falls back to the last one', () => {
    expect(getProfession('uiux').label).toBe('Desainer UI/UX');
    expect(getProfession('unknown')).toBe(professions[professions.length - 1]);
    expect(getProfession(null)).toBe(professions[professions.length - 1]);
  });

  it('labels experience levels', () => {
    expect(experienceLabel('senior')).toBe('Senior');
    expect(experienceLabel(undefined)).toBeNull();
  });

  it('gives every profession focus areas and a showcase noun', () => {
    for (const p of professions) {
      expect(p.focus.length).toBeGreaterThan(0);
      expect(p.showcase.noun).toBeTruthy();
    }
  });
});
