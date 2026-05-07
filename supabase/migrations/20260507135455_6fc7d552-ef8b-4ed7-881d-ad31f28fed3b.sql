DO $$ BEGIN
  CREATE TYPE public.workspace_role AS ENUM ('owner','admin','member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.workspace_members (
  workspace_id UUID NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.workspace_role NOT NULL DEFAULT 'member',
  invited_email TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.workspace_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.workspace_role NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24),'hex'),
  invited_by UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_workspace_member(_ws UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id=_ws AND user_id=_user);
$$;
REVOKE ALL ON FUNCTION public.is_workspace_member(UUID,UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(UUID,UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.workspace_role_for(_ws UUID, _user UUID)
RETURNS public.workspace_role LANGUAGE SQL STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT role FROM public.workspace_members WHERE workspace_id=_ws AND user_id=_user;
$$;
REVOKE ALL ON FUNCTION public.workspace_role_for(UUID,UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.workspace_role_for(UUID,UUID) TO authenticated;

DROP POLICY IF EXISTS "view own workspaces" ON public.workspaces;
CREATE POLICY "view own workspaces" ON public.workspaces FOR SELECT
  USING (public.is_workspace_member(id, auth.uid()) OR owner_id = auth.uid());
DROP POLICY IF EXISTS "create workspace" ON public.workspaces;
CREATE POLICY "create workspace" ON public.workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "owner updates ws" ON public.workspaces;
CREATE POLICY "owner updates ws" ON public.workspaces FOR UPDATE
  USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "owner deletes ws" ON public.workspaces;
CREATE POLICY "owner deletes ws" ON public.workspaces FOR DELETE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "view memberships" ON public.workspace_members;
CREATE POLICY "view memberships" ON public.workspace_members FOR SELECT
  USING (public.is_workspace_member(workspace_id, auth.uid()));
DROP POLICY IF EXISTS "self insert membership" ON public.workspace_members;
CREATE POLICY "self insert membership" ON public.workspace_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner manages members" ON public.workspace_members;
CREATE POLICY "owner manages members" ON public.workspace_members FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id=workspace_id AND w.owner_id=auth.uid()));

DROP POLICY IF EXISTS "view invites" ON public.workspace_invites;
CREATE POLICY "view invites" ON public.workspace_invites FOR SELECT
  USING (public.is_workspace_member(workspace_id, auth.uid()));
DROP POLICY IF EXISTS "admins create invites" ON public.workspace_invites;
CREATE POLICY "admins create invites" ON public.workspace_invites FOR INSERT
  WITH CHECK (public.workspace_role_for(workspace_id, auth.uid()) IN ('owner','admin'));
DROP POLICY IF EXISTS "admins delete invites" ON public.workspace_invites;
CREATE POLICY "admins delete invites" ON public.workspace_invites FOR DELETE
  USING (public.workspace_role_for(workspace_id, auth.uid()) IN ('owner','admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user_workspace()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE ws UUID;
BEGIN
  INSERT INTO public.workspaces (name, owner_id)
    VALUES (COALESCE(split_part(NEW.email,'@',1),'My Workspace'), NEW.id)
    RETURNING id INTO ws;
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (ws, NEW.id, 'owner');
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.handle_new_user_workspace() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS on_auth_user_created_ws ON auth.users;
CREATE TRIGGER on_auth_user_created_ws AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_workspace();

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS pipeline_stage TEXT NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS deal_value NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deal_currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_won BOOLEAN DEFAULT false,
  is_lost BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, key)
);
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own stages" ON public.pipeline_stages;
CREATE POLICY "own stages" ON public.pipeline_stages FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.seed_default_stages()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.pipeline_stages (user_id, key, label, color, sort_order, is_won, is_lost) VALUES
    (NEW.id, 'new', 'New', '#94a3b8', 0, false, false),
    (NEW.id, 'contacted', 'Contacted', '#3b82f6', 1, false, false),
    (NEW.id, 'replied', 'Replied', '#8b5cf6', 2, false, false),
    (NEW.id, 'meeting', 'Meeting Booked', '#f59e0b', 3, false, false),
    (NEW.id, 'won', 'Won', '#10b981', 4, true, false),
    (NEW.id, 'lost', 'Lost', '#ef4444', 5, false, true);
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.seed_default_stages() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS on_auth_user_seed_stages ON auth.users;
CREATE TRIGGER on_auth_user_seed_stages AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.seed_default_stages();

CREATE TABLE IF NOT EXISTS public.tracking_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  domain TEXT NOT NULL,
  cname_target TEXT NOT NULL DEFAULT 'track.outreachly.app',
  verified BOOLEAN DEFAULT false,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain)
);
ALTER TABLE public.tracking_domains ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own tracking domains" ON public.tracking_domains;
CREATE POLICY "own tracking domains" ON public.tracking_domains FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  result TEXT NOT NULL,
  reason TEXT,
  mx_found BOOLEAN,
  is_disposable BOOLEAN,
  is_role BOOLEAN,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, email)
);
CREATE INDEX IF NOT EXISTS ev_user_idx ON public.email_verifications(user_id);
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own verifications" ON public.email_verifications;
CREATE POLICY "own verifications" ON public.email_verifications FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);