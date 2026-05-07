import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { WorkerMailer } from "worker-mailer";
import { renderEmail } from "@/lib/spintax";

export const Route = createFileRoute("/api/public/process-queue")({
  server: {
    handlers: {
      POST: async () => {
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } },
        );

        // Reset daily counters for mailboxes whose date rolled over
        await supabase.rpc("noop").catch(() => {});
        const today = new Date().toISOString().slice(0, 10);
        await supabase.from("mailboxes")
          .update({ sent_today: 0, last_reset_date: today })
          .neq("last_reset_date", today);

        // Find active campaigns
        const { data: campaigns } = await supabase
          .from("campaigns").select("*").eq("status", "active");
        if (!campaigns?.length) return Response.json({ ok: true, processed: 0 });

        const nowHour = new Date().getUTCHours();
        let processed = 0;

        for (const camp of campaigns) {
          // Window check (UTC for now)
          if (nowHour < (camp.send_window_start ?? 0) || nowHour >= (camp.send_window_end ?? 24)) continue;

          // Get linked active mailboxes with capacity
          const { data: cmRows } = await supabase
            .from("campaign_mailboxes").select("mailbox_id").eq("campaign_id", camp.id);
          const mids = (cmRows ?? []).map((r) => r.mailbox_id);
          if (!mids.length) continue;

          const { data: mailboxes } = await supabase
            .from("mailboxes").select("*").in("id", mids).eq("is_active", true);
          const available = (mailboxes ?? []).filter((m) => m.sent_today < m.daily_limit);
          if (!available.length) continue;

          // Get due lead-step assignments
          const { data: due } = await supabase
            .from("campaign_leads")
            .select("*, leads(*)")
            .eq("campaign_id", camp.id)
            .in("status", ["pending", "in_progress"])
            .lte("next_send_at", new Date().toISOString())
            .limit(available.reduce((s, m) => s + (m.daily_limit - m.sent_today), 0));

          if (!due?.length) continue;

          const { data: steps } = await supabase
            .from("campaign_steps").select("*").eq("campaign_id", camp.id).order("step_order");
          if (!steps?.length) continue;

          let mbIdx = 0;
          for (const cl of due) {
            const stepIdx = cl.current_step; // 0-based index into steps
            if (stepIdx >= steps.length) {
              await supabase.from("campaign_leads").update({ status: "completed" }).eq("id", cl.id);
              continue;
            }
            const step = steps[stepIdx];

            // Find mailbox with capacity (round-robin)
            let mb = null;
            for (let i = 0; i < available.length; i++) {
              const candidate = available[(mbIdx + i) % available.length];
              if (candidate.sent_today < candidate.daily_limit) { mb = candidate; mbIdx = (mbIdx + i + 1) % available.length; break; }
            }
            if (!mb) break;

            const subject = renderEmail(step.subject || "", cl.leads);
            const body = renderEmail(step.body || "", cl.leads);

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
                to: cl.leads.email,
                subject,
                html: body.replace(/\n/g, "<br>"),
                text: body,
              });
              await mailer.close();

              mb.sent_today += 1;
              await supabase.from("mailboxes").update({ sent_today: mb.sent_today, last_sent_at: new Date().toISOString() }).eq("id", mb.id);

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
                step_order: step.step_order, to_email: cl.leads.email, subject, body, status: "sent",
              });
              processed++;
            } catch (e: any) {
              await supabase.from("send_log").insert({
                user_id: camp.user_id, campaign_id: camp.id, lead_id: cl.lead_id, mailbox_id: mb.id,
                step_order: step.step_order, to_email: cl.leads.email, subject, body,
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
