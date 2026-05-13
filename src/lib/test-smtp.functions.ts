import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/**
 * Attempts a real SMTP connection (LOGIN/AUTH) without sending an email.
 * Returns { ok: true } on success, throws a friendly Error on failure.
 */
export const testSmtpCredentials = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      smtp_host: z.string().min(1).max(255),
      smtp_port: z.number().int().min(1).max(65535),
      smtp_secure: z.boolean(),
      smtp_username: z.string().min(1).max(320),
      smtp_password: z.string().min(1).max(1024),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const { WorkerMailer } = await import("worker-mailer");
      const mailer = await WorkerMailer.connect({
        credentials: { username: data.smtp_username, password: data.smtp_password },
        authType: "plain",
        host: data.smtp_host,
        port: data.smtp_port,
        secure: data.smtp_secure,
      });
      await mailer.close();
      return { ok: true as const };
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (/535|auth|invalid login|password/i.test(msg)) {
        throw new Error("Could not connect — check your app password and try again.");
      }
      if (/timeout|ETIMEDOUT|ECONN|ENOTFOUND|EAI_AGAIN/i.test(msg)) {
        throw new Error("Could not connect — SMTP host or port is unreachable.");
      }
      if (/TLS|SSL|secure|wrong version/i.test(msg)) {
        throw new Error("Could not connect — TLS/SSL mismatch (port 465 = SSL on, 587 = SSL off).");
      }
      // Re-throw with context so the caller can diagnose unexpected failures.
      throw new Error(`Could not connect — ${msg}`);
    }
  });
