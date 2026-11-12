import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { SectionContainer } from "@/components/shared/SectionContainer";
import type { FinalCtaContent } from "@/types/home";

interface FinalCTAProps {
  content: FinalCtaContent;
}

export function FinalCTA({ content }: FinalCTAProps) {
  return (
    <SectionContainer>
      <div className="relative overflow-hidden rounded-2xl brand-gradient px-6 py-12 text-on-brand shadow-[var(--shadow-book)] sm:px-10 sm:py-14 lg:px-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-10 -top-10 size-48 rounded-full border border-on-brand/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-10 size-64 rounded-full border border-on-brand/10"
        />
        <BookOpen
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 bottom-6 size-40 opacity-10"
        />

        <div className="relative max-w-2xl">
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {content.heading}
          </h2>
          <p className="mt-3 text-sm leading-6 opacity-90 sm:text-base">
            {content.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={content.primaryCta.href}
              className="inline-flex items-center gap-2 rounded-xl bg-background px-6 py-3 text-sm font-semibold text-foreground transition-transform hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-brand focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              {content.primaryCta.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href={content.secondaryCta.href}
              className="inline-flex items-center gap-2 rounded-xl border border-on-brand/40 px-6 py-3 text-sm font-semibold text-on-brand transition-colors hover:bg-on-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-brand focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              {content.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
