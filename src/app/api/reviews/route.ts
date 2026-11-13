import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { refreshBookRating } from "@/lib/commerce";
import { prisma } from "@/lib/db";
import { reviewSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = reviewSchema.parse(await readJson(request));
    const book = await prisma.book.findFirst({
      where: { id: input.bookId, isActive: true },
      include: { shop: { select: { ownerId: true } } },
    });
    if (!book) return fail("Book not found.", 404);

    const verifiedPurchase = await prisma.orderItem.findFirst({
      where: {
        bookId: book.id,
        order: { userId: user.id, status: "DELIVERED" },
      },
      select: { id: true },
    });

    const review = await prisma.review.upsert({
      where: { bookId_userId: { bookId: book.id, userId: user.id } },
      update: {
        rating: input.rating,
        title: input.title,
        body: input.body,
        isVerified: Boolean(verifiedPurchase),
      },
      create: {
        bookId: book.id,
        userId: user.id,
        rating: input.rating,
        title: input.title,
        body: input.body,
        isVerified: Boolean(verifiedPurchase),
      },
    });

    await refreshBookRating(book.id);
    await prisma.notification.create({
      data: {
        userId: book.shop.ownerId,
        type: "REVIEW",
        title: "New review received",
        message: `${user.name} reviewed ${book.title}.`,
        href: "/seller/reviews",
      },
    });

    return ok({ review }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireApiUser();
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");
    if (!bookId) return fail("Book id is required.", 422);
    const review = await prisma.review.findUnique({
      where: { bookId_userId: { bookId, userId: user.id } },
    });
    if (!review) return fail("Review not found.", 404);
    await prisma.review.delete({ where: { id: review.id } });
    await refreshBookRating(bookId);
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
