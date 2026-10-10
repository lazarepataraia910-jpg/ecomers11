create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null default '',
  content text not null default '',
  tags text[] not null default '{}',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.notes enable row level security;
create policy "own notes select" on public.notes for select using (auth.uid() = user_id);
create policy "own notes insert" on public.notes for insert with check (auth.uid() = user_id);
create policy "own notes update" on public.notes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own notes delete" on public.notes for delete using (auth.uid() = user_id);
