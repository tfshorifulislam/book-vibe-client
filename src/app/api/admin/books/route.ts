import { handleError, ok, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    await requireApiUser("admin");
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const status = searchParams.get("status");
    const books = await prisma.book.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { title: { contains: q } },
                { isbn: { contains: q } },
              ],
            }
          : {}),
        ...(status === "active"
          ? { isActive: true }
          : status === "inactive"
            ? { isActive: false }
            : {}),
      },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
        shop: { select: { name: true, ownerId: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return ok({ books });
  } catch (error) {
    return handleError(error);
  }
}
