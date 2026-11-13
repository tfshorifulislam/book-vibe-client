import { z } from "zod";

import { handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/service";
import { refundStatusEmailTemplate } from "@/lib/email/templates";

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED", "PROCESSED"]),
  note: z.string().max(300).optional(),
});

export async function GET() {
  try {
    await requireApiUser("admin");
    const refunds = await prisma.refund.findMany({
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok({ refunds });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireApiUser("admin");
    const input = updateSchema.parse(await readJson(request));

    const refund = await prisma.refund.update({
      where: { id: input.id },
      data: {
        status: input.status,
        note: input.note,
      },
      include: { order: true },
    });

    if (input.status === "APPROVED" || input.status === "PROCESSED") {
      await prisma.order.update({
        where: { id: refund.orderId },
        data: { status: "REFUNDED" },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: `REFUND_${input.status}`,
        entity: "Refund",
        entityId: refund.id,
        metadata: JSON.stringify({ amount: refund.amount, orderId: refund.orderId }),
      },
    });

    const buyer = await prisma.user.findUnique({
      where: { id: refund.order.userId },
      select: { name: true, email: true },
    });
    if (buyer) {
      const emailData = refundStatusEmailTemplate(
        refund.order.orderNumber,
        buyer.name,
        input.status,
        refund.amount
      );
      await sendEmail({
        to: buyer.email,
        subject: emailData.subject,
        html: emailData.html,
      });
    }

    return ok({ refund });
  } catch (error) {
    return handleError(error);
  }
}
