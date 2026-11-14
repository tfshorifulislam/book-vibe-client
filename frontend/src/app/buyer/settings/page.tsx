import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsForm } from "@/components/buyer/settings-form";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Account settings" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  await connection();
  await requireRole("buyer");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Account settings"
        description="Manage your password and account security."
      />
      <SettingsForm />
    </div>
  );
}
