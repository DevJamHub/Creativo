-- Applied to the Creativo Supabase project on 2026-09-30.
-- Likes and comments on posts. Everyone signed in can see them; people only write their own.

create table public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index post_likes_user_idx on public.post_likes (user_id);

alter table public.post_likes enable row level security;

create policy "Signed-in users can read likes"
  on public.post_likes for select to authenticated
  using (true);

create policy "Users can like as themselves"
  on public.post_likes for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own like"
  on public.post_likes for delete to authenticated
  using ((select auth.uid()) = user_id);

create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint post_comments_body_length check (char_length(body) between 1 and 1000)
);

create index post_comments_post_created_idx on public.post_comments (post_id, created_at);
create index post_comments_author_idx on public.post_comments (author_id);

alter table public.post_comments enable row level security;

create policy "Signed-in users can read comments"
  on public.post_comments for select to authenticated
  using (true);

create policy "Users can comment as themselves"
  on public.post_comments for insert to authenticated
  with check ((select auth.uid()) = author_id);

-- The comment's author, or the owner of the post it is on, can remove it
create policy "Authors and post owners can delete comments"
  on public.post_comments for delete to authenticated
  using (
    (select auth.uid()) = author_id
    or exists (select 1 from public.posts p where p.id = post_id and p.author_id = (select auth.uid()))
  );
