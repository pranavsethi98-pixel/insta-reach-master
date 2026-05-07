import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook, createStripeClient } from "@/lib/stripe.server";

let _supabase: any = null;
function getSupabase(): any {
  if (!_supabase) {
    _supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }
  return _supabase;
}

async function handleSubscriptionUpsert(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) { console.error("No userId in subscription metadata"); return; }

  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.metadata?.lovable_external_id || item?.price?.id;
  const productId = item?.price?.product;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  await getSupabase().from("subscriptions").upsert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    product_id: productId,
    price_id: priceId,
    status: subscription.status,
    current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    environment: env,
    updated_at: new Date().toISOString(),
  }, { onConflict: "stripe_subscription_id" });

  // Also update profile's plan
  const sb = getSupabase();
  const { data: plan } = await sb.from("plans").select("id, monthly_credits").eq("stripe_price_id", priceId).maybeSingle();
  if (plan && (subscription.status === "active" || subscription.status === "trialing")) {
    await sb.from("profiles").update({ plan_id: plan.id }).eq("id", userId);
    await sb.from("credit_ledger").insert({
      user_id: userId, delta: plan.monthly_credits, reason: "plan_renewal", actor_id: userId,
    });
  }
}

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  const userId = session.metadata?.userId;
  if (!userId || session.mode !== "payment") return;

  const sb = getSupabase();
  const { data: existing } = await sb.from("processed_checkout_sessions")
    .select("session_id").eq("session_id", session.id).maybeSingle();
  if (existing) return; // idempotent

  // Look up the price -> credits
  const stripe = createStripeClient(env);
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
  const price: any = lineItems.data[0]?.price;
  const priceId = price?.metadata?.lovable_external_id || price?.id;

  const { data: sku } = await sb.from("credit_topup_skus").select("credits").eq("price_id", priceId).maybeSingle();
  const credits = sku?.credits ?? 0;

  await sb.from("processed_checkout_sessions").insert({
    session_id: session.id, user_id: userId, price_id: priceId, credits_granted: credits,
  });

  if (credits > 0) {
    await sb.from("credit_ledger").insert({
      user_id: userId, delta: credits, reason: "topup_purchase", actor_id: userId,
    });
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        const env: StripeEnv = rawEnv;
        try {
          const event = await verifyWebhook(request, env);
          switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
              await handleSubscriptionUpsert(event.data.object, env);
              break;
            case "customer.subscription.deleted":
              await getSupabase().from("subscriptions")
                .update({ status: "canceled", updated_at: new Date().toISOString() })
                .eq("stripe_subscription_id", event.data.object.id).eq("environment", env);
              break;
            case "checkout.session.completed":
              await handleCheckoutCompleted(event.data.object, env);
              break;
            default:
              console.log("Unhandled event:", event.type);
          }
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
