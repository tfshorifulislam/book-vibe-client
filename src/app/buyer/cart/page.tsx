import type { Metadata } from "next";

import { CartClient } from "@/components/buyer/cart-client";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Shopping cart" };

export default async function CartPage() {
  await requireRole("buyer");
  return (
    <div className="space-y-6">
      <PageHeader title="Shopping cart" description="Review your books before checkout." />
      <CartClient />
    </div>
  );
}
