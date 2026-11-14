import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/shared/Icon";
import { formatNumber } from "@/lib/utils";
import type { Category } from "@/types/category";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-book)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon name={category.icon} className="size-5" />
      </span>

      <h3 className="mt-4 text-sm font-semibold text-foreground">
        {category.name}
      </h3>
      {category.description ? (
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {category.description}
        </p>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="text-[11px] font-medium text-muted-foreground">
          {formatNumber(category.bookCount)} books
        </span>
        <ArrowRight
          className="size-4 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
