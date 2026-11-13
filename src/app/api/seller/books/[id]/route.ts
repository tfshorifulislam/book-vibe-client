import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { bookSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

async function ownedBook(id: string, userId: string) {
  return prisma.book.findFirst({
    where: { id, shop: { ownerId: userId } },
    include: { shop: { select: { ownerId: true } } },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireApiUser("seller");
    const { id } = await params;
    const existing = await ownedBook(id, user.id);
    if (!existing) return fail("Book not found.", 404);
    const input = bookSchema.parse(await readJson(request));

    const stockDelta = input.stock - existing.stock;
    const book = await prisma.book.update({
      where: { id },
      data: {
        title: input.title,
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
        isActive: input.isActive ?? existing.isActive,
        ...(stockDelta !== 0
          ? {
              movements: {
                create: {
                  type: "ADJUSTMENT",
                  quantity: stockDelta,
                  note: "Stock adjusted by seller",
                },
              },
            }
          : {}),
      },
    });

    return ok({ book });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireApiUser("seller");
    const { id } = await params;
    const existing = await ownedBook(id, user.id);
    if (!existing) return fail("Book not found.", 404);
    await prisma.book.update({ where: { id }, data: { isActive: false } });
    return ok({ archived: true });
  } catch (error) {
    return handleError(error);
  }
}
