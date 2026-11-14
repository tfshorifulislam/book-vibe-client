import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { Metadata } from "next";

import { AddressManager } from "@/components/buyer/address-manager";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Addresses" };

export default function AddressesPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AddressesContent />
    </Suspense>
  );
}

async function AddressesContent() {
  await connection();
  await requireRole("buyer");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery addresses"
        description="Manage the addresses you use at checkout."
      />
      <AddressManager />
    </div>
  );
}
