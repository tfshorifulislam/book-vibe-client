import { z } from "zod";

import { handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PAID", "REJECTED"]),
  note: z.string().max(300).optional(),
});

export async function GET() {
  try {
    await requireApiUser("admin");
    const payouts = await prisma.payout.findMany({
      include: {
        seller: { select: { id: true, name: true, email: true } },
        shop: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok({ payouts });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireApiUser("admin");
    const input = updateSchema.parse(await readJson(request));

    const payout = await prisma.payout.update({
      where: { id: input.id },
      data: {
        status: input.status,
        note: input.note,
        processedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: `PAYOUT_${input.status}`,
        entity: "Payout",
        entityId: payout.id,
        metadata: JSON.stringify({ amount: payout.amount, note: input.note }),
      },
    });

    return ok({ payout });
  } catch (error) {
    return handleError(error);
  }
}
