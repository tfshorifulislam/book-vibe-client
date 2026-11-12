"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent } from "react";
import {
  ArrowRight,
  BookOpen,
  Search,
  ShoppingBag,
  Store,
  Star,
} from "lucide-react";

/* ── Trust indicator data ──────────────────────────────── */
const trustItems = [
  {
    icon: BookOpen,
    label: "Discover Amazing Books",
    sub: "Thousands of titles",
  },
  {
    icon: Store,
    label: "Shop from Independent Sellers",
    sub: "Verified sellers only",
  },
  {
    icon: ShoppingBag,
    label: "Buy and Sell with Ease",
    sub: "Simple & secure",
  },
];

/* ── Hero Search Form ──────────────────────────────────── */
function HeroSearchForm() {
  const router = useRouter();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const q = String(data.get("q") ?? "").trim();
    router.push(q ? `/books?q=${encodeURIComponent(q)}` : "/books");
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex w-full items-stretch overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all"
    >
      <label htmlFor="hero-search" className="sr-only">
        Search books
      </label>
      <span className="flex items-center pl-4 text-muted-foreground" aria-hidden="true">
        <Search className="size-4 shrink-0" />
      </span>
      <input
        id="hero-search"
        type="search"
        name="q"
        placeholder="Search by book title, author, ISBN..."
        className="flex-1 bg-transparent py-3.5 pl-3 pr-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <button
        type="submit"
        className="m-1.5 shrink-0 rounded-lg bg-brand-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        Search
      </button>
    </form>
  );
}

/* ── Decorative Book Stack Visual ─────────────────────── */
function BookVisual() {
  return (
    <div className="relative flex items-center justify-center" aria-hidden="true">
      {/* Soft background glow */}
      <div className="absolute inset-0 rounded-3xl bg-[var(--gradient-subtle)] opacity-60" />

      {/* Outer ring accent */}
      <div className="absolute size-72 rounded-full border border-brand-primary/10 sm:size-80 lg:size-96" />
      <div className="absolute size-56 rounded-full border border-brand-secondary/10 sm:size-64 lg:size-72" />

      {/* Main featured book */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Large centre book */}
        <div
          className="relative flex h-56 w-40 flex-col overflow-hidden rounded-r-md rounded-l-sm shadow-[var(--shadow-book)] sm:h-64 sm:w-44"
          style={{ background: "var(--gradient-brand)" }}
        >
          {/* Book spine accent */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/20" />
          {/* Book content decoration */}
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 pt-6">
            <BookOpen className="size-10 text-white/80" />
            <div className="space-y-1.5 text-center">
              <div className="h-1.5 w-20 rounded-full bg-white/40" />
              <div className="h-1.5 w-14 rounded-full bg-white/30" />
              <div className="h-1.5 w-18 rounded-full bg-white/30" />
            </div>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs font-semibold text-white/90 leading-tight">Featured Pick</p>
            <p className="mt-0.5 text-[10px] text-white/60">BookHand Editors</p>
          </div>
        </div>

        {/* Rating badge */}
        <div className="absolute -right-6 -top-3 z-20 flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 shadow-[var(--shadow-card)]">
          <Star className="size-3 fill-brand-secondary text-brand-secondary" />
          <span className="text-xs font-semibold text-foreground">4.9</span>
        </div>

        {/* Left floating book */}
        <div
          className="absolute -left-16 top-6 z-0 flex h-36 w-24 -rotate-6 flex-col overflow-hidden rounded-r-md rounded-l-sm shadow-md sm:-left-20 sm:h-40 sm:w-28"
          style={{ background: "linear-gradient(135deg, #6B4226 0%, #8B5E3C 100%)" }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/20" />
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-3 pt-4">
            <div className="space-y-1">
              <div className="h-1 w-12 rounded-full bg-white/40" />
              <div className="h-1 w-9 rounded-full bg-white/30" />
              <div className="h-1 w-11 rounded-full bg-white/30" />
            </div>
          </div>
          <div className="p-3 text-center">
            <p className="text-[9px] font-medium text-white/80 leading-tight">Classic Novel</p>
          </div>
        </div>

        {/* Right floating book */}
        <div
          className="absolute -right-14 top-10 z-0 flex h-32 w-22 rotate-6 flex-col overflow-hidden rounded-r-md rounded-l-sm shadow-md sm:-right-16 sm:h-36 sm:w-24"
          style={{ background: "linear-gradient(135deg, #C49A52 0%, #D6A85F 100%)" }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/10" />
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-3 pt-4">
            <div className="space-y-1">
              <div className="h-1 w-10 rounded-full bg-white/50" />
              <div className="h-1 w-8 rounded-full bg-white/40" />
              <div className="h-1 w-10 rounded-full bg-white/35" />
            </div>
          </div>
          <div className="p-3 text-center">
            <p className="text-[9px] font-medium text-white/90 leading-tight">New Arrival</p>
          </div>
        </div>

        {/* Bottom floating book */}
        <div
          className="absolute -bottom-10 -left-8 z-20 flex h-28 w-20 rotate-12 flex-col overflow-hidden rounded-r-md rounded-l-sm shadow-md"
          style={{ background: "linear-gradient(135deg, #4A3728 0%, #6B5240 100%)" }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/20" />
          <div className="flex flex-1 items-center justify-center">
            <div className="space-y-0.5">
              <div className="h-0.5 w-8 rounded-full bg-white/40" />
              <div className="h-0.5 w-6 rounded-full bg-white/30" />
              <div className="h-0.5 w-8 rounded-full bg-white/30" />
            </div>
          </div>
          <div className="p-2 text-center">
            <p className="text-[8px] font-medium text-white/70">Bestseller</p>
          </div>
        </div>

        {/* Floating category badges */}
        <div className="absolute -left-4 -bottom-4 z-30 rounded-full border border-border bg-card px-3 py-1 shadow-[var(--shadow-card)]">
          <span className="text-xs font-medium text-muted-foreground">📚 10k+ Books</span>
        </div>
        <div className="absolute -right-4 bottom-4 z-30 rounded-full border border-border bg-card px-3 py-1 shadow-[var(--shadow-card)]">
          <span className="text-xs font-medium text-muted-foreground">🏪 500+ Sellers</span>
        </div>
      </div>
    </div>
  );
}

/* ── Hero Section ─────────────────────────────────────── */
export function HeroSection() {
  return (
    <section
      aria-label="Welcome to BookHand"
      className="relative overflow-hidden py-16 sm:py-20 lg:py-28"
    >
      {/* Subtle warm background gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-subtle)", opacity: 0.5 }}
      />

      {/* Decorative corner blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 size-80 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #8B5E3C 0%, transparent 70%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 size-64 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #D6A85F 0%, transparent 70%)" }}
      />

      {/* Two-column grid */}
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* ── LEFT: Content ──────────────────────────── */}
          <div className="flex flex-col items-start">

            {/* Eyebrow badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/30 bg-brand-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-brand-primary">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-primary" />
              Your next favorite book is waiting
            </span>

            {/* Main heading */}
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Discover Books.{" "}
              <span
                className="block bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-text)" }}
              >
                Share Knowledge.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              Explore thousands of books, discover new authors, and connect with
              independent bookstores and readers. Find your next favorite book on{" "}
              <span className="font-semibold text-foreground">BookHand</span>.
            </p>

            {/* Search bar */}
            <div className="mt-7 w-full max-w-lg">
              <HeroSearchForm />
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/books"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition-all hover:opacity-90 hover:shadow-[var(--shadow-book)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                style={{ background: "var(--gradient-brand)" }}
              >
                Explore Books
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/register?role=seller"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Start Selling
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap gap-5">
              {trustItems.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground leading-tight">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Book Visual ─────────────────────── */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm py-16 sm:max-w-md">
              <BookVisual />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
