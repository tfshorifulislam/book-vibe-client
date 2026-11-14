import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, ExternalLink, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { BookModerationActions } from "@/components/admin/book-actions";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Book Moderation | Admin Dashboard",
};

export default function AdminBookDetailPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminBookDetailContent {...props} />
    </Suspense>
  );
}

async function AdminBookDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  await requireRole("admin");
  const { id } = await params;

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      author: true,
      category: true,
      publisher: true,
      shop: { include: { owner: { select: { name: true, email: true } } } },
      reviews: { take: 5, include: { user: { select: { name: true } } } },
      questions: { take: 5, include: { user: { select: { name: true } } } },
    },
  });

  if (!book) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/books"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to Books
      </Link>

      <PageHeader
        eyebrow="Catalog Item"
        title={book.title}
        description={`Published by ${book.shop.name} (${book.shop.owner.name})`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge
              status={book.isActive ? "ACTIVE" : "SUSPENDED"}
              className="px-3 py-1 text-sm"
            />
            <BookModerationActions
              bookId={book.id}
              isFeatured={book.isFeatured}
              isActive={book.isActive}
            />
            <Link
              href={`/books/${book.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              <ExternalLink className="size-3.5" /> View Storefront Listing
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <BookOpen className="size-4" /> Book Specifications
          </h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold text-muted-foreground">
                Author:
              </span>{" "}
              {book.author.name}
            </p>
            <p>
              <span className="font-semibold text-muted-foreground">
                Category:
              </span>{" "}
              {book.category.name}
            </p>
            <p>
              <span className="font-semibold text-muted-foreground">
                Publisher:
              </span>{" "}
              {book.publisher?.name ?? "N/A"}
            </p>
            <p>
              <span className="font-semibold text-muted-foreground">ISBN:</span>{" "}
              {book.isbn ?? "N/A"}
            </p>
            <p>
              <span className="font-semibold text-muted-foreground">
                Condition:
              </span>{" "}
              {book.condition} ({book.listingType})
            </p>
            <p>
              <span className="font-semibold text-muted-foreground">
                Price:
              </span>{" "}
              {formatPrice(book.price)}
            </p>
            <p>
              <span className="font-semibold text-muted-foreground">
                Current Stock:
              </span>{" "}
              {book.stock} units
            </p>
            <p className="pt-2 text-xs text-muted-foreground">
              {book.description}
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <ShieldCheck className="size-4" /> Moderation Stats
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Featured Pick:</span>
              <span className="font-bold">
                {book.isFeatured ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">New Arrival:</span>
              <span className="font-bold">
                {book.isNewArrival ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Best Seller:</span>
              <span className="font-bold">
                {book.isBestSeller ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Total Sales:</span>
              <span className="font-bold">{book.salesCount} copies</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer Reviews:</span>
              <span className="font-bold">{book.reviews.length} reviews</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
