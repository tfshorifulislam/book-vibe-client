import { Bell, CheckCheck } from "lucide-react";

import { prisma } from "@/lib/db";
import { formatDateDisplay } from "@/lib/utils";
import { BroadcastNotificationForm } from "@/components/admin/broadcast-notification-form";


export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    include: {
      user: { select: { name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications Broadcast</h1>
          <p className="text-sm text-muted-foreground">
            Send platform-wide announcements or monitor delivered system notifications.
          </p>
        </div>
      </div>

      <BroadcastNotificationForm />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Bell className="size-4 text-primary" /> Recent Sent Notifications
          </h2>
          <span className="text-xs text-muted-foreground">{notifications.length} logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Title & Message</th>
                <th className="px-4 py-3">Link</th>
                <th className="px-4 py-3">Read Status</th>
                <th className="px-4 py-3">Sent At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {notifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No notifications in the system yet.
                  </td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground text-xs">{n.user.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {n.user.role} · {n.user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                          n.type === "ALERT"
                            ? "bg-destructive/15 text-destructive"
                            : n.type === "PROMO"
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {n.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-sm">
                      <div className="font-semibold text-foreground text-xs">{n.title}</div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                      {n.href ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs ${
                          n.isRead ? "text-success" : "text-muted-foreground"
                        }`}
                      >
                        <CheckCheck className="size-3.5" />
                        {n.isRead ? "Read" : "Unread"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateDisplay(n.createdAt, { includeTime: true })}
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
