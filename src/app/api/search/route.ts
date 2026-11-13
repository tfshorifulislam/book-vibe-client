import { handleError, ok } from "@/lib/api";
import { getBookCards } from "@/lib/data/books";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim();
    if (!q) {
      return ok({ books: [], categories: [], authors: [] });
    }

    const [books, categories, authors] = await Promise.all([
      getBookCards({ q, limit: 6, sort: "popular" }),
      prisma.category.findMany({
        where: { isActive: true, name: { contains: q } },
        select: { id: true, name: true, slug: true },
        take: 4,
      }),
      prisma.author.findMany({
        where: { name: { contains: q } },
        select: { id: true, name: true, slug: true },
        take: 4,
      }),
    ]);

    return ok({ books: books.books, categories, authors });
  } catch (error) {
    return handleError(error);
  }
}
