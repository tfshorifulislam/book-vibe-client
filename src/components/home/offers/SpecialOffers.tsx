import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { BookCover } from "@/components/shared/BookCover";
import { BookGrid } from "@/components/shared/BookGrid";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { formatDate } from "@/lib/utils";
import type { Offer } from "@/types/offer";

interface SpecialOffersProps {
  offer?: Offer;
}

export function SpecialOffers({ offer }: SpecialOffersProps) {
  if (!offer || !offer.isActive) return null;

  const expiry = formatDate(offer.expiryDate);

  return (
    <SectionContainer>
      <SectionHeading
        eyebrow="Limited-time savings"
        title="Special Offers"
        description="Current promotions on selected titles. Offers disappear automatically when they expire."
        action={{ label: "Shop All Offers", href: "/books?sale=active" }}
      />

      <div className="mt-8">
        <div className="relative overflow-hidden rounded-2xl brand-gradient p-6 text-on-brand shadow-[var(--shadow-book)] sm:p-8 lg:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full border border-on-brand/15"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 right-24 size-56 rounded-full border border-on-brand/10"
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-on-brand/30 bg-on-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                <Tag className="size-3.5" aria-hidden="true" />
                Active offer
              </span>

              <h3 className="mt-4 text-balance text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {offer.title}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-6 opacity-90 sm:text-base">
                {offer.description}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {offer.discountPercent ? (
                  <span className="rounded-lg bg-background px-3 py-1.5 text-sm font-bold text-foreground">
                    {offer.discountPercent}% off
                  </span>
                ) : null}
                {expiry ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium opacity-90">
                    <Clock className="size-3.5" aria-hidden="true" />
                    Ends {expiry}
                  </span>
                ) : null}
              </div>

              <Link
                href={`/books?offer=${offer.id}`}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-transform hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-brand focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Shop Now
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="hidden items-end justify-center gap-2 sm:flex">
              {offer.books.slice(0, 3).map((book, index) => (
                <div
                  key={book.id}
                  className={
                    index === 1
                      ? "w-28 -translate-y-3 sm:w-32"
                      : "w-24 opacity-90 sm:w-28"
                  }
                >
                  <BookCover
                    book={book}
                    className="shadow-[var(--shadow-book)]"
                    sizes="128px"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <BookGrid books={offer.books.slice(0, 4)} />
        </div>
      </div>
    </SectionContainer>
  );
}
