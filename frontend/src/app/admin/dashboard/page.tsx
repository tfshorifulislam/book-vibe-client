import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  CircleDollarSign,
  Package,
  ShieldAlert,
  Users,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Overview | BookHand" };

export default async function AdminDashboardPage() {
  await requireRole("admin");

  const [
    userCount,
    sellerCount,
    bookCount,
    shopCount,
    orders,
    disputesCount,
    payoutsCount,
    recentOrders,
    topShops,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.book.count(),
    prisma.shop.count({ where: { status: "ACTIVE" } }),
    prisma.order.findMany({ select: { total: true, status: true } }),
    prisma.dispute.count({ where: { status: "OPEN" } }),
    prisma.payout.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      include: { user: { select: { name: true, email: true } }, items: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.shop.findMany({
      include: {
        _count: { select: { books: true } },
        owner: { select: { name: true } },
      },
      take: 5,
    }),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalCommission = Math.round(totalRevenue * 0.1);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform Command Center"
        title="Admin Dashboard"
        description="Global metrics, sales volumes, customer activity, and catalog oversight across BookHand."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Gross Platform Volume"
          value={formatPrice(totalRevenue)}
          hint={`${orders.length} lifetime orders placed`}
          icon={<CircleDollarSign className="size-4" />}
        />
        <StatCard
          label="Platform Revenue (10%)"
          value={formatPrice(totalCommission)}
          hint="Commission earned by marketplace"
          icon={<Wallet className="size-4" />}
        />
        <StatCard
          label="Registered Users"
          value={userCount}
          hint={`${sellerCount} active verified sellers`}
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="Live Catalog Books"
          value={bookCount}
          hint={`${shopCount} active bookstores`}
          icon={<BookOpen className="size-4" />}
        />
      </div>

      {disputesCount > 0 || payoutsCount > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {disputesCount > 0 ? (
            <div className="flex items-center justify-between rounded-xl border border-warning/30 bg-warning/5 p-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="size-5 text-warning" />
                <div>
                  <p className="text-sm font-semibold">
                    {disputesCount} Open Disputes Pending
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Buyer issues requiring platform arbitration
                  </p>
                </div>
              </div>
              <Link
                href="/admin/disputes"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Review disputes →
              </Link>
            </div>
          ) : null}

          {payoutsCount > 0 ? (
            <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <Wallet className="size-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">
                    {payoutsCount} Payout Requests Pending
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Seller withdrawal claims awaiting clearance
                  </p>
                </div>
              </div>
              <Link
                href="/admin/payouts"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Process payouts →
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        {/* Recent Orders */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Package className="size-4" /> Recent Marketplace Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all orders
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between py-3"
              >
                <div className="min-w-0 pr-4">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-mono text-xs font-bold text-primary hover:underline"
                  >
                    {o.orderNumber}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {o.user.name} ·{" "}
                    {formatDate(o.createdAt.toISOString().slice(0, 10))}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <span className="text-sm font-semibold">
                    {formatPrice(o.total)}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Shops */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Building2 className="size-4" /> Bookstores
            </h2>
            <Link
              href="/admin/shops"
              className="text-xs font-medium text-primary hover:underline"
            >
              All shops
            </Link>
          </div>
          <div className="divide-y divide-border">
            {topShops.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-3"
              >
                <div className="min-w-0 pr-2">
                  <p className="line-clamp-1 text-sm font-medium text-foreground">
                    {s.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Owner: {s.owner.name}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {s._count.books} books
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
