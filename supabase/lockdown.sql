-- Emergency lockdown. Run in Supabase → SQL Editor.
-- The site no longer uses Supabase, so nothing in this app breaks.
-- WARNING: if ANOTHER app uses this same Supabase project, its tables without
-- policies will stop working through the API until you add policies for them.

-- 1. Show what is exposed right now (read-only).
select tablename, rowsecurity as rls_on
from pg_tables where schemaname = 'public' order by rls_on, tablename;

select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and (qual = 'true' or with_check = 'true' or 'anon' = any(roles));

-- 2. Turn on Row Level Security for every table in the public schema.
--    A table with RLS on and no policies cannot be read or written with the anon key.
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' and not rowsecurity loop
    execute format('alter table public.%I enable row level security', r.tablename);
    raise notice 'RLS enabled on public.%', r.tablename;
  end loop;
end $$;

-- 3. Take direct table access away from the anon (not logged in) role.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;

-- 4. Check: every row here should say rls_on = true.
select tablename, rowsecurity as rls_on from pg_tables where schemaname = 'public' order by tablename;
