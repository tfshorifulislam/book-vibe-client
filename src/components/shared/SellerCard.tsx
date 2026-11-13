import Link from "next/link";
import { BookOpen, MapPin, Star } from "lucide-react";
import { formatNumber, getInitials } from "@/lib/utils";
import type { Seller } from "@/types/seller";

interface SellerCardProps {
  seller: Seller;
  rank?: number;
}

export function SellerCard({ seller, rank }: SellerCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-book)]">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-bold text-primary"
        >
          {getInitials(seller.shopName)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {seller.shopName}
            </h3>
            {rank ? (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                #{rank}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-star text-star" aria-hidden="true" />
            <span className="font-medium text-foreground">
              {seller.rating.toFixed(1)}
            </span>
            <span>({formatNumber(seller.reviewCount)} reviews)</span>
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <BookOpen className="size-3.5 shrink-0" aria-hidden="true" />
          {formatNumber(seller.totalBooks)} listed books
        </p>
        {seller.location ? (
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{seller.location}</span>
          </p>
        ) : null}
      </div>

      <Link
        href={`/shops/${seller.shopSlug}`}
        className="mt-5 inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        Visit Shop
      </Link>
    </article>
  );
}
