import { BookOpen, Star, Store } from "lucide-react";
import { BookCover } from "@/components/shared/BookCover";
import { formatPrice } from "@/lib/utils";
import type { Book } from "@/types/book";

interface HeroVisualProps {
  books: Book[];
}

export function HeroVisual({ books }: HeroVisualProps) {
  const [main, left, right] = books;

  if (!main) {
    return (
      <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center rounded-3xl border border-dashed border-border bg-muted/40">
        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-card text-primary shadow-[var(--shadow-card)]">
            <BookOpen className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-medium text-foreground">
            Featured books will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        aria-hidden="true"
        className="absolute inset-4 rounded-[2.5rem] bg-[image:var(--gradient-subtle)] opacity-80 blur-2xl"
      />

      <div className="relative flex min-h-[26rem] items-center justify-center py-8 sm:min-h-[30rem]">
        <div
          aria-hidden="true"
          className="absolute size-72 rounded-full border border-primary/10 sm:size-80"
        />
        <div
          aria-hidden="true"
          className="absolute size-56 rounded-full border border-secondary/20 sm:size-64"
        />

        {left ? (
          <div className="absolute left-0 top-20 hidden w-28 -rotate-6 animate-float-delayed sm:block lg:left-2">
            <BookCover
              book={left}
              className="shadow-[var(--shadow-book)]"
              sizes="112px"
            />
          </div>
        ) : null}

        <div className="relative z-10 w-44 animate-float sm:w-48">
          <BookCover
            book={main}
            priority
            className="shadow-[var(--shadow-book)]"
            sizes="192px"
          />

          {main.rating ? (
            <div className="absolute -right-7 -top-4 flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 shadow-[var(--shadow-card)]">
              <Star
                className="size-3.5 fill-star text-star"
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-foreground">
                {main.rating.toFixed(1)}
              </span>
            </div>
          ) : null}
        </div>

        {right ? (
          <div className="absolute right-0 top-14 hidden w-24 rotate-6 animate-float sm:block lg:right-2">
            <BookCover
              book={right}
              className="shadow-[var(--shadow-book)]"
              sizes="96px"
            />
          </div>
        ) : null}

        <div className="absolute -bottom-1 left-0 z-20 max-w-[12rem] rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            Featured title
          </p>
          <p className="mt-1 line-clamp-1 text-xs font-semibold text-foreground">
            {main.title}
          </p>
          <p className="line-clamp-1 text-[11px] text-muted-foreground">
            {main.author}
          </p>
          <p className="mt-1 text-xs font-bold text-foreground">
            {formatPrice(main.price)}
          </p>
        </div>

        <div className="absolute right-0 top-0 z-20 hidden max-w-[11rem] rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] sm:block">
          <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Store className="size-3" aria-hidden="true" />
            Seller
          </p>
          <p className="mt-1 line-clamp-1 text-xs font-semibold text-foreground">
            {main.sellerName}
          </p>
        </div>
      </div>
    </div>
  );
}
