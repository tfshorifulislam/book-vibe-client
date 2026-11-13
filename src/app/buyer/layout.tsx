import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export const instant = false;

export default async function BuyerLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("buyer");
  return (
    <DashboardShell user={user} role="buyer">
      {children}
    </DashboardShell>
  );
}
