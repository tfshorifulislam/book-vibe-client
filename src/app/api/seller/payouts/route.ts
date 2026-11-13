import { z } from "zod";

import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";

const payoutSchema = z.object({
  amount: z.coerce.number().int().min(100, "Minimum payout is 100 BDT."),
  method: z.string().trim().min(2).max(60),
  note: z.string().trim().max(300).optional(),
});

export async function GET() {
  try {
    const user = await requireApiUser("seller");
    const payouts = await prisma.payout.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return ok({ payouts });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser("seller");
    const input = payoutSchema.parse(await readJson(request));

    const shop = await prisma.shop.findUnique({
      where: { ownerId: user.id },
      select: { id: true },
    });

    // Calculate seller earnings
    const orderItems = await prisma.orderItem.findMany({
      where: {
        sellerId: user.id,
        order: { status: "DELIVERED" },
      },
      select: { price: true, quantity: true },
    });
    const totalDelivered = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const netEarnings = Math.round(totalDelivered * 0.9); // 10% platform fee

    const pastPayouts = await prisma.payout.findMany({
      where: { sellerId: user.id, status: { in: ["PENDING", "PAID"] } },
      select: { amount: true },
    });
    const withdrawnOrPending = pastPayouts.reduce(
      (sum, p) => sum + p.amount,
      0,
    );

    const availableBalance = Math.max(0, netEarnings - withdrawnOrPending);

    if (input.amount > availableBalance) {
      return fail(
        `Requested amount exceeds available balance of ${availableBalance} BDT.`,
        400,
      );
    }

    const payout = await prisma.payout.create({
      data: {
        sellerId: user.id,
        shopId: shop?.id,
        amount: input.amount,
        method: input.method,
        note: input.note,
        status: "PENDING",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PAYOUT_REQUESTED",
        entity: "Payout",
        entityId: payout.id,
        metadata: JSON.stringify({ amount: payout.amount, method: payout.method }),
      },
    });

    return ok({ payout }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
