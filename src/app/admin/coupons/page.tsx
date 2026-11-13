import { prisma } from "@/lib/db";
import { AdminCouponManager } from "@/components/admin/coupon-manager";


export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    include: {
      shop: { select: { name: true } },
      _count: { select: { usages: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Discount Coupons</h1>
          <p className="text-sm text-muted-foreground">
            Create and monitor marketplace promotional codes and seller-specific discounts.
          </p>
        </div>
      </div>

      <AdminCouponManager initial={coupons} />
    </div>
  );
}
