-- ============================================================
-- Etsy Tag Tool — Supabase schema (v2, prefixed tables)
-- 在 Supabase 控制台 → SQL Editor → New query 里粘贴运行
--
-- 注意：表名带 tagtool_ 前缀，避免与项目里已有的表撞名
-- ============================================================

-- 1) 生成记录表（用于每日限额统计 + 历史）
create table if not exists public.tagtool_generations (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  user_id uuid references auth.users(id) on delete set null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

-- 限额查询走这个索引（ip_hash + 时间）
create index if not exists tagtool_generations_ip_created_idx
  on public.tagtool_generations (ip_hash, created_at desc);

-- 2) 用户计划表（Pro 订阅状态）
create table if not exists public.tagtool_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',      -- 'free' | 'pro'
  waffo_customer_id text,
  waffo_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) 开启行级安全（RLS）
alter table public.tagtool_generations enable row level security;
alter table public.tagtool_profiles    enable row level security;

-- tagtool_generations：普通用户不能直接读写（服务端 service_role 绕过 RLS）

-- tagtool_profiles：用户只能读自己的记录
drop policy if exists "tagtool_users_read_own_profile" on public.tagtool_profiles;
create policy "tagtool_users_read_own_profile"
  on public.tagtool_profiles
  for select
  using (auth.uid() = user_id);

-- 4) 新用户注册时自动建 profile
create or replace function public.tagtool_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.tagtool_profiles (user_id, plan)
  values (new.id, 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- ⚠️ 触发器挂在 auth.users 上是全局的：如果这个项目已有别的应用在用 auth，
-- 且已有 on_auth_user_created 触发器，请跳过下面两行，改为手动管理 profile。
drop trigger if exists tagtool_on_auth_user_created on auth.users;
create trigger tagtool_on_auth_user_created
  after insert on auth.users
  for each row execute function public.tagtool_handle_new_user();

-- 5) updated_at 自动更新
create or replace function public.tagtool_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tagtool_profiles_touch_updated_at on public.tagtool_profiles;
create trigger tagtool_profiles_touch_updated_at
  before update on public.tagtool_profiles
  for each row execute function public.tagtool_touch_updated_at();

-- 6) Data API 权限
-- 新项目不会自动把 public 表授给 service_role，不 GRANT 会 403：
-- permission denied for table tagtool_generations
grant select, insert, update, delete on public.tagtool_generations to service_role;
grant usage, select on sequence public.tagtool_generations_id_seq to service_role;
grant select, insert, update, delete on public.tagtool_profiles to service_role;
-- 登录用户只能读自己的 profile（配合上面的 RLS policy）
grant select on public.tagtool_profiles to authenticated;

-- ============================================================
-- 完成。表：tagtool_generations + tagtool_profiles
-- ============================================================
