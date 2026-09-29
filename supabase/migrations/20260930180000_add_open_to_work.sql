-- Applied to the Creativo Supabase project on 2026-09-30.
-- "Terbuka untuk peluang" (like LinkedIn's #OpenToWork): lets recruiters find people ready to be hired.
-- Existing own-row RLS on profiles covers the new column; public_profiles() now returns it too.

alter table public.profiles
  add column open_to_work boolean not null default false;

-- The return type changes, so the function is recreated
drop function public.public_profiles(uuid[]);

create function public.public_profiles(ids uuid[] default null)
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  profession text,
  specializations text[],
  experience_level text,
  headline text,
  open_to_work boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.full_name, p.avatar_url, p.profession, p.specializations, p.experience_level, p.headline, p.open_to_work
  from public.profiles p
  where p.onboarded_at is not null
    and (ids is null or p.id = any (ids))
  order by p.onboarded_at desc
  limit 200;
$$;

revoke execute on function public.public_profiles(uuid[]) from public, anon;
grant execute on function public.public_profiles(uuid[]) to authenticated;
