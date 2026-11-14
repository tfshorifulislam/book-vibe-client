import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PayoutForm } from "@/components/seller/payout-form";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Payout Requests | Seller Workspace",
};

export default function SellerPayoutsPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <SellerPayoutsContent />
    </Suspense>
  );
}

async function SellerPayoutsContent() {
  await connection();
  const user = await requireRole("seller");

  const [deliveredItems, payouts] = await Promise.all([
    prisma.orderItem.findMany({
      where: {
        sellerId: user.id,
        order: { status: "DELIVERED" },
      },
      select: { price: true, quantity: true },
    }),
    prisma.payout.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const deliveredGross = deliveredItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  const deliveredNet = Math.round(deliveredGross * 0.9);
  const withdrawnOrPending = payouts
    .filter((p) => p.status === "PENDING" || p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);
  const availableBalance = Math.max(0, deliveredNet - withdrawnOrPending);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Withdrawals"
        title="Payout Requests"
        description="Withdraw your book sales earnings directly to your mobile wallet or bank account."
      />

      <PayoutForm availableBalance={availableBalance} />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="text-base font-semibold">Payout History</h2>
        </div>
        {payouts.length ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Channel / Account</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Requested</th>
                <th className="px-4 py-3 text-right">Processed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-bold text-foreground">
                    {formatPrice(p.amount)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.method ?? "Standard Bank"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(p.createdAt.toISOString().slice(0, 10))}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {p.processedAt
                      ? formatDate(p.processedAt.toISOString().slice(0, 10))
                      : "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No payout requests made yet.
          </div>
        )}
      </div>
    </div>
  );
}
