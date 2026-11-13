import type { Metadata } from "next";
import { BarChart3, TrendingUp, Users, BookOpen } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Store Analytics | Seller Workspace",
};

export default async function SellerAnalyticsPage() {
  const user = await requireRole("seller");

  const [orderItems, books, completedOrders] = await Promise.all([
    prisma.orderItem.findMany({
      where: {
        sellerId: user.id,
        order: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
      },
      include: {
        book: { select: { title: true, category: { select: { name: true } } } },
        order: { select: { createdAt: true } },
      },
    }),
    prisma.book.findMany({
      where: { shop: { ownerId: user.id } },
      select: {
        id: true,
        title: true,
        price: true,
        salesCount: true,
        stock: true,
      },
      orderBy: { salesCount: "desc" },
      take: 5,
    }),
    prisma.order.findMany({
      where: {
        items: { some: { sellerId: user.id } },
        status: "DELIVERED",
      },
      select: { id: true, total: true, createdAt: true },
    }),
  ]);

  const grossSales = orderItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  const unitsSold = orderItems.reduce((sum, i) => sum + i.quantity, 0);
  const avgOrderValue = completedOrders.length
    ? Math.round(grossSales / completedOrders.length)
    : 0;

  // Category breakdown
  const categoryMap = new Map<string, number>();
  for (const item of orderItems) {
    const cat = item.book?.category?.name ?? "General";
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + item.quantity);
  }
  const topCategories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Intelligence"
        title="Sales & Analytics"
        description="Comprehensive insights into your bookstore's sales trends and reader demand."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Gross Revenue"
          value={formatPrice(grossSales)}
          hint="From completed and active orders"
          icon={<TrendingUp className="size-4" />}
        />
        <StatCard
          label="Books Sold"
          value={`${unitsSold} units`}
          hint="Total physical copies dispatched"
          icon={<BookOpen className="size-4" />}
        />
        <StatCard
          label="Delivered Orders"
          value={completedOrders.length}
          hint="Successfully fulfilled orders"
          icon={<BarChart3 className="size-4" />}
        />
        <StatCard
          label="Avg Order Value"
          value={formatPrice(avgOrderValue)}
          hint="Per fulfilled order"
          icon={<Users className="size-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Selling Books */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Top Performing Books</h2>
          {books.length ? (
            <div className="divide-y divide-border">
              {books.map((b, i) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3 pr-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <p className="truncate text-sm font-medium text-foreground">
                      {b.title}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold">{b.salesCount} sold</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(b.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No sales data yet.</p>
          )}
        </div>

        {/* Sales by Category */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Demand by Category</h2>
          {topCategories.length ? (
            <div className="space-y-3">
              {topCategories.map((c) => {
                const pct =
                  unitsSold > 0 ? Math.round((c.count / unitsSold) * 100) : 0;
                return (
                  <div key={c.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{c.name}</span>
                      <span className="text-muted-foreground">
                        {c.count} units ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No category sales recorded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
