-- ============================================================
-- AI Slides — Supabase schema (aislides_ prefixed tables)
-- Paste into Supabase SQL Editor → New query and run
-- ============================================================

-- 1) Generation log (daily + monthly quota counts + history)
create table if not exists public.aislides_generations (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  result jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.aislides_generations
  add column if not exists email text;

create index if not exists aislides_generations_ip_created_idx
  on public.aislides_generations (ip_hash, created_at desc);

create index if not exists aislides_generations_email_created_idx
  on public.aislides_generations (email, created_at desc);

-- 2) User plan profile (Pro subscription status)
create table if not exists public.aislides_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',      -- 'free' | 'pro'
  waffo_customer_id text,
  waffo_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) RLS
alter table public.aislides_generations enable row level security;
alter table public.aislides_profiles    enable row level security;

-- aislides_generations: no direct client access (service_role bypasses RLS)

drop policy if exists "aislides_users_read_own_profile" on public.aislides_profiles;
create policy "aislides_users_read_own_profile"
  on public.aislides_profiles
  for select
  using (auth.uid() = user_id);

-- 4) Auto-create profile on signup
create or replace function public.aislides_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.aislides_profiles (user_id, plan)
  values (new.id, 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- ⚠️ Trigger on auth.users is global — skip if another app already owns this hook.
drop trigger if exists aislides_on_auth_user_created on auth.users;
create trigger aislides_on_auth_user_created
  after insert on auth.users
  for each row execute function public.aislides_handle_new_user();

-- 5) updated_at
create or replace function public.aislides_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists aislides_profiles_touch_updated_at on public.aislides_profiles;
create trigger aislides_profiles_touch_updated_at
  before update on public.aislides_profiles
  for each row execute function public.aislides_touch_updated_at();

-- 6) Data API grants
grant select, insert, update, delete on public.aislides_generations to service_role;
grant usage, select on sequence public.aislides_generations_id_seq to service_role;
grant select, insert, update, delete on public.aislides_profiles to service_role;
grant select on public.aislides_profiles to authenticated;

-- ============================================================
-- Done: aislides_generations + aislides_profiles
-- ============================================================
