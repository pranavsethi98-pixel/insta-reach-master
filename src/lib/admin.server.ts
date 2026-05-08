import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type Role = "super_admin" | "billing_admin" | "support_admin" | "read_only_admin";

export const SUPER_ADMIN_EMAIL = "pranav@insanex.io";
export const ALL: Role[] = ["super_admin", "billing_admin", "support_admin", "read_only_admin"];
export const WRITE_USER: Role[] = ["super_admin", "support_admin"];
export const WRITE_BILLING: Role[] = ["super_admin", "billing_admin"];
export const SUPER: Role[] = ["super_admin"];

export async function getUserEmail(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();
  return data?.email?.toLowerCase() ?? null;
}

export async function assertSuperAdminEmail(userId: string) {
  const email = await getUserEmail(userId);
  if (email !== SUPER_ADMIN_EMAIL) {
    throw new Error("Super admin is restricted to pranav@insanex.io");
  }
}

export async function requireRole(userId: string, allowed: Role[]): Promise<Role[]> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const email = await getUserEmail(userId);
  const roles = (data ?? [])
    .map((r) => r.role as Role)
    .filter((role) => role !== "super_admin" || email === SUPER_ADMIN_EMAIL);
  if (!roles.some((r) => allowed.includes(r))) {
    throw new Error("Forbidden: insufficient role");
  }
  return roles;
}

export async function audit(
  actor: string,
  action: string,
  target_type?: string,
  target_id?: string,
  metadata: Record<string, unknown> = {},
) {
  await supabaseAdmin.from("admin_audit_log").insert({
    actor_id: actor,
    action,
    target_type,
    target_id,
    metadata: metadata as any,
  });
}

export { supabaseAdmin };