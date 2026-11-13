import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { ShopForm } from "@/components/seller/shop-form";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Seller Onboarding | BookHand" };

export default async function SellerOnboardingPage() {
  const user = await requireRole("seller");
  const shop = await prisma.shop.findUnique({ where: { ownerId: user.id } });

  if (shop) {
    redirect("/seller/dashboard");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Get Started"
        title="Setup Your Bookstore"
        description="Fill out your bookstore profile to start listing books and accepting orders from across Bangladesh."
      />
      <ShopForm />
    </div>
  );
}
