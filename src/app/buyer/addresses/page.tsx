import type { Metadata } from "next";

import { AddressManager } from "@/components/buyer/address-manager";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage() {
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
