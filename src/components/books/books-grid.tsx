"use client";

import { BookCard } from "@/components/shared/BookCard";
import { getCategoryName } from "@/lib/books";
import type { Book } from "@/types/book";
import type { Category } from "@/types/category";

interface BooksGridProps {
  books: Book[];
  categoryMap: Map<string, Category>;
}

export function BooksGrid({ books, categoryMap }: BooksGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          category={getCategoryName(categoryMap, book.categorySlug)}
          badge={
            book.listingType === "USED"
              ? "used"
              : book.isNewArrival
                ? "new"
                : undefined
          }
          showDetails
        />
      ))}
    </div>
  );
}
