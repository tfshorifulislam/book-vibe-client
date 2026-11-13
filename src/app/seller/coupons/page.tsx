import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { CouponManager } from "@/components/seller/coupon-manager";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Coupons | Seller Workspace" };

export default async function SellerCouponsPage() {
  const user = await requireRole("seller");
  const shop = await prisma.shop.findUnique({ where: { ownerId: user.id } });

  const coupons = shop
    ? await prisma.coupon.findMany({
        where: { shopId: shop.id },
        include: { _count: { select: { usages: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const formatted = coupons.map((c) => ({
    ...c,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Promotions"
        title="Shop Coupons"
        description="Offer promo codes and volume discounts exclusive to your bookstore."
      />

      <CouponManager initial={formatted} />
    </div>
  );
}
