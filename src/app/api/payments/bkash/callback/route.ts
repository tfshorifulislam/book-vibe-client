import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { executeBkashPayment } from "@/lib/payments/bkash";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentID");
  const status = searchParams.get("status");

  if (!orderId) {
    return new Response("Missing order ID", { status: 400 });
  }

  if (status === "cancel" || status === "failure") {
    await prisma.payment.updateMany({
      where: { orderId },
      data: { status: "FAILED" },
    });
    redirect(`/buyer/orders/${orderId}?payment=failed`);
  }

  if (status === "success" && paymentId) {
    const verified = await executeBkashPayment(paymentId);
    if (verified.success) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "PAID" },
        }),
        prisma.payment.updateMany({
          where: { orderId },
          data: {
            status: "PAID",
            transactionRef: paymentId,
          },
        }),
        prisma.auditLog.create({
          data: {
            action: "PAYMENT_CONFIRMED",
            entity: "Order",
            entityId: orderId,
            metadata: JSON.stringify({ provider: "BKASH", paymentId }),
          },
        }),
      ]);
      redirect(`/buyer/orders/${orderId}?payment=success`);
    }
  }

  redirect(`/buyer/orders/${orderId}?payment=error`);
}
