import type { Metadata } from "next";
import { Suspense } from "react";
import { BooksLoading } from "@/components/books/books-loading";
import { BooksPage } from "@/components/books/books-page";
import { parseBookSort } from "@/lib/books";
import { getAllBooks, getCategories } from "@/lib/services/catalog";

export const metadata: Metadata = {
  title: "Explore Books",
  description:
    "Browse the BookHand collection by category, author, price, and availability. Discover your next favorite book.",
};

interface BooksRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function Page({ searchParams }: BooksRouteProps) {
  return (
    <Suspense fallback={<BooksLoading />}>
      <BooksRoute searchParams={searchParams} />
    </Suspense>
  );
}

async function BooksRoute({ searchParams }: BooksRouteProps) {
  const [books, categories, params] = await Promise.all([
    getAllBooks(),
    getCategories(),
    searchParams,
  ]);

  const initialQuery = typeof params.q === "string" ? params.q : "";
  const initialCategory =
    typeof params.category === "string" ? params.category : "";
  const initialSort = parseBookSort(
    typeof params.sort === "string" ? params.sort : undefined,
  );

  return (
    <BooksPage
      books={books}
      categories={categories}
      initialQuery={initialQuery}
      initialCategory={initialCategory}
      initialSort={initialSort}
    />
  );
}
