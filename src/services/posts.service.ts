// Posts service: the work professionals share to the feed (images + caption).
// Images go to the public "posts" storage bucket under <author_id>/, rows to public.posts.
// All errors come back as friendly Indonesian messages; details are only logged in development.

import { MAX_POST_IMAGES, type Comment, type LocalImage, type Post, type PostKind } from '@/models/post';
import { professionIdsMatching } from '@/models/profession';
import type { PublicProfile } from '@/models/profile';
import { supabase } from '@/services/supabase';

const BUCKET = 'posts';

type Result<T = void> = { data: T; error: null } | { data: null; error: string };

function failure(message: string, err: unknown): { data: null; error: string } {
  if (__DEV__) console.warn('[posts]', err);
  return { data: null, error: message };
}

export function imageUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/* ------------------------------------------------------------------ */
/*  Reading                                                            */
/* ------------------------------------------------------------------ */

type PostRow = Omit<Post, 'like_count' | 'comment_count'>;
type PostRowWithCounts = PostRow & { post_likes: { count: number }[]; post_comments: { count: number }[] };

const withCounts = ({ post_likes, post_comments, ...row }: PostRowWithCounts): Post => ({
  ...row,
  like_count: post_likes[0]?.count ?? 0,
  comment_count: post_comments[0]?.count ?? 0,
});

export async function fetchPosts(): Promise<Result<Post[]>> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, post_likes(count), post_comments(count)')
    .order('created_at', { ascending: false })
    .limit(100)
    .returns<PostRowWithCounts[]>();
  if (error) return failure('Gagal memuat postingan. Periksa koneksi internet kamu.', error);
  return { data: (data ?? []).map(withCounts), error: null };
}

/** Ids of the posts the user has liked, to fill in the hearts. */
export async function fetchLikedPostIds(userId: string): Promise<Result<string[]>> {
  const { data, error } = await supabase.from('post_likes').select('post_id').eq('user_id', userId);
  if (error) return failure('Gagal memuat suka.', error);
  return { data: data.map((row) => row.post_id as string), error: null };
}

type CommentRow = Omit<Comment, 'like_count'> & { comment_likes: { count: number }[] };

/** All comments and replies of a post (oldest first), plus which of them the user liked. */
export async function fetchComments(postId: string, userId: string): Promise<Result<{ comments: Comment[]; likedIds: string[] }>> {
  const { data, error } = await supabase
    .from('post_comments')
    .select('*, comment_likes(count)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .returns<CommentRow[]>();
  if (error) return failure('Gagal memuat komentar. Periksa koneksi internet kamu.', error);

  const comments = (data ?? []).map(({ comment_likes, ...row }) => ({ ...row, like_count: comment_likes[0]?.count ?? 0 }));
  if (comments.length === 0) return { data: { comments, likedIds: [] }, error: null };

  const { data: liked, error: likedError } = await supabase
    .from('comment_likes')
    .select('comment_id')
    .eq('user_id', userId)
    .in('comment_id', comments.map((c) => c.id));
  // Hearts are a nice-to-have: show the comments even if they fail
  if (likedError && __DEV__) console.warn('[posts] comment likes failed', likedError);
  return { data: { comments, likedIds: (liked ?? []).map((row) => row.comment_id as string) }, error: null };
}

export async function fetchPublicProfiles(): Promise<Result<PublicProfile[]>> {
  const { data, error } = await supabase.rpc('public_profiles');
  if (error) return failure('Gagal memuat daftar profesional.', error);
  return { data: (data as PublicProfile[] | null) ?? [], error: null };
}

/** How many professionals one search request returns (the database allows at most 50). */
export const PROFESSIONALS_PAGE_SIZE = 30;

export interface ProfessionalSearch {
  /** Name, profession, specialization or headline */
  query: string;
  /** Only this profession id, or null for every field */
  field: string | null;
  /** Only people "Terbuka untuk peluang" */
  openOnly: boolean;
  /** 0-based page of PROFESSIONALS_PAGE_SIZE results */
  page: number;
}

/** Search every onboarded professional in the database (search_professionals()), newest first. */
export async function searchProfessionals(
  search: ProfessionalSearch,
): Promise<Result<{ items: PublicProfile[]; total: number }>> {
  const query = search.query.trim();
  const { data, error } = await supabase.rpc('search_professionals', {
    q: query || null,
    match_professions: query ? professionIdsMatching(query) : null,
    field: search.field,
    open_only: search.openOnly,
    page_size: PROFESSIONALS_PAGE_SIZE,
    page_offset: search.page * PROFESSIONALS_PAGE_SIZE,
  });
  if (error) return failure('Gagal mencari profesional. Periksa koneksi internet kamu.', error);
  const rows = (data as (PublicProfile & { total_count: number })[] | null) ?? [];
  return {
    data: { items: rows.map(({ total_count: _total, ...profile }) => profile), total: Number(rows[0]?.total_count ?? 0) },
    error: null,
  };
}

/* ------------------------------------------------------------------ */
/*  Writing                                                            */
/* ------------------------------------------------------------------ */

const extensionFor = (mime: string) => (mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg');

async function uploadImage(authorId: string, image: LocalImage, index: number | string): Promise<string> {
  const contentType = image.mimeType ?? 'image/jpeg';
  const path = `${authorId}/${Date.now()}-${index}.${extensionFor(contentType)}`;
  // fetch() reads local file:// (native) and blob: (web) URIs alike
  const body = await (await fetch(image.uri)).arrayBuffer();
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, { contentType, upsert: false });
  if (error) throw error;
  return path;
}

export async function createPost(authorId: string, images: LocalImage[], caption: string, kind: PostKind): Promise<Result<Post>> {
  const uploaded: string[] = [];
  try {
    for (const [i, image] of images.slice(0, MAX_POST_IMAGES).entries()) {
      uploaded.push(await uploadImage(authorId, image, i));
    }
  } catch (err) {
    await removeImages(uploaded);
    return failure('Gagal mengunggah foto. Coba lagi dengan koneksi yang lebih stabil.', err);
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({ author_id: authorId, image_paths: uploaded, caption: caption.trim(), kind })
    .select()
    .single<PostRow>();
  if (error) {
    await removeImages(uploaded);
    return failure('Gagal menyimpan postingan. Silakan coba lagi.', error);
  }
  return { data: { ...data, like_count: 0, comment_count: 0 }, error: null };
}

/** Uploads a new profile photo into the user's folder and returns its public URL. */
export async function uploadAvatar(userId: string, image: LocalImage): Promise<Result<string>> {
  try {
    return { data: imageUrl(await uploadImage(userId, image, 'avatar')), error: null };
  } catch (err) {
    return failure('Gagal mengunggah foto profil. Silakan coba lagi.', err);
  }
}

/** Returns only the changed fields; the caller keeps the counts it already has. */
export async function updateCaption(postId: string, caption: string): Promise<Result<Pick<Post, 'caption' | 'updated_at'>>> {
  const { data, error } = await supabase
    .from('posts')
    .update({ caption: caption.trim() })
    .eq('id', postId)
    .select('caption, updated_at')
    .single<Pick<Post, 'caption' | 'updated_at'>>();
  if (error) return failure('Gagal menyimpan caption. Silakan coba lagi.', error);
  return { data, error: null };
}

export async function deletePost(post: Post): Promise<Result> {
  const { error } = await supabase.from('posts').delete().eq('id', post.id);
  if (error) return failure('Gagal menghapus postingan. Silakan coba lagi.', error);
  await removeImages(post.image_paths);
  return { data: undefined, error: null };
}

/* ------------------------------------------------------------------ */
/*  Likes & comments                                                   */
/* ------------------------------------------------------------------ */

export async function likePost(postId: string, userId: string): Promise<Result> {
  // upsert so a double tap that races the first request is not an error
  const { error } = await supabase.from('post_likes').upsert({ post_id: postId, user_id: userId }, { ignoreDuplicates: true });
  if (error) return failure('Gagal menyukai postingan.', error);
  return { data: undefined, error: null };
}

export async function unlikePost(postId: string, userId: string): Promise<Result> {
  const { error } = await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
  if (error) return failure('Gagal membatalkan suka.', error);
  return { data: undefined, error: null };
}

export async function addComment(
  postId: string,
  authorId: string,
  body: string,
  parentId: string | null = null,
): Promise<Result<Comment>> {
  const { data, error } = await supabase
    .from('post_comments')
    .insert({ post_id: postId, author_id: authorId, body: body.trim(), parent_id: parentId })
    .select()
    .single<Omit<Comment, 'like_count'>>();
  if (error) return failure(parentId ? 'Gagal mengirim balasan. Silakan coba lagi.' : 'Gagal mengirim komentar. Silakan coba lagi.', error);
  return { data: { ...data, like_count: 0 }, error: null };
}

export async function likeComment(commentId: string, userId: string): Promise<Result> {
  const { error } = await supabase.from('comment_likes').upsert({ comment_id: commentId, user_id: userId }, { ignoreDuplicates: true });
  if (error) return failure('Gagal menyukai komentar.', error);
  return { data: undefined, error: null };
}

export async function unlikeComment(commentId: string, userId: string): Promise<Result> {
  const { error } = await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', userId);
  if (error) return failure('Gagal membatalkan suka.', error);
  return { data: undefined, error: null };
}

export async function deleteComment(commentId: string): Promise<Result> {
  const { error } = await supabase.from('post_comments').delete().eq('id', commentId);
  if (error) return failure('Gagal menghapus komentar. Silakan coba lagi.', error);
  return { data: undefined, error: null };
}

async function removeImages(paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error && __DEV__) console.warn('[posts] image cleanup failed', error);
}
