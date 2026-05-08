create table if not exists public.marketing_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'landing',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create index if not exists marketing_leads_email_idx on public.marketing_leads (email);
create index if not exists marketing_leads_created_at_idx on public.marketing_leads (created_at desc);

alter table public.marketing_leads enable row level security;

create policy "anyone can submit email"
  on public.marketing_leads for insert
  to anon, authenticated
  with check (true);

create policy "admins can view marketing leads"
  on public.marketing_leads for select
  to authenticated
  using (
    public.has_role(auth.uid(), 'super_admin')
    or public.has_role(auth.uid(), 'support_admin')
    or public.has_role(auth.uid(), 'read_only_admin')
  );