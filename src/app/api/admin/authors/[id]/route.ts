import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { authorSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireApiUser("admin");
    const { id } = await params;
    const input = authorSchema.parse(await readJson(request));
    const author = await prisma.author.update({ where: { id }, data: input });
    return ok({ author });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireApiUser("admin");
    const { id } = await params;
    const existing = await prisma.author.findUnique({
      where: { id },
      include: { _count: { select: { books: true } } },
    });
    if (!existing) return fail("Author not found.", 404);
    if (existing._count.books > 0) {
      return fail("Reassign this author's books before deleting.", 409);
    }
    await prisma.author.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
