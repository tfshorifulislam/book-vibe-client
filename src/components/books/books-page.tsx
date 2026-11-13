"use client";

import { useMemo, useRef, useState } from "react";
import {
  BOOKS_PAGE_SIZE,
  buildCategoryMap,
  filterAndSortBooks,
  getPriceBounds,
  type BookAvailability,
  type BookSort,
} from "@/lib/books";
import { CURRENCY } from "@/lib/constants";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import type { Book } from "@/types/book";
import type { Category } from "@/types/category";
import { BooksCategories } from "./books-categories";
import { BooksEmptyState } from "./books-empty-state";
import { BooksGrid } from "./books-grid";
import { BooksHeader } from "./books-header";
import { BooksPagination } from "./books-pagination";
import { BooksToolbar, type ActiveBookFilter } from "./books-toolbar";

interface BooksPageProps {
  books: Book[];
  categories: Category[];
  initialQuery?: string;
  initialCategory?: string;
  initialSort?: BookSort;
}

export function BooksPage({
  books,
  categories,
  initialQuery = "",
  initialCategory = "",
  initialSort = "featured",
}: BooksPageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [author, setAuthor] = useState("");
  const [availability, setAvailability] = useState<BookAvailability>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<BookSort>(initialSort);
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLElement>(null);

  const debouncedQuery = useDebouncedValue(query, 300);

  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories]);

  const authors = useMemo(
    () =>
      Array.from(new Set(books.map((book) => book.author))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [books],
  );

  const priceBounds = useMemo(() => getPriceBounds(books), [books]);

  const filteredBooks = useMemo(
    () =>
      filterAndSortBooks(books, {
        query: debouncedQuery,
        category,
        author,
        minPrice,
        maxPrice,
        availability,
        sort,
      }),
    [
      books,
      debouncedQuery,
      category,
      author,
      minPrice,
      maxPrice,
      availability,
      sort,
    ],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBooks.length / BOOKS_PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageBooks = filteredBooks.slice(
    (safePage - 1) * BOOKS_PAGE_SIZE,
    safePage * BOOKS_PAGE_SIZE,
  );
  const firstResult = (safePage - 1) * BOOKS_PAGE_SIZE + 1;
  const lastResult = Math.min(safePage * BOOKS_PAGE_SIZE, filteredBooks.length);

  const hasActiveFilters = Boolean(
    query.trim() ||
    category ||
    author ||
    minPrice ||
    maxPrice ||
    availability !== "all",
  );

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  function updateAuthor(value: string) {
    setAuthor(value);
    setPage(1);
  }

  function updateAvailability(value: BookAvailability) {
    setAvailability(value);
    setPage(1);
  }

  function updateMinPrice(value: string) {
    setMinPrice(value);
    setPage(1);
  }

  function updateMaxPrice(value: string) {
    setMaxPrice(value);
    setPage(1);
  }

  function updateSort(value: BookSort) {
    setSort(value);
    setPage(1);
  }

  function clearFilters() {
    setQuery("");
    setCategory("");
    setAuthor("");
    setAvailability("all");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
    resultsRef.current?.scrollIntoView({ block: "start" });
  }

  const activeFilters: ActiveBookFilter[] = [];

  if (query.trim()) {
    activeFilters.push({
      id: "query",
      label: `Search: “${query.trim()}”`,
      onRemove: () => updateQuery(""),
    });
  }

  if (category) {
    activeFilters.push({
      id: "category",
      label: `Category: ${categoryMap.get(category)?.name ?? category}`,
      onRemove: () => updateCategory(""),
    });
  }

  if (author) {
    activeFilters.push({
      id: "author",
      label: `Author: ${author}`,
      onRemove: () => updateAuthor(""),
    });
  }

  if (minPrice || maxPrice) {
    activeFilters.push({
      id: "price",
      label: `Price: ${CURRENCY.symbol}${minPrice || priceBounds.min} – ${CURRENCY.symbol}${maxPrice || priceBounds.max}`,
      onRemove: () => {
        setMinPrice("");
        setMaxPrice("");
        setPage(1);
      },
    });
  }

  if (availability !== "all") {
    activeFilters.push({
      id: "availability",
      label:
        availability === "in-stock"
          ? "Availability: In stock"
          : "Availability: Out of stock",
      onRemove: () => updateAvailability("all"),
    });
  }

  return (
    <div className="flex flex-col">
      <BooksHeader totalBooks={books.length} />

      <BooksCategories
        categories={categories}
        books={books}
        selectedCategory={category}
        onSelectCategory={updateCategory}
      />

      <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <BooksToolbar
          query={query}
          sort={sort}
          categories={categories}
          books={books}
          authors={authors}
          category={category}
          author={author}
          availability={availability}
          minPrice={minPrice}
          maxPrice={maxPrice}
          priceBounds={priceBounds}
          activeFilters={activeFilters}
          hasActiveFilters={hasActiveFilters}
          resultCount={filteredBooks.length}
          totalCount={books.length}
          onQueryChange={updateQuery}
          onSortChange={updateSort}
          onCategoryChange={updateCategory}
          onAuthorChange={updateAuthor}
          onAvailabilityChange={updateAvailability}
          onMinPriceChange={updateMinPrice}
          onMaxPriceChange={updateMaxPrice}
          onClearFilters={clearFilters}
        />

        <section
          ref={resultsRef}
          aria-labelledby="books-results-heading"
          className="mt-6 scroll-mt-24"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2
              id="books-results-heading"
              className="text-base font-semibold text-foreground"
            >
              Book results
            </h2>
            {pageBooks.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {firstResult}–{lastResult}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filteredBooks.length}
                </span>{" "}
                {filteredBooks.length === 1 ? "book" : "books"}
              </p>
            ) : null}
          </div>

          {pageBooks.length > 0 ? (
            <BooksGrid books={pageBooks} categoryMap={categoryMap} />
          ) : (
            <BooksEmptyState
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          )}

          <BooksPagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      </div>
    </div>
  );
}
