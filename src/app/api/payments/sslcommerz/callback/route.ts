import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { validateSslCommerzTransaction } from "@/lib/payments/sslcommerz";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const orderId = searchParams.get("orderId");

  const formData = await request.formData();
  const valId = formData.get("val_id") as string | null;
  const tranId = formData.get("tran_id") as string | null;
  const status = formData.get("status") as string | null;

  if (statusParam === "cancel" || status === "CANCELLED") {
    if (orderId) redirect(`/buyer/orders/${orderId}?payment=cancelled`);
  }

  if (statusParam === "fail" || status === "FAILED") {
    if (orderId) {
      await prisma.payment.updateMany({
        where: { orderId },
        data: { status: "FAILED" },
      });
      redirect(`/buyer/orders/${orderId}?payment=failed`);
    }
  }

  if (valId) {
    const verified = await validateSslCommerzTransaction(valId);
    if (verified.success) {
      const targetOrderId =
        orderId ||
        (tranId?.startsWith("TXN-") ? tranId.replace("TXN-", "") : null);
      if (targetOrderId) {
        await prisma.$transaction([
          prisma.order.updateMany({
            where: {
              OR: [{ id: targetOrderId }, { orderNumber: targetOrderId }],
            },
            data: { paymentStatus: "PAID" },
          }),
          prisma.payment.updateMany({
            where: {
              OR: [
                { orderId: targetOrderId },
                { order: { orderNumber: targetOrderId } },
              ],
            },
            data: { status: "PAID", transactionRef: verified.transactionRef },
          }),
        ]);
        if (orderId) redirect(`/buyer/orders/${orderId}?payment=success`);
      }
    }
  }

  return new Response("OK", { status: 200 });
}
