import { z } from "zod";

import { handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";

const updateSchema = z.object({
  id: z.string().optional(),
  all: z.boolean().optional(),
});

export async function GET() {
  try {
    const user = await requireApiUser();
    const [notifications, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.notification.count({
        where: { userId: user.id, isRead: false },
      }),
    ]);
    return ok({ notifications, unread });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const input = updateSchema.parse(await readJson(request));
    if (input.all) {
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
    } else if (input.id) {
      await prisma.notification.updateMany({
        where: { id: input.id, userId: user.id },
        data: { isRead: true },
      });
    }
    return ok({ updated: true });
  } catch (error) {
    return handleError(error);
  }
}
