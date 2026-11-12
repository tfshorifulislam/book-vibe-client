"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Heart, ShoppingCart, Store } from "lucide-react";
import { BookCover } from "@/components/shared/BookCover";
import { StarRating } from "@/components/shared/StarRating";
import {
  addToCart,
  isWishlisted,
  subscribeToLibrary,
  toggleWishlist,
} from "@/lib/client/guest-library";
import {
  cn,
  formatPrice,
  getConditionLabel,
  getDiscountPercent,
  getStockLabel,
} from "@/lib/utils";
import type { Book } from "@/types/book";

interface BookCardProps {
  book: Book;
  rank?: number;
  badge?: "new" | "used";
  showWishlist?: boolean;
  showAddToCart?: boolean;
  className?: string;
}

export function BookCard({
  book,
  rank,
  badge,
  showWishlist = true,
  showAddToCart = true,
  className,
}: BookCardProps) {
  const [added, setAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wishlisted = useSyncExternalStore(
    subscribeToLibrary,
    () => isWishlisted(book.id),
    () => false,
  );

  const discount = getDiscountPercent(book);
  const outOfStock = book.stock <= 0;

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  function handleWishlist() {
    toggleWishlist(book.id);
  }

  function handleAddToCart() {
    if (outOfStock) return;

    addToCart(book.id);
    setAdded(true);

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setAdded(false), 2000);
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-book)]",
        className,
      )}
    >
      <div className="relative">
        <Link
          href={`/books/${book.slug}`}
          className="block overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`View ${book.title}`}
        >
          <BookCover
            book={book}
            className="transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {rank ? (
            <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background shadow-sm">
              #{rank}
            </span>
          ) : null}
          {badge === "new" ? (
            <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm">
              New
            </span>
          ) : null}
          {badge === "used" ? (
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-secondary-foreground shadow-sm">
              Used
            </span>
          ) : null}
        </div>

        {showWishlist ? (
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={
              wishlisted
                ? `Remove ${book.title} from wishlist`
                : `Add ${book.title} to wishlist`
            }
            aria-pressed={wishlisted}
            className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Heart
              aria-hidden="true"
              className={cn(
                "size-4",
                wishlisted
                  ? "fill-primary text-primary"
                  : "fill-transparent text-foreground",
              )}
            />
          </button>
        ) : null}

        <span className="absolute bottom-2 left-2 rounded-md border border-border bg-card/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground backdrop-blur">
          {getConditionLabel(book.condition)}
        </span>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <Link
          href={`/books/${book.slug}`}
          className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {book.title}
        </Link>

        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {book.author}
        </p>
        {book.publisher ? (
          <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
            {book.publisher}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5">
          {book.rating ? (
            <StarRating rating={book.rating} reviewCount={book.reviewCount} />
          ) : (
            <span className="text-[11px] text-muted-foreground">
              No ratings yet
            </span>
          )}
          <span
            className={cn(
              "text-[11px] font-medium",
              outOfStock
                ? "text-destructive"
                : book.stock <= 3
                  ? "text-warning"
                  : "text-success",
            )}
          >
            {getStockLabel(book.stock)}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-base font-bold text-foreground">
            {formatPrice(book.price)}
          </span>
          {book.originalPrice && book.originalPrice > book.price ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(book.originalPrice)}
            </span>
          ) : null}
          {discount ? (
            <span className="rounded bg-secondary/15 px-1.5 py-0.5 text-[10px] font-semibold text-secondary-foreground dark:bg-secondary/25 dark:text-secondary-foreground">
              -{discount}%
            </span>
          ) : null}
        </div>

        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Store className="size-3 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{book.sellerName}</span>
        </p>

        {showAddToCart ? (
          <div className="mt-auto pt-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={cn(
                "inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                added && "bg-primary text-primary-foreground",
              )}
            >
              <ShoppingCart className="size-3.5" aria-hidden="true" />
              {outOfStock
                ? "Out of stock"
                : added
                  ? "Added to cart"
                  : "Add to Cart"}
            </button>
          </div>
        ) : null}

        <span className="sr-only" aria-live="polite">
          {added ? `${book.title} added to cart` : ""}
        </span>
      </div>
    </article>
  );
}
