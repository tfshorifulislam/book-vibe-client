"use client";

import { ChevronDown, X } from "lucide-react";
import {
  BOOK_SORT_OPTIONS,
  type BookAvailability,
  type BookSort,
} from "@/lib/books";
import { cn, formatNumber } from "@/lib/utils";
import type { Book } from "@/types/book";
import type { Category } from "@/types/category";
import { BooksFilters } from "./books-filters";
import { BooksSearch } from "./books-search";

export interface ActiveBookFilter {
  id: string;
  label: string;
  onRemove: () => void;
}

interface BooksToolbarProps {
  query: string;
  sort: BookSort;
  categories: Category[];
  books: Book[];
  authors: string[];
  category: string;
  author: string;
  availability: BookAvailability;
  minPrice: string;
  maxPrice: string;
  priceBounds: { min: number; max: number };
  activeFilters: ActiveBookFilter[];
  hasActiveFilters: boolean;
  resultCount: number;
  totalCount: number;
  onQueryChange: (value: string) => void;
  onSortChange: (value: BookSort) => void;
  onCategoryChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
  onAvailabilityChange: (value: BookAvailability) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onClearFilters: () => void;
}

export function BooksToolbar({
  query,
  sort,
  categories,
  books,
  authors,
  category,
  author,
  availability,
  minPrice,
  maxPrice,
  priceBounds,
  activeFilters,
  hasActiveFilters,
  resultCount,
  totalCount,
  onQueryChange,
  onSortChange,
  onCategoryChange,
  onAuthorChange,
  onAvailabilityChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClearFilters,
}: BooksToolbarProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <BooksSearch value={query} onChange={onQueryChange} />
        </div>

        <div className="w-full space-y-1.5 lg:w-60">
          <label
            htmlFor="filter-sort"
            className="text-xs font-medium text-muted-foreground"
          >
            Sort by
          </label>
          <div className="relative">
            <select
              id="filter-sort"
              value={sort}
              onChange={(event) => onSortChange(event.target.value as BookSort)}
              className="h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-9 text-sm text-foreground transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
            >
              {BOOK_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <BooksFilters
        categories={categories}
        books={books}
        authors={authors}
        category={category}
        author={author}
        availability={availability}
        minPrice={minPrice}
        maxPrice={maxPrice}
        priceBounds={priceBounds}
        onCategoryChange={onCategoryChange}
        onAuthorChange={onAuthorChange}
        onAvailabilityChange={onAvailabilityChange}
        onMinPriceChange={onMinPriceChange}
        onMaxPriceChange={onMaxPriceChange}
      />

      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p
            aria-live="polite"
            className="text-xs text-muted-foreground sm:text-sm"
          >
            Showing{" "}
            <span className="font-semibold text-foreground">
              {formatNumber(resultCount)}
            </span>{" "}
            of {formatNumber(totalCount)} {totalCount === 1 ? "book" : "books"}
          </p>
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              hasActiveFilters
                ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                : "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-60",
            )}
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear all filters
          </button>
        </div>

        {activeFilters.length > 0 ? (
          <ul
            aria-label="Active filters"
            className="flex flex-wrap items-center gap-2"
          >
            {activeFilters.map((filter) => (
              <li key={filter.id} className="max-w-full">
                <button
                  type="button"
                  onClick={filter.onRemove}
                  aria-label={`Remove ${filter.label} filter`}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span className="truncate">{filter.label}</span>
                  <X className="size-3 shrink-0" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
