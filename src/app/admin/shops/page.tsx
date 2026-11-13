import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Store } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Manage Shops | Admin Dashboard" };

export default async function AdminShopsPage() {
  await requireRole("admin");

  const shops = await prisma.shop.findMany({
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { books: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Marketplace Stores"
        title="Bookshops Directory"
        description="Oversee bookstore storefronts, owner assignments, and shop activity."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">Shop Name</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Books Listed</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shops.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Store className="size-4 shrink-0 text-primary" />
                    <span>{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-foreground">{s.owner.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.owner.email}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {s.city ? `${s.city}, ${s.district}` : "N/A"}
                </td>
                <td className="px-4 py-3 text-xs font-medium">
                  {s._count.books} books
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(s.createdAt.toISOString().slice(0, 10))}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/shops/${s.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <ExternalLink className="size-3.5" /> View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
