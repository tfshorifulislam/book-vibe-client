import "server-only";

import { calculateShipping, getCommerceSettings } from "@/lib/commerce";
import { prisma } from "@/lib/db";
import { bookCardSelect, toBookCard } from "@/lib/data/books";

export async function getCartForUser(userId: string) {
  const cart = await prisma.cart.upsert({
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

  const settings = await getCommerceSettings();
  const items = cart.items.map((item) => ({
    itemId: item.id,
    quantity: item.quantity,
    book: toBookCard(item.book),
    subtotal: item.book.price * item.quantity,
    availableStock: item.book.stock,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = calculateShipping(subtotal, settings);

  return {
    id: cart.id,
    items,
    count,
    subtotal,
    shipping,
    total: subtotal + shipping,
    settings,
  };
}
