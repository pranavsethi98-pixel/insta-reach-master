
-- Salesflows: dynamic behavior-based views
CREATE TABLE public.salesflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  -- JSON conditions: [{field:'opened_count',op:'gte',value:3,window_days:7}, ...]
  conditions JSONB NOT NULL DEFAULT '[]',
  -- Optional auto-actions: [{type:'add_to_campaign',campaign_id:'...'}, {type:'set_stage',stage:'replied'}, {type:'webhook'}]
  actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.salesflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own salesflows" ON public.salesflows FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Track salesflow execution to avoid re-acting on same lead
CREATE TABLE public.salesflow_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesflow_id UUID NOT NULL,
  lead_id UUID NOT NULL,
  user_id UUID NOT NULL,
  matched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(salesflow_id, lead_id)
);
ALTER TABLE public.salesflow_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sf matches" ON public.salesflow_matches FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AI Copilot briefs (prompt-to-campaign memory)
CREATE TABLE public.copilot_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  business_context TEXT,
  icp JSONB,
  result JSONB,
  campaign_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.copilot_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own briefs" ON public.copilot_briefs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Persistent business context for Copilot memory
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_context TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Goals (per-user monthly targets)
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  metric TEXT NOT NULL, -- meetings_booked, replies, revenue, sent
  target NUMERIC NOT NULL,
  period TEXT NOT NULL DEFAULT 'month', -- month, quarter
  starts_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own goals" ON public.goals FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Website visitor identification (pixel)
CREATE TABLE public.visitor_pixels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label TEXT NOT NULL DEFAULT 'My Website',
  pixel_key TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pixel_key)
);
ALTER TABLE public.visitor_pixels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pixels" ON public.visitor_pixels FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.visitor_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pixel_id UUID NOT NULL,
  url TEXT,
  referrer TEXT,
  ip TEXT,
  user_agent TEXT,
  visitor_email TEXT,
  visitor_company TEXT,
  visitor_country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own visitors" ON public.visitor_events FOR SELECT
  USING (auth.uid() = user_id);

-- Resource library (cold email templates / SOPs - seeded via UI)
CREATE TABLE public.resource_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL, -- 'template', 'sop', 'snippet'
  title TEXT NOT NULL,
  category TEXT,
  body TEXT NOT NULL,
  subject TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resource_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own library" ON public.resource_library FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tasks per lead
CREATE TABLE public.lead_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lead_id UUID NOT NULL,
  title TEXT NOT NULL,
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tasks" ON public.lead_tasks FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AI auto-reply settings
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_reply_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_reply_tone TEXT DEFAULT 'friendly';

-- Out-of-office reschedule (extend campaign_leads)
ALTER TABLE public.campaign_leads ADD COLUMN IF NOT EXISTS ooo_until TIMESTAMPTZ;
