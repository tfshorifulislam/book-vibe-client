import { FileText, Shield } from "lucide-react";

import { prisma } from "@/lib/db";
import { formatDateDisplay } from "@/lib/utils";

export default async function AdminReportsPage() {
  const [auditLogs, totalUsers, totalOrders, totalBooks] = await Promise.all([
    prisma.auditLog.findMany({
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.user.count(),
    prisma.order.count(),
    prisma.book.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Audit & System Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete platform audit logs, security event traces, and operational
            activity records.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase">
            Registered Users
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {totalUsers}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Platform buyer & seller accounts
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase">
            Total Orders
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {totalOrders}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Lifetime customer transactions
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase">
            Catalog Books
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {totalBooks}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Listed titles in circulation
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Shield className="size-4 text-primary" /> Audit Trail Log
          </h2>
          <span className="text-xs text-muted-foreground">
            Last {auditLogs.length} events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Entity ID</th>
                <th className="px-4 py-3">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    <FileText className="mx-auto mb-2 size-8 text-muted-foreground/50" />
                    No audit log records found.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">
                      {formatDateDisplay(log.createdAt, { includeTime: true })}
                    </td>
                    <td className="px-4 py-3">
                      {log.user ? (
                        <div>
                          <div className="text-xs font-medium text-foreground">
                            {log.user.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {log.user.role} · {log.user.email}
                          </div>
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">
                          System
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground">
                      {log.entity}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {log.entityId ?? "-"}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-muted-foreground">
                      {log.metadata ?? "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
