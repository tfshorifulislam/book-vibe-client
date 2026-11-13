import type { Metadata } from "next";

import { CollectionPage } from "@/components/marketplace/collection-page";
import { getBookCards } from "@/lib/data/books";

export const metadata: Metadata = { title: "Deals & discounts" };

export default async function DealsPage() {
  const { books, total } = await getBookCards({ onSale: true, sort: "price-asc", limit: 100 });
  return (
    <CollectionPage
      eyebrow="Save more"
      title="Deals & discounts"
      description="Discounted new and used books from sellers across Bangladesh."
      count={total}
      books={books}
    />
  );
}
