// Beranda search: the database finds matching professionals among ALL users (not only the newest 200
// the app keeps for the feed) and returns them 30 at a time. Typing waits a moment before searching,
// the previous results stay on screen until the new ones arrive, and an answer for an older search
// is dropped, so results never jump back.

import { useCallback, useEffect, useRef, useState } from 'react';

import type { PublicProfile } from '@/models/profile';
import * as postsApi from '@/services/posts.service';

export interface ProfessionalFilters {
  query: string;
  /** Profession id, or null for every field */
  field: string | null;
  openOnly: boolean;
}

/** `value`, but only after it has stopped changing for `delayMs` */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

interface Loaded {
  key: string;
  items: PublicProfile[];
  total: number;
  error: string | null;
}

const NO_RESULTS: PublicProfile[] = [];

/** The search box changed but the debounced text has not caught up yet */
const typing = (query: string, debounced: string) => query.trim() !== debounced;

export function useProfessionalSearch({ query, field, openOnly }: ProfessionalFilters) {
  const text = useDebouncedValue(query.trim(), 300);
  // One key per search; a new key means "start again from page 1"
  const key = JSON.stringify([text, field, openOnly]);

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reloads, setReloads] = useState(0);
  const latestKey = useRef(key);

  useEffect(() => {
    latestKey.current = key;
    let active = true;
    postsApi.searchProfessionals({ query: text, field, openOnly, page: 0 }).then((result) => {
      if (!active) return;
      setLoaded(
        result.error !== null
          ? { key, items: [], total: 0, error: result.error }
          : { key, items: result.data.items, total: result.data.total, error: null },
      );
    });
    return () => {
      active = false;
    };
  }, [key, text, field, openOnly, reloads]);

  /** First answer not there yet */
  const firstLoad = loaded === null;
  /** The filters changed and the new answer is on its way; `items` still shows the previous one */
  const searching = typing(query, text) || (loaded !== null && loaded.key !== key);
  const error = loaded?.key === key ? loaded.error : null;
  const items = loaded?.items ?? NO_RESULTS;
  const total = loaded?.total ?? 0;
  const hasMore = !searching && !error && items.length < total;

  /** Next page, when the list is scrolled to its end */
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const page = Math.ceil(items.length / postsApi.PROFESSIONALS_PAGE_SIZE);
    const result = await postsApi.searchProfessionals({ query: text, field, openOnly, page });
    setLoadingMore(false);
    if (result.error !== null || latestKey.current !== key) return; // failed, or the search changed meanwhile
    setLoaded((cur) => {
      if (!cur || cur.key !== key) return cur;
      // New people may have joined since page 1; skip anyone already in the list
      const seen = new Set(cur.items.map((p) => p.id));
      return { ...cur, items: [...cur.items, ...result.data.items.filter((p) => !seen.has(p.id))], total: result.data.total };
    });
  }, [hasMore, loadingMore, items.length, text, field, openOnly, key]);

  /** Search again from page 1 (pull to refresh) */
  const reload = useCallback(() => setReloads((n) => n + 1), []);

  return { items, total, firstLoad, searching, error, hasMore, loadingMore, loadMore, reload };
}
