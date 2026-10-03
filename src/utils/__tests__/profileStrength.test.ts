import type { Profile } from '@/models/profile';
import { profileStrength } from '@/utils/profileStrength';

const empty: Profile = {
  id: 'u1',
  full_name: null,
  email: 'nadia@creativo.id',
  avatar_url: null,
  profession: null,
  specializations: [],
  experience_level: null,
  headline: null,
  open_to_work: false,
  onboarded_at: null,
  created_at: '2026-09-26T00:00:00Z',
};

describe('profileStrength', () => {
  it('starts at 0% and asks for the name first', () => {
    expect(profileStrength(empty)).toEqual({ percent: 0, next: 'Tambahkan nama' });
  });

  it('suggests the next missing item in order', () => {
    const named = { ...empty, full_name: 'Nadia', profession: 'uiux' };
    expect(profileStrength(named)).toEqual({ percent: 40, next: 'Pilih fokus' });

    const withFocus = { ...named, specializations: ['Mobile UI'], headline: 'Product designer' };
    expect(profileStrength(withFocus)).toEqual({ percent: 80, next: 'Tambahkan foto profil' });
  });

  it('reaches 100% with nothing left to suggest', () => {
    const complete: Profile = {
      ...empty,
      full_name: 'Nadia',
      profession: 'uiux',
      specializations: ['Mobile UI'],
      headline: 'Product designer',
      avatar_url: 'https://example.com/nadia.png',
    };
    expect(profileStrength(complete)).toEqual({ percent: 100, next: null });
  });

  it('counts items independently of the order they were filled in', () => {
    expect(profileStrength({ ...empty, avatar_url: 'https://example.com/a.png' })).toEqual({
      percent: 20,
      next: 'Tambahkan nama',
    });
  });
});
