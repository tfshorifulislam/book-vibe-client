import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/buyer/profile-form";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  await connection();
  const user = await requireRole("buyer");
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, phone: true, avatar: true, bio: true },
  });
  return (
    <div className="space-y-6">
      <PageHeader
        title="Your profile"
        description="Keep your contact details up to date."
      />
      <ProfileForm
        initial={{
          name: profile?.name ?? user.name ?? "",
          email: profile?.email ?? user.email ?? "",
          phone: profile?.phone ?? "",
          avatar: profile?.avatar ?? user.avatar ?? "",
          bio: profile?.bio ?? "",
        }}
      />
    </div>
  );
}
