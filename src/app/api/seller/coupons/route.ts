import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { couponSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireApiUser("seller");
    const shop = await prisma.shop.findUnique({
      where: { ownerId: user.id },
      select: { id: true },
    });
    const coupons = await prisma.coupon.findMany({
      where: shop ? { shopId: shop.id } : { id: "__none__" },
      include: { _count: { select: { usages: true } } },
      orderBy: { createdAt: "desc" },
    });
    return ok({ coupons });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser("seller");
    const input = couponSchema.parse(await readJson(request));
    const shop = await prisma.shop.findUnique({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!shop) return fail("Create your shop profile first.", 409);
    const existing = await prisma.coupon.findUnique({
      where: { code: input.code },
    });
    if (existing) return fail("That coupon code is already in use.", 409);

    const coupon = await prisma.coupon.create({
      data: { ...input, shopId: shop.id },
    });
    return ok({ coupon }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
