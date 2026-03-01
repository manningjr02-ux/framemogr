-- profiles: user profile linked to auth.users
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can select own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- user_entitlements: subscription/billing, managed by webhooks or service role only
create table if not exists user_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive',
  current_period_end timestamptz,
  updated_at timestamptz not null default now(),
  constraint user_entitlements_status_check check (
    status in ('inactive', 'trialing', 'active', 'past_due', 'canceled')
  )
);

alter table user_entitlements enable row level security;

create policy "Users can select own entitlements"
  on user_entitlements for select
  using (auth.uid() = user_id);
