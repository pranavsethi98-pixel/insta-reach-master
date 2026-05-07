
-- Reply Queue (HITL Live Feed)
CREATE TABLE public.reply_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  lead_id UUID,
  mailbox_id UUID,
  classification TEXT,
  draft_subject TEXT,
  draft_body TEXT,
  context_summary TEXT,
  confidence NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending', -- pending|approved|rejected|sent|edited
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'reply_agent', -- reply_agent|sales_agent
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reply_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reply queue" ON public.reply_queue FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE INDEX idx_reply_queue_user_status ON public.reply_queue(user_id, status);

-- AI Reply Agent settings (per mailbox or global on profile)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_reply_mode TEXT NOT NULL DEFAULT 'hitl'; -- hitl|autopilot|off
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_reply_monthly_cap INTEGER DEFAULT 500;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_reply_used_this_month INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_reply_trigger_labels TEXT[] DEFAULT ARRAY['interested','objection','meeting_booked']::TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_reply_skip_labels TEXT[] DEFAULT ARRAY['not_interested','unsubscribe']::TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slack_webhook_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS calendly_token TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS calendly_user_uri TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS calendly_event_uri TEXT;

-- Subsequences (branched followups)
CREATE TABLE public.subsequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  parent_campaign_id UUID NOT NULL,
  name TEXT NOT NULL,
  trigger_event TEXT NOT NULL, -- opened|clicked|replied|not_opened|not_replied
  trigger_after_days INTEGER NOT NULL DEFAULT 0,
  trigger_step INTEGER, -- which parent step triggers
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subsequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subseq" ON public.subsequences FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

CREATE TABLE public.subsequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subsequence_id UUID NOT NULL REFERENCES public.subsequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  delay_days INTEGER NOT NULL DEFAULT 1,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subsequence_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subseq steps" ON public.subsequence_steps FOR ALL USING (
  EXISTS(SELECT 1 FROM public.subsequences s WHERE s.id=subsequence_id AND s.user_id=auth.uid())
) WITH CHECK (
  EXISTS(SELECT 1 FROM public.subsequences s WHERE s.id=subsequence_id AND s.user_id=auth.uid())
);

CREATE TABLE public.subsequence_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subsequence_id UUID NOT NULL,
  lead_id UUID NOT NULL,
  user_id UUID NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  next_send_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subsequence_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subseq enroll" ON public.subsequence_enrollments FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- Granular warmup controls per mailbox
ALTER TABLE public.mailboxes ADD COLUMN IF NOT EXISTS warmup_open_rate NUMERIC DEFAULT 0.5;
ALTER TABLE public.mailboxes ADD COLUMN IF NOT EXISTS warmup_spam_protection_level TEXT DEFAULT 'medium'; -- low|medium|high
ALTER TABLE public.mailboxes ADD COLUMN IF NOT EXISTS warmup_randomize BOOLEAN DEFAULT true;
ALTER TABLE public.mailboxes ADD COLUMN IF NOT EXISTS warmup_slow_ramp BOOLEAN DEFAULT true;
ALTER TABLE public.mailboxes ADD COLUMN IF NOT EXISTS warmup_read_emulation BOOLEAN DEFAULT true;
ALTER TABLE public.mailboxes ADD COLUMN IF NOT EXISTS deliverability_score NUMERIC DEFAULT 100;
ALTER TABLE public.mailboxes ADD COLUMN IF NOT EXISTS deliverability_inbox_pct NUMERIC DEFAULT 100;
ALTER TABLE public.mailboxes ADD COLUMN IF NOT EXISTS deliverability_spam_pct NUMERIC DEFAULT 0;
ALTER TABLE public.mailboxes ADD COLUMN IF NOT EXISTS deliverability_checked_at TIMESTAMPTZ;

-- Meetings + No-show recovery
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lead_id UUID,
  conversation_id UUID,
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled|completed|no_show|rescheduled|cancelled
  calendly_event_uri TEXT,
  no_show_followups_sent INTEGER NOT NULL DEFAULT 0,
  next_followup_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own meetings" ON public.meetings FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- AI usage ledger
CREATE TABLE public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL, -- reply|sales|copilot
  credits INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own usage" ON public.ai_usage FOR SELECT USING (auth.uid()=user_id);
