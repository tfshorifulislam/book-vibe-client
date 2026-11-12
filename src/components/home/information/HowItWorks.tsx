"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/shared/Icon";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { cn } from "@/lib/utils";
import type { HowItWorksContent } from "@/types/home";

interface HowItWorksProps {
  content: HowItWorksContent;
}

export function HowItWorks({ content }: HowItWorksProps) {
  const [active, setActive] = useState(
    content.journeys[0]?.id ?? "buyer",
  );
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const journey =
    content.journeys.find((item) => item.id === active) ??
    content.journeys[0];

  if (!journey) return null;

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();

    const currentIndex = content.journeys.findIndex(
      (item) => item.id === active,
    );
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + content.journeys.length) %
      content.journeys.length;
    const next = content.journeys[nextIndex];

    setActive(next.id);
    tabRefs.current[next.id]?.focus();
  }

  return (
    <SectionContainer className="bg-muted/30">
      <SectionHeading
        eyebrow="Simple from start to finish"
        title={content.title}
        description={content.description}
        align="center"
      />

      <div className="mt-8 flex justify-center">
        <div
          role="tablist"
          aria-label="How BookHand works"
          aria-orientation="horizontal"
          className="inline-flex rounded-xl border border-border bg-card p-1 shadow-[var(--shadow-card)]"
        >
          {content.journeys.map((item) => {
            const selected = item.id === active;

            return (
              <button
                key={item.id}
                ref={(element) => {
                  tabRefs.current[item.id] = element;
                }}
                type="button"
                role="tab"
                id={`journey-tab-${item.id}`}
                aria-selected={selected}
                aria-controls={`journey-panel-${item.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(item.id)}
                onKeyDown={handleKeyDown}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        key={journey.id}
        id={`journey-panel-${journey.id}`}
        role="tabpanel"
        aria-labelledby={`journey-tab-${journey.id}`}
        tabIndex={0}
        className="mt-8 animate-in fade-in-0 duration-200 focus-visible:outline-none"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {journey.steps.map((step) => (
            <div
              key={step.step}
              className="relative rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon name={step.icon} className="size-5" />
                </span>
                <span className="text-2xl font-bold text-muted-foreground/40">
                  {step.step}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-7 flex justify-center">
          <Link
            href={journey.cta.href}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {journey.cta.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
}
