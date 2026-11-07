-- Admin panel setup. Run once in the Supabase SQL editor (after schema.sql).

-- Who is an admin. Rows are managed only here in SQL, never from the app.
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admins enable row level security;
create policy "read own admin row" on public.admins for select using (auth.uid() = user_id);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

-- Emails for the admin user list (auth.users is not readable from the browser).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "read own or admin" on public.profiles for select using (auth.uid() = id or public.is_admin());

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as
$$ begin insert into public.profiles (id, email) values (new.id, new.email) on conflict do nothing; return new; end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Backfill users who registered before this script.
insert into public.profiles (id, email) select id, email from auth.users on conflict do nothing;

-- Admins can read and delete any note (but not edit them).
create policy "admin read notes" on public.notes for select using (public.is_admin());
create policy "admin delete notes" on public.notes for delete using (public.is_admin());

-- Make yourself admin (replace the email, run after you have registered in the app):
-- insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
