// Local search engine over the mock repositories.
// Searching "React" finds people with the React skill AND projects built with React.

import { getCategory } from '@/data/categories';
import type { Professional, Project } from '@/types';

export type SearchField =
  | 'all'
  | 'profession'
  | 'skills'
  | 'services'
  | 'experience'
  | 'location'
  | 'organization'
  | 'project'
  | 'category';

export const searchFields: { key: SearchField; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'profession', label: 'Profession' },
  { key: 'skills', label: 'Skills' },
  { key: 'services', label: 'Services' },
  { key: 'experience', label: 'Experience' },
  { key: 'location', label: 'Location' },
  { key: 'organization', label: 'Organization' },
  { key: 'project', label: 'Project' },
  { key: 'category', label: 'Category' },
];

const has = (text: string | undefined, q: string) => !!text && text.toLowerCase().includes(q);

export interface PersonMatch {
  pro: Professional;
  reasons: string[]; // why this person matched, e.g. "Skill · React"
}

// Returns the list of reasons a professional matches, or [] if they don't
export function matchProfessional(pro: Professional, rawQuery: string, field: SearchField = 'all'): string[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return ['all'];
  const reasons: string[] = [];
  const want = (f: SearchField) => field === 'all' || field === f;

  if (want('profession') && (has(pro.profession, q) || pro.specializations.some((s) => has(s, q))))
    reasons.push(`Profession · ${pro.profession}`);
  if (field === 'all' && (has(pro.name, q) || has(pro.handle, q))) reasons.push('Name');
  if (want('skills')) pro.skills.filter((s) => has(s.name, q)).forEach((s) => reasons.push(`Skill · ${s.name}`));
  if (want('services')) pro.services.filter((s) => has(s.title, q) || has(s.description, q)).forEach((s) => reasons.push(`Service · ${s.title}`));
  if (want('experience'))
    pro.experience.filter((e) => has(e.position, q) || has(e.organization, q)).forEach((e) => reasons.push(`Experience · ${e.position}`));
  if (want('location') && has(pro.location, q)) reasons.push(`Location · ${pro.location}`);
  if (want('organization'))
    [...pro.organizations.map((o) => o.name), ...pro.experience.map((e) => e.organization)]
      .filter((name) => has(name, q))
      .forEach((name) => reasons.push(`Organization · ${name}`));
  if (want('project'))
    pro.projects.filter((p) => has(p.name, q) || has(p.description, q) || p.tools.some((t) => has(t, q))).forEach((p) => reasons.push(`Project · ${p.name}`));
  if (want('category') && has(getCategory(pro.categoryId).name, q)) reasons.push(`Category · ${getCategory(pro.categoryId).name}`);
  if (field === 'all' && reasons.length === 0 && (has(pro.headline, q) || has(pro.about, q))) reasons.push('About');

  return Array.from(new Set(reasons));
}

export function searchPeople(pros: Professional[], query: string, field: SearchField = 'all'): PersonMatch[] {
  return pros
    .map((pro) => ({ pro, reasons: matchProfessional(pro, query, field) }))
    .filter((m) => m.reasons.length > 0)
    .sort((a, b) => b.reasons.length - a.reasons.length);
}

export interface ProjectMatch {
  project: Project;
  owner: Professional;
}

export function searchProjects(pros: Professional[], query: string): ProjectMatch[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return pros.flatMap((owner) =>
    owner.projects
      .filter((p) => has(p.name, q) || has(p.description, q) || has(p.role, q) || p.tools.some((t) => has(t, q)))
      .map((project) => ({ project, owner })),
  );
}

export interface GroupMatch {
  name: string;
  people: Professional[];
}

// Group matching items by name, collecting who has them
function groupBy(pros: Professional[], pick: (p: Professional) => string[], query: string): GroupMatch[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const map = new Map<string, Professional[]>();
  pros.forEach((p) =>
    new Set(pick(p).filter((name) => has(name, q))).forEach((name) => map.set(name, [...(map.get(name) ?? []), p])),
  );
  return Array.from(map, ([name, people]) => ({ name, people })).sort((a, b) => b.people.length - a.people.length);
}

export const searchSkills = (pros: Professional[], q: string) => groupBy(pros, (p) => p.skills.map((s) => s.name), q);

export const searchProfessions = (pros: Professional[], q: string) =>
  groupBy(pros, (p) => [p.profession, ...p.specializations], q);

export const searchOrganizations = (pros: Professional[], q: string) =>
  groupBy(pros, (p) => [...p.organizations.map((o) => o.name), ...p.experience.map((e) => e.organization)], q);
