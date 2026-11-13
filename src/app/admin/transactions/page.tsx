import { ArrowDownLeft, ArrowUpRight, DollarSign, RefreshCw } from "lucide-react";

import { prisma } from "@/lib/db";
import { formatCurrency, formatDateDisplay } from "@/lib/utils";


export default async function AdminTransactionsPage() {
  const [payments, payouts, refunds] = await Promise.all([
    prisma.payment.findMany({
      include: { order: { select: { orderNumber: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.payout.findMany({
      include: { seller: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.refund.findMany({
      include: { order: { select: { orderNumber: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const totalGMV = payments
    .filter((p) => p.status === "PAID" || p.status === "COMPLETED")
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPayoutsPaid = payouts
    .filter((p) => p.status === "PAID")
    .reduce((acc, p) => acc + p.amount, 0);

  const totalRefundsApproved = refunds
    .filter((r) => r.status === "APPROVED" || r.status === "PROCESSED")
    .reduce((acc, r) => acc + r.amount, 0);

  const estimatedCommission = Math.round(totalGMV * 0.1);

  // Combine into a chronological transaction feed
  type TxEntry = {
    id: string;
    type: "PAYMENT" | "PAYOUT" | "REFUND";
    label: string;
    amount: number;
    status: string;
    date: Date;
  };

  const feed: TxEntry[] = [
    ...payments.map((p) => ({
      id: `pay-${p.id}`,
      type: "PAYMENT" as const,
      label: `Order ${p.order.orderNumber} Payment (${p.provider})`,
      amount: p.amount,
      status: p.status,
      date: p.createdAt,
    })),
    ...payouts.map((p) => ({
      id: `out-${p.id}`,
      type: "PAYOUT" as const,
      label: `Seller Payout: ${p.seller.name}`,
      amount: p.amount,
      status: p.status,
      date: p.createdAt,
    })),
    ...refunds.map((r) => ({
      id: `ref-${r.id}`,
      type: "REFUND" as const,
      label: `Order ${r.order.orderNumber} Refund`,
      amount: r.amount,
      status: r.status,
      date: r.createdAt,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Transactions Ledger</h1>
        <p className="text-sm text-muted-foreground">
          Comprehensive financial movement ledger across platform sales, seller disbursements, and refunds.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Gross Sales Volume</span>
            <DollarSign className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{formatCurrency(totalGMV)}</div>
          <p className="text-xs text-muted-foreground mt-1">Paid customer checkouts</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Platform Commission</span>
            <DollarSign className="size-4 text-success" />
          </div>
          <div className="text-2xl font-bold text-success mt-2">
            {formatCurrency(estimatedCommission)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">10% marketplace fee</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Seller Payouts</span>
            <ArrowUpRight className="size-4 text-warning" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {formatCurrency(totalPayoutsPaid)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Disbursed earnings</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Refunds Settled</span>
            <RefreshCw className="size-4 text-destructive" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {formatCurrency(totalRefundsApproved)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Returned payments</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/20">
          <h2 className="text-sm font-semibold text-foreground">Recent Financial Activity</h2>
        </div>
        <div className="divide-y divide-border">
          {feed.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No financial activity recorded yet.
            </div>
          ) : (
            feed.map((entry) => (
              <div key={entry.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-9 rounded-lg flex items-center justify-center ${
                      entry.type === "PAYMENT"
                        ? "bg-success/15 text-success"
                        : entry.type === "PAYOUT"
                        ? "bg-warning/15 text-warning"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {entry.type === "PAYMENT" ? (
                      <ArrowDownLeft className="size-4" />
                    ) : entry.type === "PAYOUT" ? (
                      <ArrowUpRight className="size-4" />
                    ) : (
                      <RefreshCw className="size-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm">{entry.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateDisplay(entry.date, { includeTime: true })}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-bold ${
                      entry.type === "PAYMENT"
                        ? "text-success"
                        : entry.type === "PAYOUT"
                        ? "text-foreground"
                        : "text-destructive"
                    }`}
                  >
                    {entry.type === "PAYMENT" ? "+" : "-"}
                    {formatCurrency(entry.amount)}
                  </div>
                  <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                    {entry.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
