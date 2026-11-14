import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionPage } from "@/components/marketplace/collection-page";
import { getBookCards, getCategories } from "@/lib/data/books";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);
  return category ? { title: category.name } : { title: "Category not found" };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const { books, total } = await getBookCards({ category: slug, limit: 100 });

  return (
    <CollectionPage
      eyebrow="Category"
      title={category.name}
      description={category.description}
      count={total}
      books={books}
      breadcrumbs={[{ label: "Categories", href: "/categories" }]}
      action={
        <a
          href={`/books?category=${encodeURIComponent(slug)}`}
          className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
        >
          Filter & sort
        </a>
      }
    >
      {category.children?.length ? (
        <div className="flex flex-wrap gap-2">
          {category.children.map((child) => (
            <a
              key={child.id}
              href={`/categories/${child.slug}`}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary"
            >
              {child.name} ({child.bookCount})
            </a>
          ))}
        </div>
      ) : null}
    </CollectionPage>
  );
}
