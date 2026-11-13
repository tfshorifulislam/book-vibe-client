import type { Metadata } from "next";

import { WishlistClient } from "@/components/buyer/wishlist-client";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireRole } from "@/lib/auth/session";
import { bookCardSelect, toBookCard } from "@/lib/data/books";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await requireRole("buyer");
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: { book: { select: bookCardSelect } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  const items = (wishlist?.items ?? []).map((item) => ({
    itemId: item.id,
    book: toBookCard(item.book),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Wishlist" description={`${items.length} saved book${items.length === 1 ? "" : "s"}`} />
      <WishlistClient initialItems={items} />
    </div>
  );
}
