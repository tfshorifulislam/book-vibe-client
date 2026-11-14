"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function BooksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        We could not load the books
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Something went wrong while loading the collection. Check your connection
        and try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        Try Again
      </button>
    </div>
  );
}
