-- Applied to the Creativo Supabase project on 2026-09-30.
-- Splits a profile into two tabs: "Karya" (portfolio work, the default tab) and "Post" (everyday updates).
-- Every post made before this is a "post"; new uploads choose their kind. Existing RLS on posts covers it.

alter table public.posts
  add column kind text not null default 'post',
  add constraint posts_kind check (kind in ('post', 'karya'));
