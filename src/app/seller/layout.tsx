import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export const instant = false;

export default async function SellerLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("seller");
  return (
    <DashboardShell user={user} role="seller">
      {children}
    </DashboardShell>
  );
}
