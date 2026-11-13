import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User as UserIcon, Mail, Phone, MapPin } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { UserStatusToggle } from "@/components/admin/user-actions";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "User Details | Admin Dashboard" };

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;

  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: {
      shop: true,
      addresses: true,
      orders: { take: 5, orderBy: { createdAt: "desc" } },
      reviews: { include: { book: { select: { title: true } } }, take: 5 },
    },
  });

  if (!targetUser) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to Users
      </Link>

      <PageHeader
        eyebrow="User Profile"
        title={targetUser.name}
        description={`Registered ${targetUser.role.toLowerCase()} account on BookHand`}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge
              status={targetUser.status}
              className="px-3 py-1 text-sm"
            />
            <UserStatusToggle
              userId={targetUser.id}
              currentStatus={targetUser.status}
            />
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Info */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <UserIcon className="size-4" /> Personal Information
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <span>{targetUser.email}</span>
            </div>
            {targetUser.phone ? (
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                <span>{targetUser.phone}</span>
              </div>
            ) : null}
            <div className="border-t border-border pt-2 text-xs text-muted-foreground">
              Joined on{" "}
              {formatDate(targetUser.createdAt.toISOString().slice(0, 10))} ·
              Email Verified: {targetUser.emailVerified ? "Yes" : "No"}
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <MapPin className="size-4" /> Saved Delivery Addresses
          </h2>
          {targetUser.addresses.length ? (
            <div className="space-y-2 text-xs">
              {targetUser.addresses.map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-border bg-muted/30 p-2.5"
                >
                  <p className="font-semibold text-foreground">
                    {a.label} ({a.recipientName} - {a.phone})
                  </p>
                  <p className="text-muted-foreground">
                    {a.area}, {a.city}, {a.district}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No saved addresses.</p>
          )}
        </div>
      </div>
    </div>
  );
}
