"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { Icon } from "@/components/shared/Icon";
import { useDismiss } from "@/lib/hooks/useDismiss";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

interface CategoriesDropdownProps {
  categories: Category[];
  pathname: string;
}

export function CategoriesDropdown({
  categories,
  pathname,
}: CategoriesDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive =
    pathname === "/categories" || pathname.startsWith("/categories/");

  useDismiss(containerRef, open, () => setOpen(false));

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="categories-menu"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive
            ? "font-semibold text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Categories
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary transition-opacity",
            isActive ? "opacity-100" : "opacity-0",
          )}
        />
      </button>

      {open ? (
        <div
          id="categories-menu"
          role="menu"
          aria-label="Book categories"
          className="absolute left-1/2 top-full z-50 mt-2 w-80 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          <div className="max-h-[min(70vh,30rem)] overflow-y-auto py-2">
            {categories.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                Categories are loading.
              </p>
            ) : (
              <ul>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/categories/${category.slug}`}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                        pathname === `/categories/${category.slug}`
                          ? "font-semibold text-primary"
                          : "text-foreground",
                      )}
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon name={category.icon} className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {category.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {category.bookCount}
                      </span>
                    </Link>

                    {category.children?.length ? (
                      <ul className="mb-1 ml-11 space-y-0.5 border-l border-border pl-3">
                        {category.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/categories/${child.slug}`}
                              role="menuitem"
                              onClick={() => setOpen(false)}
                              className="block rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:outline-none"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-border bg-muted/40 px-4 py-3">
            <Link
              href="/categories"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LayoutGrid className="size-4" aria-hidden="true" />
              View All Categories
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
