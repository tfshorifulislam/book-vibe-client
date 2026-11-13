import type { Metadata } from "next";

import { CategoryCard } from "@/components/home/categories/CategoryCard";
import { getCategories } from "@/lib/data/books";

export const metadata: Metadata = {
  title: "Book categories",
  description: "Explore every category on BookHand.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
        Discover
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
        Browse by category
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Find new and used books across fiction, academic, business, history, and
        more.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
      <div className="mt-10 space-y-6">
        {categories
          .filter((category) => category.children?.length)
          .map((category) => (
            <section key={category.id}>
              <h2 className="text-lg font-bold">{category.name}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {category.children?.map((child) => (
                  <a
                    key={child.id}
                    href={`/categories/${child.slug}`}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary"
                  >
                    {child.name}{" "}
                    <span className="text-xs">({child.bookCount})</span>
                  </a>
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
