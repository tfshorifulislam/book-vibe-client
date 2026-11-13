import type { Metadata } from "next";
import Link from "next/link";
import { Eye } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { UserStatusToggle } from "@/components/admin/user-actions";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Manage Sellers | Admin Dashboard" };

export default async function AdminSellersPage() {
  await requireRole("admin");

  const sellers = await prisma.user.findMany({
    where: { role: "SELLER" },
    include: {
      shop: {
        include: {
          _count: { select: { books: true } },
        },
      },
      orderItemsSold: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Merchant Roster"
        title="Seller Management"
        description="Monitor verified bookstore owners, catalog sizes, and merchant operational status."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">Bookstore / Merchant</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Catalog Size</th>
              <th className="px-4 py-3">Items Sold</th>
              <th className="px-4 py-3">Account Status</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sellers.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-semibold text-foreground">{s.shop?.name ?? "No Shop Created"}</p>
                  <p className="text-xs text-muted-foreground">{s.name} ({s.email})</p>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {s.shop?.city ? `${s.shop.city}, ${s.shop.district}` : "Not provided"}
                </td>
                <td className="px-4 py-3 text-xs font-medium">
                  {s.shop?._count.books ?? 0} books
                </td>
                <td className="px-4 py-3 text-xs">{s.orderItemsSold.length} units</td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(s.createdAt.toISOString().slice(0, 10))}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/sellers/${s.id}`}
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                      title="View Seller Profile"
                    >
                      <Eye className="size-4" />
                    </Link>
                    <UserStatusToggle userId={s.id} currentStatus={s.status} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
