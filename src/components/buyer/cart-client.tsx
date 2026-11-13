"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { BookCover } from "@/components/shared/BookCover";
import { formatPrice } from "@/lib/utils";
import type { Book } from "@/types/book";

type CartItem = {
  itemId: string;
  quantity: number;
  subtotal: number;
  availableStock: number;
  book: Book;
};

type Cart = {
  items: CartItem[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  settings: { shippingFlat: number; freeShippingThreshold: number };
};

const EMPTY: Cart = {
  items: [],
  count: 0,
  subtotal: 0,
  shipping: 0,
  total: 0,
  settings: { shippingFlat: 60, freeShippingThreshold: 800 },
};

export function CartClient() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [pendingItem, setPendingItem] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/cart")
      .then((response) => response.json())
      .then((payload: { success: boolean; data?: Cart }) => {
        if (active) setCart(payload.success && payload.data ? payload.data : EMPTY);
      })
      .catch(() => {
        if (active) setCart(EMPTY);
      });
    return () => {
      active = false;
    };
  }, []);

  async function update(itemId: string, quantity: number) {
    setPendingItem(itemId);
    const response = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity }),
    });
    const payload = (await response.json()) as { success: boolean; data?: Cart; message?: string };
    setPendingItem(null);
    if (!response.ok || !payload.success || !payload.data) {
      toast.error(payload.message ?? "Unable to update your cart.");
      return;
    }
    setCart(payload.data);
  }

  async function remove(itemId: string) {
    setPendingItem(itemId);
    const response = await fetch(`/api/cart?itemId=${itemId}`, { method: "DELETE" });
    const payload = (await response.json()) as { success: boolean; data?: Cart; message?: string };
    setPendingItem(null);
    if (!response.ok || !payload.success || !payload.data) {
      toast.error(payload.message ?? "Unable to remove this item.");
      return;
    }
    setCart(payload.data);
    toast.success("Item removed.");
  }

  if (!cart) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-card py-20 text-muted-foreground">
        <LoaderCircle className="mr-2 size-4 animate-spin" /> Loading your cart…
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <ShoppingBag className="mx-auto size-10 text-muted-foreground" />
        <h2 className="mt-3 text-base font-semibold">Your cart is empty</h2>
        <p className="mt-1 text-sm text-muted-foreground">Find a book you love and add it here.</p>
        <Link href="/books" className="mt-5 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">
          Browse books
        </Link>
      </div>
    );
  }

  const remaining = Math.max(0, cart.settings.freeShippingThreshold - cart.subtotal);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          {remaining > 0 ? (
            <p className="text-muted-foreground">
              Add <strong className="text-foreground">{formatPrice(remaining)}</strong> more for free delivery.
            </p>
          ) : (
            <p className="font-medium text-success">You qualify for free delivery.</p>
          )}
        </div>
        {cart.items.map((item) => (
          <div key={item.itemId} className="flex gap-4 rounded-xl border border-border bg-card p-4">
            <Link href={`/books/${item.book.slug}`} className="w-20 shrink-0">
              <BookCover book={item.book} sizes="80px" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/books/${item.book.slug}`} className="line-clamp-2 text-sm font-semibold hover:text-primary">
                    {item.book.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.book.author}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Sold by {item.book.sellerName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.itemId)}
                  disabled={pendingItem === item.itemId}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  aria-label={`Remove ${item.book.title}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex h-9 items-center rounded-lg border border-border">
                  <button type="button" onClick={() => update(item.itemId, Math.max(1, item.quantity - 1))} disabled={item.quantity <= 1 || pendingItem === item.itemId} className="inline-flex size-8 items-center justify-center disabled:opacity-40" aria-label="Decrease quantity">
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button type="button" onClick={() => update(item.itemId, Math.min(item.availableStock, item.quantity + 1))} disabled={item.quantity >= item.availableStock || pendingItem === item.itemId} className="inline-flex size-8 items-center justify-center disabled:opacity-40" aria-label="Increase quantity">
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <p className="text-sm font-bold">{formatPrice(item.subtotal)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="h-fit rounded-xl border border-border bg-card p-5 xl:sticky xl:top-20">
        <h2 className="text-base font-bold">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal ({cart.count} items)</dt><dd>{formatPrice(cart.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd>{cart.shipping ? formatPrice(cart.shipping) : "Free"}</dd></div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-bold"><dt>Total</dt><dd>{formatPrice(cart.total)}</dd></div>
        </dl>
        <Link href="/buyer/checkout" className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90">
          Proceed to checkout
        </Link>
        <Link href="/books" className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-lg border border-border text-sm font-medium hover:bg-muted">
          Continue shopping
        </Link>
        <p className="mt-3 text-center text-xs text-muted-foreground">Taxes and any coupon discounts are applied at checkout.</p>
      </aside>
    </div>
  );
}
