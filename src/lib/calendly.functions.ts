import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const CAL_API = "https://api.calendly.com";

async function calFetch(path: string, token: string) {
  const res = await fetch(`${CAL_API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Calendly ${res.status}: ${await res.text()}`);
  return res.json();
}

export const connectCalendly = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ token: z.string().min(20).max(500) }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const me: any = await calFetch("/users/me", data.token);
    const userUri = me?.resource?.uri;
    if (!userUri) throw new Error("Could not fetch Calendly user");

    const events: any = await calFetch(`/event_types?user=${encodeURIComponent(userUri)}&active=true`, data.token);
    const firstEvent = events?.collection?.[0];

    await supabase.from("profiles").update({
      calendly_token: data.token,
      calendly_user_uri: userUri,
      calendly_event_uri: firstEvent?.uri ?? null,
      calendar_link: firstEvent?.scheduling_url ?? me?.resource?.scheduling_url ?? null,
    }).eq("id", userId);

    return {
      ok: true,
      name: me?.resource?.name,
      eventTypes: (events?.collection ?? []).map((e: any) => ({
        uri: e.uri,
        name: e.name,
        scheduling_url: e.scheduling_url,
        duration: e.duration,
      })),
    };
  });

export const setCalendlyEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ uri: z.string(), schedulingUrl: z.string() }).parse(i))
  .handler(async ({ data, context }) => {
    await context.supabase.from("profiles").update({
      calendly_event_uri: data.uri,
      calendar_link: data.schedulingUrl,
    }).eq("id", context.userId);
    return { ok: true };
  });

export const disconnectCalendly = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase.from("profiles").update({
      calendly_token: null, calendly_user_uri: null, calendly_event_uri: null, calendar_link: null,
    }).eq("id", context.userId);
    return { ok: true };
  });
