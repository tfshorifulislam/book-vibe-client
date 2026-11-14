import { DollarSign } from "lucide-react";

import { prisma } from "@/lib/db";
import { formatCurrency, formatDateDisplay } from "@/lib/utils";
import { AdminPayoutActions } from "@/components/admin/payout-actions";

export default async function AdminPayoutsPage() {
  const payouts = await prisma.payout.findMany({
    include: {
      seller: { select: { id: true, name: true, email: true } },
      shop: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingTotal = payouts
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0);

  const paidTotal = payouts
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Seller Payouts
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and disburse seller balance withdrawal requests via bKash,
            Nagad, or Bank Transfer.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Pending Payout Requests</span>
            <DollarSign className="size-4 text-warning" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {formatCurrency(pendingTotal)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Awaiting approval and release
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Total Disbursed</span>
            <DollarSign className="size-4 text-success" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {formatCurrency(paidTotal)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Successfully settled payouts
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">Seller / Shop</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Payment Method</th>
              <th className="px-4 py-3">Note / Details</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Requested At</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payouts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No payout requests on record.
                </td>
              </tr>
            ) : (
              payouts.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">
                      {p.seller.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.shop?.name ?? p.seller.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-foreground">
                    {p.method ?? "Bank / MFS"}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-xs text-muted-foreground">
                    {p.note ?? "Standard balance withdrawal"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.status === "PAID"
                          ? "bg-success/15 text-success"
                          : p.status === "REJECTED"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-warning/15 text-warning"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateDisplay(p.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.status === "PENDING" ? (
                      <AdminPayoutActions payoutId={p.id} />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Processed
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
