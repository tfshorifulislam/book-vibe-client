import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleDollarSign, Percent, Wallet } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Earnings & Finances | Seller Workspace",
};

export default function SellerEarningsPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <SellerEarningsContent />
    </Suspense>
  );
}

async function SellerEarningsContent() {
  await connection();
  const user = await requireRole("seller");

  const [orderItems, deliveredItems, payouts] = await Promise.all([
    prisma.orderItem.findMany({
      where: {
        sellerId: user.id,
        order: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
      },
      include: {
        order: { select: { orderNumber: true, status: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.orderItem.findMany({
      where: {
        sellerId: user.id,
        order: { status: "DELIVERED" },
      },
      select: { price: true, quantity: true },
    }),
    prisma.payout.findMany({
      where: { sellerId: user.id, status: { in: ["PENDING", "PAID"] } },
      select: { amount: true },
    }),
  ]);

  const grossSales = orderItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  const platformFee = Math.round(grossSales * 0.1); // 10% marketplace commission
  const netEarnings = grossSales - platformFee;

  const deliveredGross = deliveredItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  const deliveredNet = Math.round(deliveredGross * 0.9);
  const withdrawnOrPending = payouts.reduce((sum, p) => sum + p.amount, 0);
  const availableBalance = Math.max(0, deliveredNet - withdrawnOrPending);
  const pendingClearance = netEarnings - deliveredNet;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finances"
        title="Seller Earnings"
        description="Transparent breakdown of your book sales, platform commissions, and withdrawable balance."
        actions={
          <Link
            href="/seller/payouts"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90"
          >
            Manage Payouts <ArrowRight className="size-4" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Net Earnings"
          value={formatPrice(netEarnings)}
          hint="After 10% platform commission"
          icon={<Wallet className="size-4" />}
        />
        <StatCard
          label="Available to Withdraw"
          value={formatPrice(availableBalance)}
          hint="From delivered orders"
          icon={<CircleDollarSign className="size-4" />}
        />
        <StatCard
          label="Pending Clearance"
          value={formatPrice(pendingClearance)}
          hint="Orders in processing or transit"
          icon={<CircleDollarSign className="size-4" />}
        />
        <StatCard
          label="Platform Commission (10%)"
          value={formatPrice(platformFee)}
          hint="Standard marketplace fee"
          icon={<Percent className="size-4" />}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="text-base font-semibold">
            Sales Transactions History
          </h2>
        </div>
        {orderItems.length ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Gross Sale</th>
                <th className="px-4 py-3">Commission (10%)</th>
                <th className="px-4 py-3">Your Net</th>
                <th className="px-4 py-3">Order Status</th>
                <th className="px-4 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orderItems.map((item) => {
                const itemGross = item.price * item.quantity;
                const itemFee = Math.round(itemGross * 0.1);
                const itemNet = itemGross - itemFee;

                return (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-semibold text-primary">
                      {item.order.orderNumber}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(itemGross)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      -{formatPrice(itemFee)}
                    </td>
                    <td className="px-4 py-3 font-bold text-success">
                      {formatPrice(itemNet)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="rounded bg-muted px-2 py-0.5 font-medium">
                        {item.order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {formatDate(item.createdAt.toISOString().slice(0, 10))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No earnings recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
