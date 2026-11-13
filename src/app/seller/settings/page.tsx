import type { Metadata } from "next";

import { ProfileForm } from "@/components/buyer/profile-form";
import { SettingsForm } from "@/components/buyer/settings-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Seller Settings | BookHand" };

export default async function SellerSettingsPage() {
  const user = await requireRole("seller");
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, phone: true, bio: true, avatar: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Preferences"
        title="Seller Account Settings"
        description="Update your personal login credentials, contact phone, and security."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Account Profile</h2>
          {dbUser ? (
            <ProfileForm
              initial={{
                name: dbUser.name,
                email: dbUser.email,
                phone: dbUser.phone ?? "",
                avatar: dbUser.avatar ?? "",
                bio: dbUser.bio ?? "",
              }}
            />
          ) : null}
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Password & Security</h2>
          <SettingsForm />
        </div>
      </div>
    </div>
  );
}
