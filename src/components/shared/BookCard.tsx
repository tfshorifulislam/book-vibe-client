"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Heart, ShoppingCart, Store, Tag } from "lucide-react";
import { toast } from "sonner";
import { BookCover } from "@/components/shared/BookCover";
import { StarRating } from "@/components/shared/StarRating";
import {
  addToCart,
  isWishlisted,
  notifyLibraryChanged,
  setWishlisted,
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
  category?: string;
  showWishlist?: boolean;
  showAddToCart?: boolean;
  showDetails?: boolean;
  className?: string;
}

export function BookCard({
  book,
  rank,
  badge,
  category,
  showWishlist = true,
  showAddToCart = true,
  showDetails = false,
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

  useEffect(() => {
    let active = true;
    fetch("/api/wishlist")
      .then((response) => response.json())
      .then(
        (payload: {
          success?: boolean;
          data?: { items?: { book: { id: string } }[] };
        }) => {
          if (!active || !payload.success) return;
          setWishlisted(
            book.id,
            Boolean(
              payload.data?.items?.some((item) => item.book.id === book.id),
            ),
          );
        },
      )
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [book.id]);

  async function handleWishlist() {
    const next = !wishlisted;
    setWishlisted(book.id, next);
    const response = await fetch(
      next ? "/api/wishlist" : `/api/wishlist?bookId=${book.id}`,
      {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: next ? JSON.stringify({ bookId: book.id }) : undefined,
      },
    ).catch(() => null);
    if (response && response.ok) {
      notifyLibraryChanged();
      toast.success(next ? "Saved to wishlist." : "Removed from wishlist.");
    } else if (response && response.status === 401) {
      toggleWishlist(book.id);
      notifyLibraryChanged();
      toast.success(
        next
          ? "Saved locally. Sign in to sync your wishlist."
          : "Removed from local wishlist.",
      );
    } else {
      setWishlisted(book.id, !next);
      toast.error("Unable to update your wishlist.");
    }
  }

  async function handleAddToCart() {
    if (outOfStock) return;

    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: book.id, quantity: 1 }),
    }).catch(() => null);

    if (response && response.ok) {
      notifyLibraryChanged();
      setAdded(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setAdded(false), 2000);
      toast.success("Added to cart.");
      return;
    }

    if (!response || response.status === 401) {
      addToCart(book.id);
      notifyLibraryChanged();
      setAdded(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setAdded(false), 2000);
      toast.success(
        "Added to your guest cart. Sign in at checkout to complete your order.",
      );
      return;
    }

    toast.error("Unable to add this book to your cart.");
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
          className="block overflow-hidden rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={`View ${book.title}`}
        >
          <BookCover
            book={book}
            className="transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>

        <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
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
            className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
          className="line-clamp-2 text-sm leading-snug font-semibold text-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {book.title}
        </Link>

        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {book.author}
        </p>
        {category ? (
          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-primary">
            <Tag className="size-3 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{category}</span>
          </p>
        ) : null}
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
                "inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
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

        {showDetails ? (
          <div className={cn(showAddToCart ? "pt-2" : "mt-auto pt-3")}>
            <Link
              href={`/books/${book.slug}`}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              View Details
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        ) : null}

        <span className="sr-only" aria-live="polite">
          {added ? `${book.title} added to cart` : ""}
        </span>
      </div>
    </article>
  );
}
