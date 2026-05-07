
-- 1. Tighten is_admin: only super_admin and support_admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin'::app_role, 'support_admin'::app_role)
  );
$$;

-- 2. Workspace_members: only join via valid invite
DROP POLICY IF EXISTS "self insert membership" ON public.workspace_members;

CREATE POLICY "join via invite"
ON public.workspace_members
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.workspace_invites wi
    JOIN auth.users u ON lower(u.email) = lower(wi.email)
    WHERE wi.workspace_id = workspace_members.workspace_id
      AND u.id = auth.uid()
      AND wi.accepted_at IS NULL
  )
);

-- Allow workspace owners/admins to add members directly (e.g. seeding the owner row)
CREATE POLICY "owner adds members"
ON public.workspace_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = workspace_members.workspace_id
      AND w.owner_id = auth.uid()
  )
);

-- 3. template_pushes: require auth (replace permissive read)
DROP POLICY IF EXISTS "all read pushes" ON public.template_pushes;
CREATE POLICY "auth read pushes"
ON public.template_pushes
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 4. Prevent two super_admins via race
CREATE UNIQUE INDEX IF NOT EXISTS only_one_super_admin
ON public.user_roles ((1))
WHERE role = 'super_admin'::app_role;

-- 5. Revoke public EXECUTE on internal definer functions
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.workspace_role_for(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_workspace() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_default_stages() FROM PUBLIC, anon, authenticated;
