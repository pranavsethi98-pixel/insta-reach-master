import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

import { generateWarmupEmail, generateWarmupReply } from "@/lib/warmup-content";
import { verifyCronSecret } from "@/lib/cron-auth";

export const Route = createFileRoute("/api/public/warmup-tick")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauthorized = verifyCronSecret(request);
        if (unauthorized) return unauthorized;
        const { WorkerMailer } = await import("worker-mailer");
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } },
        );

        const today = new Date().toISOString().slice(0, 10);
        // Reset warmup counters daily
        await supabase.from("mailboxes")
          .update({ warmup_sent_today: 0 })
          .neq("last_reset_date", today);

        // Get all warmup-enabled mailboxes grouped by user
        const { data: mailboxes } = await supabase
          .from("mailboxes")
          .select("*")
          .eq("warmup_enabled", true)
          .eq("is_active", true);

        if (!mailboxes?.length) return Response.json({ ok: true, sent: 0 });

        // Group by user
        const byUser: Record<string, any[]> = {};
        for (const m of mailboxes) {
          (byUser[m.user_id] ??= []).push(m);
        }

        let sent = 0;
        for (const [userId, mbs] of Object.entries(byUser)) {
          if (mbs.length < 2) continue; // need at least 2 to warm

          // Compute today's warmup target (with ramp-up)
          for (const sender of mbs) {
            const startedDays = sender.warmup_started_at
              ? Math.floor((Date.now() - new Date(sender.warmup_started_at).getTime()) / 86400000)
              : 0;
            const ramp = Math.min(
              sender.warmup_daily_target,
              2 + startedDays * (sender.warmup_increment ?? 2),
            );
            if (sender.warmup_sent_today >= ramp) continue;

            // Send 1 message this tick (cron runs every 5 min → spread over day)
            const recipient = mbs.filter(m => m.id !== sender.id)[Math.floor(Math.random() * (mbs.length - 1))];
            const { subject, body } = generateWarmupEmail();
            const messageId = `<warmup-${crypto.randomUUID()}@${sender.from_email.split("@")[1]}>`;

            try {
              const mailer = await WorkerMailer.connect({
                credentials: { username: sender.smtp_username, password: sender.smtp_password },
                authType: "plain",
                host: sender.smtp_host,
                port: sender.smtp_port,
                secure: sender.smtp_secure,
              });
              await mailer.send({
                from: { name: sender.from_name, email: sender.from_email },
                to: recipient.from_email,
                subject,
                text: body,
                html: body.replace(/\n/g, "<br>"),
                headers: { "Message-ID": messageId, "X-Warmup": "1" },
              });
              await mailer.close();

              await supabase.from("mailboxes")
                .update({ warmup_sent_today: (sender.warmup_sent_today ?? 0) + 1 })
                .eq("id", sender.id);

              await supabase.from("warmup_log").insert({
                user_id: userId,
                from_mailbox_id: sender.id,
                to_mailbox_id: recipient.id,
                message_id: messageId,
                action: "sent",
              });

              // Schedule a reply: send back after a randomized delay (40% reply rate)
              if (Math.random() < (sender.warmup_reply_rate ?? 0.4)) {
                const reply = generateWarmupReply(subject);
                try {
                  const replyMailer = await WorkerMailer.connect({
                    credentials: { username: recipient.smtp_username, password: recipient.smtp_password },
                    authType: "plain",
                    host: recipient.smtp_host,
                    port: recipient.smtp_port,
                    secure: recipient.smtp_secure,
                  });
                  await replyMailer.send({
                    from: { name: recipient.from_name, email: recipient.from_email },
                    to: sender.from_email,
                    subject: reply.subject,
                    text: reply.body,
                    html: reply.body.replace(/\n/g, "<br>"),
                    headers: { "In-Reply-To": messageId, "X-Warmup": "1" },
                  });
                  await replyMailer.close();
                  await supabase.from("warmup_log").insert({
                    user_id: userId,
                    from_mailbox_id: recipient.id,
                    to_mailbox_id: sender.id,
                    message_id: `<reply-${crypto.randomUUID()}@${recipient.from_email.split("@")[1]}>`,
                    action: "replied",
                  });
                } catch { /* reply failures don't fail the warmup */ }
              }

              sent++;
              // Bump health score
              await supabase.from("mailboxes")
                .update({ health_score: Math.min(100, (sender.health_score ?? 100) + 1) })
                .eq("id", sender.id);
            } catch (e: any) {
              await supabase.from("mailboxes")
                .update({ health_score: Math.max(0, (sender.health_score ?? 100) - 5) })
                .eq("id", sender.id);
              await supabase.from("warmup_log").insert({
                user_id: userId,
                from_mailbox_id: sender.id,
                to_mailbox_id: recipient.id,
                action: "failed: " + String(e?.message ?? e).slice(0, 200),
              });
            }
          }
        }

        return Response.json({ ok: true, sent });
      },
    },
  },
});
