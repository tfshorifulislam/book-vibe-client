import type { ReactNode } from "react";
import { connection } from "next/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export const instant = false;

export default async function BuyerLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  const user = await requireRole("buyer");
  return (
    <DashboardShell user={user} role="buyer">
      {children}
    </DashboardShell>
  );
}
