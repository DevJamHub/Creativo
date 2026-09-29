-- Applied to the Creativo Supabase project on 2026-09-29.
-- Posts: the work professionals share to the feed (Instagram-style: images + caption).
-- Images live in the public "posts" storage bucket under <author_id>/<post-file>.

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  image_paths text[] not null,
  caption text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_image_count check (cardinality(image_paths) between 1 and 10),
  constraint posts_caption_length check (char_length(caption) <= 2200)
);

create index posts_author_created_idx on public.posts (author_id, created_at desc);
create index posts_created_idx on public.posts (created_at desc);

alter table public.posts enable row level security;

-- The feed is visible to everyone signed in; only the author can change or remove a post
create policy "Signed-in users can read posts"
  on public.posts for select to authenticated
  using (true);

create policy "Users can create their own posts"
  on public.posts for insert to authenticated
  with check ((select auth.uid()) = author_id);

create policy "Users can update their own posts"
  on public.posts for update to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

create policy "Users can delete their own posts"
  on public.posts for delete to authenticated
  using ((select auth.uid()) = author_id);

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- Public profile cards for the feed and the showcase. profiles RLS stays own-row only
-- (it holds the email), so this exposes just the public columns of onboarded users.
create function public.public_profiles(ids uuid[] default null)
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  profession text,
  specializations text[],
  experience_level text,
  headline text
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.full_name, p.avatar_url, p.profession, p.specializations, p.experience_level, p.headline
  from public.profiles p
  where p.onboarded_at is not null
    and (ids is null or p.id = any (ids))
  order by p.onboarded_at desc
  limit 200;
$$;

revoke execute on function public.public_profiles(uuid[]) from public, anon;
grant execute on function public.public_profiles(uuid[]) to authenticated;

-- Storage: public bucket so feed images load by URL; writes only into your own folder
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('posts', 'posts', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

create policy "Users can upload post images to their folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'posts' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can read their own post images"
  on storage.objects for select to authenticated
  using (bucket_id = 'posts' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can delete their own post images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'posts' and (storage.foldername(name))[1] = (select auth.uid())::text);
