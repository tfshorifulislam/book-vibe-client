import { Quote } from "lucide-react";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StarRating } from "@/components/shared/StarRating";
import { getInitials } from "@/lib/utils";
import type { Testimonial } from "@/types/testimonial";

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  if (testimonials.length === 0) return null;

  return (
    <SectionContainer className="bg-muted/30">
      <SectionHeading
        eyebrow="From the BookHand community"
        title="What Readers Are Saying"
        description="Approved reviews from readers who found their next book through BookHand."
        align="center"
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <figure
            key={testimonial.id}
            className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
          >
            <Quote className="size-6 text-primary/30" aria-hidden="true" />
            <StarRating
              rating={testimonial.rating}
              variant="stars"
              className="mt-3"
            />
            <blockquote className="mt-3 flex-1 text-sm leading-6 text-foreground">
              {testimonial.review}
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
              {testimonial.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={testimonial.avatar}
                  alt=""
                  className="size-9 rounded-full object-cover"
                  aria-hidden="true"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                >
                  {getInitials(testimonial.name)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {testimonial.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Purchased {testimonial.bookTitle}
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </SectionContainer>
  );
}
