import type { ReactNode } from "react";
import { connection } from "next/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  const user = await requireRole("admin");
  return (
    <DashboardShell user={user} role="admin">
      {children}
    </DashboardShell>
  );
}
