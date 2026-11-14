import type { ReactNode } from "react";
import { connection } from "next/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export default async function SellerLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  const user = await requireRole("seller");
  return (
    <DashboardShell user={user} role="seller">
      {children}
    </DashboardShell>
  );
}
