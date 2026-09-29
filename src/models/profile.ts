// Profile model: the signed-in user's own row, what they can edit, and other users' public card.
// Mirrors public.profiles and public.public_profiles() in supabase/migrations.

import type { ExperienceLevel } from '@/models/profession';

/** The signed-in user's own profile row (RLS: own row only, since it holds the email). */
export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  profession: string | null;
  specializations: string[];
  experience_level: ExperienceLevel | null;
  headline: string | null;
  /** "Terbuka untuk peluang": shown to recruiters, like LinkedIn's #OpenToWork */
  open_to_work: boolean;
  /** Set once the user finishes onboarding; null sends them (back) to onboarding */
  onboarded_at: string | null;
  created_at: string;
}

/** What the user can change on the Edit profil screen */
export type ProfileEdits = Pick<
  Profile,
  'full_name' | 'avatar_url' | 'profession' | 'specializations' | 'experience_level' | 'headline' | 'open_to_work'
>;

/** Answers collected by onboarding */
export interface OnboardingAnswers {
  profession: string;
  specializations: string[];
  experience_level: ExperienceLevel;
  headline: string | null;
}

/** Public columns of another user's profile — never the email. */
export interface PublicProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  profession: string | null;
  specializations: string[];
  experience_level: string | null;
  headline: string | null;
  open_to_work: boolean;
}
