import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { publisherSchema } from "@/lib/validators";

export async function GET() {
  try {
    await requireApiUser("admin");
    const publishers = await prisma.publisher.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { name: "asc" },
    });
    return ok({ publishers });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiUser("admin");
    const input = publisherSchema.parse(await readJson(request));
    const existing = await prisma.publisher.findUnique({ where: { slug: input.slug } });
    if (existing) return fail("That publisher slug is already in use.", 409);
    const publisher = await prisma.publisher.create({ data: input });
    return ok({ publisher }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
