import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { ShopForm } from "@/components/seller/shop-form";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Shop Profile | BookHand" };

export default async function SellerShopPage() {
  const user = await requireRole("seller");
  const shop = await prisma.shop.findUnique({ where: { ownerId: user.id } });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Seller Shop"
        title="Storefront Profile"
        description="Manage your bookstore branding, contact details, and location."
        actions={
          shop ? (
            <Link
              href={`/shops/${shop.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-muted"
            >
              <ExternalLink className="size-4" /> View Public Shop
            </Link>
          ) : null
        }
      />
      <ShopForm initial={shop} />
    </div>
  );
}
