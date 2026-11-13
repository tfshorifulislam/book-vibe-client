"use client";

import { Search, X } from "lucide-react";

interface BooksSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function BooksSearch({ value, onChange }: BooksSearchProps) {
  return (
    <div className="relative w-full">
      <label htmlFor="books-search" className="sr-only">
        Search books by title or author
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        id="books-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by title or author..."
        autoComplete="off"
        className="h-10 w-full rounded-lg border border-input bg-background py-2 pr-10 pl-9 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-1.5 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
