import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Home, LayoutGrid } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <BookOpen className="size-6" aria-hidden="true" />
      </span>

      <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
        404 — Page not found
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
        This page is missing from our shelves
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
        The page you are looking for may have been moved, removed, or never
        existed.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Home className="size-4" aria-hidden="true" />
          Back to Home
        </Link>
        <Link
          href="/#categories"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <LayoutGrid className="size-4" aria-hidden="true" />
          Browse Categories
        </Link>
      </div>
    </div>
  );
}
