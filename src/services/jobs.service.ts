// Jobs service: remote job openings from the Himalayas public REST API.
//   GET https://himalayas.app/jobs/api/search?q=<keyword>&country=ID
// Free and needs no key. Himalayas asks apps to link back to each job and name them as the source,
// which the Lowongan screen does.

import { parseJobPage, type JobPage } from '@/models/job';
import { apiError, buildUrl, getJson, type ApiResult } from '@/services/http';

export const JOBS_SEARCH_URL = 'https://himalayas.app/jobs/api/search';

export interface JobQuery {
  /** Free-text search, e.g. "product designer"; empty lists every job */
  keyword: string;
  /** Only jobs open to candidates living in Indonesia (worldwide jobs included) */
  indonesiaOnly: boolean;
}

export const jobsUrl = ({ keyword, indonesiaOnly }: JobQuery): string =>
  buildUrl(JOBS_SEARCH_URL, { q: keyword.trim(), country: indonesiaOnly ? 'ID' : undefined, sort: 'relevant' });

/** The 20 most relevant openings for the query, plus how many there are in total. */
export async function searchJobs(query: JobQuery, signal?: AbortSignal): Promise<ApiResult<JobPage>> {
  const result = await getJson(jobsUrl(query), { signal });
  if (result.error) return result;

  const page = parseJobPage(result.data);
  if (!page) {
    if (__DEV__) console.warn('[jobs] unexpected response shape', result.data);
    return { data: null, error: apiError('invalid_json', 200) };
  }
  return { data: page, error: null };
}
