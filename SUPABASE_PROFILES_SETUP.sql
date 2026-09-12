-- Profiles table for Divine Grace Upgrade
-- Run this in Supabase SQL Editor once.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  first_name text not null default '',
  other_names text not null default '',
  phone_number text,
  residential_address text,
  department_in_church text,
  department_in_school text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();

alter table public.profiles enable row level security;

-- Users can read only their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

-- Users can insert only their own profile row.
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

-- Users can update only their own profile row.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists idx_profiles_username on public.profiles(username);
