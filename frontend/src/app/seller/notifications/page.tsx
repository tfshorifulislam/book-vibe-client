import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { Metadata } from "next";

import { NotificationsClient } from "@/components/buyer/notifications-client";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Notifications | Seller Workspace" };

export default function SellerNotificationsPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <SellerNotificationsContent />
    </Suspense>
  );
}

async function SellerNotificationsContent() {
  await connection();
  const user = await requireRole("seller");
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const initial = notifications.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Activity"
        title="Seller Notifications"
        description="Real-time alerts on new orders, inventory thresholds, and customer messages."
      />
      <NotificationsClient initial={initial} />
    </div>
  );
}
