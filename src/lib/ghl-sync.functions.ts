import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { syncUserToGhl, getGhlSyncSettings } from "./ghl-sync.server";

async function requireAdmin(userId: string) {
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as string);
  if (!roles.some((r) => ["super_admin", "support_admin"].includes(r))) throw new Error("Forbidden");
}
async function requireSuper(userId: string) {
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  if (!(data ?? []).some((r) => (r.role as string) === "super_admin")) throw new Error("Forbidden");
}

// Self-trigger on first dashboard load — pushes the signed-in user once.
export const ensureSelfSyncedToGhl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const settings = await getGhlSyncSettings();
    if (!settings.push_signups) return { skipped: "disabled" };
    const { data: existing } = await supabaseAdmin
      .from("ghl_user_map").select("ghl_contact_id").eq("user_id", context.userId).maybeSingle();
    if (existing) return { skipped: "already_synced" };
    return await syncUserToGhl(context.userId);
  });

// ----- admin: settings -----
export const getGhlSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    return await getGhlSyncSettings();
  });

export const updateGhlSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    push_signups: z.boolean().optional(),
    push_leads: z.boolean().optional(),
    tag_replies: z.boolean().optional(),
    tag_plan_changes: z.boolean().optional(),
    log_email_activity: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await requireSuper(context.userId);
    // ghl_sync_settings is a singleton table — update without filtering by id
    // (using .limit(1) to be safe; the table always has exactly one row)
    await supabaseAdmin.from("ghl_sync_settings")
      .update({ ...data, updated_at: new Date().toISOString() })
      .not("id", "is", null);
    return { ok: true };
  });

// ----- admin: backfill all users -----
export const backfillUsersToGhl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ limit: z.number().min(1).max(500).default(100) }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { data: profiles } = await supabaseAdmin
      .from("profiles").select("id, email, ghl_sync_excluded").not("email", "is", null).limit(1000);
    const { data: mapped } = await supabaseAdmin.from("ghl_user_map").select("user_id");
    const mappedSet = new Set((mapped ?? []).map((r) => r.user_id));
    const queue = (profiles ?? [])
      .filter((p: any) => !p.ghl_sync_excluded && !mappedSet.has(p.id))
      .slice(0, data.limit);

    let ok = 0, fail = 0, skipped = 0;
    for (const p of queue) {
      const r = await syncUserToGhl(p.id);
      if (r.ok) ok++;
      else if (r.skipped) skipped++;
      else fail++;
      // GHL rate limit ~100 req/10s — gentle pacing
      await new Promise((res) => setTimeout(res, 110));
    }
    return { processed: queue.length, ok, fail, skipped, remaining: Math.max(0, ((profiles ?? []).filter((p: any) => !p.ghl_sync_excluded && !mappedSet.has(p.id)).length) - queue.length) };
  });

// ----- per-user opt-out toggle -----
export const setUserGhlExcluded = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), excluded: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    await supabaseAdmin.from("profiles")
      .update({ ghl_sync_excluded: data.excluded } as any)
      .eq("id", data.userId);
    return { ok: true };
  });
