"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LoaderCircle, Send, Star } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

export function BookReviewForm({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, rating, title, body }),
    });
    const payload = (await response.json()) as { success: boolean; message?: string };
    setPending(false);
    if (!response.ok || !payload.success) {
      toast.error(
        response.status === 401
          ? "Sign in to write a review."
          : (payload.message ?? "Unable to submit your review."),
      );
      return;
    }
    toast.success("Thanks! Your review has been published.");
    setTitle("");
    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">Write a review</h3>
      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            aria-label={`${value} star${value === 1 ? "" : "s"}`}
            className="p-0.5"
          >
            <Star
              className={cn(
                "size-5",
                value <= rating ? "fill-secondary text-secondary" : "text-muted-foreground",
              )}
            />
          </button>
        ))}
      </div>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Review title (optional)"
        className="mt-3 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary"
      />
      <textarea
        required
        minLength={5}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="What did you think of this book?"
        rows={3}
        className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-3.5" />}
        Submit review
      </button>
    </form>
  );
}

export function BookQuestionForm({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    const response = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, body }),
    });
    const payload = (await response.json()) as { success: boolean; message?: string };
    setPending(false);
    if (!response.ok || !payload.success) {
      toast.error(
        response.status === 401
          ? "Sign in to ask a question."
          : (payload.message ?? "Unable to submit your question."),
      );
      return;
    }
    toast.success("Your question has been sent to the seller.");
    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">Ask the seller a question</h3>
      <textarea
        required
        minLength={5}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Is the cover the same as the photo? Any highlighting or notes?"
        rows={3}
        className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-3.5" />}
        Send question
      </button>
    </form>
  );
}
