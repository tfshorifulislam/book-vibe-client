import type { Metadata } from "next";
import { Suspense } from "react";

import { CollectionPage } from "@/components/marketplace/collection-page";
import { getBookCards } from "@/lib/data/books";

export const metadata: Metadata = { title: "Search" };

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function SearchPage({ searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10">Searching books…</div>
      }
    >
      <SearchResults searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchResults({ searchParams }: Props) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const { books, total } = q
    ? await getBookCards({ q, limit: 100, sort: "popular" })
    : { books: [], total: 0 };

  return (
    <CollectionPage
      eyebrow="Search"
      title={q ? `Results for “${q}”` : "Search BookHand"}
      description={
        q
          ? "Titles, authors, publishers, and shops matching your search."
          : "Use the search box to find a title, author, ISBN, or publisher."
      }
      count={q ? total : undefined}
      books={books}
    />
  );
}
