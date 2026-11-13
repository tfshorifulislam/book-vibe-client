import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Categories | Seller Workspace" };

export default async function SellerCategoriesPage() {
  await requireRole("seller");

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { books: true } },
      parent: { select: { name: true } },
    },
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Marketplace Structure"
        title="Browse Book Categories"
        description="Explore active categories and subcategories where you can publish books."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{c.name}</h3>
                {c.parent ? (
                  <p className="text-xs text-muted-foreground">In: {c.parent.name}</p>
                ) : null}
              </div>
            </div>
            {c.description ? (
              <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{c.description}</p>
            ) : null}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
              <span className="text-muted-foreground">{c._count.books} marketplace books</span>
              <Link
                href={`/categories/${c.slug}`}
                target="_blank"
                className="font-medium text-primary hover:underline"
              >
                View category →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
