import type { Metadata } from "next";
import Link from "next/link";
import { Percent, Truck } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Coupons" };

export default async function CouponsPage() {
  await requireRole("buyer");
  const now = new Date();
  const coupons = await prisma.coupon.findMany({
    where: {
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Available coupons"
        description="Apply these codes at checkout to save on your order."
      />
      {coupons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <Percent className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-2 text-base font-semibold">No active coupons</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back later for new offers.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="relative overflow-hidden rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-lg border border-dashed border-primary/40 bg-primary/5 px-2.5 py-1 font-mono text-sm font-bold text-primary">
                  {coupon.code}
                </span>
                {coupon.type === "FREE_SHIPPING" ? (
                  <Truck className="size-5 text-primary" />
                ) : (
                  <Percent className="size-5 text-primary" />
                )}
              </div>
              <p className="mt-3 text-lg font-bold">
                {coupon.type === "PERCENT" ? `${coupon.value}% off` : null}
                {coupon.type === "FIXED"
                  ? `${formatPrice(coupon.value)} off`
                  : null}
                {coupon.type === "FREE_SHIPPING" ? "Free delivery" : null}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {coupon.description ?? "Use this code at checkout."}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Minimum order: {formatPrice(coupon.minOrder)}
              </p>
              {coupon.expiresAt ? (
                <p className="text-xs text-muted-foreground">
                  Valid until {coupon.expiresAt.toLocaleDateString()}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
      <Link
        href="/books"
        className="inline-flex text-sm font-medium text-primary hover:underline"
      >
        Continue shopping →
      </Link>
    </div>
  );
}
