import type { Metadata } from "next";

import { CollectionPage } from "@/components/marketplace/collection-page";
import { getBookCards } from "@/lib/data/books";

export const metadata: Metadata = { title: "Best sellers" };

export default async function BestSellersPage() {
  const { books, total } = await getBookCards({ sort: "popular", limit: 100 });
  return (
    <CollectionPage
      eyebrow="Reader favourites"
      title="Best sellers"
      description="The most purchased books on BookHand right now."
      count={total}
      books={books}
    />
  );
}
