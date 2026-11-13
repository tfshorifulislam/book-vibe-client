import type { Metadata } from "next";
import Link from "next/link";
import { Edit, Eye, Plus } from "lucide-react";

import { EmptyPanel } from "@/components/dashboard/empty-panel";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "My Books | Seller Workspace" };

export default async function SellerBooksPage() {
  const user = await requireRole("seller");
  const shop = await prisma.shop.findUnique({ where: { ownerId: user.id } });

  const books = shop
    ? await prisma.book.findMany({
        where: { shopId: shop.id },
        include: {
          category: { select: { name: true } },
          author: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory Catalogue"
        title="My Books"
        description="Manage your published titles, prices, conditions, and stock quantities."
        actions={
          <Link
            href="/seller/books/create"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90"
          >
            <Plus className="size-4" /> Add New Book
          </Link>
        }
      />

      {books.length ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Condition</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Sales</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {books.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground line-clamp-1">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.author.name}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{b.category.name}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="rounded bg-muted px-2 py-0.5 font-medium">{b.condition}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(b.price)}</td>
                  <td className="px-4 py-3">
                    <span className={b.stock <= b.lowStockAlert ? "text-warning font-bold" : ""}>
                      {b.stock} left
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{b.salesCount} sold</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.isActive ? "ACTIVE" : "SUSPENDED"} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/books/${b.slug}`}
                        target="_blank"
                        className="rounded p-1 text-muted-foreground hover:text-foreground"
                        title="View Public Listing"
                      >
                        <Eye className="size-4" />
                      </Link>
                      <Link
                        href={`/seller/books/${b.id}/edit`}
                        className="rounded p-1 text-primary hover:bg-primary/10"
                        title="Edit Book"
                      >
                        <Edit className="size-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyPanel
          title="No books listed yet"
          description="Click 'Add New Book' to publish your first title and reach readers."
          action={{
            label: "Add New Book",
            href: "/seller/books/create",
          }}
        />
      )}
    </div>
  );
}
