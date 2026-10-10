-- Quota + Waffo payment tables (run in Supabase SQL Editor)

create table if not exists public.tagtool_quotas (
  ip_hash text primary key,
  bonus_credits int not null default 0,
  bonus_claimed_at timestamptz,
  plan text not null default 'free',
  plan_expires_at timestamptz,
  email text,
  waffo_customer_id text,
  waffo_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tagtool_checkout_intents (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  plan text not null,
  created_at timestamptz not null default now(),
  consumed_at timestamptz
);

alter table public.tagtool_checkout_intents
  add column if not exists email text;

create index if not exists tagtool_checkout_intents_open_idx
  on public.tagtool_checkout_intents (plan, created_at)
  where consumed_at is null;

create index if not exists tagtool_checkout_intents_email_idx
  on public.tagtool_checkout_intents (email, created_at desc);

create table if not exists public.tagtool_webhook_events (
  event_id text primary key,
  created_at timestamptz not null default now()
);

alter table public.tagtool_quotas enable row level security;
alter table public.tagtool_checkout_intents enable row level security;
alter table public.tagtool_webhook_events enable row level security;

grant select, insert, update, delete on public.tagtool_quotas to service_role;
grant select, insert, update, delete on public.tagtool_checkout_intents to service_role;
grant usage, select on sequence public.tagtool_checkout_intents_id_seq to service_role;
grant select, insert, update, delete on public.tagtool_webhook_events to service_role;
