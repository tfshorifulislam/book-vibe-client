"use client";

import { useId, useState, type FormEvent } from "react";
import {
  AlertCircle,
  CircleCheck,
  LoaderCircle,
  Mail,
  Send,
} from "lucide-react";
import { SectionContainer } from "@/components/shared/SectionContainer";
import {
  subscribeToNewsletter,
  type NewsletterResult,
} from "@/lib/services/newsletter";
import { cn } from "@/lib/utils";

export function NewsletterSection() {
  const inputId = useId();
  const feedbackId = `${inputId}-feedback`;
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<NewsletterResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setResult(null);

    const response = await subscribeToNewsletter(email);
    setResult(response);
    setPending(false);

    if (response.status === "success") {
      setEmail("");
    }
  }

  const isError = result?.status === "error";

  return (
    <SectionContainer>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[image:var(--gradient-subtle)] opacity-70"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full border border-primary/10"
        />

        <div className="relative grid gap-7 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
              <Mail className="size-3.5" aria-hidden="true" />
              Newsletter
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl">
              Stay Updated with BookHand
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
              Get new arrivals, active offers, and reading recommendations
              delivered to your inbox. No spam, and you can unsubscribe at any
              time.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor={inputId} className="sr-only">
              Email address
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Mail
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id={inputId}
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={isError}
                  aria-describedby={feedbackId}
                  className="h-11 w-full rounded-xl border border-input bg-background pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none aria-invalid:border-destructive"
                />
              </div>

              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? (
                  <LoaderCircle
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Send className="size-4" aria-hidden="true" />
                )}
                {pending ? "Subscribing..." : "Subscribe"}
              </button>
            </div>

            <p
              id={feedbackId}
              role={isError ? "alert" : "status"}
              aria-live="polite"
              className={cn(
                "mt-2 flex min-h-4 items-center gap-1.5 text-xs",
                result
                  ? result.status === "success"
                    ? "text-success"
                    : result.status === "duplicate"
                      ? "text-warning"
                      : "text-destructive"
                  : "text-muted-foreground",
              )}
            >
              {result ? (
                result.status === "success" ? (
                  <CircleCheck className="size-3.5" aria-hidden="true" />
                ) : (
                  <AlertCircle className="size-3.5" aria-hidden="true" />
                )
              ) : null}
              {result ? result.message : "No spam. Unsubscribe anytime."}
            </p>
          </form>
        </div>
      </div>
    </SectionContainer>
  );
}
