import type { Metadata } from "next";

import { CollectionPage } from "@/components/marketplace/collection-page";
import { getBookCards } from "@/lib/data/books";

export const metadata: Metadata = { title: "Featured books" };

export default async function FeaturedBooksPage() {
  const { books, total } = await getBookCards({
    featured: true,
    sort: "popular",
    limit: 100,
  });
  return (
    <CollectionPage
      eyebrow="Editor's picks"
      title="Featured books"
      description="Hand-picked titles worth adding to your shelf."
      count={total}
      books={books}
    />
  );
}
