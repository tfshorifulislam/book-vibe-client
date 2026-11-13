import type { Metadata } from "next";

import { CollectionPage } from "@/components/marketplace/collection-page";
import { getBookCards } from "@/lib/data/books";

export const metadata: Metadata = { title: "New arrivals" };

export default async function NewArrivalsPage() {
  const { books, total } = await getBookCards({ sort: "newest", limit: 100 });
  return (
    <CollectionPage
      eyebrow="Just listed"
      title="New arrivals"
      description="The latest books added to BookHand by our sellers."
      count={total}
      books={books}
    />
  );
}
