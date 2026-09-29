-- Applied to the Creativo Supabase project on 2026-09-30.
-- Replies and likes on comments. Threads are one level deep like Instagram:
-- replying to a reply attaches to the top-level comment it belongs to.

alter table public.post_comments
  add column parent_id uuid references public.post_comments (id) on delete cascade;

create index post_comments_parent_idx on public.post_comments (parent_id);

-- Keep threads flat and on the same post, whatever the client sends
create function public.post_comments_normalize_parent()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_post uuid;
  grandparent uuid;
begin
  if new.parent_id is null then
    return new;
  end if;

  select c.post_id, c.parent_id into parent_post, grandparent
  from public.post_comments c
  where c.id = new.parent_id;

  if parent_post is null or parent_post <> new.post_id then
    raise exception 'Reply must belong to a comment on the same post';
  end if;

  new.parent_id := coalesce(grandparent, new.parent_id);
  return new;
end;
$$;

create trigger post_comments_normalize_parent
  before insert on public.post_comments
  for each row execute function public.post_comments_normalize_parent();

create table public.comment_likes (
  comment_id uuid not null references public.post_comments (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create index comment_likes_user_idx on public.comment_likes (user_id);

alter table public.comment_likes enable row level security;

create policy "Signed-in users can read comment likes"
  on public.comment_likes for select to authenticated
  using (true);

create policy "Users can like comments as themselves"
  on public.comment_likes for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own comment like"
  on public.comment_likes for delete to authenticated
  using ((select auth.uid()) = user_id);
