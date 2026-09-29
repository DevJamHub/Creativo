-- Applied to the Creativo Supabase project on 2026-09-30.
-- Direct messages between two users (the "Pesan" section of Teman). Only the two people in a
-- conversation can read it; the recipient can only mark messages read, never edit them.

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint messages_body_length check (char_length(body) between 1 and 2000),
  constraint messages_not_self check (sender_id <> recipient_id)
);

create index messages_pair_created_idx on public.messages (sender_id, recipient_id, created_at desc);
create index messages_recipient_created_idx on public.messages (recipient_id, created_at desc);

alter table public.messages enable row level security;

create policy "Participants can read their messages"
  on public.messages for select to authenticated
  using ((select auth.uid()) in (sender_id, recipient_id));

create policy "Users can send messages as themselves"
  on public.messages for insert to authenticated
  with check ((select auth.uid()) = sender_id);

create policy "Recipients can mark messages read"
  on public.messages for update to authenticated
  using ((select auth.uid()) = recipient_id)
  with check ((select auth.uid()) = recipient_id);

-- Updates may only touch read_at
revoke update on public.messages from authenticated;
grant update (read_at) on public.messages to authenticated;

-- One row per conversation: the other person, the latest message, and how many are unread.
-- security invoker, so the RLS above decides what is visible.
create function public.my_conversations()
returns table (
  other_id uuid,
  last_body text,
  last_at timestamptz,
  last_sender_id uuid,
  unread bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with mine as (
    select
      case when m.sender_id = (select auth.uid()) then m.recipient_id else m.sender_id end as other_id,
      m.body, m.created_at, m.sender_id, m.recipient_id, m.read_at
    from public.messages m
    where (select auth.uid()) in (m.sender_id, m.recipient_id)
  )
  select distinct on (mine.other_id)
    mine.other_id,
    mine.body,
    mine.created_at,
    mine.sender_id,
    (select count(*) from mine u
      where u.other_id = mine.other_id and u.recipient_id = (select auth.uid()) and u.read_at is null)
  from mine
  order by mine.other_id, mine.created_at desc;
$$;

revoke execute on function public.my_conversations() from public, anon;
grant execute on function public.my_conversations() to authenticated;

-- New messages reach the app live (RLS still applies)
alter publication supabase_realtime add table public.messages;
