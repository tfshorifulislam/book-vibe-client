import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";

import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export const instant = false;

export default function BuyerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <BuyerLayoutContent>{children}</BuyerLayoutContent>
    </Suspense>
  );
}

async function BuyerLayoutContent({ children }: { children: ReactNode }) {
  await connection();
  const user = await requireRole("buyer");
  return (
    <DashboardShell user={user} role="buyer">
      {children}
    </DashboardShell>
  );
}
