import "server-only";

import type { PaymentInitiateInput, PaymentInitiateResult } from "./types";

export async function initiateStripePayment(
  input: PaymentInitiateInput
): Promise<PaymentInitiateResult> {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return {
      success: false,
      error: "Stripe secret key not configured. Configure STRIPE_SECRET_KEY in .env.",
    };
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const body = new URLSearchParams({
      "payment_method_types[0]": "card",
      mode: "payment",
      customer_email: input.customerEmail,
      client_reference_id: input.orderId,
      "success_url": `${siteUrl}/buyer/orders/${input.orderId}?payment=success`,
      "cancel_url": `${siteUrl}/buyer/orders/${input.orderId}?payment=cancelled`,
      "line_items[0][price_data][currency]": "bdt",
      "line_items[0][price_data][product_data][name]": `BookHand Order ${input.orderNumber}`,
      "line_items[0][price_data][unit_amount]": Math.round(input.amount * 100).toString(),
      "line_items[0][quantity]": "1",
    });

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await res.json();
    if (res.ok && data.url) {
      return {
        success: true,
        paymentUrl: data.url,
        transactionRef: data.id,
      };
    }

    return {
      success: false,
      error: data.error?.message || "Failed to create Stripe checkout session",
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}
