-- Applied to the Creativo Supabase project on 2026-09-30.
-- Follows between users, and notifications created by the database whenever someone
-- likes or comments on your post, replies to or likes your comment, or follows you.

/* ------------------------------------------------------------------ */
/*  Follows                                                            */
/* ------------------------------------------------------------------ */

create table public.follows (
  follower_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_not_self check (follower_id <> following_id)
);

create index follows_following_idx on public.follows (following_id);

alter table public.follows enable row level security;

create policy "Signed-in users can read follows"
  on public.follows for select to authenticated
  using (true);

create policy "Users can follow as themselves"
  on public.follows for insert to authenticated
  with check ((select auth.uid()) = follower_id);

create policy "Users can unfollow as themselves"
  on public.follows for delete to authenticated
  using ((select auth.uid()) = follower_id);

/* ------------------------------------------------------------------ */
/*  Who a reply was really for                                         */
/* ------------------------------------------------------------------ */

-- Threads are flattened to one level, so remember whose comment was actually replied to
alter table public.post_comments
  add column reply_to_author_id uuid references public.profiles (id) on delete set null;

create or replace function public.post_comments_normalize_parent()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_post uuid;
  grandparent uuid;
  parent_author uuid;
begin
  if new.parent_id is null then
    new.reply_to_author_id := null;
    return new;
  end if;

  select c.post_id, c.parent_id, c.author_id into parent_post, grandparent, parent_author
  from public.post_comments c
  where c.id = new.parent_id;

  if parent_post is null or parent_post <> new.post_id then
    raise exception 'Reply must belong to a comment on the same post';
  end if;

  new.reply_to_author_id := parent_author;
  new.parent_id := coalesce(grandparent, new.parent_id);
  return new;
end;
$$;

/* ------------------------------------------------------------------ */
/*  Notifications                                                      */
/* ------------------------------------------------------------------ */

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.post_comments (id) on delete cascade,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint notifications_type_check
    check (type in ('like_post', 'comment', 'reply', 'like_comment', 'follow')),
  constraint notifications_not_self check (recipient_id <> actor_id)
);

create index notifications_recipient_created_idx on public.notifications (recipient_id, created_at desc);
create index notifications_actor_idx on public.notifications (actor_id);
create index notifications_post_idx on public.notifications (post_id);
create index notifications_comment_idx on public.notifications (comment_id);

alter table public.notifications enable row level security;

-- Only the triggers below create notifications; people can read, mark read and clear their own
create policy "Users can read their own notifications"
  on public.notifications for select to authenticated
  using ((select auth.uid()) = recipient_id);

create policy "Users can mark their own notifications read"
  on public.notifications for update to authenticated
  using ((select auth.uid()) = recipient_id)
  with check ((select auth.uid()) = recipient_id);

create policy "Users can clear their own notifications"
  on public.notifications for delete to authenticated
  using ((select auth.uid()) = recipient_id);

-- Inserts a notification unless someone is acting on their own content
create function public.notify(
  recipient uuid,
  actor uuid,
  kind text,
  post uuid default null,
  comment uuid default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.notifications (recipient_id, actor_id, type, post_id, comment_id)
  select recipient, actor, kind, post, comment
  where recipient is not null and recipient <> actor;
$$;

revoke execute on function public.notify(uuid, uuid, text, uuid, uuid) from public, anon, authenticated;

create function public.notify_on_post_like()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform public.notify((select author_id from public.posts where id = new.post_id), new.user_id, 'like_post', new.post_id);
    return new;
  end if;
  -- Unlike: take the notification back
  delete from public.notifications
  where type = 'like_post' and actor_id = old.user_id and post_id = old.post_id;
  return old;
end;
$$;

create function public.notify_on_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  post_author uuid := (select author_id from public.posts where id = new.post_id);
begin
  if new.reply_to_author_id is not null then
    perform public.notify(new.reply_to_author_id, new.author_id, 'reply', new.post_id, new.id);
  end if;
  -- The post's owner hears about every comment, unless they were just told about it as a reply
  if post_author is distinct from new.reply_to_author_id then
    perform public.notify(post_author, new.author_id, 'comment', new.post_id, new.id);
  end if;
  return new;
end;
$$;

create function public.notify_on_comment_like()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.post_comments;
begin
  if tg_op = 'INSERT' then
    select * into target from public.post_comments where id = new.comment_id;
    perform public.notify(target.author_id, new.user_id, 'like_comment', target.post_id, target.id);
    return new;
  end if;
  delete from public.notifications
  where type = 'like_comment' and actor_id = old.user_id and comment_id = old.comment_id;
  return old;
end;
$$;

create function public.notify_on_follow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform public.notify(new.following_id, new.follower_id, 'follow');
    return new;
  end if;
  delete from public.notifications
  where type = 'follow' and actor_id = old.follower_id and recipient_id = old.following_id;
  return old;
end;
$$;

revoke execute on function public.notify_on_post_like() from public, anon, authenticated;
revoke execute on function public.notify_on_comment() from public, anon, authenticated;
revoke execute on function public.notify_on_comment_like() from public, anon, authenticated;
revoke execute on function public.notify_on_follow() from public, anon, authenticated;

create trigger post_likes_notify
  after insert or delete on public.post_likes
  for each row execute function public.notify_on_post_like();

create trigger post_comments_notify
  after insert on public.post_comments
  for each row execute function public.notify_on_comment();

create trigger comment_likes_notify
  after insert or delete on public.comment_likes
  for each row execute function public.notify_on_comment_like();

create trigger follows_notify
  after insert or delete on public.follows
  for each row execute function public.notify_on_follow();

-- Push new notifications to the app as they happen (RLS still applies)
alter publication supabase_realtime add table public.notifications;
