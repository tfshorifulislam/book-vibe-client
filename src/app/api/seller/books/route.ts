import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";
import { bookSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireApiUser("seller");
    const shop = await prisma.shop.findUnique({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!shop) return ok({ books: [] });

    const books = await prisma.book.findMany({
      where: { shopId: shop.id },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
        publisher: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok({ books });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser("seller");
    const input = bookSchema.parse(await readJson(request));
    const shop = await prisma.shop.findUnique({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!shop) return fail("Create your shop profile first.", 409);

    const [author, category, publisher] = await Promise.all([
      prisma.author.findUnique({ where: { id: input.authorId } }),
      prisma.category.findUnique({ where: { id: input.categoryId } }),
      input.publisherId
        ? prisma.publisher.findUnique({ where: { id: input.publisherId } })
        : Promise.resolve(null),
    ]);
    if (!author) return fail("Choose a valid author.", 422);
    if (!category) return fail("Choose a valid category.", 422);
    if (input.publisherId && !publisher) {
      return fail("Choose a valid publisher.", 422);
    }

    const slug =
      input.slug ||
      (await uniqueSlug(input.title, async (candidate) =>
        Boolean(await prisma.book.findUnique({ where: { slug: candidate } })),
      ));

    const book = await prisma.book.create({
      data: {
        title: input.title,
        slug: slugify(slug),
        description: input.description,
        authorId: input.authorId,
        categoryId: input.categoryId,
        publisherId: input.publisherId,
        isbn: input.isbn,
        language: input.language,
        edition: input.edition,
        pageCount: input.pageCount,
        publicationDate: input.publicationDate,
        coverImage: input.coverImage,
        coverTone: input.coverTone,
        condition: input.condition,
        listingType: input.listingType,
        price: input.price,
        originalPrice: input.originalPrice,
        stock: input.stock,
        lowStockAlert: input.lowStockAlert,
        isNewArrival: true,
        isActive: input.isActive ?? true,
        shopId: shop.id,
        listedAt: new Date(),
        movements: {
          create: {
            type: "LISTING",
            quantity: input.stock,
            note: "Initial stock",
          },
        },
      },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "BOOK_CREATED",
        entity: "Book",
        entityId: book.id,
        metadata: JSON.stringify({ title: book.title }),
      },
    });

    return ok({ book }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
