import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");

  if (!signature && process.env.NODE_ENV === "production") {
    return new Response("Missing signature", { status: 400 });
  }

  try {
    const event = await request.json();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.client_reference_id;
      const paymentIntentId = session.payment_intent;

      if (orderId) {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: "PAID" },
          }),
          prisma.payment.updateMany({
            where: { orderId },
            data: {
              status: "PAID",
              transactionRef: paymentIntentId || session.id,
            },
          }),
          prisma.auditLog.create({
            data: {
              action: "STRIPE_PAYMENT_CONFIRMED",
              entity: "Order",
              entityId: orderId,
              metadata: JSON.stringify({ sessionId: session.id, paymentIntentId }),
            },
          }),
        ]);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Webhook processing failed" }),
      { status: 400 }
    );
  }
}
