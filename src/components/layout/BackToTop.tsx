"use client";

import { ArrowUp } from "lucide-react";

export function BackToTop() {
  function handleClick() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-footer-border px-3 py-1.5 text-xs font-medium text-footer-foreground transition-colors hover:bg-footer-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-footer-foreground"
    >
      <ArrowUp className="size-3.5" aria-hidden="true" />
      Back to Top
    </button>
  );
}
