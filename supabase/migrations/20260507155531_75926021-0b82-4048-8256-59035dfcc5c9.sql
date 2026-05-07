
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS calendar_link text;

CREATE TABLE IF NOT EXISTS public.webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  url text NOT NULL,
  secret text NOT NULL DEFAULT encode(extensions.gen_random_bytes(24),'hex'),
  events text[] NOT NULL DEFAULT ARRAY['reply','bounce','open','click','sent']::text[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_delivery_at timestamptz,
  last_status int
);
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own webhooks" ON public.webhooks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  webhook_id uuid NOT NULL,
  event text NOT NULL,
  status int,
  response text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own deliveries" ON public.webhook_deliveries FOR SELECT USING (auth.uid() = user_id);
