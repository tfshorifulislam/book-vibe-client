import type { Metadata } from "next";
import { BarChart3, TrendingUp, Users, BookOpen } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Platform Analytics | Admin Dashboard",
};

export default async function AdminAnalyticsPage() {
  await requireRole("admin");

  const [orders, books, users, categories] = await Promise.all([
    prisma.order.findMany({
      select: { total: true, status: true, createdAt: true },
    }),
    prisma.book.findMany({
      select: {
        id: true,
        salesCount: true,
        category: { select: { name: true } },
      },
    }),
    prisma.user.findMany({ select: { role: true, createdAt: true } }),
    prisma.category.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { order: "asc" },
    }),
  ]);

  const totalVolume = orders.reduce((sum, o) => sum + o.total, 0);
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;
  const fulfillmentRate = orders.length
    ? Math.round((deliveredOrders / orders.length) * 100)
    : 100;
  const buyerCount = users.filter((u) => u.role === "BUYER").length;
  const sellerCount = users.filter((u) => u.role === "SELLER").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform Intelligence"
        title="Marketplace Analytics"
        description="Macro-level metrics on gross merchandise volume, fulfillment performance, and community growth."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Gross Merchandise Volume"
          value={formatPrice(totalVolume)}
          hint={`${orders.length} total orders recorded`}
          icon={<TrendingUp className="size-4" />}
        />
        <StatCard
          label="Fulfillment Success Rate"
          value={`${fulfillmentRate}%`}
          hint={`${deliveredOrders} delivered orders`}
          icon={<BarChart3 className="size-4" />}
        />
        <StatCard
          label="Total Registered Buyers"
          value={buyerCount}
          hint="Active book consumers"
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="Total Registered Sellers"
          value={sellerCount}
          hint="Independent bookstores & sellers"
          icon={<BookOpen className="size-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Catalog Books by Category</h2>
          <div className="space-y-3">
            {categories.slice(0, 8).map((c) => {
              const count = c._count.books;
              const pct = books.length
                ? Math.round((count / books.length) * 100)
                : 0;
              return (
                <div key={c.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{c.name}</span>
                    <span className="text-muted-foreground">
                      {count} books ({pct}%)
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
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">User Base Distribution</h2>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
              <p className="text-3xl font-extrabold text-primary">
                {buyerCount}
              </p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground uppercase">
                Buyers
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
              <p className="text-3xl font-extrabold text-foreground">
                {sellerCount}
              </p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground uppercase">
                Sellers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
