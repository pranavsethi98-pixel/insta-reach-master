import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { WorkerMailer } from "worker-mailer";
import { renderEmail } from "@/lib/spintax";

export const sendTestEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      mailboxId: z.string().uuid(),
      to: z.string().email(),
      subject: z.string().min(1).max(998),
      body: z.string().min(1).max(50_000),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: mb, error } = await supabase
      .from("mailboxes").select("*").eq("id", data.mailboxId).single();
    if (error || !mb) throw new Error("Mailbox not found");

    const sample = { first_name: "Friend", last_name: "", company: "Your Company", title: "", email: data.to, icebreaker: "" };
    const subject = renderEmail(data.subject, sample);
    const body = renderEmail(data.body, sample);
    const sigHtml = mb.signature ? `<br><br>${mb.signature.replace(/\n/g, "<br>")}` : "";

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
        to: data.to,
        subject: `[TEST] ${subject}`,
        html: body.replace(/\n/g, "<br>") + sigHtml,
        text: body + (mb.signature ? `\n\n${mb.signature}` : ""),
      });
      await mailer.close();
      return { ok: true };
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      // Friendly SMTP error mapping
      if (/535|auth/i.test(msg)) throw new Error("Authentication failed — check your SMTP username/password (Gmail/Outlook need an App Password).");
      if (/timeout|ETIMEDOUT|ECONN/i.test(msg)) throw new Error("Couldn't reach the SMTP server — check host & port.");
      if (/TLS|SSL|secure/i.test(msg)) throw new Error("TLS/SSL mismatch — port 465 needs secure=true, port 587 needs secure=false.");
      if (/relay|denied|not permitted/i.test(msg)) throw new Error("Server refused to relay — your mailbox may not be allowed to send from this address.");
      throw new Error(msg);
    }
  });
