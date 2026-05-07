import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type Role = "super_admin" | "billing_admin" | "support_admin" | "read_only_admin";

async function requireRole(userId: string, allowed: Role[]): Promise<Role[]> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r) => r.role as Role);
  if (!roles.some((r) => allowed.includes(r))) {
    throw new Error("Forbidden: insufficient role");
  }
  return roles;
}

async function audit(
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

const ALL: Role[] = ["super_admin", "billing_admin", "support_admin", "read_only_admin"];
const WRITE_USER: Role[] = ["super_admin", "support_admin"];
const WRITE_BILLING: Role[] = ["super_admin", "billing_admin"];
const SUPER: Role[] = ["super_admin"];

// ---------- session ----------
export const getMyAdminRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    return { roles: (data ?? []).map((r) => r.role as Role) };
  });

// ---------- platform overview ----------
export const getPlatformOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context.userId, ALL);
    const [users, mailboxes, campaigns, sent, subs, tickets] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("mailboxes").select("id,health_score", { count: "exact" }),
      supabaseAdmin.from("campaigns").select("id,status", { count: "exact" }),
      supabaseAdmin.from("send_log").select("id", { count: "exact", head: true }).eq("status", "sent"),
      supabaseAdmin.from("subscriptions").select("plan_id,status"),
      supabaseAdmin.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
    ]);
    const activeCamp = (campaigns.data ?? []).filter((c) => c.status === "active").length;
    const lowHealth = (mailboxes.data ?? []).filter((m) => (m.health_score ?? 100) < 70).length;
    return {
      users: users.count ?? 0,
      mailboxes: mailboxes.count ?? 0,
      campaigns: campaigns.count ?? 0,
      activeCampaigns: activeCamp,
      lowHealthMailboxes: lowHealth,
      totalSent: sent.count ?? 0,
      activeSubs: (subs.data ?? []).filter((s) => s.status === "active").length,
      openTickets: tickets.count ?? 0,
    };
  });

// ---------- users ----------
export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { search?: string; limit?: number }) => d)
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, ALL);
    let q = supabaseAdmin
      .from("profiles")
      .select("id,email,full_name,company_name,created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 100);
    if (data.search) q = q.ilike("email", `%${data.search}%`);
    const { data: profiles, error } = await q;
    if (error) throw new Error(error.message);
    const ids = (profiles ?? []).map((p) => p.id);
    const [flags, tags, roles, subs] = await Promise.all([
      supabaseAdmin.from("user_flags").select("*").in("user_id", ids),
      supabaseAdmin.from("user_tags").select("*").in("user_id", ids),
      supabaseAdmin.from("user_roles").select("*").in("user_id", ids),
      supabaseAdmin.from("subscriptions").select("*,plans(name,code)").in("user_id", ids),
    ]);
    return (profiles ?? []).map((p) => ({
      ...p,
      flag: (flags.data ?? []).find((f) => f.user_id === p.id) ?? null,
      tags: (tags.data ?? []).filter((t) => t.user_id === p.id).map((t) => t.tag),
      roles: (roles.data ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
      subscription: (subs.data ?? []).find((s) => s.user_id === p.id) ?? null,
    }));
  });

export const getUserDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, ALL);
    const [profile, flag, tags, roles, sub, payments, ledger, mailboxes, campaigns, leads, notes, logins] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", data.userId).maybeSingle(),
      supabaseAdmin.from("user_flags").select("*").eq("user_id", data.userId).maybeSingle(),
      supabaseAdmin.from("user_tags").select("*").eq("user_id", data.userId),
      supabaseAdmin.from("user_roles").select("*").eq("user_id", data.userId),
      supabaseAdmin.from("subscriptions").select("*,plans(*)").eq("user_id", data.userId).maybeSingle(),
      supabaseAdmin.from("payments_history").select("*").eq("user_id", data.userId).order("created_at", { ascending: false }).limit(50),
      supabaseAdmin.from("credit_ledger").select("*").eq("user_id", data.userId).order("created_at", { ascending: false }).limit(100),
      supabaseAdmin.from("mailboxes").select("id,label,from_email,is_active,health_score,admin_suspended").eq("user_id", data.userId),
      supabaseAdmin.from("campaigns").select("id,name,status,created_at").eq("user_id", data.userId),
      supabaseAdmin.from("leads").select("id", { count: "exact", head: true }).eq("user_id", data.userId),
      supabaseAdmin.from("admin_notes").select("*").eq("user_id", data.userId).order("created_at", { ascending: false }),
      supabaseAdmin.from("login_history").select("*").eq("user_id", data.userId).order("created_at", { ascending: false }).limit(20),
    ]);
    const credits = (ledger.data ?? []).reduce((s, e) => s + (e.delta ?? 0), 0);
    return {
      profile: profile.data,
      flag: flag.data,
      tags: (tags.data ?? []).map((t) => t.tag),
      roles: (roles.data ?? []).map((r) => r.role),
      subscription: sub.data,
      payments: payments.data ?? [],
      ledger: ledger.data ?? [],
      credits,
      mailboxes: mailboxes.data ?? [],
      campaigns: campaigns.data ?? [],
      leadCount: leads.count ?? 0,
      notes: notes.data ?? [],
      logins: logins.data ?? [],
    };
  });

export const setUserFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; suspend?: boolean; ban?: boolean; reason?: string }) =>
    z.object({
      userId: z.string().uuid(),
      suspend: z.boolean().optional(),
      ban: z.boolean().optional(),
      reason: z.string().max(500).optional(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, WRITE_USER);
    const { error } = await supabaseAdmin.from("user_flags").upsert({
      user_id: data.userId,
      is_suspended: data.suspend ?? false,
      is_banned: data.ban ?? false,
      reason: data.reason ?? null,
      flagged_by: context.userId,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    await audit(context.userId, "user.flag", "user", data.userId, data);
    return { ok: true };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, SUPER);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    await audit(context.userId, "user.delete", "user", data.userId);
    return { ok: true };
  });

export const sendPasswordReset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string }) => z.object({ email: z.string().email() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, WRITE_USER);
    const { error } = await supabaseAdmin.auth.admin.generateLink({ type: "recovery", email: data.email });
    if (error) throw new Error(error.message);
    await audit(context.userId, "user.password_reset", "user", undefined, { email: data.email });
    return { ok: true };
  });

export const addUserNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; body: string }) =>
    z.object({ userId: z.string().uuid(), body: z.string().min(1).max(5000) }).parse(d))
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, [...WRITE_USER]);
    const { error } = await supabaseAdmin.from("admin_notes").insert({
      user_id: data.userId, author_id: context.userId, body: data.body,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const tagUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; tag: string; remove?: boolean }) =>
    z.object({ userId: z.string().uuid(), tag: z.string().min(1).max(50), remove: z.boolean().optional() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, ALL);
    if (data.remove) {
      await supabaseAdmin.from("user_tags").delete().eq("user_id", data.userId).eq("tag", data.tag);
    } else {
      await supabaseAdmin.from("user_tags").upsert({ user_id: data.userId, tag: data.tag });
    }
    return { ok: true };
  });

// ---------- roles & invites ----------
export const grantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: Role }) =>
    z.object({ userId: z.string().uuid(), role: z.enum(["super_admin","billing_admin","support_admin","read_only_admin"]) }).parse(d))
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, SUPER);
    const { error } = await supabaseAdmin.from("user_roles").upsert({
      user_id: data.userId, role: data.role, granted_by: context.userId,
    });
    if (error) throw new Error(error.message);
    await audit(context.userId, "role.grant", "user", data.userId, { role: data.role });
    return { ok: true };
  });

export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: Role }) =>
    z.object({ userId: z.string().uuid(), role: z.enum(["super_admin","billing_admin","support_admin","read_only_admin"]) }).parse(d))
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, SUPER);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).eq("role", data.role);
    await audit(context.userId, "role.revoke", "user", data.userId, { role: data.role });
    return { ok: true };
  });

export const inviteAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string; role: Role }) =>
    z.object({ email: z.string().email(), role: z.enum(["super_admin","billing_admin","support_admin","read_only_admin"]) }).parse(d))
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, SUPER);
    const { data: inv, error } = await supabaseAdmin
      .from("admin_invites")
      .insert({ email: data.email, role: data.role, invited_by: context.userId })
      .select("*").single();
    if (error) throw new Error(error.message);
    await audit(context.userId, "admin.invite", "email", data.email, { role: data.role });
    return inv;
  });

export const listAdminInvites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context.userId, SUPER);
    const { data } = await supabaseAdmin.from("admin_invites").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

export const acceptAdminInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { token: string }) => z.object({ token: z.string().min(8) }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: inv, error } = await supabaseAdmin
      .from("admin_invites").select("*").eq("token", data.token).is("accepted_at", null).maybeSingle();
    if (error || !inv) throw new Error("Invalid invite");
    const { data: user } = await supabaseAdmin.from("profiles").select("email").eq("id", context.userId).maybeSingle();
    if (!user || user.email?.toLowerCase() !== inv.email.toLowerCase()) {
      throw new Error("Invite is for a different email");
    }
    await supabaseAdmin.from("user_roles").upsert({ user_id: context.userId, role: inv.role, granted_by: inv.invited_by });
    await supabaseAdmin.from("admin_invites").update({ accepted_at: new Date().toISOString() }).eq("id", inv.id);
    return { ok: true, role: inv.role };
  });

// ---------- billing & credits ----------
export const listPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data } = await supabaseAdmin.from("plans").select("*").order("price_cents");
    return data ?? [];
  });

export const upsertPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => d)
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, SUPER);
    const { error } = await supabaseAdmin.from("plans").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const assignPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; planId: string }) => d)
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, WRITE_BILLING);
    await supabaseAdmin.from("subscriptions").upsert({
      user_id: data.userId, plan_id: data.planId, status: "active", updated_at: new Date().toISOString(),
    } as any);
    await audit(context.userId, "billing.assign_plan", "user", data.userId, { planId: data.planId });
    return { ok: true };
  });

export const adjustCredits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; delta: number; reason: string }) =>
    z.object({ userId: z.string().uuid(), delta: z.number().int(), reason: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, WRITE_BILLING);
    const { error } = await supabaseAdmin.from("credit_ledger").insert({
      user_id: data.userId, delta: data.delta, reason: data.reason, actor_id: context.userId,
    });
    if (error) throw new Error(error.message);
    await audit(context.userId, "credits.adjust", "user", data.userId, { delta: data.delta, reason: data.reason });
    return { ok: true };
  });

export const refundPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { paymentId: string; amountCents: number }) => d)
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, WRITE_BILLING);
    const { error } = await supabaseAdmin
      .from("payments_history")
      .update({ refunded_cents: data.amountCents, status: "refunded" })
      .eq("id", data.paymentId);
    if (error) throw new Error(error.message);
    await audit(context.userId, "billing.refund", "payment", data.paymentId, { amountCents: data.amountCents });
    return { ok: true };
  });

export const listCoupons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context.userId, ALL);
    const { data } = await supabaseAdmin.from("coupons").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

export const upsertCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => d)
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, WRITE_BILLING);
    const { error } = await supabaseAdmin.from("coupons").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setCreditCost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { action: string; cost: number }) => d)
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, SUPER);
    await supabaseAdmin.from("credit_costs").upsert({ action: data.action, cost: data.cost, updated_at: new Date().toISOString() });
    return { ok: true };
  });

export const listCreditCosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data } = await supabaseAdmin.from("credit_costs").select("*").order("action");
    return data ?? [];
  });

// ---------- mailboxes / deliverability ----------
export const listAllMailboxes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { lowHealthOnly?: boolean }) => d ?? {})
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, ALL);
    let q = supabaseAdmin.from("mailboxes")
      .select("id,user_id,label,from_email,is_active,health_score,deliverability_score,warmup_enabled,warmup_pool_id,admin_suspended,sent_today,daily_limit,created_at")
      .order("health_score");
    if (data?.lowHealthOnly) q = q.lt("health_score", 70);
    const { data: rows } = await q.limit(500);
    return rows ?? [];
  });

export const setMailboxAdminSuspended = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { mailboxId: string; suspend: boolean }) => d)
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, [...SUPER, "support_admin"]);
    await supabaseAdmin.from("mailboxes").update({ admin_suspended: data.suspend, is_active: !data.suspend }).eq("id", data.mailboxId);
    await audit(context.userId, "mailbox.suspend", "mailbox", data.mailboxId, { suspend: data.suspend });
    return { ok: true };
  });

export const moveMailboxToPool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { mailboxId: string; poolId: string }) => d)
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, SUPER);
    await supabaseAdmin.from("mailboxes").update({ warmup_pool_id: data.poolId }).eq("id", data.mailboxId);
    await audit(context.userId, "mailbox.pool_move", "mailbox", data.mailboxId, { poolId: data.poolId });
    return { ok: true };
  });

export const listWarmupPools = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context.userId, ALL);
    const { data: pools } = await supabaseAdmin.from("warmup_pools").select("*");
    const { data: counts } = await supabaseAdmin.from("mailboxes").select("warmup_pool_id");
    const map: Record<string, number> = {};
    (counts ?? []).forEach((m) => { if (m.warmup_pool_id) map[m.warmup_pool_id] = (map[m.warmup_pool_id] ?? 0) + 1; });
    return (pools ?? []).map((p) => ({ ...p, member_count: map[p.id] ?? 0 }));
  });

// ---------- campaigns ----------
export const listAllCampaigns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context.userId, ALL);
    const { data } = await supabaseAdmin
      .from("campaigns")
      .select("id,user_id,name,status,daily_send_limit,created_at")
      .order("created_at", { ascending: false }).limit(500);
    return data ?? [];
  });

export const setCampaignStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { campaignId: string; status: string }) => d)
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, [...SUPER, "support_admin"]);
    await supabaseAdmin.from("campaigns").update({ status: data.status }).eq("id", data.campaignId);
    await audit(context.userId, "campaign.set_status", "campaign", data.campaignId, { status: data.status });
    return { ok: true };
  });

// ---------- compliance / blacklist ----------
export const listBlacklist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context.userId, ALL);
    const { data } = await supabaseAdmin.from("global_blacklist").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

export const addBlacklist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { kind: "email" | "domain" | "ip"; value: string; reason?: string }) =>
    z.object({ kind: z.enum(["email","domain","ip"]), value: z.string().min(1).max(255), reason: z.string().max(500).optional() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, SUPER);
    const { error } = await supabaseAdmin.from("global_blacklist").insert({ ...data, created_by: context.userId });
    if (error) throw new Error(error.message);
    await audit(context.userId, "blacklist.add", data.kind, data.value);
    return { ok: true };
  });

export const removeBlacklist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, SUPER);
    await supabaseAdmin.from("global_blacklist").delete().eq("id", data.id);
    await audit(context.userId, "blacklist.remove", "blacklist", data.id);
    return { ok: true };
  });

export const listAbuseFlags = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context.userId, ALL);
    const { data } = await supabaseAdmin.from("abuse_flags").select("*").order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });

export const setPlatformSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { key: string; value: any }) => d)
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, SUPER);
    await supabaseAdmin.from("platform_settings").upsert({ key: data.key, value: data.value, updated_at: new Date().toISOString() });
    return { ok: true };
  });

export const listPlatformSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context.userId, ALL);
    const { data } = await supabaseAdmin.from("platform_settings").select("*");
    return data ?? [];
  });

// ---------- announcements ----------
export const listAnnouncements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context.userId, ALL);
    const { data } = await supabaseAdmin.from("announcements").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

export const upsertAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => d)
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, SUPER);
    const payload = { ...data, created_by: context.userId };
    const { error } = await supabaseAdmin.from("announcements").upsert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- support tickets ----------
export const listAllTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context.userId, ALL);
    const { data } = await supabaseAdmin.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });

export const replyTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ticketId: string; body: string; status?: string }) => d)
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, [...SUPER, "support_admin"]);
    await supabaseAdmin.from("support_ticket_replies").insert({
      ticket_id: data.ticketId, author_id: context.userId, is_admin_reply: true, body: data.body,
    });
    if (data.status) await supabaseAdmin.from("support_tickets").update({ status: data.status, updated_at: new Date().toISOString() }).eq("id", data.ticketId);
    return { ok: true };
  });

// ---------- LLM providers ----------
export const listLlmProviders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context.userId, ALL);
    const { data } = await supabaseAdmin.from("llm_providers").select("*");
    return data ?? [];
  });

export const upsertLlmProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => d)
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, SUPER);
    const { error } = await supabaseAdmin.from("llm_providers").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- template pushes ----------
export const pushTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { title: string; subject?: string; body: string; category?: string; planCodes?: string[] }) => d)
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, SUPER);
    // log the push
    const { data: push, error } = await supabaseAdmin.from("template_pushes").insert({
      title: data.title, subject: data.subject, body: data.body, category: data.category,
      target_plan_codes: data.planCodes ?? [], pushed_by: context.userId,
    }).select("*").single();
    if (error) throw new Error(error.message);

    // distribute into resource_library for matching users
    let users: string[] = [];
    if (!data.planCodes?.length) {
      const { data: rows } = await supabaseAdmin.from("profiles").select("id");
      users = (rows ?? []).map((r) => r.id);
    } else {
      const { data: rows } = await supabaseAdmin.from("subscriptions")
        .select("user_id,plans(code)").in("plans.code" as any, data.planCodes);
      users = (rows ?? []).map((r: any) => r.user_id);
    }
    if (users.length) {
      await supabaseAdmin.from("resource_library").insert(
        users.map((u) => ({
          user_id: u, kind: "template", title: data.title, subject: data.subject ?? null,
          body: data.body, category: data.category ?? "Pushed",
        })),
      );
    }
    await audit(context.userId, "template.push", "template", push.id, { users: users.length });
    return { ok: true, recipients: users.length };
  });

// ---------- analytics ----------
export const platformAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context.userId, ALL);
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const [sends, opens, replies, bounces, signups, subs, payments] = await Promise.all([
      supabaseAdmin.from("send_log").select("sent_at,status").gte("sent_at", since).limit(50000),
      supabaseAdmin.from("send_log").select("opened_at").not("opened_at", "is", null).gte("sent_at", since).limit(50000),
      supabaseAdmin.from("send_log").select("replied_at").not("replied_at", "is", null).gte("sent_at", since).limit(50000),
      supabaseAdmin.from("send_log").select("bounced_at").not("bounced_at", "is", null).gte("sent_at", since).limit(50000),
      supabaseAdmin.from("profiles").select("created_at").gte("created_at", since),
      supabaseAdmin.from("subscriptions").select("plan_id,status,plans(price_cents)"),
      supabaseAdmin.from("payments_history").select("amount_cents,refunded_cents,created_at,status").gte("created_at", since),
    ]);
    const mrr = (subs.data ?? []).filter((s: any) => s.status === "active")
      .reduce((sum: number, s: any) => sum + (s.plans?.price_cents ?? 0), 0);
    const revenue30d = (payments.data ?? []).filter(p => p.status === "succeeded")
      .reduce((s, p) => s + (p.amount_cents - (p.refunded_cents ?? 0)), 0);
    return {
      sends30d: sends.data?.length ?? 0,
      opens30d: opens.data?.length ?? 0,
      replies30d: replies.data?.length ?? 0,
      bounces30d: bounces.data?.length ?? 0,
      signups30d: signups.data?.length ?? 0,
      mrrCents: mrr,
      revenueCents30d: revenue30d,
    };
  });

// ---------- audit ----------
export const listAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireRole(context.userId, ALL);
    const { data } = await supabaseAdmin.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(300);
    return data ?? [];
  });

// ---------- impersonation (read-only "view as") ----------
export const viewAsUser = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireRole(context.userId, ALL);
    await audit(context.userId, "user.view_as", "user", data.userId);
    const [profile, mailboxes, campaigns, leads, conversations, sub, ledger] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", data.userId).maybeSingle(),
      supabaseAdmin.from("mailboxes").select("*").eq("user_id", data.userId),
      supabaseAdmin.from("campaigns").select("*").eq("user_id", data.userId),
      supabaseAdmin.from("leads").select("*").eq("user_id", data.userId).limit(100),
      supabaseAdmin.from("conversations").select("*").eq("user_id", data.userId).limit(100),
      supabaseAdmin.from("subscriptions").select("*,plans(*)").eq("user_id", data.userId).maybeSingle(),
      supabaseAdmin.from("credit_ledger").select("delta").eq("user_id", data.userId),
    ]);
    return {
      profile: profile.data, mailboxes: mailboxes.data ?? [], campaigns: campaigns.data ?? [],
      leads: leads.data ?? [], conversations: conversations.data ?? [], subscription: sub.data,
      credits: (ledger.data ?? []).reduce((s, e) => s + (e.delta ?? 0), 0),
    };
  });

// ---------- bootstrap first super admin ----------
export const claimFirstSuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count } = await supabaseAdmin
      .from("user_roles").select("id", { count: "exact", head: true }).eq("role", "super_admin");
    if ((count ?? 0) > 0) throw new Error("A super admin already exists");
    await supabaseAdmin.from("user_roles").insert({
      user_id: context.userId, role: "super_admin", granted_by: context.userId,
    });
    await audit(context.userId, "admin.bootstrap_super");
    return { ok: true };
  });
