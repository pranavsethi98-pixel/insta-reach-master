
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('super_admin','billing_admin','support_admin','read_only_admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  granted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id);
$$;

CREATE POLICY "view own roles" ON public.user_roles FOR SELECT USING (auth.uid()=user_id OR public.is_admin(auth.uid()));
CREATE POLICY "super manages roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- ============ ADMIN INVITES ============
CREATE TABLE public.admin_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role app_role NOT NULL,
  token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(24),'hex'),
  invited_by uuid NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super manages invites" ON public.admin_invites FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- ============ AUDIT LOG ============
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit" ON public.admin_audit_log FOR SELECT USING (public.is_admin(auth.uid()));

-- ============ PLANS / SUBSCRIPTIONS / CREDITS ============
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  price_cents integer NOT NULL DEFAULT 0,
  interval text NOT NULL DEFAULT 'month',
  monthly_credits integer NOT NULL DEFAULT 0,
  max_mailboxes integer,
  max_active_campaigns integer,
  features jsonb DEFAULT '{}'::jsonb,
  stripe_price_id text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all read plans" ON public.plans FOR SELECT USING (true);
CREATE POLICY "super manages plans" ON public.plans FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid REFERENCES public.plans(id),
  status text NOT NULL DEFAULT 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sub read" ON public.subscriptions FOR SELECT USING (auth.uid()=user_id OR public.is_admin(auth.uid()));
CREATE POLICY "billing manages sub" ON public.subscriptions FOR ALL
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'billing_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'billing_admin'));

CREATE TABLE public.credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  delta integer NOT NULL,
  reason text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own credits read" ON public.credit_ledger FOR SELECT USING (auth.uid()=user_id OR public.is_admin(auth.uid()));
CREATE POLICY "billing adjusts credits" ON public.credit_ledger FOR INSERT
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'billing_admin'));

CREATE TABLE public.credit_costs (
  action text PRIMARY KEY,
  cost numeric NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.credit_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all read costs" ON public.credit_costs FOR SELECT USING (true);
CREATE POLICY "super edits costs" ON public.credit_costs FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_pct integer,
  discount_cents integer,
  bonus_credits integer,
  max_redemptions integer,
  redemptions integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all read coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "billing manages coupons" ON public.coupons FOR ALL
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'billing_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'billing_admin'));

CREATE TABLE public.payments_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL,
  stripe_payment_intent_id text,
  stripe_invoice_id text,
  description text,
  refunded_cents integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own payments read" ON public.payments_history FOR SELECT USING (auth.uid()=user_id OR public.is_admin(auth.uid()));
CREATE POLICY "billing inserts payments" ON public.payments_history FOR INSERT
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'billing_admin'));

-- ============ USER OPS ============
CREATE TABLE public.user_flags (
  user_id uuid PRIMARY KEY,
  is_suspended boolean NOT NULL DEFAULT false,
  is_banned boolean NOT NULL DEFAULT false,
  reason text,
  flagged_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own/admin read flags" ON public.user_flags FOR SELECT USING (auth.uid()=user_id OR public.is_admin(auth.uid()));
CREATE POLICY "support manages flags" ON public.user_flags FOR ALL
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'support_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'support_admin'));

CREATE TABLE public.admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  author_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin reads notes" ON public.admin_notes FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "support writes notes" ON public.admin_notes FOR INSERT
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'support_admin'));

CREATE TABLE public.user_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tag text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, tag)
);
ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin tags" ON public.user_tags FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own/admin read login" ON public.login_history FOR SELECT USING (auth.uid()=user_id OR public.is_admin(auth.uid()));
CREATE POLICY "self insert login" ON public.login_history FOR INSERT WITH CHECK (auth.uid()=user_id);

-- ============ SUPPORT / ANNOUNCEMENTS ============
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text DEFAULT 'normal',
  assigned_to uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own/admin tickets" ON public.support_tickets FOR SELECT USING (auth.uid()=user_id OR public.is_admin(auth.uid()));
CREATE POLICY "user creates ticket" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid()=user_id);
CREATE POLICY "support edits tickets" ON public.support_tickets FOR UPDATE
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'support_admin'));

CREATE TABLE public.support_ticket_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  is_admin_reply boolean NOT NULL DEFAULT false,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_ticket_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ticket parties read replies" ON public.support_ticket_replies FOR SELECT USING (
  public.is_admin(auth.uid()) OR EXISTS(SELECT 1 FROM public.support_tickets t WHERE t.id=ticket_id AND t.user_id=auth.uid())
);
CREATE POLICY "ticket parties write replies" ON public.support_ticket_replies FOR INSERT WITH CHECK (
  public.is_admin(auth.uid()) OR EXISTS(SELECT 1 FROM public.support_tickets t WHERE t.id=ticket_id AND t.user_id=auth.uid())
);

CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience text NOT NULL DEFAULT 'all',
  segment jsonb DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all read active announcements" ON public.announcements FOR SELECT USING (is_active=true OR public.is_admin(auth.uid()));
CREATE POLICY "super manages announcements" ON public.announcements FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- ============ COMPLIANCE / ABUSE ============
CREATE TABLE public.global_blacklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('email','domain','ip')),
  value text NOT NULL,
  reason text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(kind, value)
);
ALTER TABLE public.global_blacklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin reads blacklist" ON public.global_blacklist FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "super manages blacklist" ON public.global_blacklist FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.abuse_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  campaign_id uuid,
  mailbox_id uuid,
  kind text NOT NULL,
  severity text NOT NULL DEFAULT 'low',
  detail text,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.abuse_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin reads abuse" ON public.abuse_flags FOR SELECT USING (public.is_admin(auth.uid()));

CREATE TABLE public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all read settings" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "super edits settings" ON public.platform_settings FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- ============ WARMUP NETWORK / IPs ============
CREATE TABLE public.warmup_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier text NOT NULL CHECK (tier IN ('basic','standard','premium')),
  name text NOT NULL,
  size integer NOT NULL DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.warmup_pools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin reads pools" ON public.warmup_pools FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "super manages pools" ON public.warmup_pools FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

ALTER TABLE public.mailboxes ADD COLUMN IF NOT EXISTS warmup_pool_id uuid REFERENCES public.warmup_pools(id);
ALTER TABLE public.mailboxes ADD COLUMN IF NOT EXISTS admin_suspended boolean NOT NULL DEFAULT false;

CREATE TABLE public.ip_reputation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text NOT NULL UNIQUE,
  score numeric NOT NULL DEFAULT 100,
  blacklists jsonb DEFAULT '[]'::jsonb,
  last_checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ip_reputation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin reads ip rep" ON public.ip_reputation FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "super edits ip rep" ON public.ip_reputation FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- ============ AI PROVIDERS ============
CREATE TABLE public.llm_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  byok_allowed boolean NOT NULL DEFAULT false,
  default_model text,
  monthly_token_cap bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.llm_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all read llm" ON public.llm_providers FOR SELECT USING (true);
CREATE POLICY "super manages llm" ON public.llm_providers FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- ============ TEMPLATE PUSHES ============
CREATE TABLE public.template_pushes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text,
  body text NOT NULL,
  category text,
  target_plan_codes text[] DEFAULT ARRAY[]::text[],
  pushed_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.template_pushes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all read pushes" ON public.template_pushes FOR SELECT USING (true);
CREATE POLICY "super pushes templates" ON public.template_pushes FOR ALL USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- ============ SEED DEFAULTS ============
INSERT INTO public.plans (code,name,price_cents,monthly_credits,max_mailboxes,max_active_campaigns,features) VALUES
  ('free','Free',0,100,2,1,'{"warmup":false,"ai_replies":false}'),
  ('starter','Starter',3700,2000,10,5,'{"warmup":true,"ai_replies":true}'),
  ('growth','Growth',9700,10000,50,20,'{"warmup":true,"ai_replies":true,"subsequences":true}'),
  ('hypergrowth','Hypergrowth',35800,60000,500,200,'{"warmup":true,"ai_replies":true,"subsequences":true,"visitor_id":true}')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.credit_costs (action,cost) VALUES
  ('email_send',0.1),('email_verify',0.25),('ai_reply',5),('ai_copilot',10),('visitor_resolve',1),('lead_enrich',1)
ON CONFLICT (action) DO NOTHING;

INSERT INTO public.warmup_pools (tier,name) VALUES
  ('basic','Basic Pool'),('standard','Standard Pool'),('premium','Premium Pool')
ON CONFLICT DO NOTHING;

INSERT INTO public.platform_settings (key,value) VALUES
  ('bounce_threshold_pct', '5'::jsonb),
  ('spam_threshold_pct', '0.3'::jsonb),
  ('auto_pause_on_threshold', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
