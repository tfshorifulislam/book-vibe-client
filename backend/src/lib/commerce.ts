import "server-only";

import { prisma } from "@/lib/db";

export const DEFAULT_SHIPPING = 60;
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 800;
export const DEFAULT_COMMISSION_RATE = 5;

export async function getCommerceSettings() {
  const rows = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: [
          "shipping_flat_rate",
          "free_shipping_threshold",
          "commission_rate",
        ],
      },
    },
  });
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    shippingFlat: Number(map.shipping_flat_rate) || DEFAULT_SHIPPING,
    freeShippingThreshold:
      Number(map.free_shipping_threshold) || DEFAULT_FREE_SHIPPING_THRESHOLD,
    commissionRate: Number(map.commission_rate) || DEFAULT_COMMISSION_RATE,
  };
}

export function calculateShipping(
  subtotal: number,
  settings: { shippingFlat: number; freeShippingThreshold: number },
) {
  if (subtotal <= 0) return 0;
  return subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFlat;
}

export type CouponResult = {
  valid: boolean;
  message: string;
  coupon?: {
    id: string;
    code: string;
    type: string;
    value: number;
    minOrder: number;
    maxDiscount: number | null;
  };
  discount: number;
  freeShipping: boolean;
};

export async function validateCoupon(
  code: string,
  userId: string,
  subtotal: number,
): Promise<CouponResult> {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon || !coupon.isActive) {
    return {
      valid: false,
      message: "Coupon not found.",
      discount: 0,
      freeShipping: false,
    };
  }
  if (coupon.startsAt && coupon.startsAt.getTime() > Date.now()) {
    return {
      valid: false,
      message: "This coupon is not active yet.",
      discount: 0,
      freeShipping: false,
    };
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return {
      valid: false,
      message: "This coupon has expired.",
      discount: 0,
      freeShipping: false,
    };
  }
  if (subtotal < coupon.minOrder) {
    return {
      valid: false,
      message: `Add ৳${coupon.minOrder - subtotal} more to use this coupon.`,
      discount: 0,
      freeShipping: false,
    };
  }
  if (coupon.usageLimit) {
    const used = await prisma.couponUsage.count({
      where: { couponId: coupon.id },
    });
    if (used >= coupon.usageLimit) {
      return {
        valid: false,
        message: "This coupon is no longer available.",
        discount: 0,
        freeShipping: false,
      };
    }
  }
  const userUsed = await prisma.couponUsage.count({
    where: { couponId: coupon.id, userId },
  });
  if (userUsed >= coupon.perUserLimit) {
    return {
      valid: false,
      message: "You have already used this coupon.",
      discount: 0,
      freeShipping: false,
    };
  }

  let discount = 0;
  let freeShipping = false;
  if (coupon.type === "FIXED") {
    discount = Math.min(coupon.value, subtotal);
  } else if (coupon.type === "PERCENT") {
    discount = Math.round((subtotal * coupon.value) / 100);
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else if (coupon.type === "FREE_SHIPPING") {
    freeShipping = true;
  }

  return {
    valid: true,
    message:
      coupon.type === "FREE_SHIPPING"
        ? "Free shipping applied."
        : `Coupon applied: ৳${discount} off.`,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder,
      maxDiscount: coupon.maxDiscount,
    },
    discount,
    freeShipping,
  };
}

export function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `BH-${year}-${random}`;
}

export async function refreshBookRating(bookId: string) {
  const aggregate = await prisma.review.aggregate({
    where: { bookId, isApproved: true },
    _sum: { rating: true },
    _count: { rating: true },
  });
  await prisma.book.update({
    where: { id: bookId },
    data: {
      ratingSum: aggregate._sum.rating ?? 0,
      ratingCount: aggregate._count.rating ?? 0,
    },
  });
}

export function orderStatusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
