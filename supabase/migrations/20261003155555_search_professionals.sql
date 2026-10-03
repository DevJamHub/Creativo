-- NOT APPLIED YET: run this in the Creativo Supabase project before merging the PR for issue #20.
-- Beranda search across ALL professionals, page by page.
-- public_profiles() returns at most 200 profiles (newest first) and the app filtered those on the
-- phone, so once there were more than 200 users the older ones could never be found. This function
-- filters in the database and returns one page at a time, with the total number of matches.
-- Like public_profiles(): security definer, public columns only (never the email), signed-in users only.

create function public.search_professionals(
  q text default null,                     -- name, headline or specialization (case-insensitive)
  match_professions text[] default null,   -- profession ids whose label matches q (labels live in the app)
  field text default null,                 -- only this profession (the field chips on Beranda)
  open_only boolean default false,         -- only "Terbuka untuk peluang"
  page_size integer default 30,
  page_offset integer default 0
)
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  profession text,
  specializations text[],
  experience_level text,
  headline text,
  open_to_work boolean,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with search as (
    -- Escape LIKE wildcards so "%" or "_" typed by the user match literally
    select coalesce(trim(q), '') = '' as everyone,
           '%' || replace(replace(replace(coalesce(trim(q), ''), '\', '\\'), '%', '\%'), '_', '\_') || '%' as pattern
  )
  select p.id, p.full_name, p.avatar_url, p.profession, p.specializations, p.experience_level, p.headline,
         p.open_to_work, count(*) over () as total_count
  from public.profiles p
  cross join search s
  where p.onboarded_at is not null
    and (field is null or p.profession = field)
    and (not open_only or p.open_to_work)
    and (
      s.everyone
      or p.full_name ilike s.pattern
      or p.headline ilike s.pattern
      or p.profession = any (coalesce(match_professions, '{}'))
      or exists (select 1 from unnest(p.specializations) as spec where spec ilike s.pattern)
    )
  order by p.onboarded_at desc, p.id
  limit least(greatest(page_size, 1), 50)
  offset greatest(page_offset, 0);
$$;

revoke execute on function public.search_professionals(text, text[], text, boolean, integer, integer) from public, anon;
grant execute on function public.search_professionals(text, text[], text, boolean, integer, integer) to authenticated;
