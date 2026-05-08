
-- GHL sync settings (single row, key/value via existing platform_settings would also work,
-- but a dedicated table gives us typed toggles + future per-feature config).
CREATE TABLE IF NOT EXISTS public.ghl_sync_settings (
  id boolean PRIMARY KEY DEFAULT true,
  push_signups boolean NOT NULL DEFAULT true,
  push_leads boolean NOT NULL DEFAULT false,
  tag_replies boolean NOT NULL DEFAULT true,
  tag_plan_changes boolean NOT NULL DEFAULT true,
  log_email_activity boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = true)
);
INSERT INTO public.ghl_sync_settings (id) VALUES (true) ON CONFLICT DO NOTHING;

ALTER TABLE public.ghl_sync_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read sync settings" ON public.ghl_sync_settings
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "super manages sync settings" ON public.ghl_sync_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Map workspace users to GHL contact (separate from per-lead map).
CREATE TABLE IF NOT EXISTS public.ghl_user_map (
  user_id uuid PRIMARY KEY,
  ghl_contact_id text NOT NULL,
  ghl_location_id text NOT NULL,
  last_synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ghl_user_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read user map" ON public.ghl_user_map
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "self reads user map" ON public.ghl_user_map
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Per-workspace opt-out
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ghl_sync_excluded boolean NOT NULL DEFAULT false;
