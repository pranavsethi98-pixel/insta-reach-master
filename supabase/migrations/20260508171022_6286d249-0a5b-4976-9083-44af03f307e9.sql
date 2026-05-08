
CREATE TABLE public.ghl_contact_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL,
  ghl_contact_id TEXT NOT NULL,
  ghl_location_id TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lead_id),
  UNIQUE (user_id, ghl_contact_id)
);

CREATE TABLE public.ghl_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  direction TEXT NOT NULL CHECK (direction IN ('outbound','inbound','test')),
  action TEXT NOT NULL,
  lead_id UUID,
  ghl_contact_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('ok','error')),
  http_status INT,
  error TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ghl_sync_log_created ON public.ghl_sync_log (created_at DESC);
CREATE INDEX idx_ghl_sync_log_user ON public.ghl_sync_log (user_id, created_at DESC);
CREATE INDEX idx_ghl_contact_map_lead ON public.ghl_contact_map (lead_id);

ALTER TABLE public.ghl_contact_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghl_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own contact map"
  ON public.ghl_contact_map FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admins read sync log"
  ON public.ghl_sync_log FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));
