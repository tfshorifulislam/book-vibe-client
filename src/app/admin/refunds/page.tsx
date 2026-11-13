import Link from "next/link";
import { RotateCcw } from "lucide-react";

import { prisma } from "@/lib/db";
import { formatCurrency, formatDateDisplay } from "@/lib/utils";
import { AdminRefundActions } from "@/components/admin/refund-actions";


export default async function AdminRefundsPage() {
  const refunds = await prisma.refund.findMany({
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Refund Requests</h1>
          <p className="text-sm text-muted-foreground">
            Review and adjudicate customer refund and return claims.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-3 py-1.5 rounded-lg border border-border">
          <RotateCcw className="size-4 text-primary" />
          <span>Total Requests: <strong className="text-foreground">{refunds.length}</strong></span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {refunds.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No refund requests on record.
                </td>
              </tr>
            ) : (
              refunds.map((refund) => (
                <tr key={refund.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${refund.order.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {refund.order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{refund.order.user.name}</div>
                    <div className="text-xs text-muted-foreground">{refund.order.user.email}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {formatCurrency(refund.amount)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                    {refund.reason}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                        refund.status === "APPROVED" || refund.status === "PROCESSED"
                          ? "bg-success/15 text-success"
                          : refund.status === "REJECTED"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-warning/15 text-warning"
                      }`}
                    >
                      {refund.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateDisplay(refund.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {refund.status === "REQUESTED" ? (
                      <AdminRefundActions refundId={refund.id} />
                    ) : (
                      <span className="text-xs text-muted-foreground">Settled</span>
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
