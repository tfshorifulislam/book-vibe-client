"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { BookCard } from "@/components/shared/BookCard";
import type { Book } from "@/types/book";

type WishlistItem = { itemId: string; book: Book };

export function WishlistClient({
  initialItems,
}: {
  initialItems: WishlistItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((response) => response.json())
      .then(
        (payload: { success?: boolean; data?: { items?: WishlistItem[] } }) => {
          if (payload.success) setItems(payload.data?.items ?? []);
        },
      )
      .catch(() => {});
  }, []);

  async function remove(bookId: string) {
    setPending(bookId);
    const response = await fetch(`/api/wishlist?bookId=${bookId}`, {
      method: "DELETE",
    });
    setPending(null);
    if (!response.ok) {
      toast.error("Unable to remove this book.");
      return;
    }
    setItems((current) => current.filter((item) => item.book.id !== bookId));
    toast.success("Removed from wishlist.");
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <h2 className="text-base font-semibold">Your wishlist is empty</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Save books you want to come back to.
        </p>
        <Link
          href="/books"
          className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Browse books
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.itemId} className="relative">
          <BookCard book={item.book} showWishlist={false} showDetails />
          <button
            type="button"
            onClick={() => remove(item.book.id)}
            disabled={pending === item.book.id}
            className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground shadow-sm backdrop-blur hover:text-destructive disabled:opacity-50"
            aria-label={`Remove ${item.book.title} from wishlist`}
          >
            {pending === item.book.id ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
