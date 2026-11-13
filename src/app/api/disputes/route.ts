import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { disputeRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser("buyer");
    const input = disputeRequestSchema.parse(await readJson(request));

    const order = await prisma.order.findFirst({
      where: { id: input.orderId, userId: user.id },
      include: { disputes: true },
    });

    if (!order) {
      return fail("Order not found or unauthorized.", 404);
    }

    const openDispute = order.disputes.find((d) => d.status === "OPEN");
    if (openDispute) {
      return fail("An open dispute already exists for this order.", 409);
    }

    const dispute = await prisma.dispute.create({
      data: {
        orderId: order.id,
        userId: user.id,
        reason: input.reason,
        status: "OPEN",
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
          type: "DISPUTE",
          title: "New Dispute Filed",
          message: `${user.name} opened a dispute for Order ${order.orderNumber}.`,
          href: "/admin/disputes",
        })),
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DISPUTE_FILED",
        entity: "Dispute",
        entityId: dispute.id,
        metadata: JSON.stringify({ orderId: order.id, reason: input.reason }),
      },
    });

    return ok({ dispute }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
