import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CircleDollarSign,
  ClipboardList,
  Package,
  TriangleAlert,
} from "lucide-react";

import { EmptyPanel } from "@/components/dashboard/empty-panel";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Seller dashboard" };

export default async function SellerDashboardPage() {
  const user = await requireRole("seller");
  const shop = await prisma.shop.findUnique({ where: { ownerId: user.id } });
  const [books, orderItems, recentOrders, pendingCount] = await Promise.all([
    prisma.book.findMany({
      where: { shop: { ownerId: user.id } },
      select: { id: true, title: true, slug: true, stock: true, lowStockAlert: true, salesCount: true, price: true },
      orderBy: { salesCount: "desc" },
    }),
    prisma.orderItem.findMany({
      where: {
        sellerId: user.id,
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
      select: { price: true, quantity: true },
    }),
    prisma.order.findMany({
      where: { items: { some: { sellerId: user.id } } },
      include: { items: { where: { sellerId: user.id } }, user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.count({
      where: { status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] }, items: { some: { sellerId: user.id } } },
    }),
  ]);

  const revenue = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const unitsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const lowStock = books.filter((book) => book.stock > 0 && book.stock <= book.lowStockAlert);
  const outOfStock = books.filter((book) => book.stock === 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Seller workspace"
        title={shop?.name ?? "Your shop"}
        description={shop ? "Track sales, inventory, and orders from one place." : "Create your shop profile and start listing books."}
        actions={
          <Link href={shop ? "/seller/books/new" : "/seller/shop"} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
            {shop ? "Add a book" : "Create shop"} <ArrowRight className="size-3.5" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatPrice(revenue)} hint={`${unitsSold} units sold`} icon={<CircleDollarSign className="size-4" />} />
        <StatCard label="Orders to action" value={pendingCount} hint="Pending, confirmed, or processing" icon={<ClipboardList className="size-4" />} />
        <StatCard label="Listings" value={books.length} hint={`${outOfStock.length} out of stock`} icon={<BookOpen className="size-4" />} />
        <StatCard label="Low stock" value={lowStock.length} hint="At or below alert threshold" icon={<TriangleAlert className="size-4" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-bold"><Package className="size-4" /> Recent orders</h2>
            <Link href="/seller/orders" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          {recentOrders.length ? (
            <div className="mt-4 divide-y divide-border">
              {recentOrders.map((order) => {
                const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                return (
                  <Link key={order.id} href={`/seller/orders/${order.id}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><ClipboardList className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.user.name} · {formatDate(order.createdAt.toISOString().slice(0, 10))}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatPrice(total)}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-4"><EmptyPanel title="No orders yet" description="New orders containing your books will appear here." /></div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold">Best sellers</h2>
            <Link href="/seller/inventory" className="text-xs font-medium text-primary hover:underline">Inventory</Link>
          </div>
          {books.length ? (
            <ul className="mt-4 space-y-3">
              {books.slice(0, 5).map((book) => (
                <li key={book.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/books/${book.slug}`} className="truncate text-sm font-medium hover:text-primary">{book.title}</Link>
                    <p className="text-xs text-muted-foreground">{book.salesCount} sold · {book.stock} in stock</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">{formatPrice(book.price)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No listings yet.</p>
          )}
        </section>
      </div>

      {lowStock.length || outOfStock.length ? (
        <section className="rounded-xl border border-warning/30 bg-warning/5 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold"><TriangleAlert className="size-4 text-warning" /> Inventory needs attention</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[...outOfStock, ...lowStock].slice(0, 6).map((book) => (
              <li key={book.id} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
                <span className="line-clamp-1 font-medium">{book.title}</span>
                <span className="text-xs text-muted-foreground">{book.stock === 0 ? "Out of stock" : `${book.stock} left`}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
