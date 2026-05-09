GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.workspace_role_for(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon;