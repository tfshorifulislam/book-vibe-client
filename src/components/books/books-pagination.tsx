"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPageNumbers } from "@/lib/books";
import { cn } from "@/lib/utils";

interface BooksPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BooksPagination({
  page,
  totalPages,
  onPageChange,
}: BooksPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Books pagination"
      className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row"
    >
      <p className="text-xs text-muted-foreground">
        Page <span className="font-semibold text-foreground">{page}</span> of{" "}
        {totalPages}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </button>

        <ul className="flex flex-wrap items-center justify-center gap-1">
          {getPageNumbers(page, totalPages).map((item, index) =>
            item === "ellipsis" ? (
              <li
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="inline-flex size-9 items-center justify-center text-xs text-muted-foreground"
              >
                …
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => onPageChange(item)}
                  aria-current={item === page ? "page" : undefined}
                  aria-label={`Go to page ${item}`}
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-lg border text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    item === page
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/40 hover:text-primary",
                  )}
                >
                  {item}
                </button>
              </li>
            ),
          )}
        </ul>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:text-foreground"
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
