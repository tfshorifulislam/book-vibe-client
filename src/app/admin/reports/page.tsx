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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Audit & System Reports</h1>
          <p className="text-sm text-muted-foreground">
            Complete platform audit logs, security event traces, and operational activity records.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Registered Users</div>
          <div className="text-2xl font-bold text-foreground mt-2">{totalUsers}</div>
          <p className="text-xs text-muted-foreground mt-1">Platform buyer & seller accounts</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Total Orders</div>
          <div className="text-2xl font-bold text-foreground mt-2">{totalOrders}</div>
          <p className="text-xs text-muted-foreground mt-1">Lifetime customer transactions</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Catalog Books</div>
          <div className="text-2xl font-bold text-foreground mt-2">{totalBooks}</div>
          <p className="text-xs text-muted-foreground mt-1">Listed titles in circulation</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="size-4 text-primary" /> Audit Trail Log
          </h2>
          <span className="text-xs text-muted-foreground">Last {auditLogs.length} events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    <FileText className="mx-auto size-8 text-muted-foreground/50 mb-2" />
                    No audit log records found.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateDisplay(log.createdAt, { includeTime: true })}
                    </td>
                    <td className="px-4 py-3">
                      {log.user ? (
                        <div>
                          <div className="font-medium text-foreground text-xs">{log.user.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {log.user.role} · {log.user.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground font-mono">System</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{log.entity}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                      {log.entityId ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate font-mono">
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
