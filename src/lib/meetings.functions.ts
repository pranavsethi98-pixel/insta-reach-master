import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listMeetings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("meetings")
      .select("*, lead:leads(email, first_name, company)")
      .order("scheduled_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return { items: data ?? [] };
  });

export const markMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    id: z.string().uuid(),
    status: z.enum(["scheduled", "completed", "no_show", "rescheduled", "cancelled"]),
  }).parse(i))
  .handler(async ({ data, context }) => {
    const updates: any = { status: data.status };
    if (data.status === "no_show") {
      updates.next_followup_at = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1h
    }
    await context.supabase.from("meetings").update(updates).eq("id", data.id);
    return { ok: true };
  });

export const createMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    lead_id: z.string().uuid().optional(),
    conversation_id: z.string().uuid().optional(),
    scheduled_at: z.string(),
    calendly_event_uri: z.string().optional(),
  }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: m, error } = await supabase.from("meetings").insert({ ...data, user_id: userId }).select().single();
    if (error) throw error;
    return { id: m.id };
  });

/** Cron-callable: process pending no-show followups (1h, 24h, 48h cadence) */
export const processNoShowQueue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: due } = await supabase
      .from("meetings").select("*, lead:leads(email, first_name)")
      .eq("user_id", userId).eq("status", "no_show")
      .lte("next_followup_at", new Date().toISOString())
      .lt("no_show_followups_sent", 3);

    let sent = 0;
    for (const m of due ?? []) {
      // Enqueue a draft reply to the queue (uses existing Reply Agent flow)
      if (m.conversation_id) {
        await supabase.from("reply_queue").insert({
          user_id: userId,
          conversation_id: m.conversation_id,
          lead_id: m.lead_id,
          classification: "no_show",
          draft_subject: "Sorry we missed you",
          draft_body: `Hi ${m.lead?.first_name ?? "there"},\n\nLooks like we missed each other. Want to grab another time? Happy to work around your schedule.\n\nBest`,
          status: "pending",
          source: "reply_agent",
        });
      }
      const next = m.no_show_followups_sent === 0 ? 24 : 48;
      await supabase.from("meetings").update({
        no_show_followups_sent: m.no_show_followups_sent + 1,
        next_followup_at: new Date(Date.now() + next * 3600 * 1000).toISOString(),
      }).eq("id", m.id);
      sent++;
    }
    return { processed: sent };
  });
