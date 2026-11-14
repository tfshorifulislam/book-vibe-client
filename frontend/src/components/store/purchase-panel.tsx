"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Heart,
  LoaderCircle,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

export function PurchasePanel({
  bookId,
  slug,
  stock,
}: {
  bookId: string;
  slug: string;
  stock: number;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistPending, setWishlistPending] = useState(false);
  const outOfStock = stock <= 0;

  useEffect(() => {
    let active = true;
    fetch("/api/wishlist")
      .then((response) => response.json())
      .then(
        (payload: {
          success?: boolean;
          data?: { items?: { book: { id: string } }[] };
        }) => {
          if (active && payload.success) {
            setWishlisted(
              Boolean(
                payload.data?.items?.some((item) => item.book.id === bookId),
              ),
            );
          }
        },
      )
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [bookId]);

  async function add(redirect?: boolean) {
    setPending(true);
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, quantity }),
    });
    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
    };
    setPending(false);
    if (!response.ok || !payload.success) {
      if (response.status === 401) {
        toast.error("Please sign in to add books to your cart.", {
          action: {
            label: "Sign in",
            onClick: () => router.push(`/login?next=/books/${slug}`),
          },
        });
      } else {
        toast.error(payload.message ?? "Unable to add this book to your cart.");
      }
      return;
    }
    toast.success("Added to cart.");
    router.refresh();
    if (redirect) router.push("/buyer/checkout");
  }

  async function toggleWishlist() {
    setWishlistPending(true);
    const response = await fetch(
      wishlisted ? `/api/wishlist?bookId=${bookId}` : "/api/wishlist",
      {
        method: wishlisted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: wishlisted ? undefined : JSON.stringify({ bookId }),
      },
    );
    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
    };
    setWishlistPending(false);
    if (!response.ok || !payload.success) {
      if (response.status === 401) {
        router.push(`/login?next=/books/${slug}`);
        return;
      }
      toast.error(payload.message ?? "Unable to update your wishlist.");
      return;
    }
    setWishlisted((value) => !value);
    toast.success(wishlisted ? "Removed from wishlist." : "Saved to wishlist.");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Quantity</span>
        <div className="inline-flex h-10 items-center rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1 || outOfStock}
            className="inline-flex size-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-9 text-center text-sm font-semibold">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(stock, value + 1))}
            disabled={quantity >= stock || outOfStock}
            className="inline-flex size-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <span
          className={cn(
            "text-xs",
            outOfStock ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {outOfStock ? "Out of stock" : `${stock} available`}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => add(false)}
          disabled={outOfStock || pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <ShoppingCart className="size-4" />
          )}
          Add to cart
        </button>
        <button
          type="button"
          onClick={() => add(true)}
          disabled={outOfStock || pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingBag className="size-4" />
          Buy now
        </button>
      </div>

      <button
        type="button"
        onClick={toggleWishlist}
        disabled={wishlistPending}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <Heart
          className={cn("size-4", wishlisted && "fill-primary text-primary")}
        />
        {wishlisted ? "Saved to wishlist" : "Add to wishlist"}
      </button>

      <p className="text-xs text-muted-foreground">
        Secure checkout · Cash on delivery available ·{" "}
        <Link href="/return-policy" className="text-primary hover:underline">
          7-day return policy
        </Link>
      </p>
    </div>
  );
}
