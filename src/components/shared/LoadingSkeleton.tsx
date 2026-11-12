import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
    />
  );
}

export function SectionHeadingSkeleton({ align = "left" }: { align?: "left" | "center" }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center",
      )}
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-64 max-w-full sm:w-80" />
      <Skeleton className="h-4 w-full max-w-xl" />
    </div>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

export function BookGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <BookCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Skeleton className="size-11 rounded-lg" />
      <Skeleton className="mt-4 h-4 w-2/3" />
      <Skeleton className="mt-2 h-3 w-1/2" />
    </div>
  );
}

export function SellerCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-3/4" />
      <Skeleton className="mt-4 h-9 w-full" />
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48 rounded-full" />
          <Skeleton className="h-14 w-full max-w-lg" />
          <Skeleton className="h-14 w-3/4 max-w-md" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-12 w-full max-w-lg rounded-xl" />
          <div className="flex gap-3">
            <Skeleton className="h-11 w-36 rounded-xl" />
            <Skeleton className="h-11 w-32 rounded-xl" />
          </div>
        </div>
        <Skeleton className="mx-auto aspect-[4/3] w-full max-w-md rounded-3xl" />
      </div>
      <div className="mt-20 space-y-6">
        <SectionHeadingSkeleton />
        <BookGridSkeleton count={4} />
      </div>
    </div>
  );
}
