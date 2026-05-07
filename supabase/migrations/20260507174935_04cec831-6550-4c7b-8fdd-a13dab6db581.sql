-- Subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  product_id text not null,
  price_id text not null,
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  environment text not null default 'sandbox',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_stripe_id on public.subscriptions(stripe_subscription_id);
alter table public.subscriptions enable row level security;
create policy "Users view own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Service role manages subscriptions" on public.subscriptions for all using (auth.role() = 'service_role');

-- Map our internal plans to Stripe price IDs
alter table public.plans add column if not exists stripe_price_id text;
update public.plans set stripe_price_id = 'starter_monthly' where name = 'Starter';
update public.plans set stripe_price_id = 'growth_monthly' where name = 'Growth';
update public.plans set stripe_price_id = 'hypergrowth_monthly' where name = 'Hypergrowth';

-- One-time credit top-ups: price_id -> credits granted
create table if not exists public.credit_topup_skus (
  price_id text primary key,
  credits integer not null,
  label text not null
);
insert into public.credit_topup_skus (price_id, credits, label) values
  ('credits_1k', 1000, '1,000 Credits'),
  ('credits_10k', 10000, '10,000 Credits')
on conflict (price_id) do nothing;

-- Track processed checkout sessions for idempotent credit grants
create table if not exists public.processed_checkout_sessions (
  session_id text primary key,
  user_id uuid not null,
  price_id text not null,
  credits_granted integer default 0,
  processed_at timestamptz default now()
);