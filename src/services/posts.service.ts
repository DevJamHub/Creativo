// Posts service: the work professionals share to the feed (photos + caption), likes and comments.
// Photos are uploaded first (POST /uploads, as base64), then the post is saved with their addresses
// (POST /posts). Every endpoint here is protected: api() adds the access token to each request.
// Errors come back as friendly Indonesian messages; details are only logged in development.

import { MAX_POST_IMAGES, type Comment, type LocalImage, type Post, type PostKind } from '@/models/post';
import type { PublicProfile } from '@/models/profile';
import { api, assetUrl, toResult, type Result } from '@/services/api';

/** Full address of a post photo ("/uploads/…" from the API, or a web address). */
export const imageUrl = assetUrl;

/* ------------------------------------------------------------------ */
/*  Reading                                                            */
/* ------------------------------------------------------------------ */

export async function fetchPosts(): Promise<Result<Post[]>> {
  return toResult(await api<{ posts: Post[] }>('/posts'), (data) => data.posts);
}

/** Ids of the posts you liked, to fill in the hearts. */
export async function fetchLikedPostIds(): Promise<Result<string[]>> {
  return toResult(await api<{ post_ids: string[] }>('/posts/liked'), (data) => data.post_ids);
}

/** All comments and replies of a post (oldest first), plus which of them you liked. */
export async function fetchComments(postId: string): Promise<Result<{ comments: Comment[]; likedIds: string[] }>> {
  const result = await api<{ comments: Comment[]; liked_ids: string[] }>(`/posts/${postId}/comments`);
  return toResult(result, (data) => ({ comments: data.comments, likedIds: data.liked_ids }));
}

export async function fetchPublicProfiles(): Promise<Result<PublicProfile[]>> {
  return toResult(await api<{ profiles: PublicProfile[] }>('/profiles'), (data) => data.profiles);
}

/* ------------------------------------------------------------------ */
/*  Writing                                                            */
/* ------------------------------------------------------------------ */

/** The photo as base64 text, read from its local file:// (native) or blob: (web) address. */
async function toBase64(image: LocalImage): Promise<string> {
  const blob = await (await fetch(image.uri)).blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^;]*;base64,/, ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

const mimeType = (image: LocalImage) => (image.mimeType === 'image/jpg' || !image.mimeType ? 'image/jpeg' : image.mimeType);

async function uploadImage(image: LocalImage): Promise<Result<string>> {
  let base64: string;
  try {
    base64 = await toBase64(image);
  } catch (err) {
    if (__DEV__) console.warn('[posts] reading photo failed', err);
    return { data: null, error: 'Foto tidak dapat dibaca. Pilih foto lain.' };
  }
  // Big photos take a while over Wi-Fi
  const result = await api<{ path: string }>('/uploads', {
    method: 'POST',
    body: { base64, mime_type: mimeType(image) },
    timeoutMs: 60_000,
  });
  return toResult(result, (data) => data.path);
}

export async function createPost(images: LocalImage[], caption: string, kind: PostKind): Promise<Result<Post>> {
  const paths: string[] = [];
  for (const image of images.slice(0, MAX_POST_IMAGES)) {
    const uploaded = await uploadImage(image);
    if (uploaded.error !== null) return uploaded;
    paths.push(uploaded.data);
  }
  const result = await api<{ post: Post }>('/posts', { method: 'POST', body: { image_paths: paths, caption: caption.trim(), kind } });
  return toResult(result, (data) => data.post);
}

/** Uploads a new profile photo and returns its address, to be saved with the profile. */
export function uploadAvatar(image: LocalImage): Promise<Result<string>> {
  return uploadImage(image);
}

/** Returns only the changed fields; the caller keeps the counts it already has. */
export async function updateCaption(postId: string, caption: string): Promise<Result<Pick<Post, 'caption' | 'updated_at'>>> {
  const result = await api<{ post: Post }>(`/posts/${postId}`, { method: 'PATCH', body: { caption: caption.trim() } });
  return toResult(result, ({ post }) => ({ caption: post.caption, updated_at: post.updated_at }));
}

export async function deletePost(postId: string): Promise<Result> {
  return toResult(await api(`/posts/${postId}`, { method: 'DELETE' }), () => undefined);
}

/* ------------------------------------------------------------------ */
/*  Likes & comments                                                   */
/* ------------------------------------------------------------------ */

export async function likePost(postId: string): Promise<Result> {
  return toResult(await api(`/posts/${postId}/like`, { method: 'POST' }), () => undefined);
}

export async function unlikePost(postId: string): Promise<Result> {
  return toResult(await api(`/posts/${postId}/like`, { method: 'DELETE' }), () => undefined);
}

export async function addComment(postId: string, body: string, parentId: string | null = null): Promise<Result<Comment>> {
  const result = await api<{ comment: Comment }>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: { body: body.trim(), parent_id: parentId },
  });
  return toResult(result, (data) => data.comment);
}

export async function likeComment(commentId: string): Promise<Result> {
  return toResult(await api(`/comments/${commentId}/like`, { method: 'POST' }), () => undefined);
}

export async function unlikeComment(commentId: string): Promise<Result> {
  return toResult(await api(`/comments/${commentId}/like`, { method: 'DELETE' }), () => undefined);
}

/** Deleting a top-level comment also deletes its replies. */
export async function deleteComment(commentId: string): Promise<Result> {
  return toResult(await api(`/comments/${commentId}`, { method: 'DELETE' }), () => undefined);
}
