import Link from "next/link";
import { CreditCard } from "lucide-react";

import { prisma } from "@/lib/db";
import { formatCurrency, formatDateDisplay } from "@/lib/utils";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Payments Log
          </h1>
          <p className="text-sm text-muted-foreground">
            Audit customer payments across Cash on Delivery, bKash, and digital
            gateways.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
          <CreditCard className="size-4 text-primary" />
          <span>
            Total Transactions:{" "}
            <strong className="text-foreground">{payments.length}</strong>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Transaction Ref</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No payment records found.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${p.order.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {p.order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">
                      {p.order.user.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.order.user.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {p.provider}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {p.transactionRef ?? "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.status === "PAID" || p.status === "COMPLETED"
                          ? "bg-success/15 text-success"
                          : p.status === "FAILED"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-warning/15 text-warning"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateDisplay(p.createdAt, { includeTime: true })}
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
