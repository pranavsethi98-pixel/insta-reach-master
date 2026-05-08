import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { ghl, getLocationId } from "./ghl.server";

async function requireAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as string);
  if (!roles.some((r) => ["super_admin", "support_admin"].includes(r))) {
    throw new Error("Forbidden");
  }
}

async function log(entry: {
  user_id?: string | null;
  direction: "outbound" | "inbound" | "test";
  action: string;
  lead_id?: string | null;
  ghl_contact_id?: string | null;
  status: "ok" | "error";
  http_status?: number;
  error?: string;
  payload?: any;
}) {
  await supabaseAdmin.from("ghl_sync_log").insert(entry as any);
}

// ---------- connection status (admin) ----------
export const ghlStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const hasToken = !!process.env.GHL_PRIVATE_TOKEN;
    const hasLocation = !!process.env.GHL_LOCATION_ID;
    return {
      configured: hasToken && hasLocation,
      hasToken,
      hasLocation,
      locationId: process.env.GHL_LOCATION_ID ?? null,
    };
  });

// ---------- test connection (admin) ----------
export const ghlTestConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const r = await ghl.getLocation();
    await log({
      user_id: context.userId,
      direction: "test",
      action: "get_location",
      status: r.ok ? "ok" : "error",
      http_status: r.status,
      error: r.error,
      payload: r.ok ? { id: (r.data as any)?.location?.id ?? (r.data as any)?.id } : r.data,
    });
    if (!r.ok) throw new Error(`GHL ${r.status}: ${r.error ?? "unknown"}`);
    const loc = (r.data as any)?.location ?? r.data;
    return { ok: true, name: loc?.name ?? null, id: loc?.id ?? getLocationId() };
  });

// ---------- recent sync log (admin) ----------
export const ghlRecentLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("ghl_sync_log").select("*")
      .order("created_at", { ascending: false }).limit(50);
    return { rows: data ?? [] };
  });

// ---------- push a single lead (user-triggered) ----------
export const ghlPushLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ leadId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: lead, error } = await supabaseAdmin
      .from("leads").select("*").eq("id", data.leadId).maybeSingle();
    if (error || !lead) throw new Error("Lead not found");
    if ((lead as any).user_id !== context.userId) throw new Error("Forbidden");

    const r = await ghl.upsertContact({
      email: (lead as any).email ?? undefined,
      firstName: (lead as any).first_name ?? undefined,
      lastName: (lead as any).last_name ?? undefined,
      companyName: (lead as any).company ?? undefined,
      tags: ["emailsend"],
      source: "EmailSend",
    });

    if (!r.ok) {
      await log({
        user_id: context.userId, direction: "outbound", action: "upsert_contact",
        lead_id: data.leadId, status: "error", http_status: r.status, error: r.error, payload: r.data,
      });
      throw new Error(`GHL ${r.status}: ${r.error}`);
    }
    const contactId = (r.data as any)?.contact?.id ?? (r.data as any)?.id;
    await supabaseAdmin.from("ghl_contact_map").upsert({
      user_id: context.userId,
      lead_id: data.leadId,
      ghl_contact_id: contactId,
      ghl_location_id: getLocationId(),
      last_synced_at: new Date().toISOString(),
    } as any, { onConflict: "user_id,lead_id" });
    await log({
      user_id: context.userId, direction: "outbound", action: "upsert_contact",
      lead_id: data.leadId, ghl_contact_id: contactId, status: "ok", http_status: r.status,
    });
    return { ok: true, contactId };
  });
