import { z } from "zod";

import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { refreshBookRating } from "@/lib/commerce";
import { prisma } from "@/lib/db";

const schema = z.object({
  type: z.enum(["review", "question", "dispute"]),
  id: z.string().min(1),
  action: z.enum(["approve", "reject", "delete", "resolve"]),
  resolution: z.string().max(1000).optional(),
});

export async function PATCH(request: Request) {
  try {
    await requireApiUser("admin");
    const input = schema.parse(await readJson(request));

    if (input.type === "review") {
      if (input.action === "delete") {
        const review = await prisma.review.findUnique({ where: { id: input.id } });
        if (!review) return fail("Review not found.", 404);
        await prisma.review.delete({ where: { id: input.id } });
        await refreshBookRating(review.bookId);
      } else {
        await prisma.review.update({
          where: { id: input.id },
          data: { isApproved: input.action === "approve" },
        });
        const review = await prisma.review.findUnique({ where: { id: input.id } });
        if (review) await refreshBookRating(review.bookId);
      }
    }

    if (input.type === "question") {
      if (input.action === "delete") {
        await prisma.question.delete({ where: { id: input.id } });
      } else {
        await prisma.question.update({
          where: { id: input.id },
          data: { isApproved: input.action === "approve" },
        });
      }
    }

    if (input.type === "dispute") {
      await prisma.dispute.update({
        where: { id: input.id },
        data: {
          status: input.action === "resolve" ? "RESOLVED" : "REJECTED",
          resolution: input.resolution,
        },
      });
    }

    return ok({ updated: true });
  } catch (error) {
    return handleError(error);
  }
}
