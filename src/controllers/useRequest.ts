// State of one API request (Week 6 · API UI States): at any moment it is in exactly one state,
// and each state has its own screen.
//
//   idle ──run──▶ loading ──▶ success   data arrived          → show the data
//                         ├─▶ empty     200, but nothing in it → "Belum ada data"
//                         └─▶ error     4xx / 5xx / timeout / offline → message + "Coba Lagi"
//   error ──retry──▶ loading (attempt + 1, the screen says "Mencoba lagi…")
//
// The reducer is pure so the flow can be tested on its own; the hook wires it to a request and makes
// sure only the newest request reaches the screen.

import { useCallback, useEffect, useReducer, useRef } from 'react';

import type { ApiError, ApiResult } from '@/services/http';

export type RequestStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface RequestState<T> {
  status: RequestStatus;
  data: T | null;
  error: ApiError | null;
  /** 0 for the first request, then +1 for every retry */
  attempt: number;
}

export type RequestAction<T> =
  | { type: 'start'; retry: boolean }
  | { type: 'success'; data: T; empty: boolean }
  | { type: 'failure'; error: ApiError };

export const idleState: RequestState<never> = { status: 'idle', data: null, error: null, attempt: 0 };

export function requestReducer<T>(state: RequestState<T>, action: RequestAction<T>): RequestState<T> {
  switch (action.type) {
    case 'start':
      return { status: 'loading', data: null, error: null, attempt: action.retry ? state.attempt + 1 : 0 };
    case 'success':
      return { status: action.empty ? 'empty' : 'success', data: action.data, error: null, attempt: state.attempt };
    case 'failure':
      // A failed request never shows data
      return { status: 'error', data: null, error: action.error, attempt: state.attempt };
  }
}

const isEmptyList = (data: unknown) => Array.isArray(data) && data.length === 0;

interface UseRequestOptions<T> {
  /** Send the request as soon as the screen opens (default) */
  immediate?: boolean;
  isEmpty?: (data: T) => boolean;
}

export function useRequest<T>(
  send: (signal: AbortSignal) => Promise<ApiResult<T>>,
  { immediate = true, isEmpty = isEmptyList }: UseRequestOptions<T> = {},
) {
  const [state, dispatch] = useReducer(requestReducer<T>, idleState as RequestState<T>);
  const latest = useRef<AbortController | null>(null);
  const sendRef = useRef(send);
  const isEmptyRef = useRef(isEmpty);
  useEffect(() => {
    sendRef.current = send;
    isEmptyRef.current = isEmpty;
  });

  const start = useCallback(async (retry: boolean) => {
    latest.current?.abort();
    const controller = new AbortController();
    latest.current = controller;
    dispatch({ type: 'start', retry });
    const result = await sendRef.current(controller.signal);
    // Replaced by a newer request, or the screen was closed
    if (controller.signal.aborted) return;
    if (result.error) dispatch({ type: 'failure', error: result.error });
    else dispatch({ type: 'success', data: result.data, empty: isEmptyRef.current(result.data) });
  }, []);

  useEffect(() => {
    if (immediate) start(false);
    return () => latest.current?.abort();
  }, [immediate, start]);

  const run = useCallback(() => start(false), [start]);
  /** "Coba Lagi" */
  const retry = useCallback(() => start(true), [start]);

  return { ...state, run, retry, retrying: state.status === 'loading' && state.attempt > 0 };
}
