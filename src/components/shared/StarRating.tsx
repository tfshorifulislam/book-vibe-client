import { Star } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  variant?: "compact" | "stars";
  className?: string;
}

export function StarRating({
  rating,
  reviewCount,
  variant = "compact",
  className,
}: StarRatingProps) {
  const rounded = Math.round(rating);

  if (variant === "stars") {
    return (
      <div
        role="img"
        className={cn("flex items-center gap-1", className)}
        aria-label={`${rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            aria-hidden="true"
            className={cn(
              "size-4",
              index < rounded
                ? "fill-star text-star"
                : "fill-transparent text-border",
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <span
      role="img"
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium text-foreground",
        className,
      )}
      aria-label={`${rating} out of 5 stars${
        reviewCount ? ` from ${reviewCount} reviews` : ""
      }`}
    >
      <Star aria-hidden="true" className="size-3.5 fill-star text-star" />
      <span>{rating.toFixed(1)}</span>
      {reviewCount ? (
        <span className="font-normal text-muted-foreground">
          ({formatNumber(reviewCount)})
        </span>
      ) : null}
    </span>
  );
}
