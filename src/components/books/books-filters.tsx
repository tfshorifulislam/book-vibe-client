"use client";

import { ChevronDown } from "lucide-react";
import {
  BOOK_AVAILABILITY_OPTIONS,
  countBooksInCategory,
  type BookAvailability,
} from "@/lib/books";
import { CURRENCY } from "@/lib/constants";
import { cn, formatNumber } from "@/lib/utils";
import type { Book } from "@/types/book";
import type { Category } from "@/types/category";

interface BooksFiltersProps {
  categories: Category[];
  books: Book[];
  authors: string[];
  category: string;
  author: string;
  availability: BookAvailability;
  minPrice: string;
  maxPrice: string;
  priceBounds: { min: number; max: number };
  onCategoryChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
  onAvailabilityChange: (value: BookAvailability) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

const controlClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none";

export function BooksFilters({
  categories,
  books,
  authors,
  category,
  author,
  availability,
  minPrice,
  maxPrice,
  priceBounds,
  onCategoryChange,
  onAuthorChange,
  onAvailabilityChange,
  onMinPriceChange,
  onMaxPriceChange,
}: BooksFiltersProps) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1.5">
        <label
          htmlFor="filter-category"
          className="text-xs font-medium text-muted-foreground"
        >
          Category
        </label>
        <div className="relative">
          <select
            id="filter-category"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className={cn(controlClass, "appearance-none pr-9")}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name} (
                {formatNumber(countBooksInCategory(books, item.slug))})
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="filter-author"
          className="text-xs font-medium text-muted-foreground"
        >
          Author
        </label>
        <div className="relative">
          <select
            id="filter-author"
            value={author}
            onChange={(event) => onAuthorChange(event.target.value)}
            className={cn(controlClass, "appearance-none pr-9")}
          >
            <option value="">All authors</option>
            {authors.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="filter-availability"
          className="text-xs font-medium text-muted-foreground"
        >
          Availability
        </label>
        <div className="relative">
          <select
            id="filter-availability"
            value={availability}
            onChange={(event) =>
              onAvailabilityChange(event.target.value as BookAvailability)
            }
            className={cn(controlClass, "appearance-none pr-9")}
          >
            {BOOK_AVAILABILITY_OPTIONS.map((option) => (
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

      <fieldset className="space-y-1.5">
        <legend className="text-xs font-medium text-muted-foreground">
          Price range ({CURRENCY.code})
        </legend>
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground"
            >
              {CURRENCY.symbol}
            </span>
            <input
              id="filter-price-min"
              type="number"
              inputMode="numeric"
              min={0}
              max={priceBounds.max}
              step={10}
              value={minPrice}
              onChange={(event) => onMinPriceChange(event.target.value)}
              placeholder={String(priceBounds.min)}
              aria-label="Minimum price"
              className={cn(
                controlClass,
                "[appearance:textfield] py-2 pr-2 pl-6 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              )}
            />
          </div>
          <span aria-hidden="true" className="text-xs text-muted-foreground">
            –
          </span>
          <div className="relative min-w-0 flex-1">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground"
            >
              {CURRENCY.symbol}
            </span>
            <input
              id="filter-price-max"
              type="number"
              inputMode="numeric"
              min={0}
              max={priceBounds.max}
              step={10}
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(event.target.value)}
              placeholder={String(priceBounds.max)}
              aria-label="Maximum price"
              className={cn(
                controlClass,
                "[appearance:textfield] py-2 pr-2 pl-6 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              )}
            />
          </div>
        </div>
      </fieldset>
    </div>
  );
}
