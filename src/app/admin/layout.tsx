import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export const instant = false;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("admin");
  return (
    <DashboardShell user={user} role="admin">
      {children}
    </DashboardShell>
  );
}
