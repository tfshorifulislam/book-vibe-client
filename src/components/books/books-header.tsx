import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface BooksHeaderProps {
  totalBooks: number;
}

export function BooksHeader({ totalBooks }: BooksHeaderProps) {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <li>
              <Link
                href="/"
                className="rounded transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li>
              <span aria-current="page" className="font-medium text-foreground">
                Books
              </span>
            </li>
          </ol>
        </nav>

        <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              <span aria-hidden="true" className="h-px w-6 bg-primary/60" />
              Book catalogue
            </p>
            <h1
              id="books-heading"
              className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Explore Books
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Discover your next favorite book from our collection.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-card)]">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg leading-tight font-bold text-foreground">
                {formatNumber(totalBooks)}
              </p>
              <p className="text-xs text-muted-foreground">
                {totalBooks === 1 ? "book available" : "books available"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
