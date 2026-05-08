// Outbound EmailSend → GHL sync helpers (server-only).
// Used by signup/backfill, reply-agent hooks, and plan-change webhooks.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { ghl, getLocationId } from "./ghl.server";

type LogEntry = {
  user_id?: string | null;
  direction: "outbound" | "inbound" | "test";
  action: string;
  lead_id?: string | null;
  ghl_contact_id?: string | null;
  status: "ok" | "error";
  http_status?: number;
  error?: string;
  payload?: any;
};

async function log(entry: LogEntry) {
  try { await supabaseAdmin.from("ghl_sync_log").insert(entry as any); } catch {}
}

async function getSettings() {
  const { data } = await supabaseAdmin.from("ghl_sync_settings").select("*").maybeSingle();
  return data ?? {
    push_signups: true, push_leads: false, tag_replies: true,
    tag_plan_changes: true, log_email_activity: false,
  };
}

function isConfigured() {
  return !!process.env.GHL_PRIVATE_TOKEN && !!process.env.GHL_LOCATION_ID;
}

/** Push a single EmailSend user to GHL as a contact. Idempotent (upsert). */
export async function syncUserToGhl(userId: string): Promise<{ ok: boolean; contactId?: string; skipped?: string; error?: string }> {
  if (!isConfigured()) return { ok: false, skipped: "not_configured" };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, company_name, ghl_sync_excluded, created_at")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return { ok: false, error: "profile_not_found" };
  if ((profile as any).ghl_sync_excluded) return { ok: false, skipped: "opted_out" };
  if (!profile.email) return { ok: false, skipped: "no_email" };

  const [first, ...rest] = (profile.full_name ?? "").trim().split(/\s+/);

  const r = await ghl.upsertContact({
    email: profile.email,
    firstName: first || undefined,
    lastName: rest.join(" ") || undefined,
    companyName: (profile as any).company_name ?? undefined,
    tags: ["emailsend-user"],
    source: "EmailSend",
  });

  if (!r.ok) {
    await log({ user_id: userId, direction: "outbound", action: "user.upsert", status: "error", http_status: r.status, error: r.error, payload: r.data });
    return { ok: false, error: r.error };
  }
  const contactId = (r.data as any)?.contact?.id ?? (r.data as any)?.id;
  if (contactId) {
    await supabaseAdmin.from("ghl_user_map").upsert({
      user_id: userId,
      ghl_contact_id: contactId,
      ghl_location_id: getLocationId(),
      last_synced_at: new Date().toISOString(),
    } as any);
  }
  await log({ user_id: userId, direction: "outbound", action: "user.upsert", ghl_contact_id: contactId, status: "ok", http_status: r.status });
  return { ok: true, contactId };
}

/** Add tags + optional note to the user's GHL contact. No-op if user not yet mapped. */
export async function tagUserContact(userId: string, tags: string[], note?: string) {
  if (!isConfigured()) return { ok: false, skipped: "not_configured" };
  const { data: map } = await supabaseAdmin
    .from("ghl_user_map").select("ghl_contact_id").eq("user_id", userId).maybeSingle();
  let contactId = (map as any)?.ghl_contact_id;
  if (!contactId) {
    const synced = await syncUserToGhl(userId);
    if (!synced.ok || !synced.contactId) return synced;
    contactId = synced.contactId;
  }
  const r = await ghl.addTags(contactId, tags);
  await log({
    user_id: userId, direction: "outbound", action: `user.tag:${tags.join(",")}`,
    ghl_contact_id: contactId, status: r.ok ? "ok" : "error",
    http_status: r.status, error: r.error,
  });
  if (note) {
    const nr = await ghl.addNote(contactId, note);
    await log({
      user_id: userId, direction: "outbound", action: "user.note",
      ghl_contact_id: contactId, status: nr.ok ? "ok" : "error",
      http_status: nr.status, error: nr.error,
    });
  }
  return { ok: r.ok, contactId };
}

/** Tag the lead's GHL contact. Used on reply detection. Creates contact if missing. */
export async function tagLeadContact(opts: {
  userId: string; leadId: string; tags: string[]; note?: string;
}) {
  if (!isConfigured()) return { ok: false, skipped: "not_configured" };
  const { data: lead } = await supabaseAdmin
    .from("leads").select("*").eq("id", opts.leadId).maybeSingle();
  if (!lead) return { ok: false, error: "lead_not_found" };

  const { data: existing } = await supabaseAdmin
    .from("ghl_contact_map").select("ghl_contact_id")
    .eq("user_id", opts.userId).eq("lead_id", opts.leadId).maybeSingle();
  let contactId = (existing as any)?.ghl_contact_id;

  if (!contactId) {
    const r = await ghl.upsertContact({
      email: (lead as any).email ?? undefined,
      firstName: (lead as any).first_name ?? undefined,
      lastName: (lead as any).last_name ?? undefined,
      companyName: (lead as any).company ?? undefined,
      tags: ["lead", ...opts.tags],
      source: "EmailSend",
    });
    if (!r.ok) {
      await log({ user_id: opts.userId, direction: "outbound", action: "lead.upsert", lead_id: opts.leadId, status: "error", http_status: r.status, error: r.error });
      return { ok: false, error: r.error };
    }
    contactId = (r.data as any)?.contact?.id ?? (r.data as any)?.id;
    if (contactId) {
      await supabaseAdmin.from("ghl_contact_map").upsert({
        user_id: opts.userId, lead_id: opts.leadId,
        ghl_contact_id: contactId, ghl_location_id: getLocationId(),
        last_synced_at: new Date().toISOString(),
      } as any, { onConflict: "user_id,lead_id" });
    }
  } else {
    await ghl.addTags(contactId, opts.tags);
  }
  if (opts.note && contactId) await ghl.addNote(contactId, opts.note);
  await log({
    user_id: opts.userId, direction: "outbound", action: `lead.tag:${opts.tags.join(",")}`,
    lead_id: opts.leadId, ghl_contact_id: contactId, status: "ok",
  });
  return { ok: true, contactId };
}

export { getSettings as getGhlSyncSettings };
