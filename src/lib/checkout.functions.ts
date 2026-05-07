import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createStripeClient, type StripeEnv } from "@/lib/stripe.server";

const ENV: StripeEnv = (process.env.STRIPE_LIVE_API_KEY ? 'live' : 'sandbox');

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { priceId: string; returnUrl: string }) => d)
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const stripe = createStripeClient(ENV);

    // Resolve human-readable price_id (lovable_external_id) -> Stripe price object
    const prices = await stripe.prices.search({
      query: `metadata['lovable_external_id']:'${data.priceId}'`,
      limit: 1,
    });
    const price = prices.data[0];
    if (!price) throw new Error(`Price not found: ${data.priceId}`);

    const isRecurring = !!price.recurring;

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: price.id, quantity: 1 }],
      mode: isRecurring ? "subscription" : "payment",
      ui_mode: "embedded" as any,
      return_url: `${data.returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      metadata: { userId, lovable_price_id: data.priceId },
      ...(isRecurring && { subscription_data: { metadata: { userId, lovable_price_id: data.priceId } } }),
    });

    return { clientSecret: session.client_secret };
  });
