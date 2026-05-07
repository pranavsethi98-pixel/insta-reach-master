import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { WorkerMailer } from "worker-mailer";
import { renderEmail } from "@/lib/spintax";
import { rewriteLinks } from "@/lib/links";

export const Route = createFileRoute("/api/public/process-queue")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } },
        );

        const today = new Date().toISOString().slice(0, 10);
        // Reset daily counters
        await supabase.from("mailboxes")
          .update({ sent_today: 0, warmup_sent_today: 0, last_reset_date: today })
          .neq("last_reset_date", today);

        // Reset hourly counters
        await supabase.from("mailboxes")
          .update({ sent_this_hour: 0, hour_reset_at: new Date().toISOString() })
          .lt("hour_reset_at", new Date(Date.now() - 3600_000).toISOString());

        // Build base URL for tracking pixel
        const origin = new URL(request.url).origin;

        const { data: campaigns } = await supabase
          .from("campaigns").select("*").eq("status", "active");
        if (!campaigns?.length) return Response.json({ ok: true, processed: 0 });

        const nowHour = new Date().getUTCHours();
        let processed = 0;

        for (const camp of campaigns) {
          if (nowHour < (camp.send_window_start ?? 0) || nowHour >= (camp.send_window_end ?? 24)) continue;

          // Linked mailboxes with capacity (daily + hourly + ramp)
          const { data: cmRows } = await supabase
            .from("campaign_mailboxes").select("mailbox_id").eq("campaign_id", camp.id);
          const mids = (cmRows ?? []).map((r) => r.mailbox_id);
          if (!mids.length) continue;

          const { data: mailboxes } = await supabase
            .from("mailboxes").select("*").in("id", mids).eq("is_active", true);

          const computeDailyCap = (m: any) => {
            if (!m.ramp_up_enabled) return m.daily_limit;
            const days = m.ramp_started_at
              ? Math.floor((Date.now() - new Date(m.ramp_started_at).getTime()) / 86400000)
              : 0;
            return Math.min(m.daily_limit, (m.ramp_start ?? 5) + days * (m.ramp_increment ?? 5));
          };

          const available = (mailboxes ?? []).filter((m) => {
            const cap = computeDailyCap(m);
            return m.sent_today < cap && m.sent_this_hour < (m.hourly_limit ?? cap);
          });
          if (!available.length) continue;

          // Suppression set (per user)
          const { data: supRows } = await supabase
            .from("suppressions").select("email,domain").eq("user_id", camp.user_id);
          const supEmails = new Set((supRows ?? []).filter(s => s.email).map(s => s.email!.toLowerCase()));
          const supDomains = new Set((supRows ?? []).filter(s => s.domain).map(s => s.domain!.toLowerCase()));

          const totalCapacity = available.reduce((s, m) => s + Math.min(
            computeDailyCap(m) - m.sent_today,
            (m.hourly_limit ?? 999) - m.sent_this_hour,
          ), 0);

          const { data: due } = await supabase
            .from("campaign_leads")
            .select("*, leads(*)")
            .eq("campaign_id", camp.id)
            .in("status", ["pending", "in_progress"])
            .lte("next_send_at", new Date().toISOString())
            .limit(Math.max(1, totalCapacity));

          if (!due?.length) continue;

          const { data: steps } = await supabase
            .from("campaign_steps").select("*").eq("campaign_id", camp.id).order("step_order");
          if (!steps?.length) continue;

          let mbIdx = 0;
          for (const cl of due) {
            const stepIdx = cl.current_step;
            if (stepIdx >= steps.length) {
              await supabase.from("campaign_leads").update({ status: "completed" }).eq("id", cl.id);
              continue;
            }
            const step = steps[stepIdx];
            const lead = cl.leads;

            // Conditional step gating (based on previous step's outcome)
            if (stepIdx > 0 && step.condition && step.condition !== "always") {
              const prevStep = steps[stepIdx - 1];
              const { data: prevSends } = await supabase.from("send_log")
                .select("opened_at,clicked_at,replied_at")
                .eq("campaign_id", camp.id).eq("lead_id", cl.lead_id)
                .eq("step_order", prevStep.step_order);
              const opened = (prevSends ?? []).some((p: any) => p.opened_at);
              const clicked = (prevSends ?? []).some((p: any) => p.clicked_at);
              const replied = (prevSends ?? []).some((p: any) => p.replied_at);
              const cond = step.condition as string;
              const skip =
                (cond === "if_opened" && !opened) ||
                (cond === "if_not_opened" && opened) ||
                (cond === "if_clicked" && !clicked) ||
                (cond === "if_not_replied" && replied);
              if (skip) {
                const nextStep = stepIdx + 1;
                const isDone = nextStep >= steps.length;
                await supabase.from("campaign_leads").update({
                  current_step: nextStep,
                  status: isDone ? "completed" : "in_progress",
                  next_send_at: isDone ? null : new Date().toISOString(),
                }).eq("id", cl.id);
                continue;
              }
            }

            // Suppression check
            const emailLc = (lead.email || "").toLowerCase();
            const domainLc = emailLc.split("@")[1] ?? "";
            if (supEmails.has(emailLc) || supDomains.has(domainLc)) {
              await supabase.from("campaign_leads")
                .update({ status: "suppressed" }).eq("id", cl.id);
              continue;
            }

            // stop_on_reply / stop_on_click
            if (camp.stop_on_reply || camp.stop_on_click) {
              const { data: prior } = await supabase.from("send_log")
                .select("replied_at,clicked_at")
                .eq("campaign_id", camp.id).eq("lead_id", cl.lead_id);
              const replied = (prior ?? []).some((p: any) => p.replied_at);
              const clicked = (prior ?? []).some((p: any) => p.clicked_at);
              if ((camp.stop_on_reply && replied) || (camp.stop_on_click && clicked)) {
                await supabase.from("campaign_leads")
                  .update({ status: "stopped" }).eq("id", cl.id);
                continue;
              }
            }

            // Pick mailbox
            let mb = null;
            for (let i = 0; i < available.length; i++) {
              const candidate = available[(mbIdx + i) % available.length];
              const cap = computeDailyCap(candidate);
              if (candidate.sent_today < cap && candidate.sent_this_hour < (candidate.hourly_limit ?? cap)) {
                mb = candidate; mbIdx = (mbIdx + i + 1) % available.length; break;
              }
            }
            if (!mb) break;

            // A/B variant pick
            const subjVariants = [step.subject, ...(step.variant_subjects ?? [])].filter(Boolean);
            const bodyVariants = [step.body, ...(step.variant_bodies ?? [])].filter(Boolean);
            const variantIdx = Math.floor(Math.random() * Math.max(subjVariants.length, bodyVariants.length, 1));
            const subjectTpl = subjVariants[variantIdx % subjVariants.length] ?? "";
            const bodyTpl = bodyVariants[variantIdx % bodyVariants.length] ?? "";

            // Apply icebreaker merge tag
            const leadForRender = { ...lead, icebreaker: lead.icebreaker || "" };
            const subject = renderEmail(subjectTpl, leadForRender);
            const body = renderEmail(bodyTpl, leadForRender);

            const trackingId = crypto.randomUUID();
            const messageId = `<${crypto.randomUUID()}@${(mb.from_email as string).split("@")[1]}>`;
            const sigHtml = mb.signature ? `<br><br>${mb.signature.replace(/\n/g, "<br>")}` : "";
            const trackingPixel = camp.track_opens
              ? `<img src="${origin}/api/public/track/open/${trackingId}" width="1" height="1" style="display:none" />`
              : "";
            const html = body.replace(/\n/g, "<br>") + sigHtml + trackingPixel;

            try {
              const mailer = await WorkerMailer.connect({
                credentials: { username: mb.smtp_username, password: mb.smtp_password },
                authType: "plain",
                host: mb.smtp_host,
                port: mb.smtp_port,
                secure: mb.smtp_secure,
              });
              await mailer.send({
                from: { name: mb.from_name, email: mb.from_email },
                to: lead.email,
                reply: mb.reply_to ? { email: mb.reply_to } : undefined,
                subject,
                html,
                text: body + (mb.signature ? `\n\n${mb.signature}` : ""),
                headers: { "Message-ID": messageId },
              });
              await mailer.close();

              mb.sent_today += 1;
              mb.sent_this_hour = (mb.sent_this_hour ?? 0) + 1;
              await supabase.from("mailboxes").update({
                sent_today: mb.sent_today,
                sent_this_hour: mb.sent_this_hour,
                last_sent_at: new Date().toISOString(),
              }).eq("id", mb.id);

              const nextStep = stepIdx + 1;
              const isDone = nextStep >= steps.length;
              const delayDays = isDone ? 0 : (steps[nextStep].delay_days ?? 0);
              await supabase.from("campaign_leads").update({
                current_step: nextStep,
                status: isDone ? "completed" : "in_progress",
                last_sent_at: new Date().toISOString(),
                next_send_at: isDone ? null : new Date(Date.now() + delayDays * 86400000).toISOString(),
              }).eq("id", cl.id);

              await supabase.from("send_log").insert({
                user_id: camp.user_id, campaign_id: camp.id, lead_id: cl.lead_id, mailbox_id: mb.id,
                step_order: step.step_order, to_email: lead.email, subject, body, status: "sent",
                tracking_id: trackingId, message_id: messageId, variant_index: variantIdx,
              });
              processed++;
            } catch (e: any) {
              await supabase.from("send_log").insert({
                user_id: camp.user_id, campaign_id: camp.id, lead_id: cl.lead_id, mailbox_id: mb.id,
                step_order: step.step_order, to_email: lead.email, subject, body,
                status: "failed", error: String(e?.message ?? e),
              });
            }
          }
        }

        return Response.json({ ok: true, processed });
      },
    },
  },
});
