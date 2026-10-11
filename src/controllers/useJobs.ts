// Job board state for the Lowongan screen. Every request goes REQUEST → LOADING → SUCCESS or ERROR.
// The reducer is pure so that flow can be tested on its own; the hook wires it to the API and
// makes sure only the newest request (latest filter, latest refresh) ever reaches the screen.

import { useCallback, useEffect, useReducer, useRef } from 'react';

import type { JobPage } from '@/models/job';
import type { ApiError } from '@/services/http';
import { searchJobs, type JobQuery } from '@/services/jobs.service';

export type JobsStatus = 'loading' | 'success' | 'error';

export interface JobsState {
  status: JobsStatus;
  /** Last page received for the current query; kept while refreshing and after a failed refresh */
  data: JobPage | null;
  error: ApiError | null;
  /** A refresh is running while the old list stays on screen */
  refreshing: boolean;
}

export type JobsAction =
  /** 'replace': new query, clear the list. 'refresh': pull to refresh / retry, keep the list. */
  | { type: 'request'; mode: 'replace' | 'refresh' }
  | { type: 'success'; page: JobPage }
  | { type: 'failure'; error: ApiError };

export const initialJobsState: JobsState = { status: 'loading', data: null, error: null, refreshing: false };

export function jobsReducer(state: JobsState, action: JobsAction): JobsState {
  switch (action.type) {
    case 'request':
      // With nothing on screen yet, a retry shows the loading state like a first request
      return action.mode === 'refresh' && state.data ? { ...state, refreshing: true } : initialJobsState;
    case 'success':
      return { status: 'success', data: action.page, error: null, refreshing: false };
    case 'failure':
      return { status: 'error', data: state.data, error: action.error, refreshing: false };
  }
}

export function useJobs({ keyword, indonesiaOnly }: JobQuery) {
  const [state, dispatch] = useReducer(jobsReducer, initialJobsState);
  const latest = useRef<AbortController | null>(null);

  const start = useCallback(
    (mode: 'replace' | 'refresh') => {
      latest.current?.abort();
      const controller = new AbortController();
      latest.current = controller;
      dispatch({ type: 'request', mode });

      searchJobs({ keyword, indonesiaOnly }, controller.signal).then((result) => {
        // A newer request (another filter, a refresh) or leaving the screen replaced this one
        if (controller.signal.aborted) return;
        dispatch(result.error ? { type: 'failure', error: result.error } : { type: 'success', page: result.data });
      });
      return controller;
    },
    [keyword, indonesiaOnly],
  );

  // Fetch again whenever the query changes
  useEffect(() => {
    const controller = start('replace');
    return () => controller.abort();
  }, [start]);

  /** Pull to refresh, the refresh button and "Coba lagi" */
  const reload = useCallback(() => {
    start('refresh');
  }, [start]);

  return { ...state, jobs: state.data?.jobs ?? [], total: state.data?.total ?? 0, reload };
}
