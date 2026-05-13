// Server helper to fan out webhook deliveries. Runs from the queue/inbound
// routes which already have a service-role supabase client.
import { createHmac } from "crypto";

export type WebhookEvent = "sent" | "open" | "click" | "reply" | "bounce";

export async function fireWebhook(
  supabase: any,
  userId: string,
  event: WebhookEvent,
  payload: Record<string, any>,
) {
  const { data: hooks } = await supabase
    .from("webhooks").select("*")
    .eq("user_id", userId).eq("is_active", true);
  if (!hooks?.length) return;

  const body = JSON.stringify({ event, sent_at: new Date().toISOString(), data: payload });

  await Promise.all(hooks
    .filter((h: any) => (h.events ?? []).includes(event))
    .map(async (h: any) => {
      const sig = createHmac("sha256", h.secret ?? "").update(body).digest("hex");
      let status = 0; let response = "";
      try {
        const r = await fetch(h.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-EmailSend-Event": event,
            "X-EmailSend-Signature": `sha256=${sig}`,
          },
          body,
          signal: AbortSignal.timeout(8000),
        });
        status = r.status;
        response = (await r.text()).slice(0, 500);
      } catch (e: any) {
        response = String(e?.message ?? e).slice(0, 500);
      }
      await supabase.from("webhooks").update({
        last_delivery_at: new Date().toISOString(),
        last_status: status,
      }).eq("id", h.id);
      await supabase.from("webhook_deliveries").insert({
        user_id: userId, webhook_id: h.id, event, status, response, payload,
      });
    }));
}
