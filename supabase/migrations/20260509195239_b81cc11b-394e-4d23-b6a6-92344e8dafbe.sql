REVOKE EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.workspace_role_for(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon;