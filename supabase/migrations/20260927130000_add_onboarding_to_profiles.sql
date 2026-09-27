-- Applied to the Creativo Supabase project on 2026-09-27.
-- Onboarding answers: what the user does, so the dashboard can be tailored to their profession.
-- Existing RLS policies on profiles (own row only) cover these columns.
alter table public.profiles
  add column profession text,
  add column specializations text[] not null default '{}',
  add column experience_level text,
  add column headline text,
  add column onboarded_at timestamptz;

alter table public.profiles
  add constraint profiles_headline_length check (char_length(headline) <= 120),
  add constraint profiles_experience_level_check
    check (experience_level in ('student', 'junior', 'mid', 'senior', 'lead'));
