// How complete a profile is, and what to fill in next.

import type { Profile } from '@/models/profile';

// In the order we nudge people to fill it in
const checklist: { label: string; done: (p: Profile) => boolean }[] = [
  { label: 'Tambahkan nama', done: (p) => !!p.full_name },
  { label: 'Pilih profesi', done: (p) => !!p.profession },
  { label: 'Pilih fokus', done: (p) => p.specializations.length > 0 },
  { label: 'Tulis bio', done: (p) => !!p.headline },
  { label: 'Tambahkan foto profil', done: (p) => !!p.avatar_url },
];

export function profileStrength(profile: Profile): { percent: number; next: string | null } {
  const done = checklist.filter((c) => c.done(profile)).length;
  return {
    percent: Math.round((done / checklist.length) * 100),
    next: checklist.find((c) => !c.done(profile))?.label ?? null,
  };
}
