"use client";

import { EmptyState } from "@/components/shared/EmptyState";

interface BooksEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function BooksEmptyState({
  hasActiveFilters,
  onClearFilters,
}: BooksEmptyStateProps) {
  return (
    <EmptyState
      icon="Search"
      title="No books found"
      description={
        hasActiveFilters
          ? "We could not find any books matching your search and filters. Try adjusting them or clear all filters to see the full collection."
          : "There are no books available right now. Please check back soon as sellers add new listings."
      }
    >
      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Clear Filters
        </button>
      ) : null}
    </EmptyState>
  );
}
