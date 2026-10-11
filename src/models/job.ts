// Job model: remote job openings from the Himalayas public API (https://himalayas.app/api).
// parseJobPage turns the raw JSON into typed Job objects with Indonesian labels;
// entries missing a title, company or link are skipped rather than shown broken.

export interface Job {
  /** The job's unique URL on Himalayas (their `guid`) */
  id: string;
  title: string;
  company: string;
  companyLogo: string | null;
  /** First sentences of the description, as plain text */
  excerpt: string;
  /** e.g. "Penuh waktu", "Kontrak" */
  employmentType: string | null;
  /** e.g. ["Menengah", "Senior"] */
  seniority: string[];
  /** e.g. "USD 60 rb–90 rb / tahun"; null when the company didn't share it */
  salary: string | null;
  /** "Seluruh dunia" or the countries candidates must live in */
  location: string;
  /** ISO date */
  publishedAt: string;
  /** Where to read and apply. Himalayas asks apps to link back here. */
  url: string;
}

export interface JobPage {
  jobs: Job[];
  /** All matches on the server; this page holds at most 20 of them */
  total: number;
}

export const JOB_SOURCE = { name: 'Himalayas', url: 'https://himalayas.app/jobs' } as const;

/** What to search for each profession in models/profession. An empty keyword lists every job. */
const jobKeywords: Record<string, string> = {
  informatics: 'software engineer',
  uiux: 'product designer',
  graphic: 'graphic designer',
  architect: 'architectural designer',
  photographer: 'photographer',
  creator: 'content creator',
  data: 'data analyst',
  marketer: 'digital marketing',
  other: '',
};

export const jobKeyword = (professionId: string | null | undefined): string => jobKeywords[professionId ?? ''] ?? '';

const employmentTypes: Record<string, string> = {
  'Full Time': 'Penuh waktu',
  'Part Time': 'Paruh waktu',
  Contractor: 'Kontrak',
  Temporary: 'Sementara',
  Intern: 'Magang',
  Volunteer: 'Relawan',
  Other: 'Lainnya',
};

const seniorities: Record<string, string> = {
  'Entry-level': 'Pemula',
  'Mid-level': 'Menengah',
  Senior: 'Senior',
  Manager: 'Manajer',
  Director: 'Direktur',
  Executive: 'Eksekutif',
};

const salaryPeriods: Record<string, string> = {
  hourly: 'jam',
  weekly: 'minggu',
  fortnightly: '2 minggu',
  monthly: 'bulan',
  annual: 'tahun',
};

/* ------------------------------------------------------------------ */
/*  Formatting                                                         */
/* ------------------------------------------------------------------ */

/** 3492 → "3.492" (Indonesian thousands separator) */
export const formatCount = (n: number): string => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const oneDecimal = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');

/** 60000 → "60 rb", 1250000 → "1,3 jt" */
function compact(n: number): string {
  if (n >= 1_000_000) return `${oneDecimal(n / 1_000_000)} jt`;
  if (n >= 1_000) return `${oneDecimal(n / 1_000)} rb`;
  return String(Math.round(n));
}

export function formatSalary(min: unknown, max: unknown, currency: unknown, period: unknown): string | null {
  const amounts = [min, max].filter((n): n is number => typeof n === 'number' && n > 0);
  if (amounts.length === 0) return null;
  const range = amounts[0] === amounts[1] ? compact(amounts[0]) : amounts.map(compact).join('–');
  const unit = typeof currency === 'string' && currency ? `${currency} ` : '';
  const per = salaryPeriods[typeof period === 'string' ? period : 'annual'] ?? 'tahun';
  return `${unit}${range} / ${per}`;
}

export function formatLocation(countries: unknown): string {
  const list = Array.isArray(countries) ? countries.filter((c): c is string => typeof c === 'string' && c.length > 0) : [];
  if (list.length === 0) return 'Seluruh dunia';
  // Our users are in Indonesia, so name it first when a long list includes it
  list.sort((a, b) => Number(b === 'Indonesia') - Number(a === 'Indonesia'));
  if (list.length <= 2) return list.join(', ');
  return `${list.slice(0, 2).join(', ')} +${list.length - 2}`;
}

const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/** HTML → readable plain text (tags removed, common entities decoded, whitespace collapsed). */
export function plainText(html: string): string {
  return html
    .replace(/<\/(p|div|h\d|li)>|<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&([a-z]+);/gi, (match, name: string) => entities[name.toLowerCase()] ?? match)
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cuts long text at a word boundary, e.g. for a two-line card excerpt. */
export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max * 0.6)).trimEnd()}…`;
}

const EXCERPT_MAX = 220;

/* ------------------------------------------------------------------ */
/*  JSON → Job                                                         */
/* ------------------------------------------------------------------ */

type Raw = Record<string, unknown>;

const text = (value: unknown): string | null => (typeof value === 'string' && value.trim() ? value.trim() : null);
const isWebUrl = (value: string | null): value is string => !!value && /^https?:\/\//i.test(value);

/** One job from the API, or null if it lacks what a card needs. */
export function parseJob(raw: unknown): Job | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Raw;

  const title = text(r.title);
  const company = text(r.companyName);
  const url = [text(r.applicationLink), text(r.guid)].find(isWebUrl);
  if (!title || !company || !url) return null;

  const logo = text(r.companyLogo);
  const seconds = typeof r.pubDate === 'number' ? r.pubDate : null;
  const seniority = Array.isArray(r.seniority) ? r.seniority.filter((s): s is string => typeof s === 'string') : [];

  return {
    id: [text(r.guid), url].find(isWebUrl) ?? url,
    title: plainText(title),
    company: plainText(company),
    companyLogo: isWebUrl(logo) ? logo : null,
    // The API's own excerpt glues headings to the next sentence ("ABOUT THE ROLEWe are…"),
    // so build it from the HTML description, where block ends become spaces
    excerpt: truncate(plainText(text(r.description) ?? text(r.excerpt) ?? ''), EXCERPT_MAX),
    employmentType: employmentTypes[text(r.employmentType) ?? ''] ?? null,
    seniority: seniority.map((s) => seniorities[s] ?? s),
    salary: formatSalary(r.minSalary, r.maxSalary, r.currency, r.salaryPeriod),
    location: formatLocation(r.locationRestrictions),
    publishedAt: new Date(seconds !== null ? seconds * 1000 : Date.now()).toISOString(),
    url,
  };
}

/** The whole response, or null if it isn't the shape the API documents ({ jobs: [...] }). */
export function parseJobPage(json: unknown): JobPage | null {
  if (!json || typeof json !== 'object' || !Array.isArray((json as Raw).jobs)) return null;
  const { jobs: rawJobs, totalCount } = json as { jobs: unknown[]; totalCount?: unknown };

  const seen = new Set<string>();
  const jobs: Job[] = [];
  for (const raw of rawJobs) {
    const job = parseJob(raw);
    if (!job || seen.has(job.id)) continue; // a duplicate would break the list's keys
    seen.add(job.id);
    jobs.push(job);
  }

  const total = typeof totalCount === 'number' && totalCount >= jobs.length ? totalCount : jobs.length;
  return { jobs, total };
}
