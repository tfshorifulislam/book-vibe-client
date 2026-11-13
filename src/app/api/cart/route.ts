import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { getCartForUser } from "@/lib/data/cart";
import { prisma } from "@/lib/db";
import { cartItemSchema, cartUpdateSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireApiUser();
    const cart = await getCartForUser(user.id);
    return ok(cart);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = cartItemSchema.parse(await readJson(request));
    const book = await prisma.book.findFirst({
      where: { id: input.bookId, isActive: true },
      select: { id: true, stock: true },
    });
    if (!book) return fail("This book is not available.", 404);
    if (book.stock <= 0) return fail("This book is out of stock.", 409);

    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_bookId: { cartId: cart.id, bookId: book.id } },
    });
    const quantity = Math.min(
      book.stock,
      (existing?.quantity ?? 0) + input.quantity,
    );

    await prisma.cartItem.upsert({
      where: { cartId_bookId: { cartId: cart.id, bookId: book.id } },
      update: { quantity },
      create: { cartId: cart.id, bookId: book.id, quantity },
    });

    return ok(await getCartForUser(user.id));
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const input = cartUpdateSchema.parse(await readJson(request));
    const item = await prisma.cartItem.findFirst({
      where: { id: input.itemId, cart: { userId: user.id } },
      include: { book: { select: { stock: true } } },
    });
    if (!item) return fail("Cart item not found.", 404);

    if (input.quantity === 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: Math.min(input.quantity, item.book.stock) },
      });
    }

    return ok(await getCartForUser(user.id));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireApiUser();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (itemId) {
      await prisma.cartItem.deleteMany({
        where: { id: itemId, cart: { userId: user.id } },
      });
    } else {
      await prisma.cartItem.deleteMany({
        where: { cart: { userId: user.id } },
      });
    }

    return ok(await getCartForUser(user.id));
  } catch (error) {
    return handleError(error);
  }
}
