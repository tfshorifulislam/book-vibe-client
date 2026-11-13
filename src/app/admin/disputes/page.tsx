import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { prisma } from "@/lib/db";
import { formatDateDisplay } from "@/lib/utils";
import { ModerationButton } from "@/components/admin/moderation-actions";

export default async function AdminDisputesPage() {
  const disputes = await prisma.dispute.findMany({
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
            Disputes Resolution
          </h1>
          <p className="text-sm text-muted-foreground">
            Arbitrate disputes raised by buyers against marketplace sellers and
            orders.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
          <AlertCircle className="size-4 text-warning" />
          <span>
            Total Disputes:{" "}
            <strong className="text-foreground">{disputes.length}</strong>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Raised By</th>
              <th className="px-4 py-3">Reason / Details</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Resolution</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {disputes.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No disputes opened.
                </td>
              </tr>
            ) : (
              disputes.map((d) => (
                <tr key={d.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-semibold">
                    <Link
                      href={`/admin/orders/${d.order.id}`}
                      className="text-primary hover:underline"
                    >
                      {d.order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">
                      {d.order.user.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {d.order.user.email}
                    </div>
                  </td>
                  <td className="max-w-xs px-4 py-3">
                    <p className="line-clamp-2 text-xs text-foreground">
                      {d.reason}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        d.status === "RESOLVED"
                          ? "bg-success/15 text-success"
                          : d.status === "REJECTED"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-warning/15 text-warning"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-xs text-muted-foreground">
                    {d.resolution ?? "Pending investigation"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateDisplay(d.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {d.status === "OPEN" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <ModerationButton
                          type="dispute"
                          id={d.id}
                          action="resolve"
                          resolution="Arbitrated and resolved by administrator."
                        />
                        <ModerationButton
                          type="dispute"
                          id={d.id}
                          action="reject"
                          resolution="Dispute claim dismissed after review."
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Closed
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
