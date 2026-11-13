import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { categorySchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireApiUser("admin");
    const { id } = await params;
    const input = categorySchema.parse(await readJson(request));
    if (input.parentId === id) return fail("A category cannot be its own parent.", 422);
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return fail("Category not found.", 404);
    const category = await prisma.category.update({ where: { id }, data: input });
    return ok({ category });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireApiUser("admin");
    const { id } = await params;
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { books: true, children: true } } },
    });
    if (!existing) return fail("Category not found.", 404);
    if (existing._count.books > 0 || existing._count.children > 0) {
      return fail("Move or remove this category's books and subcategories first.", 409);
    }
    await prisma.category.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
