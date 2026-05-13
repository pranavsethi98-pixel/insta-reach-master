import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { tagLeadContact, getGhlSyncSettings } from "./ghl-sync.server";

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const LABELS = [
  "interested",
  "meeting_booked",
  "not_interested",
  "out_of_office",
  "referral",
  "objection",
  "unsubscribe",
  "other",
] as const;

async function callAi(messages: any[], json = false) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI not configured");
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}`);
  const j: any = await res.json();
  return j?.choices?.[0]?.message?.content ?? "";
}

/** Classify an inbound reply and draft a response. Enqueues to reply_queue (HITL) or sends (autopilot). */
export const processInboundReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ conversationId: z.string().uuid(), messageId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_reply_mode, ai_reply_monthly_cap, ai_reply_used_this_month, ai_reply_trigger_labels, ai_reply_skip_labels, calendar_link, ai_reply_tone, business_context, slack_webhook_url")
      .eq("id", userId)
      .single();

    if (!profile || profile.ai_reply_mode === "off") return { skipped: "off" };
    if ((profile.ai_reply_used_this_month ?? 0) >= (profile.ai_reply_monthly_cap ?? 500)) {
      return { skipped: "cap_reached" };
    }

    const { data: conv } = await supabase
      .from("conversations").select("*").eq("id", data.conversationId).eq("user_id", userId).single();
    const { data: lead } = conv?.lead_id
      ? await supabase.from("leads").select("*").eq("id", conv.lead_id).single()
      : { data: null };
    const { data: msgs } = await supabase
      .from("messages").select("*").eq("conversation_id", data.conversationId).order("created_at");
    const latest = msgs?.find((m) => m.id === data.messageId) ?? msgs?.[msgs.length - 1];
    if (!latest || latest.direction !== "inbound") return { skipped: "not_inbound" };

    // 1. Classify
    const cls = await callAi(
      [
        { role: "system", content: `Classify reply intent. Output JSON {label, confidence}. Labels: ${LABELS.join(", ")}.` },
        { role: "user", content: `Subject: ${latest.subject}\n\n${latest.body}` },
      ],
      true,
    );
    let classification = "other";
    let confidence = 0.5;
    try {
      const parsed = JSON.parse(cls);
      if (LABELS.includes(parsed.label)) classification = parsed.label;
      confidence = Number(parsed.confidence) || 0.5;
    } catch {}

    // Update conversation classification
    await supabase.from("conversations").update({ classification, ai_category: classification, ai_confidence: confidence }).eq("id", data.conversationId);

    // GHL: tag the lead's contact based on classification
    try {
      const ghlSettings = await getGhlSyncSettings();
      if (ghlSettings.tag_replies && conv?.lead_id) {
        const tagMap: Record<string, string[]> = {
          interested: ["replied", "positive"],
          meeting_booked: ["replied", "meeting-booked"],
          objection: ["replied", "objection"],
          referral: ["replied", "referral"],
          not_interested: ["replied", "not-interested"],
          unsubscribe: ["unsubscribed"],
          out_of_office: ["ooo"],
          other: ["replied"],
        };
        const tags = tagMap[classification] ?? ["replied"];
        const note = `Reply classified as "${classification}" (${Math.round(confidence * 100)}%):\n\n${(latest.body ?? "").slice(0, 500)}`;
        await tagLeadContact({ userId, leadId: conv.lead_id, tags, note });
      }
    } catch (e) { console.error("GHL tag on reply failed", e); }


    // OOO handling — only update campaign_leads tied to THIS conversation's campaign
    if (classification === "out_of_office") {
      const oooUntil = new Date(Date.now() + 7 * 86400000).toISOString();
      if (conv?.lead_id && conv?.campaign_id) {
        await supabase.from("campaign_leads")
          .update({ ooo_until: oooUntil, status: "ooo" })
          .eq("lead_id", conv.lead_id)
          .eq("campaign_id", conv.campaign_id);
      }
      return { classification, action: "scheduled_for_return" };
    }

    // Skip if label not in trigger list
    const triggers: string[] = profile.ai_reply_trigger_labels ?? [];
    const skips: string[] = profile.ai_reply_skip_labels ?? [];
    if (skips.includes(classification)) return { classification, skipped: "skip_label" };
    if (triggers.length && !triggers.includes(classification)) {
      return { classification, skipped: "not_in_triggers" };
    }

    // 2. Draft reply
    const tone = profile.ai_reply_tone || "friendly";
    const calLink = profile.calendar_link || "";
    const bizCtx = profile.business_context || "";

    const draft = await callAi([
      {
        role: "system",
        content: `You are a sales rep replying to a prospect. Tone: ${tone}. Business: ${bizCtx}. ${calLink ? `If they show interest or ask to book, include this calendar link naturally: ${calLink}` : ""} Handle objections directly. Keep it under 100 words. Output JSON {subject, body}.`,
      },
      { role: "user", content: `Reply intent: ${classification}\nTheir message:\n${latest.body}` },
    ], true);

    let draftSubject = latest.subject ? `Re: ${latest.subject.replace(/^Re:\s*/i, "")}` : "";
    let draftBody = "";
    try {
      const parsed = JSON.parse(draft);
      draftSubject = parsed.subject || draftSubject;
      draftBody = parsed.body || "";
    } catch {
      draftBody = draft;
    }

    // 3. Track usage
    await supabase.from("ai_usage").insert({
      user_id: userId, kind: "reply", credits: 5,
      metadata: { conversation_id: data.conversationId, classification },
    });
    await supabase.from("profiles")
      .update({ ai_reply_used_this_month: (profile.ai_reply_used_this_month ?? 0) + 1 })
      .eq("id", userId);

    // 4. Queue or autopilot
    const status = profile.ai_reply_mode === "autopilot" ? "approved" : "pending";
    const { data: queued } = await supabase.from("reply_queue").insert({
      user_id: userId,
      conversation_id: data.conversationId,
      lead_id: conv?.lead_id ?? null,
      mailbox_id: conv?.mailbox_id ?? null,
      classification,
      draft_subject: draftSubject,
      draft_body: draftBody,
      confidence,
      status,
      context_summary: latest.body?.slice(0, 200),
    }).select().single();

    // Slack escalation for objections / referrals — only to validated Slack webhook URLs
    const slackUrl = profile.slack_webhook_url ?? "";
    if (slackUrl.startsWith("https://hooks.slack.com/") && (classification === "objection" || classification === "referral")) {
      try {
        await fetch(slackUrl, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: `🚨 ${classification.toUpperCase()} from ${lead?.email ?? "lead"}\n> ${latest.body?.slice(0, 200)}` }),
        });
      } catch {}
    }

    return { classification, status, queueId: queued?.id };
  });

export const listReplyQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("reply_queue")
      .select("*, conversation:conversations(subject), lead:leads(email, first_name, company)")
      .eq("user_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return { items: data ?? [] };
  });

export const approveReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      subject: z.string().optional(),
      body: z.string().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const updates: any = { status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: userId };
    if (data.subject !== undefined) updates.draft_subject = data.subject;
    if (data.body !== undefined) updates.draft_body = data.body;
    // Ownership check — users can only approve their own queue items
    await supabase.from("reply_queue").update(updates).eq("id", data.id).eq("user_id", userId);
    return { ok: true };
  });

export const rejectReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Ownership check — users can only reject their own queue items
    await supabase.from("reply_queue")
      .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: userId })
      .eq("id", data.id)
      .eq("user_id", userId);
    return { ok: true };
  });
