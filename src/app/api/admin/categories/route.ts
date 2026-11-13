import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { categorySchema } from "@/lib/validators";

export async function GET() {
  try {
    await requireApiUser("admin");
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { books: true } },
        parent: { select: { name: true } },
      },
      orderBy: [{ parentId: "asc" }, { order: "asc" }],
    });
    return ok({ categories });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiUser("admin");
    const input = categorySchema.parse(await readJson(request));
    const existing = await prisma.category.findUnique({
      where: { slug: input.slug },
    });
    if (existing) return fail("That category slug is already in use.", 409);
    const category = await prisma.category.create({ data: input });
    return ok({ category }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
