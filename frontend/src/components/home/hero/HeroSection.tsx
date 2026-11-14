import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/shared/Icon";
import type { HeroContent } from "@/types/home";
import type { Book } from "@/types/book";
import { HeroSearch } from "./HeroSearch";
import { HeroVisual } from "./HeroVisual";

interface HeroSectionProps {
  content: HeroContent;
  featuredBooks: Book[];
  popularSearches: string[];
}

export function HeroSection({
  content,
  featuredBooks,
  popularSearches,
}: HeroSectionProps) {
  const suggestions = Array.from(
    new Set(
      featuredBooks
        .flatMap((book) => [book.title, book.author, book.publisher, book.isbn])
        .filter((value): value is string => Boolean(value)),
    ),
  );

  return (
    <section
      aria-label="Welcome to BookHand"
      className="relative overflow-hidden py-14 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[image:var(--gradient-subtle)] opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 size-80 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full bg-secondary/15 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-primary"
              />
              {content.eyebrow}
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
              {content.heading}{" "}
              <span className="brand-gradient-text block">
                {content.headingAccent}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              {content.description}
            </p>

            <div className="mt-7 w-full">
              <HeroSearch
                suggestions={suggestions}
                popularSearches={popularSearches}
              />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/books"
                className="brand-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-on-brand shadow-[var(--shadow-card)] transition-all hover:opacity-95 hover:shadow-[var(--shadow-book)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
              >
                Explore Books
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/register?role=seller"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
              >
                Become a Seller
              </Link>
            </div>

            <div className="mt-9 grid w-full gap-4 sm:grid-cols-3">
              {content.trustItems.map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon name={item.icon} className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs leading-tight font-semibold text-foreground">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroVisual books={featuredBooks.slice(0, 3)} />
          </div>
        </div>
      </div>
    </section>
  );
}
