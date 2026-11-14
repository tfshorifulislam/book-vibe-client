import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { Metadata } from "next";

import { CheckoutClient } from "@/components/buyer/checkout-client";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}

async function CheckoutContent() {
  await connection();
  await requireRole("buyer");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Checkout"
        description="Confirm your delivery details and place the order."
      />
      <CheckoutClient />
    </div>
  );
}
