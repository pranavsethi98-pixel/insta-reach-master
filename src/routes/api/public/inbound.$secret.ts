// Inbound webhook for replies + bounces.
// Configure your IMAP-bridge / forwarder (CloudMailin, SendGrid Inbound Parse,
// or a tiny self-hosted Node forwarder) to POST JSON here:
//   POST /api/public/inbound/<your-secret>
//   { from, to, subject, text, html, in_reply_to, message_id, is_bounce?, bounce_type?, bounce_reason? }

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { fireWebhook } from "@/lib/webhooks";
import { z } from "zod";

const InboundSchema = z.object({
  from: z.string().email().max(320),
  to: z.string().email().max(320),
  subject: z.string().max(998).optional().default(""),
  text: z.string().max(200_000).optional().default(""),
  html: z.string().max(500_000).optional().default(""),
  in_reply_to: z.string().max(998).optional(),
  message_id: z.string().max(998).optional(),
  is_bounce: z.boolean().optional(),
  bounce_type: z.enum(["hard", "soft"]).optional(),
  bounce_reason: z.string().max(2000).optional(),
});

export const Route = createFileRoute("/api/public/inbound/$secret")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } },
        );

        const { data: secretRow } = await supabase
          .from("inbound_secrets").select("user_id").eq("secret", params.secret).maybeSingle();
        if (!secretRow) return new Response("Unauthorized", { status: 401 });
        const userId = secretRow.user_id;

        let body: any;
        try { body = InboundSchema.parse(await request.json()); }
        catch { return new Response("Bad payload", { status: 400 }); }

        const fromLc = body.from.toLowerCase();
        const toLc = body.to.toLowerCase();

        // Find original send by Message-ID (In-Reply-To) first, then fallback to lead email
        let sendLog: any = null;
        if (body.in_reply_to) {
          const { data } = await supabase.from("send_log")
            .select("*").eq("user_id", userId).eq("message_id", body.in_reply_to).maybeSingle();
          sendLog = data;
        }
        if (!sendLog) {
          const { data } = await supabase.from("send_log")
            .select("*").eq("user_id", userId).eq("to_email", fromLc)
            .order("sent_at", { ascending: false }).limit(1).maybeSingle();
          sendLog = data;
        }

        // Bounce handling
        if (body.is_bounce) {
          if (sendLog) {
            await supabase.from("send_log").update({
              bounced_at: new Date().toISOString(),
              bounce_type: body.bounce_type ?? "hard",
              bounce_reason: body.bounce_reason ?? null,
              status: "bounced",
            }).eq("id", sendLog.id);
          }
          // Auto-suppress hard bounces
          if ((body.bounce_type ?? "hard") === "hard") {
            const bouncedEmail = sendLog?.to_email ?? fromLc;
            await supabase.from("suppressions").insert({
              user_id: userId, email: bouncedEmail, reason: "bounce",
            });
          }
          await fireWebhook(supabase, userId, "bounce", {
            to: sendLog?.to_email ?? fromLc, type: body.bounce_type ?? "hard",
            reason: body.bounce_reason, campaign_id: sendLog?.campaign_id, lead_id: sendLog?.lead_id,
          });
          return Response.json({ ok: true, kind: "bounce" });
        }

        // Reply handling
        const mailboxQ = await supabase.from("mailboxes")
          .select("id").eq("user_id", userId).ilike("from_email", toLc).maybeSingle();
        const mailboxId = mailboxQ.data?.id ?? sendLog?.mailbox_id ?? null;
        if (!mailboxId) return Response.json({ ok: false, reason: "no_mailbox" });

        // Find or create conversation
        let convId: string;
        const { data: existing } = await supabase.from("conversations")
          .select("id,unread_count").eq("user_id", userId)
          .eq("mailbox_id", mailboxId).eq("lead_id", sendLog?.lead_id ?? null).maybeSingle();
        if (existing) {
          convId = existing.id;
          await supabase.from("conversations").update({
            last_message_at: new Date().toISOString(),
            unread_count: (existing.unread_count ?? 0) + 1,
            status: "open",
          }).eq("id", convId);
        } else {
          const { data: created } = await supabase.from("conversations").insert({
            user_id: userId, mailbox_id: mailboxId, lead_id: sendLog?.lead_id ?? null,
            campaign_id: sendLog?.campaign_id ?? null, subject: body.subject,
            unread_count: 1,
          }).select("id").single();
          convId = created!.id;
        }

        await supabase.from("messages").insert({
          conversation_id: convId, user_id: userId, direction: "inbound",
          from_email: fromLc, to_email: toLc, subject: body.subject,
          body: body.text || body.html, message_id: body.message_id ?? null,
          in_reply_to: body.in_reply_to ?? null,
        });

        if (sendLog) {
          await supabase.from("send_log").update({
            replied_at: new Date().toISOString(),
          }).eq("id", sendLog.id);
        }

        await fireWebhook(supabase, userId, "reply", {
          from: fromLc, to: toLc, subject: body.subject,
          conversation_id: convId, lead_id: sendLog?.lead_id, campaign_id: sendLog?.campaign_id,
          snippet: (body.text || body.html || "").slice(0, 500),
        });

        // Fire-and-forget AI categorization (best-effort)
        const apiKey = process.env.LOVABLE_API_KEY;
        if (apiKey && (body.text || body.html)) {
          try {
            const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                  { role: "system", content: 'Classify a cold-email reply into ONE of: interested, not_interested, out_of_office, unsubscribe, question, other. Return strict JSON: {"category":"...","confidence":0..1,"summary":"<8 words"}' },
                  { role: "user", content: (body.text || body.html).slice(0, 4000) },
                ],
              }),
            });
            if (aiRes.ok) {
              const j: any = await aiRes.json();
              const txt = j?.choices?.[0]?.message?.content ?? "";
              const m = txt.match(/\{[\s\S]*\}/);
              if (m) {
                const parsed = JSON.parse(m[0]);
                await supabase.from("conversations").update({
                  ai_category: parsed.category,
                  ai_confidence: parsed.confidence,
                  ai_summary: parsed.summary,
                }).eq("id", convId);
                if (parsed.category === "unsubscribe") {
                  await supabase.from("suppressions").insert({
                    user_id: userId, email: fromLc, reason: "unsubscribe",
                  });
                }
              }
            }
          } catch { /* ignore */ }
        }

        return Response.json({ ok: true, kind: "reply", conversation_id: convId });
      },
    },
  },
});
