// Social service: follows between users, and the notifications the API creates for you.
// All errors come back as friendly Indonesian messages; details are only logged in development.

import type { AppNotification } from '@/models/notification';
import { api, startPolling, toResult, type Result } from '@/services/api';

/* ------------------------------------------------------------------ */
/*  Follows                                                            */
/* ------------------------------------------------------------------ */

/** Who follows `userId` (followers) and who `userId` follows (following), newest first. */
export async function fetchConnections(userId: string): Promise<Result<{ followers: string[]; following: string[] }>> {
  return toResult(await api<{ followers: string[]; following: string[] }>(`/users/${userId}/connections`));
}

export async function follow(targetId: string): Promise<Result> {
  return toResult(await api(`/users/${targetId}/follow`, { method: 'POST' }), () => undefined);
}

export async function unfollow(targetId: string): Promise<Result> {
  return toResult(await api(`/users/${targetId}/follow`, { method: 'DELETE' }), () => undefined);
}

/* ------------------------------------------------------------------ */
/*  Notifications                                                      */
/* ------------------------------------------------------------------ */

export async function fetchNotifications(): Promise<Result<AppNotification[]>> {
  return toResult(await api<{ notifications: AppNotification[] }>('/notifications'), (data) => data.notifications);
}

export async function markAllNotificationsRead(): Promise<Result> {
  return toResult(await api('/notifications/read-all', { method: 'POST' }), () => undefined);
}

const NOTIFICATION_POLL_MS = 15_000;

/** Calls `onChange` whenever a notification arrives (or one is taken back). Returns a stop function. */
export function subscribeToNotifications(onChange: () => void): () => void {
  let last: string | null = null;
  return startPolling(async () => {
    const result = await api<{ latest_id: string | null; total: number }>('/notifications/status', { poll: true });
    if (result.error) return;
    const seen = `${result.data.latest_id}:${result.data.total}`;
    if (last !== null && seen !== last) onChange();
    last = seen;
  }, NOTIFICATION_POLL_MS);
}
