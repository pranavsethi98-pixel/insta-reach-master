
-- Storage bucket for lead magnet PDFs (public read so signed delivery email links work simply)
INSERT INTO storage.buckets (id, name, public) VALUES ('lead-magnets', 'lead-magnets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read lead magnets" ON storage.objects
  FOR SELECT USING (bucket_id = 'lead-magnets');

-- Catalog of lead magnets
CREATE TABLE public.lead_magnets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cover_image_url TEXT,
  file_url TEXT NOT NULL,
  file_size_kb INTEGER,
  page_count INTEGER,
  category TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_magnets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published lead magnets"
  ON public.lead_magnets FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage lead magnets"
  ON public.lead_magnets FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Track which magnet a lead opted in for
ALTER TABLE public.marketing_leads
  ADD COLUMN IF NOT EXISTS lead_magnet_slug TEXT,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_marketing_leads_magnet ON public.marketing_leads(lead_magnet_slug);
CREATE INDEX IF NOT EXISTS idx_lead_magnets_slug ON public.lead_magnets(slug);
