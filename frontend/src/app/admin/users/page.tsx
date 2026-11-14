import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { Eye } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { UserStatusToggle } from "@/components/admin/user-actions";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Manage Users | Admin Dashboard" };

export default function AdminUsersPage(props: {
  searchParams: Promise<{ role?: string }>;
}) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminUsersContent {...props} />
    </Suspense>
  );
}

async function AdminUsersContent({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  await connection();
  await requireRole("admin");
  const { role } = await searchParams;

  const users = await prisma.user.findMany({
    where: role ? { role: role.toUpperCase() } : {},
    include: {
      _count: { select: { orders: true, reviews: true } },
      shop: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const roles = [
    { label: "All Users", value: "" },
    { label: "Buyers", value: "buyer" },
    { label: "Sellers", value: "seller" },
    { label: "Admins", value: "admin" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="User Directory"
        title="Account Management"
        description="View registered buyers, independent bookstore sellers, and platform administrators."
      />

      <div className="flex flex-wrap gap-2">
        {roles.map((r) => (
          <Link
            key={r.value}
            href={r.value ? `/admin/users?role=${r.value}` : "/admin/users"}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              (role ?? "") === r.value
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Activity</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-semibold text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                  {u.shop ? (
                    <p className="text-[11px] text-primary">
                      Shop: {u.shop.name}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-xs">
                  <span className="rounded bg-muted px-2 py-0.5 font-bold uppercase">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={u.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {u._count.orders} orders · {u._count.reviews} reviews
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(u.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                      title="View Profile Details"
                    >
                      <Eye className="size-4" />
                    </Link>
                    <UserStatusToggle userId={u.id} currentStatus={u.status} />
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
