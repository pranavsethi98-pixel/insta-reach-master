import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import dns from "node:dns/promises";

const DISPOSABLE = new Set([
  "mailinator.com","tempmail.com","10minutemail.com","guerrillamail.com",
  "trashmail.com","yopmail.com","throwawaymail.com","fakeinbox.com",
  "getnada.com","sharklasers.com","temp-mail.org","dispostable.com",
]);
const ROLE = new Set([
  "info","admin","support","sales","contact","help","hello","team",
  "noreply","no-reply","abuse","postmaster","webmaster","billing",
]);

async function verifyOne(email: string) {
  const e = email.trim().toLowerCase();
  const m = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/.exec(e);
  if (!m) return { result: "invalid", reason: "bad_syntax", mx_found: false, is_disposable: false, is_role: false };
  const [local, domain] = e.split("@");
  const is_role = ROLE.has(local);
  const is_disposable = DISPOSABLE.has(domain);
  let mx_found = false;
  try {
    const mx = await dns.resolveMx(domain);
    mx_found = (mx?.length ?? 0) > 0;
  } catch { mx_found = false; }
  let result: "valid" | "invalid" | "risky" | "unknown" = "valid";
  let reason: string | null = null;
  if (!mx_found) { result = "invalid"; reason = "no_mx_record"; }
  else if (is_disposable) { result = "invalid"; reason = "disposable"; }
  else if (is_role) { result = "risky"; reason = "role_address"; }
  return { result, reason, mx_found, is_disposable, is_role };
}

export const verifyEmails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ emails: z.array(z.string().email()).min(1).max(200) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const out: Array<{ email: string; result: string; reason: string | null; mx_found: boolean; is_disposable: boolean; is_role: boolean }> = [];
    for (const email of data.emails) {
      const r = await verifyOne(email);
      out.push({ email, ...r });
      await supabase.from("email_verifications").upsert({
        user_id: userId,
        email: email.toLowerCase(),
        ...r,
        checked_at: new Date().toISOString(),
      } as any, { onConflict: "user_id,email" });
    }
    return { results: out };
  });

export const verifyLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ leadIds: z.array(z.string().uuid()).min(1).max(200) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: leads } = await supabase.from("leads").select("id,email").in("id", data.leadIds);
    let invalid = 0, risky = 0, valid = 0;
    for (const l of leads ?? []) {
      if (!l.email) continue;
      const r = await verifyOne(l.email);
      if (r.result === "invalid") invalid++;
      else if (r.result === "risky") risky++;
      else valid++;
      await supabase.from("email_verifications").upsert({
        user_id: userId, email: l.email.toLowerCase(), ...r,
        checked_at: new Date().toISOString(),
      } as any, { onConflict: "user_id,email" });
      // Mirror status onto the lead so the Leads table reflects the result.
      await supabase.from("leads").update({ verification_status: r.result } as any).eq("id", l.id);
      // Auto-suppress invalids
      if (r.result === "invalid") {
        await supabase.from("suppressions").upsert({
          user_id: userId, email: l.email.toLowerCase(), reason: `verify_${r.reason}`,
        } as any, { onConflict: "user_id,email" });
      }
    }
    return { valid, risky, invalid };
  });
