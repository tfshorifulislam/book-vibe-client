import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsForm } from "@/components/buyer/settings-form";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Account settings" };

export default async function SettingsPage() {
  await requireRole("buyer");
  return (
    <div className="space-y-6">
      <PageHeader title="Account settings" description="Manage your password and account security." />
      <SettingsForm />
    </div>
  );
}
