
-- ============ MAILBOX UPGRADES ============
ALTER TABLE public.mailboxes
  ADD COLUMN IF NOT EXISTS imap_host text,
  ADD COLUMN IF NOT EXISTS imap_port int DEFAULT 993,
  ADD COLUMN IF NOT EXISTS imap_secure boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS imap_username text,
  ADD COLUMN IF NOT EXISTS imap_password text,
  ADD COLUMN IF NOT EXISTS reply_to text,
  ADD COLUMN IF NOT EXISTS signature text,
  ADD COLUMN IF NOT EXISTS warmup_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS warmup_daily_target int DEFAULT 40,
  ADD COLUMN IF NOT EXISTS warmup_increment int DEFAULT 2,
  ADD COLUMN IF NOT EXISTS warmup_reply_rate numeric DEFAULT 0.4,
  ADD COLUMN IF NOT EXISTS warmup_started_at date,
  ADD COLUMN IF NOT EXISTS warmup_sent_today int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS health_score int DEFAULT 100,
  ADD COLUMN IF NOT EXISTS hourly_limit int DEFAULT 10,
  ADD COLUMN IF NOT EXISTS sent_this_hour int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hour_reset_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS ramp_up_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS ramp_start int DEFAULT 5,
  ADD COLUMN IF NOT EXISTS ramp_increment int DEFAULT 5,
  ADD COLUMN IF NOT EXISTS ramp_started_at date DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS last_imap_sync_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_imap_uid bigint DEFAULT 0;

-- ============ CAMPAIGN UPGRADES ============
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS track_opens boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS track_clicks boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS stop_on_reply boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS stop_on_click boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tracking_domain text,
  ADD COLUMN IF NOT EXISTS daily_send_limit int DEFAULT 500;

-- A/B variants on steps
ALTER TABLE public.campaign_steps
  ADD COLUMN IF NOT EXISTS variant_subjects jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS variant_bodies jsonb DEFAULT '[]'::jsonb;

-- ============ LEADS UPGRADES ============
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS list_id uuid,
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS icebreaker text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS linkedin text,
  ADD COLUMN IF NOT EXISTS phone text;

CREATE UNIQUE INDEX IF NOT EXISTS leads_user_email_unique ON public.leads(user_id, lower(email));

-- ============ LEAD LISTS ============
CREATE TABLE IF NOT EXISTS public.lead_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lead_lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own lists" ON public.lead_lists;
CREATE POLICY "own lists" ON public.lead_lists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ SUPPRESSION ============
CREATE TABLE IF NOT EXISTS public.suppressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  domain text,
  reason text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS suppressions_user_email_idx ON public.suppressions(user_id, lower(email));
CREATE INDEX IF NOT EXISTS suppressions_user_domain_idx ON public.suppressions(user_id, lower(domain));
ALTER TABLE public.suppressions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own suppressions" ON public.suppressions;
CREATE POLICY "own suppressions" ON public.suppressions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ EMAIL EVENTS (opens, clicks, bounces) ============
CREATE TABLE IF NOT EXISTS public.email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  send_log_id uuid,
  campaign_id uuid,
  lead_id uuid,
  mailbox_id uuid,
  event_type text NOT NULL, -- open, click, bounce, reply, unsubscribe
  metadata jsonb DEFAULT '{}'::jsonb,
  user_agent text,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS email_events_user_idx ON public.email_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS email_events_campaign_idx ON public.email_events(campaign_id, event_type);
CREATE INDEX IF NOT EXISTS email_events_send_idx ON public.email_events(send_log_id);
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own events" ON public.email_events;
CREATE POLICY "own events" ON public.email_events FOR SELECT USING (auth.uid() = user_id);

-- send_log additions for tracking
ALTER TABLE public.send_log
  ADD COLUMN IF NOT EXISTS message_id text,
  ADD COLUMN IF NOT EXISTS tracking_id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS replied_at timestamptz,
  ADD COLUMN IF NOT EXISTS bounced_at timestamptz,
  ADD COLUMN IF NOT EXISTS clicked_at timestamptz,
  ADD COLUMN IF NOT EXISTS variant_index int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS in_reply_to text;

CREATE INDEX IF NOT EXISTS send_log_tracking_idx ON public.send_log(tracking_id);
CREATE INDEX IF NOT EXISTS send_log_message_id_idx ON public.send_log(message_id);

-- ============ INBOX / CONVERSATIONS ============
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mailbox_id uuid NOT NULL,
  lead_id uuid,
  campaign_id uuid,
  subject text,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  unread_count int DEFAULT 0,
  status text NOT NULL DEFAULT 'open', -- open, archived
  classification text, -- interested, not_interested, ooo, neutral, unsubscribe
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS conv_user_idx ON public.conversations(user_id, last_message_at DESC);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own conv" ON public.conversations;
CREATE POLICY "own conv" ON public.conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  direction text NOT NULL, -- outbound, inbound
  from_email text NOT NULL,
  to_email text NOT NULL,
  subject text,
  body text,
  message_id text,
  in_reply_to text,
  imap_uid bigint,
  is_warmup boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS msg_conv_idx ON public.messages(conversation_id, created_at);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own msg" ON public.messages;
CREATE POLICY "own msg" ON public.messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ WARMUP ============
CREATE TABLE IF NOT EXISTS public.warmup_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  from_mailbox_id uuid NOT NULL,
  to_mailbox_id uuid NOT NULL,
  message_id text,
  action text NOT NULL, -- sent, replied, marked_important
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS warmup_log_idx ON public.warmup_log(user_id, created_at DESC);
ALTER TABLE public.warmup_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own warmup" ON public.warmup_log;
CREATE POLICY "own warmup" ON public.warmup_log FOR SELECT USING (auth.uid() = user_id);

-- ============ AB TEST RESULTS view helper not needed; events suffice ============

-- ============ CRON: warmup + IMAP sync ============
DO $$ BEGIN
  PERFORM cron.unschedule('warmup-tick');
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  PERFORM cron.unschedule('imap-sync');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'warmup-tick',
  '*/5 * * * *',
  $$ select net.http_post(
    url:='https://project--c1fb09cc-dc95-493b-92f3-507054f93627.lovable.app/api/public/warmup-tick',
    headers:='{"Content-Type":"application/json"}'::jsonb,
    body:='{}'::jsonb
  ); $$
);

SELECT cron.schedule(
  'imap-sync',
  '*/3 * * * *',
  $$ select net.http_post(
    url:='https://project--c1fb09cc-dc95-493b-92f3-507054f93627.lovable.app/api/public/imap-sync',
    headers:='{"Content-Type":"application/json"}'::jsonb,
    body:='{}'::jsonb
  ); $$
);
