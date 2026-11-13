"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { StarRating } from "@/components/shared/StarRating";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
  book: { id: string; title: string; slug: string };
};

export function ReviewsClient({ initial }: { initial: Review[] }) {
  const [items, setItems] = useState(initial);

  async function remove(bookId: string) {
    if (!window.confirm("Delete this review?")) return;
    const response = await fetch(`/api/reviews?bookId=${bookId}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Unable to delete this review.");
      return;
    }
    setItems((current) => current.filter((item) => item.book.id !== bookId));
    toast.success("Review deleted.");
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <Star className="mx-auto size-8 text-muted-foreground" />
        <h2 className="mt-2 text-base font-semibold">No reviews yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">Share your thoughts on books you have read.</p>
        <Link href="/books" className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">Browse books</Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((review) => (
        <li key={review.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link href={`/books/${review.book.slug}`} className="text-sm font-semibold hover:text-primary">{review.book.title}</Link>
              <div className="mt-1 flex items-center gap-2">
                <StarRating rating={review.rating} />
                {review.isVerified ? <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">Verified purchase</span> : null}
                {!review.isApproved ? <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">Pending approval</span> : null}
              </div>
            </div>
            <button type="button" onClick={() => remove(review.book.id)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /> Delete</button>
          </div>
          {review.title ? <p className="mt-2 text-sm font-medium">{review.title}</p> : null}
          <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
          <p className="mt-2 text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
        </li>
      ))}
    </ul>
  );
}
