import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";

import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export const instant = false;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}

async function AdminLayoutContent({ children }: { children: ReactNode }) {
  await connection();
  const user = await requireRole("admin");
  return (
    <DashboardShell user={user} role="admin">
      {children}
    </DashboardShell>
  );
}
