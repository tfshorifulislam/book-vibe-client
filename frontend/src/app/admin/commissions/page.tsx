import Link from "next/link";
import { DollarSign, Percent, Settings, Store } from "lucide-react";

import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export default async function AdminCommissionsPage() {
  const [setting, shops, deliveredOrders] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: "commission_rate" } }),
    prisma.shop.findMany({
      include: {
        books: { select: { id: true } },
        _count: { select: { books: true } },
      },
    }),
    prisma.order.findMany({
      where: { status: "DELIVERED" },
      select: { subtotal: true, total: true },
    }),
  ]);

  const commissionRate = parseInt(setting?.value ?? "10", 10) || 10;
  const totalDeliveredGMV = deliveredOrders.reduce(
    (sum, o) => sum + o.subtotal,
    0,
  );
  const totalCommissionEarned = Math.round(
    (totalDeliveredGMV * commissionRate) / 100,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Commissions Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Platform revenue share, marketplace take-rate, and fee collection
            across registered sellers.
          </p>
        </div>
        <Link
          href="/admin/settings/commission"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
        >
          <Settings className="size-3.5" /> Adjust Commission Rate
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Marketplace Take-Rate</span>
            <Percent className="size-4 text-primary" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-foreground">
            {commissionRate}%
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Applies to all completed orders
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Delivered Volume</span>
            <DollarSign className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-foreground">
            {formatCurrency(totalDeliveredGMV)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Total delivered merchandise value
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Platform Revenue</span>
            <DollarSign className="size-4 text-success" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-success">
            {formatCurrency(totalCommissionEarned)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Net earned marketplace commission
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Store className="size-4 text-primary" /> Vendor Commission Overview
          </h2>
          <span className="text-xs text-muted-foreground">
            {shops.length} Active Shops
          </span>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">Bookstore / Shop</th>
              <th className="px-4 py-3">Listed Books</th>
              <th className="px-4 py-3">Fee Model</th>
              <th className="px-4 py-3">Commission Rate</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shops.map((shop) => (
              <tr key={shop.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-semibold text-foreground">
                    {shop.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    /{shop.slug}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {shop._count.books} books
                </td>
                <td className="px-4 py-3 text-xs font-medium text-foreground">
                  Standard Percentage
                </td>
                <td className="px-4 py-3 font-semibold text-foreground">
                  {commissionRate}%
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      shop.status === "ACTIVE"
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {shop.status === "ACTIVE"
                      ? "Active & Verified"
                      : "Pending Verification"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/sellers/${shop.ownerId}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View Vendor
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
