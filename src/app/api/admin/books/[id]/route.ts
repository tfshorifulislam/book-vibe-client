import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isNewArrival: z.coerce.boolean().optional(),
  isBestSeller: z.coerce.boolean().optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await requireApiUser("admin");
    const { id } = await params;
    const input = schema.parse(await readJson(request));
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) return fail("Book not found.", 404);
    const book = await prisma.book.update({
      where: { id },
      data: input,
    });
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "BOOK_MODERATED",
        entity: "Book",
        entityId: id,
        metadata: JSON.stringify(input),
      },
    });
    return ok({ book });
  } catch (error) {
    return handleError(error);
  }
}
