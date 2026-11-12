"use client";

import { useRouter } from "next/navigation";
import {
  useId,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Search } from "lucide-react";
import { SEARCH_HELP_TEXT } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface HeroSearchProps {
  suggestions: string[];
  popularSearches: string[];
}

export function HeroSearch({
  suggestions,
  popularSearches,
}: HeroSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();

  const trimmed = query.trim();
  const matches = trimmed
    ? suggestions
        .filter((suggestion) =>
          suggestion.toLowerCase().includes(trimmed.toLowerCase()),
        )
        .slice(0, 6)
    : [];
  const isListOpen = open && matches.length > 0;

  function navigate(value: string) {
    const keyword = value.trim();
    if (!keyword) return;
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeIndex >= 0 && matches[activeIndex]) {
      navigate(matches[activeIndex]);
      return;
    }
    navigate(query);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!isListOpen) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % matches.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        index <= 0 ? matches.length - 1 : index - 1,
      );
    }
  }

  return (
    <div className="w-full max-w-lg">
      <form role="search" onSubmit={handleSubmit}>
        <div
          className="relative flex items-stretch overflow-visible rounded-xl border border-border bg-card shadow-[var(--shadow-card)] transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          onFocus={() => setOpen(true)}
          onBlur={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              setOpen(false);
              setActiveIndex(-1);
            }
          }}
        >
          <label htmlFor="hero-search" className="sr-only">
            Search books
          </label>
          <span
            className="flex items-center pl-4 text-muted-foreground"
            aria-hidden="true"
          >
            <Search className="size-4 shrink-0" />
          </span>
          <input
            id="hero-search"
            type="search"
            name="q"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search by title, author, ISBN, or publisher"
            autoComplete="off"
            role="combobox"
            aria-expanded={isListOpen}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-activedescendant={
              isListOpen && activeIndex >= 0
                ? `${listId}-option-${activeIndex}`
                : undefined
            }
            className="min-w-0 flex-1 bg-transparent py-3.5 pl-3 pr-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            className="m-1.5 shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:px-5"
          >
            Search
          </button>

          {isListOpen ? (
            <ul
              id={listId}
              role="listbox"
              aria-label="Search suggestions"
              onMouseDown={(event) => event.preventDefault()}
              className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-popover py-1 shadow-xl animate-in fade-in-0 slide-in-from-top-1 duration-150"
            >
              {matches.map((match, index) => (
                <li
                  key={match}
                  id={`${listId}-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    setQuery(match);
                    setOpen(false);
                    setActiveIndex(-1);
                    navigate(match);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm text-foreground transition-colors",
                    index === activeIndex
                      ? "bg-muted"
                      : "hover:bg-muted",
                  )}
                >
                  <Search
                    className="size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="truncate">{match}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </form>

      <p className="mt-2 text-xs text-muted-foreground">{SEARCH_HELP_TEXT}</p>

      {popularSearches.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Popular:
          </span>
          {popularSearches.map((keyword) => (
            <button
              key={keyword}
              type="button"
              onClick={() => navigate(keyword)}
              className={cn(
                "rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              {keyword}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
