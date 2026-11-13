import { z } from "zod";

import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { bookCardSelect, toBookCard } from "@/lib/data/books";
import { prisma } from "@/lib/db";

const wishlistSchema = z.object({ bookId: z.string().min(1) });

async function getWishlist(userId: string) {
  const wishlist = await prisma.wishlist.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: { book: { select: bookCardSelect } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return {
    id: wishlist.id,
    items: wishlist.items.map((item) => ({
      itemId: item.id,
      book: toBookCard(item.book),
    })),
  };
}

export async function GET() {
  try {
    const user = await requireApiUser();
    return ok(await getWishlist(user.id));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const { bookId } = wishlistSchema.parse(await readJson(request));
    const book = await prisma.book.findFirst({
      where: { id: bookId, isActive: true },
      select: { id: true },
    });
    if (!book) return fail("Book not found.", 404);

    const wishlist = await prisma.wishlist.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
    await prisma.wishlistItem.upsert({
      where: { wishlistId_bookId: { wishlistId: wishlist.id, bookId } },
      update: {},
      create: { wishlistId: wishlist.id, bookId },
    });

    return ok(await getWishlist(user.id));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireApiUser();
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");

    if (bookId) {
      await prisma.wishlistItem.deleteMany({
        where: { bookId, wishlist: { userId: user.id } },
      });
    } else {
      await prisma.wishlistItem.deleteMany({
        where: { wishlist: { userId: user.id } },
      });
    }

    return ok(await getWishlist(user.id));
  } catch (error) {
    return handleError(error);
  }
}
