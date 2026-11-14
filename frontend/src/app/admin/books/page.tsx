import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { Eye } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { BookModerationActions } from "@/components/admin/book-actions";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Manage Books | Admin Dashboard" };

export default function AdminBooksPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminBooksContent />
    </Suspense>
  );
}

async function AdminBooksContent() {
  await connection();
  await requireRole("admin");

  const books = await prisma.book.findMany({
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
      shop: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Marketplace Catalog"
        title="Books Directory"
        description="Review published books, feature titles on the homepage, and suspend non-compliant listings."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">Book Title</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Seller Shop</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {books.map((b) => (
              <tr key={b.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="line-clamp-1 font-semibold text-foreground">
                    {b.title}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {b.condition}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{b.author.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {b.category.name}
                </td>
                <td className="px-4 py-3 text-xs font-medium text-primary">
                  <Link
                    href={`/shops/${b.shop.slug}`}
                    target="_blank"
                    className="hover:underline"
                  >
                    {b.shop.name}
                  </Link>
                </td>
                <td className="px-4 py-3 font-semibold">
                  {formatPrice(b.price)}
                </td>
                <td className="px-4 py-3 text-xs">{b.stock} units</td>
                <td className="px-4 py-3">
                  <StatusBadge status={b.isActive ? "ACTIVE" : "SUSPENDED"} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/books/${b.slug}`}
                      target="_blank"
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                      title="View public listing"
                    >
                      <Eye className="size-4" />
                    </Link>
                    <BookModerationActions
                      bookId={b.id}
                      isFeatured={b.isFeatured}
                      isActive={b.isActive}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
