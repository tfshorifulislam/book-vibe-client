import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";

import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export const instant = false;

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <SellerLayoutContent>{children}</SellerLayoutContent>
    </Suspense>
  );
}

async function SellerLayoutContent({ children }: { children: ReactNode }) {
  await connection();
  const user = await requireRole("seller");
  return (
    <DashboardShell user={user} role="seller">
      {children}
    </DashboardShell>
  );
}
