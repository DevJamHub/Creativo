-- Applied to the Creativo Supabase project on 2026-09-28.
-- profiles.email mirrors auth.users.email. The own-row RLS policies let users write any column,
-- so a trigger overwrites whatever the client sends with the real auth email.
create function public.profiles_sync_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.email := (select u.email from auth.users u where u.id = new.id);
  return new;
end;
$$;

revoke execute on function public.profiles_sync_email() from public, anon, authenticated;

create trigger profiles_sync_email
  before insert or update on public.profiles
  for each row execute function public.profiles_sync_email();

-- Keep the mirror current when a user changes their email in Supabase Auth
create function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

revoke execute on function public.handle_user_email_change() from public, anon, authenticated;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();
