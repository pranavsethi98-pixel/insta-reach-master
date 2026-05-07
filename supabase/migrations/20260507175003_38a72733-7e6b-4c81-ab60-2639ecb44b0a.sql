alter table public.credit_topup_skus enable row level security;
alter table public.processed_checkout_sessions enable row level security;
create policy "Anyone can read topup SKUs" on public.credit_topup_skus for select using (true);
create policy "Users view own checkout sessions" on public.processed_checkout_sessions for select using (auth.uid() = user_id);