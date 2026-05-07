
-- Click tracking per send
ALTER TABLE public.send_log
  ADD COLUMN IF NOT EXISTS click_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bounce_type text,
  ADD COLUMN IF NOT EXISTS bounce_reason text;

CREATE TABLE IF NOT EXISTS public.click_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  send_log_id uuid,
  campaign_id uuid,
  lead_id uuid,
  url text NOT NULL,
  user_agent text,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own clicks" ON public.click_events FOR SELECT USING (auth.uid() = user_id);

-- Reply categorization on conversations
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS ai_category text,
  ADD COLUMN IF NOT EXISTS ai_confidence numeric,
  ADD COLUMN IF NOT EXISTS ai_summary text;

-- Conditional steps
ALTER TABLE public.campaign_steps
  ADD COLUMN IF NOT EXISTS condition text NOT NULL DEFAULT 'always',
  ADD COLUMN IF NOT EXISTS skip_if_no_open boolean NOT NULL DEFAULT false;
-- condition: 'always' | 'if_opened' | 'if_not_opened' | 'if_clicked' | 'if_not_replied'

-- Inbound webhook secret per user (for forwarding services)
CREATE TABLE IF NOT EXISTS public.inbound_secrets (
  user_id uuid PRIMARY KEY,
  secret text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inbound_secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own inbound secret" ON public.inbound_secrets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own inbound secret" ON public.inbound_secrets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for matching inbound replies by message-id
CREATE INDEX IF NOT EXISTS idx_send_log_message_id ON public.send_log(message_id);
CREATE INDEX IF NOT EXISTS idx_send_log_to_email ON public.send_log(to_email);
