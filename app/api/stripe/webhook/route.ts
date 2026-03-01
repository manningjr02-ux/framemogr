import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function getStripe(): Stripe {
  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(stripeSecretKey);
}

function getWebhookSecret(): string {
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }
  return webhookSecret;
}

async function resolveCustomerEmail(stripe: Stripe, obj: {
  customer?: string | Stripe.Customer | Stripe.DeletedCustomer | null;
  customer_details?: { email?: string | null } | null;
}): Promise<string | null> {
  if (obj.customer_details?.email) {
    return obj.customer_details.email;
  }
  const raw = obj.customer;
  if (!raw) return null;
  const customerId = typeof raw === "string" ? raw : raw.id;
  if (!customerId) return null;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    return customer.email ?? null;
  } catch (e) {
    console.error("[stripe-webhook] Failed to fetch customer:", e);
    return null;
  }
}

function subscriptionStatusToDb(stripeStatus: string): "trialing" | "active" | "past_due" | "canceled" | "inactive" {
  switch (stripeStatus) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      return "canceled";
    default:
      return "inactive";
  }
}

async function upsertEntitlement(
  userId: string,
  data: {
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    status: "trialing" | "active" | "past_due" | "canceled" | "inactive";
    current_period_end: number | null;
  }
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("user_entitlements")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: data.stripe_customer_id,
        stripe_subscription_id: data.stripe_subscription_id,
        status: data.status,
        current_period_end: data.current_period_end ? new Date(data.current_period_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    throw error;
  }
}

async function handleCheckoutSessionCompleted(stripe: Stripe, session: Stripe.Checkout.Session): Promise<void> {
  const email = await resolveCustomerEmail(stripe, {
    customer: session.customer,
    customer_details: session.customer_details,
  });
  if (!email) {
    console.warn("[stripe-webhook] checkout.session.completed: no customer email");
    return;
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();

  if (!profile?.id) {
    console.warn("[stripe-webhook] checkout.session.completed: no profile for email", email);
    return;
  }

  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  let sub: Stripe.Subscription | null = null;
  if (subscriptionId) {
    try {
      sub = await stripe.subscriptions.retrieve(subscriptionId);
    } catch (e) {
      console.error("[stripe-webhook] Failed to fetch subscription:", e);
    }
  }

  const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const status = sub ? subscriptionStatusToDb(sub.status) : "active";
  const currentPeriodEnd =
    (sub as { current_period_end?: number }).current_period_end ??
    (sub?.items?.data?.[0] as { current_period_end?: number } | undefined)?.current_period_end ??
    null;

  await upsertEntitlement(profile.id, {
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: subscriptionId ?? null,
    status,
    current_period_end: currentPeriodEnd ?? null,
  });
}

async function handleSubscriptionEvent(
  stripe: Stripe,
  subscription: Stripe.Subscription
): Promise<void> {
  const email = await resolveCustomerEmail(stripe, { customer: subscription.customer });
  if (!email) {
    console.warn("[stripe-webhook] subscription event: no customer email");
    return;
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();

  if (!profile?.id) {
    console.warn("[stripe-webhook] subscription event: no profile for email", email);
    return;
  }

  const stripeCustomerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? null;

  const sub = subscription as { current_period_end?: number };
  const periodEnd =
    sub.current_period_end ??
    (subscription.items?.data?.[0] as { current_period_end?: number } | undefined)?.current_period_end ??
    null;

  await upsertEntitlement(profile.id, {
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: subscription.id,
    status: subscriptionStatusToDb(subscription.status),
    current_period_end: periodEnd,
  });
}

export async function POST(request: Request) {
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let body: string;
  try {
    body = await request.text();
  } catch (e) {
    console.error("[stripe-webhook] Failed to read body:", e);
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    console.error("[stripe-webhook] Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, getWebhookSecret());
  } catch (e) {
    console.error("[stripe-webhook] Signature verification failed:", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const run = async () => {
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutSessionCompleted(getStripe(), session);
          break;
        }
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionEvent(getStripe(), subscription);
          break;
        }
        default:
          break;
      }
    } catch (e) {
      console.error("[stripe-webhook] Error handling event:", event.type, e);
    }
  };

  void run();

  return NextResponse.json({ received: true }, { status: 200 });
}
