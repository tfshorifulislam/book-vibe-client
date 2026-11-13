import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, ExternalLink, Store } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { UserStatusToggle } from "@/components/admin/user-actions";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Seller Details | Admin Dashboard" };

export default async function AdminSellerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;

  const seller = await prisma.user.findFirst({
    where: { id, role: "SELLER" },
    include: {
      shop: {
        include: {
          books: {
            take: 8,
            orderBy: { createdAt: "desc" },
            include: { category: { select: { name: true } } },
          },
          _count: { select: { books: true } },
        },
      },
    },
  });

  if (!seller) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/sellers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to Sellers
      </Link>

      <PageHeader
        eyebrow="Seller Merchant"
        title={seller.shop?.name ?? seller.name}
        description={`Owner: ${seller.name} (${seller.email}) · Joined ${formatDate(seller.createdAt.toISOString().slice(0, 10))}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={seller.status} className="text-sm px-3 py-1" />
            <UserStatusToggle userId={seller.id} currentStatus={seller.status} />
            {seller.shop ? (
              <Link
                href={`/shops/${seller.shop.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                <ExternalLink className="size-3.5" /> View Public Shop
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Store className="size-4" /> Bookstore Profile
          </h2>
          <div className="text-sm space-y-2">
            <p className="text-xs text-muted-foreground">{seller.shop?.description || "No description provided."}</p>
            <div className="border-t border-border pt-2 text-xs space-y-1">
              <p><span className="font-semibold">Phone:</span> {seller.shop?.phone || seller.phone || "N/A"}</p>
              <p><span className="font-semibold">Email:</span> {seller.shop?.email || seller.email}</p>
              <p><span className="font-semibold">Address:</span> {seller.shop?.address || "N/A"}, {seller.shop?.city || ""}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <BookOpen className="size-4" /> Catalog Sample ({seller.shop?._count.books ?? 0} total)
          </h2>
          {seller.shop?.books.length ? (
            <div className="divide-y divide-border text-xs">
              {seller.shop.books.map((b) => (
                <div key={b.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground line-clamp-1">{b.title}</p>
                    <p className="text-muted-foreground">{b.category.name} · {b.condition}</p>
                  </div>
                  <span className="font-bold">{b.stock} in stock</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No books published by this seller yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
