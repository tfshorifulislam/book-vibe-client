import { z } from "zod";

import { handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";

const broadcastSchema = z.object({
  title: z.string().min(2).max(100),
  message: z.string().min(2).max(500),
  type: z.enum(["SYSTEM", "PROMO", "ALERT"]).default("SYSTEM"),
  targetRole: z.enum(["ALL", "BUYER", "SELLER"]).default("ALL"),
  href: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    await requireApiUser("admin");
    const input = broadcastSchema.parse(await readJson(request));

    const where = input.targetRole === "ALL" ? {} : { role: input.targetRole.toLowerCase() };
    const users = await prisma.user.findMany({
      where,
      select: { id: true },
    });

    if (users.length > 0) {
      await prisma.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          title: input.title,
          message: input.message,
          type: input.type,
          href: input.href || null,
        })),
      });
    }

    return ok({ sentCount: users.length });
  } catch (error) {
    return handleError(error);
  }
}
