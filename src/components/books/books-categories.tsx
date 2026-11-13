"use client";

import type { ReactNode } from "react";
import { LayoutGrid } from "lucide-react";
import { Icon } from "@/components/shared/Icon";
import { countBooksInCategory } from "@/lib/books";
import { cn, formatNumber } from "@/lib/utils";
import type { Book } from "@/types/book";
import type { Category } from "@/types/category";

interface BooksCategoriesProps {
  categories: Category[];
  books: Book[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export function BooksCategories({
  categories,
  books,
  selectedCategory,
  onSelectCategory,
}: BooksCategoriesProps) {
  return (
    <section
      aria-labelledby="books-categories-heading"
      className="border-b border-border bg-background"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="books-categories-heading"
            className="text-sm font-semibold text-foreground"
          >
            Browse by category
          </h2>
          <p className="hidden text-xs text-muted-foreground sm:block">
            {formatNumber(categories.length)} categories
          </p>
        </div>

        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <CategoryButton
            active={!selectedCategory}
            label="All Books"
            count={books.length}
            onClick={() => onSelectCategory("")}
            icon={<LayoutGrid className="size-3.5" aria-hidden="true" />}
          />

          {categories.map((category) => (
            <CategoryButton
              key={category.id}
              active={selectedCategory === category.slug}
              label={category.name}
              count={countBooksInCategory(books, category.slug)}
              onClick={() => onSelectCategory(category.slug)}
              icon={<Icon name={category.icon} className="size-3.5" />}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface CategoryButtonProps {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
  icon: ReactNode;
}

function CategoryButton({
  active,
  label,
  count,
  onClick,
  icon,
}: CategoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/40 hover:text-primary",
      )}
    >
      {icon}
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
          active
            ? "bg-primary-foreground/15 text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {formatNumber(count)}
      </span>
    </button>
  );
}
