import {
  BookCardSkeleton,
  Skeleton,
} from "@/components/shared/LoadingSkeleton";

export function BooksLoading() {
  return (
    <div aria-busy="true" aria-label="Loading books">
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Skeleton className="h-3 w-40" />
          <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full max-w-2xl space-y-3">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-72 max-w-full" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <Skeleton className="h-20 w-44 rounded-xl" />
          </div>
        </div>
      </section>

      <div className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-40" />
          <div className="mt-3 flex gap-2 overflow-hidden">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-9 w-28 shrink-0 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <Skeleton className="h-10 w-full flex-1 rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg lg:w-56" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>

        <Skeleton className="mt-6 h-4 w-48" />

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <BookCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
