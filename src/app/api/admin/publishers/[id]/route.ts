import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { publisherSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireApiUser("admin");
    const { id } = await params;
    const input = publisherSchema.parse(await readJson(request));
    const publisher = await prisma.publisher.update({
      where: { id },
      data: input,
    });
    return ok({ publisher });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireApiUser("admin");
    const { id } = await params;
    const existing = await prisma.publisher.findUnique({
      where: { id },
      include: { _count: { select: { books: true } } },
    });
    if (!existing) return fail("Publisher not found.", 404);
    if (existing._count.books > 0) {
      return fail("Reassign this publisher's books before deleting.", 409);
    }
    await prisma.publisher.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
