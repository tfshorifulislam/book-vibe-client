import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { authorSchema } from "@/lib/validators";

export async function GET() {
  try {
    await requireApiUser("admin");
    const authors = await prisma.author.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { name: "asc" },
    });
    return ok({ authors });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiUser("admin");
    const input = authorSchema.parse(await readJson(request));
    const existing = await prisma.author.findUnique({ where: { slug: input.slug } });
    if (existing) return fail("That author slug is already in use.", 409);
    const author = await prisma.author.create({ data: input });
    return ok({ author }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
