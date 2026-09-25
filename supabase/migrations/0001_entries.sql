-- Mood check-in entries.
-- Run this in the Supabase SQL editor (or `supabase db push` if the CLI is linked).
-- Assumes a `profiles` table keyed by auth.users.id already exists (it does, per src/api/profile.ts).

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mood text not null check (
    mood in ('happy', 'calm', 'sad', 'anxious', 'loved', 'tired', 'excited', 'angry')
  ),
  activities text[] not null default '{}',
  note text,
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists entries_user_date_idx on public.entries (user_id, entry_date desc, created_at desc);

alter table public.entries enable row level security;

drop policy if exists "Users can view own entries" on public.entries;
create policy "Users can view own entries" on public.entries
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own entries" on public.entries;
create policy "Users can insert own entries" on public.entries
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own entries" on public.entries;
create policy "Users can update own entries" on public.entries
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own entries" on public.entries;
create policy "Users can delete own entries" on public.entries
  for delete using (auth.uid() = user_id);
