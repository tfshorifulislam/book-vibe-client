import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { refundRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser("buyer");
    const input = refundRequestSchema.parse(await readJson(request));

    const order = await prisma.order.findFirst({
      where: { id: input.orderId, userId: user.id },
      include: { refunds: true },
    });

    if (!order) {
      return fail("Order not found or unauthorized.", 404);
    }

    if (order.status !== "DELIVERED") {
      return fail("Refunds can only be requested for delivered orders.", 400);
    }

    const activeRefund = order.refunds.find(
      (r) => r.status === "REQUESTED" || r.status === "APPROVED" || r.status === "PROCESSED",
    );
    if (activeRefund) {
      return fail(
        `A refund request is already ${activeRefund.status.toLowerCase()} for this order.`,
        409,
      );
    }

    const refundAmount = input.amount && input.amount <= order.total ? input.amount : order.total;

    const refund = await prisma.refund.create({
      data: {
        orderId: order.id,
        amount: refundAmount,
        reason: input.reason,
        note: input.note,
        status: "REQUESTED",
      },
    });

    // Notify administrators
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "REFUND",
          title: "New Refund Request",
          message: `${user.name} requested a refund for Order ${order.orderNumber}.`,
          href: "/admin/refunds",
        })),
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "REFUND_REQUESTED",
        entity: "Refund",
        entityId: refund.id,
        metadata: JSON.stringify({ orderId: order.id, amount: refundAmount, reason: input.reason }),
      },
    });

    return ok({ refund }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
