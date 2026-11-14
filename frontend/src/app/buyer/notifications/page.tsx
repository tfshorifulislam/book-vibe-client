import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { Metadata } from "next";

import { NotificationsClient } from "@/components/buyer/notifications-client";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <NotificationsContent />
    </Suspense>
  );
}

async function NotificationsContent() {
  await connection();
  const user = await requireRole("buyer");
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
        title="Notifications"
        description="Updates about your orders, questions, and messages."
      />
      <NotificationsClient initial={initial} />
    </div>
  );
}
