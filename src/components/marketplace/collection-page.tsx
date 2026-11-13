import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { BookGrid } from "@/components/shared/BookGrid";
import type { Book } from "@/types/book";

export function CollectionPage({
  eyebrow,
  title,
  description,
  count,
  books,
  breadcrumbs = [],
  action,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  count?: number;
  books: Book[];
  breadcrumbs?: { label: string; href: string }[];
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1">
            <ChevronRight className="size-3" />
            <Link href={crumb.href} className="hover:text-primary">{crumb.label}</Link>
          </span>
        ))}
      </nav>

      <div className="mt-5 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
          ) : null}
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
          {count !== undefined ? (
            <p className="mt-2 text-xs text-muted-foreground">{count} books</p>
          ) : null}
        </div>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </div>

      {children ? <div className="mt-6">{children}</div> : null}

      <div className="mt-6">
        <BookGrid
          books={books}
          emptyTitle="No books here yet"
          emptyDescription="New titles will appear as sellers list them."
          emptyAction={{ label: "Browse all books", href: "/books" }}
        />
      </div>
    </div>
  );
}
