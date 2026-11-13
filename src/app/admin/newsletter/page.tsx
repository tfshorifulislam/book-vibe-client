import { Mail, Users } from "lucide-react";

import { prisma } from "@/lib/db";
import { formatDateDisplay } from "@/lib/utils";


export default async function AdminNewsletterPage() {
  const subscribers = await prisma.newsletterSubscription.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Newsletter Subscribers</h1>
          <p className="text-sm text-muted-foreground">
            View verified email subscribers from the BookHand homepage newsletter form.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-3 py-1.5 rounded-lg border border-border">
          <Users className="size-4 text-primary" />
          <span>Total Subscribers: <strong className="text-foreground">{subscribers.length}</strong></span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Subscriber Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Subscribed Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  <Mail className="mx-auto size-8 text-muted-foreground/50 mb-2" />
                  No subscribers yet.
                </td>
              </tr>
            ) : (
              subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {sub.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateDisplay(sub.createdAt, { includeTime: true })}
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
