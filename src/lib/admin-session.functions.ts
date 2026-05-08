import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getUserEmail, SUPER_ADMIN_EMAIL, supabaseAdmin, type Role } from "./admin.server";

export const getMyAdminRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const email = await getUserEmail(context.userId);
    const roles = (data ?? [])
      .map((r) => r.role as Role)
      .filter((role) => role !== "super_admin" || email === SUPER_ADMIN_EMAIL);
    return { roles, canClaimSuperAdmin: email === SUPER_ADMIN_EMAIL };
  });